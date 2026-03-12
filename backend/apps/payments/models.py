from django.db import models
from apps.users.models import UserProfile


class Plan(models.Model):
    PERIOD_CHOICES = [
        ('weekly', 'Semanal'),
        ('monthly', 'Mensual'),
    ]

    name = models.CharField(max_length=20, unique=True)
    display_name = models.CharField(max_length=50)
    price_pen = models.DecimalField(max_digits=8, decimal_places=2)
    price_original_pen = models.DecimalField(max_digits=8, decimal_places=2)
    credits = models.IntegerField()
    videos_per_period = models.IntegerField()
    period = models.CharField(max_length=10, choices=PERIOD_CHOICES)
    features = models.JSONField(default=list)
    is_popular = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.display_name} - S/{self.price_pen}"

    class Meta:
        ordering = ['order']


class Subscription(models.Model):
    STATUS_CHOICES = [
        ('active', 'Activa'),
        ('cancelled', 'Cancelada'),
        ('expired', 'Expirada'),
        ('past_due', 'Vencida'),
    ]

    user = models.ForeignKey(
        UserProfile, on_delete=models.CASCADE,
        related_name='subscriptions'
    )
    plan = models.ForeignKey(Plan, on_delete=models.PROTECT)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES)
    culqi_subscription_id = models.CharField(max_length=100, null=True, blank=True)
    current_period_start = models.DateTimeField()
    current_period_end = models.DateTimeField()
    cancelled_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.user.username} - {self.plan.display_name} ({self.status})"

    class Meta:
        ordering = ['-created_at']


class Payment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('completed', 'Completado'),
        ('failed', 'Fallido'),
        ('refunded', 'Reembolsado'),
    ]

    user = models.ForeignKey(
        UserProfile, on_delete=models.CASCADE,
        related_name='payments'
    )
    plan = models.ForeignKey(Plan, null=True, on_delete=models.SET_NULL)
    subscription = models.ForeignKey(
        Subscription, null=True, blank=True,
        on_delete=models.SET_NULL
    )
    amount_pen = models.DecimalField(max_digits=8, decimal_places=2)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES)
    culqi_charge_id = models.CharField(max_length=100, null=True, blank=True)
    payment_method = models.CharField(max_length=30, default='card')
    credits_added = models.IntegerField(default=0)
    affiliate_commission_paid = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.user.username} - S/{self.amount_pen} ({self.status})"

    class Meta:
        ordering = ['-created_at']
