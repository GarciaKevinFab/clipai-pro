from django.urls import path
from apps.social.views import (
    social_accounts_view,
    tiktok_start,
    tiktok_callback,
    youtube_start,
    youtube_callback,
    instagram_start,
    instagram_callback,
    disconnect_view,
)

urlpatterns = [
    path('accounts/', social_accounts_view, name='social-accounts'),
    path('oauth/tiktok/start/', tiktok_start, name='tiktok-start'),
    path('oauth/tiktok/callback/', tiktok_callback, name='tiktok-callback'),
    path('oauth/youtube/start/', youtube_start, name='youtube-start'),
    path('oauth/youtube/callback/', youtube_callback, name='youtube-callback'),
    path('oauth/instagram/start/', instagram_start, name='instagram-start'),
    path('oauth/instagram/callback/', instagram_callback, name='instagram-callback'),
    path('accounts/<int:id>/', disconnect_view, name='social-disconnect'),
]
