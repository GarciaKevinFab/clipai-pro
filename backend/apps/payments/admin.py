from django.contrib import admin
from .models import Plan, Subscription, Payment


@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ['display_name', 'name', 'price_pen', 'credits', 'videos_per_period', 'period', 'is_popular', 'is_active', 'order']
    list_filter = ['period', 'is_popular', 'is_active']
    search_fields = ['name', 'display_name']


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ['user', 'plan', 'status', 'current_period_start', 'current_period_end', 'created_at']
    list_filter = ['status', 'plan', 'created_at']
    search_fields = ['user__user__username', 'culqi_subscription_id']


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['user', 'plan', 'amount_pen', 'status', 'payment_method', 'credits_added', 'created_at']
    list_filter = ['status', 'payment_method', 'created_at']
    search_fields = ['user__user__username', 'culqi_charge_id']
