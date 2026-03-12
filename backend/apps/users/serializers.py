from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from rest_framework import serializers

from .models import UserProfile, CreditTransaction


class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')

    class Meta:
        model = UserProfile
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'credits', 'plan', 'plan_expires_at', 'referral_code',
            'total_videos_generated', 'avatar_url', 'onboarding_completed',
            'created_at',
        ]
        read_only_fields = [
            'id', 'credits', 'plan', 'plan_expires_at', 'referral_code',
            'total_videos_generated', 'created_at',
        ]

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        if 'first_name' in user_data:
            instance.user.first_name = user_data['first_name']
        if 'last_name' in user_data:
            instance.user.last_name = user_data['last_name']
        instance.user.save()
        return super().update(instance, validated_data)


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    ref = serializers.CharField(required=False, allow_blank=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Este nombre de usuario ya esta en uso.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este email ya esta registrado.")
        return value

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Las contrasenas no coinciden.'
            })
        return data

    def create(self, validated_data):
        ref_code = validated_data.pop('ref', None)
        validated_data.pop('password_confirm')

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
        )

        referred_by = None
        if ref_code:
            try:
                referred_by = UserProfile.objects.get(referral_code=ref_code)
            except UserProfile.DoesNotExist:
                pass

        profile = UserProfile.objects.create(
            user=user,
            credits=5,
            referred_by=referred_by,
        )

        CreditTransaction.objects.create(
            user=profile,
            amount=5,
            concept='welcome_bonus',
        )

        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        from django.contrib.auth import authenticate
        try:
            user = User.objects.get(email=data['email'])
        except User.DoesNotExist:
            raise serializers.ValidationError({
                'email': 'No existe una cuenta con este email.'
            })

        user = authenticate(username=user.username, password=data['password'])
        if not user:
            raise serializers.ValidationError({
                'password': 'Contrasena incorrecta.'
            })

        if not user.is_active:
            raise serializers.ValidationError({
                'email': 'Esta cuenta ha sido desactivada.'
            })

        data['user'] = user
        return data


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("La contrasena actual es incorrecta.")
        return value


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])

    def validate(self, data):
        try:
            uid = urlsafe_base64_decode(data['uid']).decode()
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError({
                'uid': 'Link de recuperacion invalido.'
            })

        if not default_token_generator.check_token(user, data['token']):
            raise serializers.ValidationError({
                'token': 'El link de recuperacion ha expirado o es invalido.'
            })

        data['user'] = user
        return data


class CreditTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditTransaction
        fields = ['id', 'amount', 'concept', 'reference_id', 'created_at']
