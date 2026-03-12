import uuid
import secrets

from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    PLAN_CHOICES = [
        ('free', 'Free'),
        ('starter', 'Starter'),
        ('basic', 'Basico'),
        ('pro', 'Profesional'),
        ('ultimate', 'Ultimate'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    credits = models.IntegerField(default=5)
    plan = models.CharField(max_length=20, choices=PLAN_CHOICES, default='free')
    plan_expires_at = models.DateTimeField(null=True, blank=True)
    referral_code = models.CharField(max_length=12, unique=True)
    referred_by = models.ForeignKey(
        'self', null=True, blank=True,
        on_delete=models.SET_NULL, related_name='referrals'
    )
    total_videos_generated = models.IntegerField(default=0)
    avatar_url = models.URLField(null=True, blank=True)
    onboarding_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.referral_code:
            self.referral_code = secrets.token_urlsafe(8)[:12].upper()
        super().save(*args, **kwargs)

    def can_generate(self, cost):
        return self.credits >= cost

    def deduct_credits(self, amount, concept, reference_id=None):
        self.credits -= amount
        self.save()
        CreditTransaction.objects.create(
            user=self, amount=-amount, concept=concept,
            reference_id=reference_id
        )

    def add_credits(self, amount, concept, reference_id=None):
        self.credits += amount
        self.save()
        CreditTransaction.objects.create(
            user=self, amount=amount, concept=concept,
            reference_id=reference_id
        )

    def __str__(self):
        return f"{self.user.username} ({self.plan})"

    class Meta:
        ordering = ['-created_at']


class CreditTransaction(models.Model):
    CONCEPT_CHOICES = [
        ('welcome_bonus', 'Bono de Bienvenida'),
        ('plan_purchase', 'Compra de Plan'),
        ('video_generated', 'Video Generado'),
        ('video_failed_refund', 'Reembolso por Fallo'),
        ('referral_bonus', 'Bono de Referido'),
        ('admin_adjustment', 'Ajuste Administrativo'),
    ]

    user = models.ForeignKey(
        UserProfile, on_delete=models.CASCADE,
        related_name='credit_transactions'
    )
    amount = models.IntegerField()
    concept = models.CharField(max_length=40, choices=CONCEPT_CHOICES)
    reference_id = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        sign = '+' if self.amount > 0 else ''
        return f"{self.user.user.username}: {sign}{self.amount} ({self.concept})"

    class Meta:
        ordering = ['-created_at']
