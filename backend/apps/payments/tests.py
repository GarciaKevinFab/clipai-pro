import uuid
from decimal import Decimal
from unittest.mock import patch, MagicMock

from django.conf import settings
from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone

from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.affiliates.models import AffiliateProfile, AffiliateCommission
from apps.payments.models import Plan, Subscription, Payment
from apps.users.models import UserProfile


def create_user_with_profile(
    username='testuser',
    email='test@example.com',
    password='TestPass123!',
    credits=5,
):
    """Helper: create User + UserProfile and return (user, profile, tokens)."""
    user = User.objects.create_user(
        username=username, email=email, password=password,
    )
    profile = UserProfile.objects.create(user=user, credits=credits)
    refresh = RefreshToken.for_user(user)
    tokens = {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }
    return user, profile, tokens


def create_plan(**overrides):
    """Helper: create a Plan with sensible defaults."""
    defaults = {
        'name': 'starter',
        'display_name': 'Starter',
        'price_pen': Decimal('29.90'),
        'price_original_pen': Decimal('49.90'),
        'credits': 100,
        'videos_per_period': 30,
        'period': 'monthly',
        'features': ['Feature A', 'Feature B'],
        'is_active': True,
        'order': 1,
    }
    defaults.update(overrides)
    return Plan.objects.create(**defaults)


def mock_culqi_success_response():
    """Return a mock requests.Response for a successful Culqi charge."""
    mock_resp = MagicMock()
    mock_resp.status_code = 201
    mock_resp.json.return_value = {
        'id': 'chr_test_123456',
        'amount': 2990,
        'currency_code': 'PEN',
        'outcome': {'type': 'venta_exitosa'},
    }
    return mock_resp


class CreateChargeTests(APITestCase):
    """Tests for POST /api/payments/create-charge/"""

    def setUp(self):
        self.user, self.profile, self.tokens = create_user_with_profile()
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {self.tokens['access']}"
        )
        self.plan = create_plan()

    @patch('apps.payments.services.requests.post')
    def test_create_charge_success(self, mock_post):
        mock_post.return_value = mock_culqi_success_response()

        response = self.client.post(
            '/api/payments/create-charge/',
            {
                'plan_id': str(self.plan.id),
                'culqi_token': 'tkn_test_abc123',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('payment', response.data)

        # Payment record created
        payment = Payment.objects.get(
            culqi_charge_id='chr_test_123456'
        )
        self.assertEqual(payment.status, 'completed')
        self.assertEqual(payment.credits_added, 100)

        # Credits added to profile
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.credits, 5 + 100)

        # Subscription created
        sub = Subscription.objects.filter(
            user=self.profile, status='active'
        ).first()
        self.assertIsNotNone(sub)
        self.assertEqual(sub.plan, self.plan)

    def test_create_charge_invalid_plan(self):
        fake_id = uuid.uuid4()
        response = self.client.post(
            '/api/payments/create-charge/',
            {
                'plan_id': str(fake_id),
                'culqi_token': 'tkn_test_abc123',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class PaymentHistoryTests(APITestCase):
    """Tests for GET /api/payments/history/"""

    def setUp(self):
        self.user, self.profile, self.tokens = create_user_with_profile()
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {self.tokens['access']}"
        )
        self.plan = create_plan()

    def test_payment_history(self):
        for i in range(3):
            Payment.objects.create(
                user=self.profile,
                plan=self.plan,
                amount_pen=Decimal('29.90'),
                status='completed',
                credits_added=100,
            )

        response = self.client.get('/api/payments/history/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 3)


class SubscriptionViewTests(APITestCase):
    """Tests for GET /api/payments/subscription/"""

    def setUp(self):
        self.user, self.profile, self.tokens = create_user_with_profile()
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {self.tokens['access']}"
        )
        self.plan = create_plan()

    def test_subscription_view(self):
        now = timezone.now()
        sub = Subscription.objects.create(
            user=self.profile,
            plan=self.plan,
            status='active',
            current_period_start=now,
            current_period_end=now + timezone.timedelta(days=30),
        )

        response = self.client.get('/api/payments/subscription/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(response.data['subscription'])
        self.assertEqual(
            response.data['subscription']['id'], sub.id
        )


class CancelSubscriptionTests(APITestCase):
    """Tests for POST /api/payments/cancel/"""

    def setUp(self):
        self.user, self.profile, self.tokens = create_user_with_profile()
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {self.tokens['access']}"
        )
        self.plan = create_plan()

    def test_cancel_subscription(self):
        now = timezone.now()
        sub = Subscription.objects.create(
            user=self.profile,
            plan=self.plan,
            status='active',
            current_period_start=now,
            current_period_end=now + timezone.timedelta(days=30),
        )

        response = self.client.post('/api/payments/cancel/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        sub.refresh_from_db()
        self.assertEqual(sub.status, 'cancelled')
        self.assertIsNotNone(sub.cancelled_at)


class AffiliateCommissionTests(APITestCase):
    """Tests for affiliate commission creation on successful payment."""

    def setUp(self):
        # Create referrer with affiliate profile
        self.referrer_user, self.referrer_profile, _ = create_user_with_profile(
            username='referrer', email='referrer@example.com',
        )
        self.affiliate = AffiliateProfile.objects.create(
            user=self.referrer_profile,
            is_active=True,
            commission_rate=Decimal('0.30'),
        )

        # Create referred user
        self.user, self.profile, self.tokens = create_user_with_profile(
            username='referred', email='referred@example.com',
        )
        self.profile.referred_by = self.referrer_profile
        self.profile.save()

        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {self.tokens['access']}"
        )
        self.plan = create_plan()

    @patch('apps.payments.services.requests.post')
    def test_affiliate_commission_on_payment(self, mock_post):
        mock_post.return_value = mock_culqi_success_response()

        response = self.client.post(
            '/api/payments/create-charge/',
            {
                'plan_id': str(self.plan.id),
                'culqi_token': 'tkn_test_abc123',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Commission created
        commission = AffiliateCommission.objects.filter(
            affiliate=self.affiliate,
            referred_user=self.profile,
        ).first()
        self.assertIsNotNone(commission)

        expected = (self.plan.price_pen * Decimal('0.30')).quantize(
            Decimal('0.01')
        )
        self.assertEqual(commission.amount_pen, expected)
        self.assertEqual(commission.status, 'pending')

        # Affiliate totals updated
        self.affiliate.refresh_from_db()
        self.assertEqual(self.affiliate.total_referrals, 1)
        self.assertEqual(self.affiliate.total_earned_pen, expected)
