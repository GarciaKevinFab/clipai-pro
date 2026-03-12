from django.contrib import admin
from .models import Style, Voice, Music


@admin.register(Style)
class StyleAdmin(admin.ModelAdmin):
    list_display = ['name', 'key', 'emoji', 'is_new', 'is_active', 'order']
    list_filter = ['is_new', 'is_active']
    search_fields = ['name', 'key']


@admin.register(Voice)
class VoiceAdmin(admin.ModelAdmin):
    list_display = ['name', 'voice_id', 'gender', 'description', 'is_active', 'order']
    list_filter = ['gender', 'is_active']
    search_fields = ['name', 'voice_id', 'tags']


@admin.register(Music)
class MusicAdmin(admin.ModelAdmin):
    list_display = ['name', 'music_id', 'category', 'is_active', 'order']
    list_filter = ['category', 'is_active']
    search_fields = ['name', 'music_id']
