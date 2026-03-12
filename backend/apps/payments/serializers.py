from rest_framework import serializers

from apps.payments.models import Plan, Subscription, Payment


class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = '__all__'


class SubscriptionSerializer(serializers.ModelSerializer):
    plan = PlanSerializer(read_only=True)

    class Meta:
        model = Subscription
        fields = '__all__'


class PaymentSerializer(serializers.ModelSerializer):
    plan_name = serializers.CharField(source='plan.display_name', read_only=True)

    class Meta:
        model = Payment
        fields = '__all__'


class CreateChargeSerializer(serializers.Serializer):
    plan_id = serializers.UUIDField(
        error_messages={
            'required': 'El plan es obligatorio.',
            'invalid': 'El ID del plan no es valido.',
        },
    )
    culqi_token = serializers.CharField(
        max_length=255,
        error_messages={
            'required': 'El token de pago es obligatorio.',
            'blank': 'El token de pago no puede estar vacio.',
        },
    )

    def validate_plan_id(self, value):
        try:
            Plan.objects.get(id=value, is_active=True)
        except Plan.DoesNotExist:
            raise serializers.ValidationError(
                'El plan seleccionado no existe o no esta disponible.'
            )
        return value
