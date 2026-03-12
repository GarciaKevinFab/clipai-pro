from django.urls import path

from apps.payments.views import (
    create_charge_view,
    culqi_webhook_view,
    PaymentHistoryView,
    subscription_view,
    cancel_subscription_view,
)

urlpatterns = [
    path('create-charge/', create_charge_view, name='create-charge'),
    path('webhook/culqi/', culqi_webhook_view, name='culqi-webhook'),
    path('history/', PaymentHistoryView.as_view(), name='payment-history'),
    path('subscription/', subscription_view, name='subscription'),
    path('cancel/', cancel_subscription_view, name='cancel-subscription'),
]
