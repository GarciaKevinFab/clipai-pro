import logging
from datetime import timedelta
from decimal import Decimal

import requests
from django.conf import settings
from django.db import transaction
from django.utils import timezone

from apps.affiliates.models import AffiliateProfile, AffiliateCommission
from apps.payments.models import Plan, Subscription, Payment

logger = logging.getLogger(__name__)


class PaymentError(Exception):
    """Error al procesar un pago."""
    pass


def process_payment(user_profile, plan: Plan, culqi_token: str) -> Payment:
    """
    Crea un cargo en Culqi y, si es exitoso, registra el pago,
    crea la suscripcion, agrega creditos y actualiza el plan del usuario.
    """
    amount_in_cents = int(plan.price_pen * 100)

    # ------------------------------------------------------------------
    # Crear cargo en Culqi
    # ------------------------------------------------------------------
    try:
        response = requests.post(
            'https://api.culqi.com/v2/charges',
            headers={
                'Authorization': f'Bearer {settings.CULQI_PRIVATE_KEY}',
                'Content-Type': 'application/json',
            },
            json={
                'amount': amount_in_cents,
                'currency_code': 'PEN',
                'email': user_profile.user.email,
                'source_id': culqi_token,
                'description': f'ClipAI Pro - {plan.display_name}',
                'metadata': {
                    'user_id': str(user_profile.id),
                    'plan_id': str(plan.id),
                },
            },
            timeout=30,
        )
    except requests.RequestException as exc:
        # Error de red / timeout
        Payment.objects.create(
            user=user_profile,
            plan=plan,
            amount_pen=plan.price_pen,
            status='failed',
            credits_added=0,
        )
        logger.error(f"Error de red al conectar con Culqi: {exc}")
        raise PaymentError('Error al conectar con el servicio de pagos. Intenta de nuevo.')

    # ------------------------------------------------------------------
    # Evaluar respuesta de Culqi
    # ------------------------------------------------------------------
    if response.status_code not in (200, 201):
        error_detail = response.json().get('user_message', 'Pago rechazado.')
        Payment.objects.create(
            user=user_profile,
            plan=plan,
            amount_pen=plan.price_pen,
            status='failed',
            credits_added=0,
        )
        logger.warning(
            f"Cargo rechazado por Culqi para usuario {user_profile.user.username}: "
            f"{error_detail}"
        )
        raise PaymentError(error_detail)

    charge_data = response.json()
    culqi_charge_id = charge_data.get('id', '')

    # ------------------------------------------------------------------
    # Pago exitoso: crear registros dentro de una transaccion atomica
    # ------------------------------------------------------------------
    with transaction.atomic():
        now = timezone.now()

        # Determinar periodo de suscripcion
        if plan.period == 'weekly':
            period_end = now + timedelta(weeks=1)
        else:
            period_end = now + timedelta(days=30)

        # Cancelar suscripcion activa previa
        Subscription.objects.filter(
            user=user_profile, status='active',
        ).update(status='cancelled', cancelled_at=now)

        # Crear suscripcion
        subscription = Subscription.objects.create(
            user=user_profile,
            plan=plan,
            status='active',
            culqi_subscription_id=culqi_charge_id,
            current_period_start=now,
            current_period_end=period_end,
        )

        # Crear pago
        payment = Payment.objects.create(
            user=user_profile,
            plan=plan,
            subscription=subscription,
            amount_pen=plan.price_pen,
            status='completed',
            culqi_charge_id=culqi_charge_id,
            payment_method='card',
            credits_added=plan.credits,
        )

        # Agregar creditos al perfil
        user_profile.add_credits(
            plan.credits,
            'plan_purchase',
            reference_id=str(payment.id),
        )

        # Actualizar plan del usuario
        user_profile.plan = plan.name
        user_profile.plan_expires_at = period_end
        user_profile.save()

    # Comision de afiliado (fuera del atomic para no bloquear el pago)
    try:
        process_affiliate_commission(payment)
    except Exception as exc:
        logger.error(f"Error al procesar comision de afiliado: {exc}")

    logger.info(
        f"Pago completado: usuario={user_profile.user.username}, "
        f"plan={plan.display_name}, charge={culqi_charge_id}"
    )

    return payment


def process_affiliate_commission(payment: Payment) -> None:
    """
    Si el usuario que pago fue referido, calcula y registra la comision
    para el afiliado correspondiente.
    """
    user_profile = payment.user

    if not user_profile.referred_by:
        return

    try:
        affiliate = AffiliateProfile.objects.get(
            user=user_profile.referred_by,
            is_active=True,
        )
    except AffiliateProfile.DoesNotExist:
        return

    commission_amount = (payment.amount_pen * affiliate.commission_rate).quantize(
        Decimal('0.01')
    )

    with transaction.atomic():
        AffiliateCommission.objects.create(
            affiliate=affiliate,
            referred_user=user_profile,
            payment=payment,
            amount_pen=commission_amount,
            status='pending',
        )

        affiliate.total_earned_pen += commission_amount
        affiliate.pending_pen += commission_amount
        affiliate.total_referrals += 1
        affiliate.save()

        payment.affiliate_commission_paid = True
        payment.save()

    logger.info(
        f"Comision de afiliado registrada: S/{commission_amount} "
        f"para {affiliate.user.user.username}"
    )
