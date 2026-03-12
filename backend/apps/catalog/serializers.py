from rest_framework import serializers

from apps.catalog.models import Style, Voice, Music
from apps.payments.models import Plan


class StyleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Style
        fields = ['id', 'key', 'name', 'emoji', 'is_new', 'order']


class VoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Voice
        fields = [
            'id', 'voice_id', 'name', 'description',
            'tags', 'gender', 'preview_url', 'order',
        ]


class MusicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Music
        fields = [
            'id', 'music_id', 'name', 'category',
            'preview_url', 'order',
        ]


class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = [
            'id', 'name', 'display_name', 'price_pen',
            'price_original_pen', 'credits', 'videos_per_period',
            'period', 'features', 'is_popular', 'order',
        ]
