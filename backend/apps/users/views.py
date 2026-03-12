from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.conf import settings
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    RegisterSerializer, LoginSerializer, UserProfileSerializer,
    ChangePasswordSerializer, ForgotPasswordSerializer, ResetPasswordSerializer,
)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()

    refresh = RefreshToken.for_user(user)
    profile = user.profile

    return Response({
        'message': 'Cuenta creada exitosamente. Tienes 5 creditos de bienvenida.',
        'tokens': {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        },
        'user': UserProfileSerializer(profile).data,
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.validated_data['user']

    refresh = RefreshToken.for_user(user)
    profile = user.profile

    return Response({
        'tokens': {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        },
        'user': UserProfileSerializer(profile).data,
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_view(request):
    refresh_token = request.data.get('refresh')
    if not refresh_token:
        return Response(
            {'error': 'Se requiere el refresh token.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    try:
        refresh = RefreshToken(refresh_token)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })
    except Exception:
        return Response(
            {'error': 'Refresh token invalido o expirado.'},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    refresh_token = request.data.get('refresh')
    if not refresh_token:
        return Response(
            {'error': 'Se requiere el refresh token.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': 'Sesion cerrada exitosamente.'})
    except Exception:
        return Response(
            {'error': 'Token invalido.'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def me_view(request):
    profile = request.user.profile

    if request.method == 'GET':
        return Response(UserProfileSerializer(profile).data)

    serializer = UserProfileSerializer(profile, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    serializer = ChangePasswordSerializer(
        data=request.data, context={'request': request}
    )
    serializer.is_valid(raise_exception=True)

    request.user.set_password(serializer.validated_data['new_password'])
    request.user.save()

    return Response({'message': 'Contrasena actualizada exitosamente.'})


@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password_view(request):
    serializer = ForgotPasswordSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    email = serializer.validated_data['email']
    try:
        user = User.objects.get(email=email)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_url = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"

        send_mail(
            subject='ClipAI Pro - Recuperar contrasena',
            message=f'Hola {user.first_name or user.username},\n\n'
                    f'Haz clic en el siguiente enlace para restablecer tu contrasena:\n'
                    f'{reset_url}\n\n'
                    f'Este enlace expira en 24 horas.\n\n'
                    f'Si no solicitaste este cambio, ignora este email.\n\n'
                    f'— Equipo ClipAI Pro',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
    except User.DoesNotExist:
        pass

    return Response({
        'message': 'Si el email existe, recibiras un enlace para restablecer tu contrasena.'
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password_view(request):
    serializer = ResetPasswordSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user = serializer.validated_data['user']
    user.set_password(serializer.validated_data['new_password'])
    user.save()

    return Response({'message': 'Contrasena restablecida exitosamente.'})
