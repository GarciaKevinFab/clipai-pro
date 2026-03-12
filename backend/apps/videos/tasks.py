import logging

import requests
from celery import shared_task
from django.conf import settings

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=30)
def generate_video(self, video_id):
    from apps.videos.models import VideoGeneration

    try:
        video = VideoGeneration.objects.select_related('user').get(id=video_id)
    except VideoGeneration.DoesNotExist:
        logger.error(f"VideoGeneration {video_id} no encontrado.")
        return

    payload = {
        'video_id': str(video.id),
        'script': video.script,
        'video_type': video.video_type,
        'style': video.style,
        'voice_id': video.voice_id,
        'music_id': video.music_id or '',
        'format': video.format,
        'clips_count': video.clips_count,
        'clip_duration': video.clip_duration,
        'user_id': str(video.user.id),
    }

    try:
        response = requests.post(
            settings.N8N_WEBHOOK_URL,
            json=payload,
            headers={
                'Authorization': f'Bearer {settings.N8N_API_KEY}',
                'Content-Type': 'application/json',
            },
            timeout=30,
        )
        response.raise_for_status()

        data = response.json()
        video.status = 'generating_images'
        video.n8n_execution_id = data.get('executionId', '')
        video.progress = 10
        video.save()

        logger.info(f"Video {video_id} enviado a N8N exitosamente.")

    except requests.RequestException as exc:
        logger.error(f"Error al enviar video {video_id} a N8N: {exc}")

        video.status = 'failed'
        video.error_message = f'Error al conectar con el servicio de generacion: {str(exc)}'
        video.save()

        # Reembolsar creditos
        profile = video.user
        profile.add_credits(
            video.credits_used,
            'video_failed_refund',
            reference_id=str(video.id),
        )

        logger.info(
            f"Creditos reembolsados ({video.credits_used}) al usuario "
            f"{profile.user.username} por fallo en video {video_id}."
        )
