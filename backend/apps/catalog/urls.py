from django.urls import path

from apps.catalog.views import (
    StyleListView,
    VoiceListView,
    MusicListView,
    PlanListView,
)

urlpatterns = [
    path('styles/', StyleListView.as_view(), name='style-list'),
    path('voices/', VoiceListView.as_view(), name='voice-list'),
    path('music/', MusicListView.as_view(), name='music-list'),
    path('plans/', PlanListView.as_view(), name='plan-list'),
]
