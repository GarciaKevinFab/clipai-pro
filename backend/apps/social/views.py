import requests as http_requests
from urllib.parse import urlencode
from datetime import timedelta

from django.conf import settings
from django.shortcuts import redirect
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status

from apps.social.models import SocialAccount
from apps.social.serializers import SocialAccountSerializer


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _frontend_redirect(platform, error=None):
    """Construye la URL de redirección al frontend."""
    base = f"{settings.FRONTEND_URL}/redes-sociales"
    if error:
        return redirect(f"{base}?error={error}&platform={platform}")
    return redirect(f"{base}?connected={platform}")


def _upsert_social_account(user, platform, platform_user_id, platform_username,
                           access_token, refresh_token=None, expires_in=None):
    """Crea o actualiza una cuenta social vinculada al usuario."""
    token_expires_at = None
    if expires_in:
        token_expires_at = timezone.now() + timedelta(seconds=int(expires_in))

    SocialAccount.objects.update_or_create(
        user=user,
        platform=platform,
        defaults={
            'platform_user_id': str(platform_user_id),
            'platform_username': platform_username,
            'access_token': access_token,
            'refresh_token': refresh_token or '',
            'token_expires_at': token_expires_at,
            'is_active': True,
        },
    )


# ---------------------------------------------------------------------------
# TikTok OAuth
# ---------------------------------------------------------------------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tiktok_start(request):
    """Genera la URL de autorización de TikTok y la devuelve al frontend."""
    request.session['social_auth_user_id'] = request.user.profile.id

    params = urlencode({
        'client_key': settings.TIKTOK_CLIENT_KEY,
        'redirect_uri': settings.TIKTOK_REDIRECT_URI,
        'scope': 'user.info.basic,video.upload',
        'response_type': 'code',
        'state': 'tiktok',
    })
    auth_url = f"https://www.tiktok.com/v2/auth/authorize/?{params}"
    return Response({'auth_url': auth_url})


@api_view(['GET'])
@permission_classes([AllowAny])
def tiktok_callback(request):
    """Callback de TikTok: intercambia el código por tokens y crea la cuenta."""
    code = request.GET.get('code')
    if not code:
        return _frontend_redirect('tiktok', error='no_code')

    user_id = request.session.get('social_auth_user_id')
    if not user_id:
        return _frontend_redirect('tiktok', error='sesion_expirada')

    # Intercambiar código por token
    token_resp = http_requests.post(
        'https://open.tiktokapis.com/v2/oauth/token/',
        data={
            'client_key': settings.TIKTOK_CLIENT_KEY,
            'client_secret': settings.TIKTOK_CLIENT_SECRET,
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': settings.TIKTOK_REDIRECT_URI,
        },
    )

    if token_resp.status_code != 200:
        return _frontend_redirect('tiktok', error='error_token')

    token_data = token_resp.json()
    access_token = token_data.get('access_token')
    refresh_token = token_data.get('refresh_token')
    expires_in = token_data.get('expires_in')
    open_id = token_data.get('open_id')

    # Obtener información del usuario
    user_info_resp = http_requests.get(
        'https://open.tiktokapis.com/v2/user/info/',
        headers={'Authorization': f'Bearer {access_token}'},
        params={'fields': 'open_id,display_name,username'},
    )

    username = ''
    if user_info_resp.status_code == 200:
        user_data = user_info_resp.json().get('data', {}).get('user', {})
        username = user_data.get('username') or user_data.get('display_name', '')

    from apps.users.models import UserProfile
    try:
        user_profile = UserProfile.objects.get(id=user_id)
    except UserProfile.DoesNotExist:
        return _frontend_redirect('tiktok', error='usuario_no_encontrado')

    _upsert_social_account(
        user=user_profile,
        platform='tiktok',
        platform_user_id=open_id,
        platform_username=username,
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=expires_in,
    )

    return _frontend_redirect('tiktok')


# ---------------------------------------------------------------------------
# YouTube (Google) OAuth
# ---------------------------------------------------------------------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def youtube_start(request):
    """Genera la URL de autorización de Google/YouTube y la devuelve al frontend."""
    request.session['social_auth_user_id'] = request.user.profile.id

    params = urlencode({
        'client_id': settings.GOOGLE_CLIENT_ID,
        'redirect_uri': settings.GOOGLE_REDIRECT_URI,
        'scope': 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/userinfo.profile',
        'response_type': 'code',
        'access_type': 'offline',
        'prompt': 'consent',
        'state': 'youtube',
    })
    auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{params}"
    return Response({'auth_url': auth_url})


@api_view(['GET'])
@permission_classes([AllowAny])
def youtube_callback(request):
    """Callback de Google: intercambia el código por tokens y crea la cuenta."""
    code = request.GET.get('code')
    if not code:
        return _frontend_redirect('youtube', error='no_code')

    user_id = request.session.get('social_auth_user_id')
    if not user_id:
        return _frontend_redirect('youtube', error='sesion_expirada')

    # Intercambiar código por token
    token_resp = http_requests.post(
        'https://oauth2.googleapis.com/token',
        data={
            'client_id': settings.GOOGLE_CLIENT_ID,
            'client_secret': settings.GOOGLE_CLIENT_SECRET,
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': settings.GOOGLE_REDIRECT_URI,
        },
    )

    if token_resp.status_code != 200:
        return _frontend_redirect('youtube', error='error_token')

    token_data = token_resp.json()
    access_token = token_data.get('access_token')
    refresh_token = token_data.get('refresh_token')
    expires_in = token_data.get('expires_in')

    # Obtener información del usuario
    user_info_resp = http_requests.get(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        headers={'Authorization': f'Bearer {access_token}'},
    )

    if user_info_resp.status_code != 200:
        return _frontend_redirect('youtube', error='error_usuario')

    user_data = user_info_resp.json()
    google_id = user_data.get('id')
    username = user_data.get('name', '')

    from apps.users.models import UserProfile
    try:
        user_profile = UserProfile.objects.get(id=user_id)
    except UserProfile.DoesNotExist:
        return _frontend_redirect('youtube', error='usuario_no_encontrado')

    _upsert_social_account(
        user=user_profile,
        platform='youtube',
        platform_user_id=google_id,
        platform_username=username,
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=expires_in,
    )

    return _frontend_redirect('youtube')


