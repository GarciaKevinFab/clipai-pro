import logging

from django.conf import settings
from django.utils import timezone
from django_ratelimit.decorators import ratelimit

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.videos.constants import CREDIT_COSTS
from apps.videos.models import VideoGeneration
from apps.videos.serializers import (
    VideoGenerationSerializer,
    VideoGenerateSerializer,
    VideoStatusSerializer,
    VideoPublishSerializer,
)
from apps.videos.tasks import generate_video

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# GET /api/videos/
# ---------------------------------------------------------------------------
class VideoListView(ListAPIView):
    serializer_class = VideoGenerationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = VideoGeneration.objects.filter(user=self.request.user.profile)

        video_status = self.request.query_params.get('status')
        if video_status:
            qs = qs.filter(status=video_status)

        video_type = self.request.query_params.get('video_type')
        if video_type:
            qs = qs.filter(video_type=video_type)

        return qs.order_by('-created_at')


# ---------------------------------------------------------------------------
# POST /api/videos/generate/
# ---------------------------------------------------------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@ratelimit(key='user', rate='5/m', method='POST', block=True)
def video_generate_view(request):
    serializer = VideoGenerateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    profile = request.user.profile
    video_type = data['video_type']
    cost = CREDIT_COSTS.get(video_type)

    if cost is None:
        return Response(
            {'error': 'Tipo de video no valido.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    total_cost = cost * data['clips_count']

    if not profile.can_generate(total_cost):
        return Response(
            {
                'error': 'No tienes suficientes creditos.',
                'creditos_necesarios': total_cost,
                'creditos_disponibles': profile.credits,
            },
            status=status.HTTP_402_PAYMENT_REQUIRED,
        )

    # Deducir creditos
    profile.deduct_credits(
        total_cost,
        'video_generated',
        reference_id=None,  # se actualiza despues
    )

    # Crear VideoGeneration
    video = VideoGeneration.objects.create(
        user=profile,
        title=data.get('title', ''),
        script=data['script'],
        video_type=video_type,
        style=data['style'],
        voice_id=data['voice_id'],
        music_id=data.get('music_id', ''),
        format=data.get('format', '9:16'),
        clips_count=data['clips_count'],
        clip_duration=data['clip_duration'],
        credits_used=total_cost,
        status='processing',
    )

    # Despachar tarea Celery
    generate_video.delay(str(video.id))

    return Response(
        {
            'message': 'Video en proceso de generacion.',
            'video': VideoGenerationSerializer(video).data,
        },
        status=status.HTTP_201_CREATED,
    )


# ---------------------------------------------------------------------------
# GET /api/videos/<id>/
# ---------------------------------------------------------------------------
class VideoDetailView(RetrieveAPIView):
    serializer_class = VideoGenerationSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        return VideoGeneration.objects.filter(
            user=self.request.user.profile,
        ).prefetch_related('scenes')


# ---------------------------------------------------------------------------
# GET /api/videos/<id>/status/
# ---------------------------------------------------------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def video_status_view(request, id):
    try:
        video = VideoGeneration.objects.get(id=id, user=request.user.profile)
    except VideoGeneration.DoesNotExist:
        return Response(
            {'error': 'Video no encontrado.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    return Response(VideoStatusSerializer(video).data)


# ---------------------------------------------------------------------------
# DELETE /api/videos/<id>/
# ---------------------------------------------------------------------------
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def video_delete_view(request, id):
    try:
        video = VideoGeneration.objects.get(id=id, user=request.user.profile)
    except VideoGeneration.DoesNotExist:
        return Response(
            {'error': 'Video no encontrado.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    if video.status not in ('completed', 'failed'):
        return Response(
            {'error': 'Solo puedes eliminar videos completados o fallidos.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    video.delete()
    return Response(
        {'message': 'Video eliminado exitosamente.'},
        status=status.HTTP_200_OK,
    )


# ---------------------------------------------------------------------------
# POST /api/videos/<id>/publish/
# ---------------------------------------------------------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def video_publish_view(request, id):
    try:
        video = VideoGeneration.objects.get(id=id, user=request.user.profile)
    except VideoGeneration.DoesNotExist:
        return Response(
            {'error': 'Video no encontrado.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    if video.status != 'completed':
        return Response(
            {'error': 'Solo puedes publicar videos completados.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    serializer = VideoPublishSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    platforms = serializer.validated_data['platforms']

    if 'tiktok' in platforms:
        video.published_to_tiktok = True
    if 'youtube' in platforms:
        video.published_to_youtube = True
    if 'instagram' in platforms:
        video.published_to_instagram = True

    video.save()

    return Response({
        'message': 'Video marcado para publicacion.',
        'platforms': platforms,
    })


# ---------------------------------------------------------------------------
# POST /api/videos/webhook/n8n/  (AllowAny, validates X-API-Key)
# ---------------------------------------------------------------------------
@api_view(['POST'])
@permission_classes([AllowAny])
def n8n_webhook_view(request):
    # Validar API key
    api_key = request.headers.get('X-API-Key', '')
    if api_key != settings.N8N_API_KEY:
        return Response(
            {'error': 'API key invalida.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    video_id = request.data.get('video_id')
    if not video_id:
        return Response(
            {'error': 'Se requiere video_id.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        video = VideoGeneration.objects.select_related('user').get(id=video_id)
    except VideoGeneration.DoesNotExist:
        return Response(
            {'error': 'Video no encontrado.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    new_status = request.data.get('status')
    valid_statuses = [s[0] for s in VideoGeneration.STATUS_CHOICES]

    if new_status and new_status in valid_statuses:
        video.status = new_status

    # Actualizar campos opcionales
    video_url = request.data.get('video_url')
    if video_url:
        video.video_url = video_url

    thumbnail_url = request.data.get('thumbnail_url')
    if thumbnail_url:
        video.thumbnail_url = thumbnail_url

    progress = request.data.get('progress')
    if progress is not None:
        video.progress = int(progress)

    error_message = request.data.get('error_message')
    if error_message:
        video.error_message = error_message

    duration_seconds = request.data.get('duration_seconds')
    if duration_seconds is not None:
        video.duration_seconds = float(duration_seconds)

    file_size_mb = request.data.get('file_size_mb')
    if file_size_mb is not None:
        video.file_size_mb = float(file_size_mb)

    # Logica por estado final
    if new_status == 'completed':
        video.completed_at = timezone.now()
        video.progress = 100
        profile = video.user
        profile.total_videos_generated += 1
        profile.save()

    elif new_status == 'failed':
        # Reembolsar creditos
        profile = video.user
        profile.add_credits(
            video.credits_used,
            'video_failed_refund',
            reference_id=str(video.id),
        )
        logger.info(
            f"Webhook N8N: creditos reembolsados ({video.credits_used}) "
            f"al usuario {profile.user.username} por video {video.id}."
        )

    video.save()

    return Response({'message': 'Webhook procesado exitosamente.'})
