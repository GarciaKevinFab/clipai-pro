import uuid

from django.db import models
from apps.users.models import UserProfile


class VideoGeneration(models.Model):
    VIDEO_TYPES = [
        ('prompt_to_video', 'Prompt to Video'),
        ('sora2', 'Sora 2'),
        ('ai_asmr', 'AI ASMR (Veo3)'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('processing', 'Procesando'),
        ('generating_images', 'Generando Imagenes'),
        ('generating_audio', 'Generando Audio'),
        ('rendering', 'Renderizando'),
        ('uploading', 'Subiendo'),
        ('completed', 'Completado'),
        ('failed', 'Fallido'),
    ]
    FORMAT_CHOICES = [
        ('9:16', '9:16 Vertical'),
        ('16:9', '16:9 Horizontal'),
        ('1:1', '1:1 Cuadrado'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        UserProfile, on_delete=models.CASCADE,
        related_name='videos'
    )
    title = models.CharField(max_length=200, blank=True)
    script = models.TextField(max_length=2000)
    video_type = models.CharField(
        max_length=20, choices=VIDEO_TYPES,
        default='prompt_to_video'
    )
    style = models.CharField(max_length=50, default='anime')
    voice_id = models.CharField(max_length=100)
    voice_name = models.CharField(max_length=100, blank=True)
    music_id = models.CharField(max_length=100, null=True, blank=True)
    format = models.CharField(max_length=5, choices=FORMAT_CHOICES, default='9:16')
    clips_count = models.IntegerField(default=3)
    clip_duration = models.IntegerField(default=4)
    credits_used = models.IntegerField(default=0)
    status = models.CharField(
        max_length=25, choices=STATUS_CHOICES,
        default='pending'
    )
    progress = models.IntegerField(default=0)
    error_message = models.TextField(null=True, blank=True)
    video_url = models.URLField(null=True, blank=True)
    thumbnail_url = models.URLField(null=True, blank=True)
    duration_seconds = models.FloatField(null=True, blank=True)
    resolution = models.CharField(max_length=10, default='1080p')
    file_size_mb = models.FloatField(null=True, blank=True)
    n8n_execution_id = models.CharField(max_length=100, null=True, blank=True)
    published_to_tiktok = models.BooleanField(default=False)
    published_to_youtube = models.BooleanField(default=False)
    published_to_instagram = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.title or 'Sin titulo'} ({self.status})"

    class Meta:
        ordering = ['-created_at']


class VideoScene(models.Model):
    video = models.ForeignKey(
        VideoGeneration, on_delete=models.CASCADE,
        related_name='scenes'
    )
    order = models.IntegerField()
    prompt = models.TextField(blank=True)
    narration_text = models.TextField(blank=True)
    image_url = models.URLField(null=True, blank=True)
    duration_seconds = models.IntegerField(default=4)

    def __str__(self):
        return f"Escena {self.order} - {self.video.title}"

    class Meta:
        ordering = ['order']
