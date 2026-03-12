from django.contrib import admin
from .models import VideoGeneration, VideoScene


class VideoSceneInline(admin.TabularInline):
    model = VideoScene
    extra = 0


@admin.register(VideoGeneration)
class VideoGenerationAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'video_type', 'style', 'status', 'credits_used', 'created_at']
    list_filter = ['status', 'video_type', 'style', 'format', 'created_at']
    search_fields = ['title', 'script', 'user__user__username']
    readonly_fields = ['id', 'created_at', 'completed_at']
    inlines = [VideoSceneInline]


@admin.register(VideoScene)
class VideoSceneAdmin(admin.ModelAdmin):
    list_display = ['video', 'order', 'duration_seconds']
    list_filter = ['duration_seconds']
    search_fields = ['video__title', 'prompt']
