from unittest.mock import patch

from django.conf import settings
from django.contrib.auth.models import User
from django.test import TestCase, override_settings

from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.users.models import UserProfile
from apps.videos.models import VideoGeneration


def create_user_with_profile(
    username='testuser',
    email='test@example.com',
    password='TestPass123!',
    credits=50,
):
    """Helper: create User + UserProfile and return (user, profile, tokens)."""
    user = User.objects.create_user(
        username=username, email=email, password=password,
    )
    profile = UserProfile.objects.create(user=user, credits=credits)
    refresh = RefreshToken.for_user(user)
    tokens = {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }
    return user, profile, tokens


def make_video(profile, **overrides):
    """Helper: create a VideoGeneration with sensible defaults."""
    defaults = {
        'user': profile,
        'title': 'Test Video',
        'script': 'A test script for video generation.',
        'video_type': 'prompt_to_video',
        'style': 'anime',
        'voice_id': 'voice_123',
        'format': '9:16',
        'clips_count': 3,
        'clip_duration': 4,
        'credits_used': 30,
        'status': 'pending',
    }
    defaults.update(overrides)
    return VideoGeneration.objects.create(**defaults)


VALID_GENERATE_PAYLOAD = {
    'script': 'A short script for the video.',
    'video_type': 'prompt_to_video',
    'style': 'anime',
    'voice_id': 'voice_123',
    'clips_count': 3,
    'clip_duration': 4,
    'title': 'My Video',
}


@override_settings(
    RATELIMIT_ENABLE=False,
    CACHES={'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'}},
)
class VideoGenerateTests(APITestCase):
    """Tests for POST /api/videos/generate/"""

    def setUp(self):
        self.user, self.profile, self.tokens = create_user_with_profile(credits=50)
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {self.tokens['access']}"
        )

    @patch('apps.videos.views.generate_video.delay')
    def test_generate_video_success(self, mock_task):
        response = self.client.post(
            '/api/videos/generate/',
            VALID_GENERATE_PAYLOAD,
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('video', response.data)

        # Video created in DB
        video = VideoGeneration.objects.get(id=response.data['video']['id'])
        self.assertEqual(video.status, 'processing')
        self.assertEqual(video.credits_used, 30)  # 10 per clip * 3 clips

        # Credits deducted
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.credits, 20)  # 50 - 30

        # Celery task dispatched
        mock_task.assert_called_once_with(str(video.id))

    @patch('apps.videos.views.generate_video.delay')
    def test_generate_insufficient_credits(self, mock_task):
        self.profile.credits = 0
        self.profile.save()

        response = self.client.post(
            '/api/videos/generate/',
            VALID_GENERATE_PAYLOAD,
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_402_PAYMENT_REQUIRED)
        mock_task.assert_not_called()


@override_settings(
    RATELIMIT_ENABLE=False,
    CACHES={'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'}},
)
class VideoListTests(APITestCase):
    """Tests for GET /api/videos/"""

    def setUp(self):
        self.user, self.profile, self.tokens = create_user_with_profile()
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {self.tokens['access']}"
        )

    def test_list_videos(self):
        for i in range(3):
            make_video(self.profile, title=f'Video {i}')

        response = self.client.get('/api/videos/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 3)


@override_settings(
    RATELIMIT_ENABLE=False,
    CACHES={'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'}},
)
class VideoStatusTests(APITestCase):
    """Tests for GET /api/videos/<id>/status/"""

    def setUp(self):
        self.user, self.profile, self.tokens = create_user_with_profile()
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {self.tokens['access']}"
        )

    def test_video_status(self):
        video = make_video(self.profile, status='processing', progress=45)
        response = self.client.get(f'/api/videos/{video.id}/status/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'processing')
        self.assertEqual(response.data['progress'], 45)


@override_settings(
    RATELIMIT_ENABLE=False,
    CACHES={'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'}},
)
class VideoDeleteTests(APITestCase):
    """Tests for DELETE /api/videos/<id>/delete/"""

    def setUp(self):
        self.user, self.profile, self.tokens = create_user_with_profile()
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {self.tokens['access']}"
        )

    def test_delete_completed_video(self):
        video = make_video(self.profile, status='completed')
        response = self.client.delete(f'/api/videos/{video.id}/delete/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(VideoGeneration.objects.filter(id=video.id).exists())

    def test_delete_processing_video(self):
        video = make_video(self.profile, status='processing')
        response = self.client.delete(f'/api/videos/{video.id}/delete/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(VideoGeneration.objects.filter(id=video.id).exists())


@override_settings(
    RATELIMIT_ENABLE=False,
    CACHES={'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'}},
)
class N8NWebhookTests(APITestCase):
    """Tests for POST /api/videos/webhook/n8n/"""

    def setUp(self):
        self.user, self.profile, _ = create_user_with_profile(credits=0)
        self.video = make_video(
            self.profile, status='processing', credits_used=30
        )
        self.api_key = settings.N8N_API_KEY

    def test_n8n_webhook_completed(self):
        response = self.client.post(
            '/api/videos/webhook/n8n/',
            {
                'video_id': str(self.video.id),
                'status': 'completed',
                'video_url': 'https://cdn.example.com/video.mp4',
                'progress': 100,
            },
            format='json',
            HTTP_X_API_KEY=self.api_key,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.video.refresh_from_db()
        self.assertEqual(self.video.status, 'completed')
        self.assertEqual(self.video.progress, 100)
        self.assertEqual(self.video.video_url, 'https://cdn.example.com/video.mp4')

        self.profile.refresh_from_db()
        self.assertEqual(self.profile.total_videos_generated, 1)

    def test_n8n_webhook_failed_refunds(self):
        response = self.client.post(
            '/api/videos/webhook/n8n/',
            {
                'video_id': str(self.video.id),
                'status': 'failed',
                'error_message': 'Rendering failed.',
            },
            format='json',
            HTTP_X_API_KEY=self.api_key,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.video.refresh_from_db()
        self.assertEqual(self.video.status, 'failed')

        # Credits refunded
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.credits, 30)  # 0 + 30 refund

    def test_n8n_webhook_invalid_key(self):
        response = self.client.post(
            '/api/videos/webhook/n8n/',
            {
                'video_id': str(self.video.id),
                'status': 'completed',
            },
            format='json',
            HTTP_X_API_KEY='wrong-key',
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
