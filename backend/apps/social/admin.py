from django.contrib import admin
from .models import SocialAccount


@admin.register(SocialAccount)
class SocialAccountAdmin(admin.ModelAdmin):
    list_display = ['user', 'platform', 'platform_username', 'is_active', 'connected_at']
    list_filter = ['platform', 'is_active', 'connected_at']
    search_fields = ['user__user__username', 'platform_username', 'platform_user_id']
