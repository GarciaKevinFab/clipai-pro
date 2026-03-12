from django.contrib.auth.models import User
from django.conf import settings
from django.test import TestCase

from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.users.models import UserProfile, CreditTransaction


def create_user_with_profile(
    username='testuser',
    email='test@example.com',
    password='TestPass123!',
    credits=5,
):
    """Helper: create User + UserProfile and return (user, profile, tokens)."""
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
    )
    profile = UserProfile.objects.create(user=user, credits=credits)
    refresh = RefreshToken.for_user(user)
    tokens = {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }
    return user, profile, tokens


class AuthRegisterTests(APITestCase):
    """Tests for POST /api/auth/register/"""

    def test_register_success(self):
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'StrongPass123!',
            'password_confirm': 'StrongPass123!',
        }
        response = self.client.post('/api/auth/register/', data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])
        self.assertIn('refresh', response.data['tokens'])

        # User and profile created
        self.assertTrue(User.objects.filter(email='new@example.com').exists())
        profile = User.objects.get(email='new@example.com').profile
        self.assertEqual(profile.credits, 5)

        # Welcome bonus transaction recorded
        self.assertTrue(
            CreditTransaction.objects.filter(
                user=profile, concept='welcome_bonus', amount=5
            ).exists()
        )

    def test_register_duplicate_email(self):
        User.objects.create_user(
            username='existing', email='dup@example.com', password='Pass123!'
        )
        data = {
            'username': 'another',
            'email': 'dup@example.com',
            'password': 'StrongPass123!',
            'password_confirm': 'StrongPass123!',
        }
        response = self.client.post('/api/auth/register/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_with_referral(self):
        # Create referrer
        referrer_user = User.objects.create_user(
            username='referrer', email='ref@example.com', password='Pass123!'
        )
        referrer_profile = UserProfile.objects.create(
            user=referrer_user, credits=5, referral_code='REFCODE123'
        )

        data = {
            'username': 'referred',
            'email': 'referred@example.com',
            'password': 'StrongPass123!',
            'password_confirm': 'StrongPass123!',
            'ref': 'REFCODE123',
        }
        response = self.client.post('/api/auth/register/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        referred_profile = User.objects.get(email='referred@example.com').profile
        self.assertEqual(referred_profile.referred_by, referrer_profile)


class AuthLoginTests(APITestCase):
    """Tests for POST /api/auth/login/"""

    def setUp(self):
        self.user, self.profile, _ = create_user_with_profile()

    def test_login_success(self):
        data = {'email': 'test@example.com', 'password': 'TestPass123!'}
        response = self.client.post('/api/auth/login/', data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])
        self.assertIn('refresh', response.data['tokens'])

    def test_login_wrong_password(self):
        data = {'email': 'test@example.com', 'password': 'WrongPass999!'}
        response = self.client.post('/api/auth/login/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class MeViewTests(APITestCase):
    """Tests for GET/PATCH /api/auth/me/"""

    def setUp(self):
        self.user, self.profile, self.tokens = create_user_with_profile()

    def test_me_authenticated(self):
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {self.tokens['access']}"
        )
        response = self.client.get('/api/auth/me/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['credits'], 5)
        self.assertEqual(response.data['email'], 'test@example.com')

    def test_me_unauthenticated(self):
        response = self.client.get('/api/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_profile(self):
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {self.tokens['access']}"
        )
        response = self.client.patch(
            '/api/auth/me/',
            {'onboarding_completed': True},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.profile.refresh_from_db()
        self.assertTrue(self.profile.onboarding_completed)


class ChangePasswordTests(APITestCase):
    """Tests for POST /api/auth/change-password/"""

    def setUp(self):
        self.user, self.profile, self.tokens = create_user_with_profile()
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {self.tokens['access']}"
        )

    def test_change_password(self):
        data = {
            'old_password': 'TestPass123!',
            'new_password': 'NewStrongPass456!',
        }
        response = self.client.post(
            '/api/auth/change-password/', data, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify new password works
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NewStrongPass456!'))
