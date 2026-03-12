from rest_framework import serializers
from apps.social.models import SocialAccount


class SocialAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialAccount
        exclude = ['access_token', 'refresh_token']
        read_only_fields = ['id', 'user', 'connected_at']