# ---------------------------------------------------------------------------
# Instagram (Meta) OAuth
# ---------------------------------------------------------------------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def instagram_start(request):
    """Genera la URL de autorización de Meta/Instagram y la devuelve al frontend."""
    request.session['social_auth_user_id'] = request.user.profile.id

    params = urlencode({
        'client_id': settings.META_APP_ID,
        'redirect_uri': settings.INSTAGRAM_REDIRECT_URI,
        'scope': 'instagram_basic,instagram_content_publish',
        'response_type': 'code',
        'state': 'instagram',
    })
    auth_url = f"https://www.facebook.com/v18.0/dialog/oauth?{params}"
    return Response({'auth_url': auth_url})


@api_view(['GET'])
@permission_classes([AllowAny])
def instagram_callback(request):
    """Callback de Meta: intercambia el código, obtiene token de larga duración y crea la cuenta."""
    code = request.GET.get('code')
    if not code:
        return _frontend_redirect('instagram', error='no_code')

    user_id = request.session.get('social_auth_user_id')
    if not user_id:
        return _frontend_redirect('instagram', error='sesion_expirada')

    # Intercambiar código por token de corta duración
    token_resp = http_requests.post(
        'https://graph.facebook.com/v18.0/oauth/access_token',
        data={
            'client_id': settings.META_APP_ID,
            'client_secret': settings.META_APP_SECRET,
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': settings.INSTAGRAM_REDIRECT_URI,
        },
    )

    if token_resp.status_code != 200:
        return _frontend_redirect('instagram', error='error_token')

    token_data = token_resp.json()
    short_lived_token = token_data.get('access_token')

    # Obtener token de larga duración
    long_token_resp = http_requests.get(
        'https://graph.facebook.com/v18.0/oauth/access_token',
        params={
            'grant_type': 'fb_exchange_token',
            'client_id': settings.META_APP_ID,
            'client_secret': settings.META_APP_SECRET,
            'fb_exchange_token': short_lived_token,
        },
    )

    if long_token_resp.status_code == 200:
        long_token_data = long_token_resp.json()
        access_token = long_token_data.get('access_token', short_lived_token)
        expires_in = long_token_data.get('expires_in')
    else:
        access_token = short_lived_token
        expires_in = token_data.get('expires_in')

    # Obtener páginas del usuario para encontrar la cuenta de Instagram vinculada
    pages_resp = http_requests.get(
        'https://graph.facebook.com/v18.0/me/accounts',
        params={'access_token': access_token},
    )

    ig_user_id = ''
    ig_username = ''

    if pages_resp.status_code == 200:
        pages = pages_resp.json().get('data', [])
        for page in pages:
            page_id = page.get('id')
            ig_resp = http_requests.get(
                f'https://graph.facebook.com/v18.0/{page_id}',
                params={
                    'fields': 'instagram_business_account',
                    'access_token': access_token,
                },
            )
            if ig_resp.status_code == 200:
                ig_account = ig_resp.json().get('instagram_business_account')
                if ig_account:
                    ig_user_id = ig_account.get('id', '')
                    # Obtener username de Instagram
                    ig_info_resp = http_requests.get(
                        f'https://graph.facebook.com/v18.0/{ig_user_id}',
                        params={
                            'fields': 'username',
                            'access_token': access_token,
                        },
                    )
                    if ig_info_resp.status_code == 200:
                        ig_username = ig_info_resp.json().get('username', '')
                    break

    if not ig_user_id:
        return _frontend_redirect('instagram', error='cuenta_instagram_no_encontrada')

    from apps.users.models import UserProfile
    try:
        user_profile = UserProfile.objects.get(id=user_id)
    except UserProfile.DoesNotExist:
        return _frontend_redirect('instagram', error='usuario_no_encontrado')

    _upsert_social_account(
        user=user_profile,
        platform='instagram',
        platform_user_id=ig_user_id,
        platform_username=ig_username,
        access_token=access_token,
        expires_in=expires_in,
    )

    return _frontend_redirect('instagram')


# ---------------------------------------------------------------------------
# Gestión de cuentas sociales
# ---------------------------------------------------------------------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def social_accounts_view(request):
    """Lista todas las cuentas sociales conectadas del usuario."""
    accounts = SocialAccount.objects.filter(user=request.user.profile, is_active=True)
    serializer = SocialAccountSerializer(accounts, many=True)
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def disconnect_view(request, id):
    """Desconecta (elimina) una cuenta social del usuario."""
    try:
        account = SocialAccount.objects.get(id=id, user=request.user.profile)
    except SocialAccount.DoesNotExist:
        return Response(
            {'error': 'Cuenta social no encontrada.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    account.delete()
    return Response(
        {'message': 'Cuenta desconectada exitosamente.'},
        status=status.HTTP_200_OK,
    )
