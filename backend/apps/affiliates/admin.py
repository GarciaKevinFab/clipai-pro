from django.contrib import admin
from .models import AffiliateProfile, AffiliateCommission


@admin.register(AffiliateProfile)
class AffiliateProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'is_active', 'commission_rate', 'total_referrals', 'total_earned_pen', 'pending_pen', 'activated_at']
    list_filter = ['is_active', 'activated_at']
    search_fields = ['user__user__username']


@admin.register(AffiliateCommission)
class AffiliateCommissionAdmin(admin.ModelAdmin):
    list_display = ['affiliate', 'referred_user', 'amount_pen', 'status', 'created_at', 'paid_at']
    list_filter = ['status', 'created_at']
    search_fields = ['affiliate__user__user__username', 'referred_user__user__username']
