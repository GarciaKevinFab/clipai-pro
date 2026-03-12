from django.db import models


class Style(models.Model):
    key = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=50)
    emoji = models.CharField(max_length=10)
    is_new = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.emoji} {self.name}"

    class Meta:
        ordering = ['order']


class Voice(models.Model):
    GENDER_CHOICES = [('m', 'Masculino'), ('f', 'Femenino')]

    voice_id = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=200)
    tags = models.CharField(max_length=200)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    preview_url = models.URLField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.name} ({self.get_gender_display()})"

    class Meta:
        ordering = ['order']


class Music(models.Model):
    CATEGORY_CHOICES = [
        ('epic', 'Epico'),
        ('terror', 'Terror / Misterio'),
        ('happy', 'Positivo / Alegre'),
        ('lofi', 'Lofi / Relajante'),
        ('drama', 'Drama'),
    ]

    music_id = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    preview_url = models.URLField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"

    class Meta:
        ordering = ['order']
        verbose_name_plural = 'Music tracks'
