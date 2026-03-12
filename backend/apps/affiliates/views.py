from decimal import Decimal

from django.conf import settings
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from django.utils import timezone

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from apps.affiliates.models import AffiliateProfile, AffiliateCommission
from apps.affiliates.serializers import (
    AffiliateProfileSerializer,
    AffiliateCommissionSerializer,
    EarningsSummarySerializer,
)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def affiliate_profile_view(request):
    """GET /api/affiliates/profile/ - Retorna el perfil de afiliado."""
    profile = request.user.profile
    try:
        affiliate = AffiliateProfile.objects.get(user=profile)
        serializer = AffiliateProfileSerializer(affiliate)
        data = serializer.data
        data['is_affiliate'] = True
        return Response(data)
    except AffiliateProfile.DoesNotExist:
        return Response({
            'is_affiliate': False,
            'referral_code': profile.referral_code,
        })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def activate_affiliate_view(request):
    """POST /api/affiliates/activate/ - Activa el perfil de afiliado."""
    profile = request.user.profile
    if AffiliateProfile.objects.filter(user=profile).exists():
        return Response(
            {'error': 'Ya eres un afiliado activo.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    affiliate = AffiliateProfile.objects.create(user=profile)
    serializer = AffiliateProfileSerializer(affiliate)
    data = serializer.data
    data['is_affiliate'] = True
    return Response(data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def referrals_view(request):
    """GET /api/affiliates/referrals/ - Lista los referidos con estado de pago."""
    profile = request.user.profile
    try:
        affiliate = AffiliateProfile.objects.get(user=profile)
    except AffiliateProfile.DoesNotExist:
        return Response(
            {'error': 'No tienes un perfil de afiliado activo.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    commissions = AffiliateCommission.objects.filter(
        affiliate=affiliate
    ).select_related('referred_user__user', 'payment')

    paginator = PageNumberPagination()
    paginator.page_size = 20
    page = paginator.paginate_queryset(commissions, request)
    serializer = AffiliateCommissionSerializer(page, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def earnings_view(request):
    """GET /api/affiliates/earnings/ - Resumen de ganancias con desglose mensual."""
    profile = request.user.profile
    try:
        affiliate = AffiliateProfile.objects.get(user=profile)
    except AffiliateProfile.DoesNotExist:
        return Response(
            {'error': 'No tienes un perfil de afiliado activo.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    six_months_ago = timezone.now() - timezone.timedelta(days=180)

    monthly_earnings = (
        AffiliateCommission.objects
        .filter(affiliate=affiliate, created_at__gte=six_months_ago)
        .annotate(month=TruncMonth('created_at'))
        .values('month')
        .annotate(
            total=Sum('amount_pen'),
            count=Count('id'),
        )
        .order_by('-month')
    )

    data = {
        'total_earned_pen': affiliate.total_earned_pen,
        'total_paid_pen': affiliate.total_paid_pen,
        'pending_pen': affiliate.pending_pen,
        'monthly_earnings': list(monthly_earnings),
    }

    serializer = EarningsSummarySerializer(data)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def affiliate_link_view(request):
    """GET /api/affiliates/link/ - Retorna el enlace de referido completo."""
    profile = request.user.profile
    referral_url = f"{settings.FRONTEND_URL}/signup?ref={profile.referral_code}"
    return Response({
        'referral_code': profile.referral_code,
        'referral_link': referral_url,
    })
