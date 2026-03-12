from rest_framework import serializers

from apps.videos.models import VideoGeneration, VideoScene


class VideoSceneSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoScene
        fields = [
            'id', 'order', 'prompt', 'narration_text',
            'image_url', 'duration_seconds',
        ]


class VideoGenerationSerializer(serializers.ModelSerializer):
    scenes = VideoSceneSerializer(many=True, read_only=True)
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = VideoGeneration
        fields = [
            'id', 'user', 'title', 'script', 'video_type', 'style',
            'voice_id', 'voice_name', 'music_id', 'format',
            'clips_count', 'clip_duration', 'credits_used',
            'status', 'progress', 'error_message',
            'video_url', 'thumbnail_url', 'duration_seconds',
            'resolution', 'file_size_mb', 'n8n_execution_id',
            'published_to_tiktok', 'published_to_youtube',
            'published_to_instagram',
            'created_at', 'completed_at',
            'scenes',
        ]
        read_only_fields = [
            'id', 'user', 'credits_used', 'status', 'progress',
            'error_message', 'video_url', 'thumbnail_url',
            'duration_seconds', 'resolution', 'file_size_mb',
            'n8n_execution_id', 'published_to_tiktok',
            'published_to_youtube', 'published_to_instagram',
            'created_at', 'completed_at',
        ]


class VideoGenerateSerializer(serializers.Serializer):
    script = serializers.CharField(max_length=2000)
    video_type = serializers.ChoiceField(
        choices=['prompt_to_video', 'sora2', 'ai_asmr'],
    )
    style = serializers.CharField(max_length=50)
    voice_id = serializers.CharField(max_length=100)
    music_id = serializers.CharField(max_length=100, required=False, allow_blank=True)
    format = serializers.ChoiceField(
        choices=['9:16', '16:9', '1:1'],
        default='9:16',
    )
    clips_count = serializers.IntegerField(min_value=1, max_value=10)
    clip_duration = serializers.ChoiceField(choices=[4, 6, 8, 12])
    title = serializers.CharField(max_length=200, required=False, allow_blank=True)


class VideoStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoGeneration
        fields = ['status', 'progress', 'video_url', 'error_message']


class VideoPublishSerializer(serializers.Serializer):
    platforms = serializers.ListField(
        child=serializers.ChoiceField(choices=['tiktok', 'youtube', 'instagram']),
        min_length=1,
    )
