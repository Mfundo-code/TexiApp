from rest_framework import serializers
from .models import CustomUser, Ride, Message  # ← added Message here

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    mode = serializers.ChoiceField(
        choices=CustomUser.MODE_CHOICES,
        required=False  # Optional; defaults to 'passenger'
    )

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'phone', 'password', 'mode']

    def create(self, validated_data):
        # Extract mode if provided
        mode = validated_data.pop('mode', 'passenger')
        user = CustomUser.objects.create_user(**validated_data)
        user.mode = mode
        user.save(update_fields=['mode'])
        return user


class RideSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)

    class Meta:
        model = Ride
        fields = [
            'id',
            'ride_type',
            'username',
            'phone',
            'pickup_name',
            'pickup_lat',
            'pickup_lng',
            'dropoff_name',
            'dropoff_lat',
            'dropoff_lng',
            'departure_time',  # ✅ Added departure_time
            'created_at',
            'is_active',
        ]
        read_only_fields = ['user', 'created_at']


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    is_me = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'content', 'timestamp', 'sender_name', 'is_me']
        read_only_fields = ['sender', 'recipient', 'ride']

    def get_is_me(self, obj):
        # returns True if the message was sent by the requesting user
        return obj.sender == self.context['request'].user
