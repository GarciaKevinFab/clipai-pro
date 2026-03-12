import hashlib
import hmac
import logging

from django.conf import settings
from django.utils import timezone

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.payments.models import Plan, Subscription, Payment
from apps.payments.serializers import (
    CreateChargeSerializer,
    PaymentSerializer,
    SubscriptionSerializer,
)
from apps.payments.services import process_payment, PaymentError

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# POST /api/payments/create-charge/
# ---------------------------------------------------------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_charge_view(request):
    serializer = CreateChargeSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    plan_id = serializer.validated_data['plan_id']
    culqi_token = serializer.validated_data['culqi_token']

    try:
        plan = Plan.objects.get(id=plan_id, is_active=True)
    except Plan.DoesNotExist:
        return Response(
            {'error': 'El plan seleccionado no existe o no esta disponible.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    profile = request.user.profile

    try:
        payment = process_payment(profile, plan, culqi_token)
    except PaymentError as exc:
        return Response(
            {'error': str(exc)},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response(
        {
            'message': 'Pago procesado exitosamente.',
            'payment': PaymentSerializer(payment).data,
        },
        status=status.HTTP_201_CREATED,
    )


# ---------------------------------------------------------------------------
# POST /api/payments/webhook/culqi/
# ---------------------------------------------------------------------------
@api_view(['POST'])
@permission_classes([AllowAny])
def culqi_webhook_view(request):
    # Validar firma HMAC
    signature = request.headers.get('X-Culqi-Signature', '')
    secret = settings.CULQI_WEBHOOK_SECRET

    if not secret:
        logger.error('CULQI_WEBHOOK_SECRET no configurado.')
        return Response(
            {'error': 'Webhook no configurado.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    expected_signature = hmac.new(
        secret.encode('utf-8'),
        request.body,
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(signature, expected_signature):
        return Response(
            {'error': 'Firma invalida.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    # Procesar evento
    data = request.data
    event_type = data.get('type', '')
    charge_data = data.get('data', {})
    culqi_charge_id = charge_data.get('id', '')

    if not culqi_charge_id:
        return Response(
            {'error': 'Datos del webhook incompletos.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        payment = Payment.objects.get(culqi_charge_id=culqi_charge_id)
    except Payment.DoesNotExist:
        return Response(
            {'error': 'Pago no encontrado.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    if event_type == 'charge.succeeded':
        payment.status = 'completed'
        payment.save()
        logger.info(f"Webhook Culqi: pago {culqi_charge_id} confirmado.")

    elif event_type == 'charge.failed':
        payment.status = 'failed'
        payment.save()
        logger.warning(f"Webhook Culqi: pago {culqi_charge_id} fallido.")

    elif event_type == 'charge.refunded':
        payment.status = 'refunded'
        payment.save()
        logger.info(f"Webhook Culqi: pago {culqi_charge_id} reembolsado.")

    return Response({'message': 'Webhook procesado exitosamente.'})


# ---------------------------------------------------------------------------
# GET /api/payments/history/
# ---------------------------------------------------------------------------
class PaymentHistoryView(ListAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(
            user=self.request.user.profile,
        ).select_related('plan')


# ---------------------------------------------------------------------------
# GET /api/payments/subscription/
# ---------------------------------------------------------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def subscription_view(request):
    profile = request.user.profile

    subscription = Subscription.objects.filter(
        user=profile, status='active',
    ).select_related('plan').first()

    if not subscription:
        return Response({'subscription': None})

    return Response({
        'subscription': SubscriptionSerializer(subscription).data,
    })


# ---------------------------------------------------------------------------
# POST /api/payments/cancel/
# ---------------------------------------------------------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_subscription_view(request):
    profile = request.user.profile

    subscription = Subscription.objects.filter(
        user=profile, status='active',
    ).first()

    if not subscription:
        return Response(
            {'error': 'No tienes una suscripcion activa.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    subscription.status = 'cancelled'
    subscription.cancelled_at = timezone.now()
    subscription.save()

    return Response({
        'message': 'Suscripcion cancelada exitosamente.',
        'subscription': SubscriptionSerializer(subscription).data,
    })
