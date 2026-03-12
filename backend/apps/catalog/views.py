from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny

from apps.catalog.models import Style, Voice, Music
from apps.catalog.serializers import (
    StyleSerializer,
    VoiceSerializer,
    MusicSerializer,
    PlanSerializer,
)
from apps.payments.models import Plan


class StyleListView(ListAPIView):
    serializer_class = StyleSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Style.objects.filter(is_active=True)


class VoiceListView(ListAPIView):
    serializer_class = VoiceSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = Voice.objects.filter(is_active=True)

        gender = self.request.query_params.get('gender')
        if gender:
            qs = qs.filter(gender=gender)

        tags = self.request.query_params.get('tags')
        if tags:
            qs = qs.filter(tags__icontains=tags)

        return qs


class MusicListView(ListAPIView):
    serializer_class = MusicSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = Music.objects.filter(is_active=True)

        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category=category)

        return qs


class PlanListView(ListAPIView):
    serializer_class = PlanSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Plan.objects.filter(is_active=True)
