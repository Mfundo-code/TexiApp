from rest_framework import serializers
from .models import CustomUser, Ride, Message, Post, Comment

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={'input_type': 'password'}
    )
    mode = serializers.ChoiceField(
        choices=CustomUser.MODE_CHOICES,
        required=False
    )
    
    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'phone', 'password', 'mode']
    
    def validate(self, data):
        # Check if email already exists
        if CustomUser.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError("Email already exists")
        
        # Check if phone already exists
        if CustomUser.objects.filter(phone=data['phone']).exists():
            raise serializers.ValidationError("Phone number already exists")
        
        return data
    
    def create(self, validated_data):
        mode = validated_data.pop('mode', 'passenger')
        user = CustomUser.objects.create_user(**validated_data)
        user.mode = mode
        user.save(update_fields=['mode'])
        return user

class RideSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()
    ride_type_display = serializers.CharField(
        source='get_ride_type_display', 
        read_only=True
    )
    
    class Meta:
        model = Ride
        fields = [
            'id', 'ride_type', 'ride_type_display', 'username', 'phone',
            'pickup_name', 'pickup_lat', 'pickup_lng', 
            'dropoff_name', 'dropoff_lat', 'dropoff_lng',
            'departure_time', 'created_at', 'is_active'
        ]
        read_only_fields = ['user', 'created_at']
    
    def get_username(self, obj):
        return obj.user.username if obj.user else "Deleted User"
    
    def get_phone(self, obj):
        return obj.user.phone if obj.user else "N/A"

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    is_me = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = ['id', 'content', 'timestamp', 'sender_name', 'is_me', 'is_read']
        read_only_fields = ['sender', 'recipient', 'timestamp', 'is_read']
    
    def get_is_me(self, obj):
        return obj.sender == self.context['request'].user

class CommentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'username', 'content', 'created_at']

class PostSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)
    comments = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = ['id', 'username', 'phone', 'content', 'created_at', 'comments']
    
    def get_comments(self, obj):
        return CommentSerializer(obj.comments.all()[:3], many=True).data

class CreatePostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['content']

class CreateCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['content']
