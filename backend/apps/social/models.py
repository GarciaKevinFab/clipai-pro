from django.db import models
from encrypted_model_fields.fields import EncryptedTextField
from apps.users.models import UserProfile


class SocialAccount(models.Model):
    PLATFORM_CHOICES = [
        ('tiktok', 'TikTok'),
        ('youtube', 'YouTube'),
        ('instagram', 'Instagram'),
    ]

    user = models.ForeignKey(
        UserProfile, on_delete=models.CASCADE,
        related_name='social_accounts'
    )
    platform = models.CharField(max_length=15, choices=PLATFORM_CHOICES)
    platform_user_id = models.CharField(max_length=100)
    platform_username = models.CharField(max_length=100)
    access_token = EncryptedTextField()
    refresh_token = EncryptedTextField(null=True, blank=True)
    token_expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    connected_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.user.username} - {self.platform} (@{self.platform_username})"

    class Meta:
        unique_together = ['user', 'platform']
        ordering = ['-connected_at']
