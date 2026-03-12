from django.urls import path
from apps.affiliates import views

urlpatterns = [
    path('profile/', views.affiliate_profile_view, name='affiliate-profile'),
    path('activate/', views.activate_affiliate_view, name='affiliate-activate'),
    path('referrals/', views.referrals_view, name='affiliate-referrals'),
    path('earnings/', views.earnings_view, name='affiliate-earnings'),
    path('link/', views.affiliate_link_view, name='affiliate-link'),
]
