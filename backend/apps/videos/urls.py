from django.urls import path

from apps.videos.views import (
    VideoListView,
    video_generate_view,
    VideoDetailView,
    video_status_view,
    video_delete_view,
    video_publish_view,
    n8n_webhook_view,
)

urlpatterns = [
    path('', VideoListView.as_view(), name='video-list'),
    path('generate/', video_generate_view, name='video-generate'),
    path('<uuid:id>/', VideoDetailView.as_view(), name='video-detail'),
    path('<uuid:id>/status/', video_status_view, name='video-status'),
    path('<uuid:id>/delete/', video_delete_view, name='video-delete'),
    path('<uuid:id>/publish/', video_publish_view, name='video-publish'),
    path('webhook/n8n/', n8n_webhook_view, name='n8n-webhook'),
]
