from django.db import models
from apps.users.models import UserProfile


class AffiliateProfile(models.Model):
    user = models.OneToOneField(
        UserProfile, on_delete=models.CASCADE,
        related_name='affiliate'
    )
    is_active = models.BooleanField(default=True)
    commission_rate = models.DecimalField(
        max_digits=4, decimal_places=2, default=0.30
    )
    total_referrals = models.IntegerField(default=0)
    total_earned_pen = models.DecimalField(
        max_digits=10, decimal_places=2, default=0
    )
    total_paid_pen = models.DecimalField(
        max_digits=10, decimal_places=2, default=0
    )
    pending_pen = models.DecimalField(
        max_digits=10, decimal_places=2, default=0
    )
    payment_info = models.JSONField(default=dict)
    activated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Afiliado: {self.user.user.username} ({self.total_referrals} referidos)"

    class Meta:
        ordering = ['-activated_at']


class AffiliateCommission(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('approved', 'Aprobado'),
        ('paid', 'Pagado'),
    ]

    affiliate = models.ForeignKey(
        AffiliateProfile, on_delete=models.CASCADE,
        related_name='commissions'
    )
    referred_user = models.ForeignKey(
        UserProfile, on_delete=models.CASCADE
    )
    payment = models.ForeignKey(
        'payments.Payment', on_delete=models.CASCADE
    )
    amount_pen = models.DecimalField(max_digits=8, decimal_places=2)
    status = models.CharField(
        max_length=10, choices=STATUS_CHOICES, default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Comision S/{self.amount_pen} - {self.status}"

    class Meta:
        ordering = ['-created_at']
