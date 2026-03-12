from django.contrib import admin
from .models import UserProfile, CreditTransaction


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'plan', 'credits', 'referral_code', 'total_videos_generated', 'created_at']
    list_filter = ['plan', 'onboarding_completed', 'created_at']
    search_fields = ['user__username', 'user__email', 'referral_code']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(CreditTransaction)
class CreditTransactionAdmin(admin.ModelAdmin):
    list_display = ['user', 'amount', 'concept', 'reference_id', 'created_at']
    list_filter = ['concept', 'created_at']
    search_fields = ['user__user__username', 'reference_id']
    readonly_fields = ['created_at']
