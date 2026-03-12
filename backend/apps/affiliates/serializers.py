from rest_framework import serializers
from apps.affiliates.models import AffiliateProfile, AffiliateCommission


class AffiliateProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.user.username', read_only=True)
    email = serializers.EmailField(source='user.user.email', read_only=True)

    class Meta:
        model = AffiliateProfile
        fields = [
            'id', 'username', 'email', 'is_active',
            'commission_rate', 'total_referrals',
            'total_earned_pen', 'total_paid_pen', 'pending_pen',
            'payment_info', 'activated_at',
        ]
        read_only_fields = [
            'id', 'total_referrals',
            'total_earned_pen', 'total_paid_pen', 'pending_pen',
            'activated_at',
        ]


class AffiliateCommissionSerializer(serializers.ModelSerializer):
    referred_username = serializers.CharField(
        source='referred_user.user.username', read_only=True
    )
    payment_amount = serializers.DecimalField(
        source='payment.amount', max_digits=8, decimal_places=2, read_only=True
    )

    class Meta:
        model = AffiliateCommission
        fields = [
            'id', 'referred_username', 'payment_amount',
            'amount_pen', 'status', 'created_at', 'paid_at',
        ]
        read_only_fields = fields


class MonthlyEarningSerializer(serializers.Serializer):
    month = serializers.DateField()
    total = serializers.DecimalField(max_digits=10, decimal_places=2)
    count = serializers.IntegerField()


class EarningsSummarySerializer(serializers.Serializer):
    total_earned_pen = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_paid_pen = serializers.DecimalField(max_digits=10, decimal_places=2)
    pending_pen = serializers.DecimalField(max_digits=10, decimal_places=2)
    monthly_earnings = MonthlyEarningSerializer(many=True)
