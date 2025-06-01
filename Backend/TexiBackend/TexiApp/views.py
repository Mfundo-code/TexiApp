from django.contrib.auth import authenticate, logout
from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.utils import timezone
from .models import CustomUser, Ride, Message, Post, Comment
from .serializers import (
    RegisterSerializer, RideSerializer, MessageSerializer,
    PostSerializer, CreatePostSerializer, CommentSerializer,
    CreateCommentSerializer,
)

# User Registration
class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {"message": "User registered successfully.", "user_id": user.id},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Authentication Endpoints
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')
    user = authenticate(email=email, password=password)
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.id,
            'email': user.email,
            'username': user.username,
            'phone': user.phone
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    if request.auth:
        request.auth.delete()
    logout(request)
    return Response({'message': 'Logged out successfully'})

# Rides
class RideListCreateView(generics.ListCreateAPIView):
    serializer_class = RideSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Add expiration check to queries
        if self.request.query_params.get('mode') == 'driver':
            return Ride.objects.filter(
                ride_type__in=['request', 'parcel'],
                _is_active=True,
                expires_at__gt=timezone.now()
            )
        else:
            return Ride.objects.filter(
                ride_type='offer',
                _is_active=True,
                expires_at__gt=timezone.now()
            )
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class RideDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Ride.objects.all()
    serializer_class = RideSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_update(self, serializer):
        if serializer.instance.user != self.request.user:
            raise PermissionDenied("You can only update your own rides")
        serializer.save()
    
    def perform_destroy(self, instance):
        if instance.user != self.request.user:
            raise PermissionDenied("You can only delete your own rides")
        instance.delete()

class RideMatchesView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, ride_id):
        try:
            main_ride = Ride.objects.get(pk=ride_id, user=request.user)
            match = main_ride.find_matches()
            
            if match:
                # Persist the match relationship
                main_ride.matched_ride = match
                match.matched_ride = main_ride
                main_ride.save()
                match.save()
                
                return Response({
                    'match': {
                        'id': match.id,
                        'ride_type': match.ride_type,
                        'ride_type_display': match.get_ride_type_display(),
                        'user': {
                            'id': match.user.id,
                            'name': match.user.username,
                            'phone': match.user.phone,
                        },
                        'pickup': {
                            'name': match.pickup_name,
                            'lat': match.pickup_lat,
                            'lng': match.pickup_lng,
                        },
                        'dropoff': {
                            'name': match.dropoff_name,
                            'lat': match.dropoff_lat,
                            'lng': match.dropoff_lng,
                        },
                    }
                })
            return Response({'match': None})
        except Ride.DoesNotExist:
            return Response(
                {'error': 'Ride not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

# Unified Messaging
class MessageListView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Message.objects.filter(
            Q(sender=self.request.user) | Q(recipient=self.request.user)
        ).order_by('timestamp')

class MessageDetailView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        partner_id = self.kwargs['user_id']
        partner = get_object_or_404(CustomUser, id=partner_id)
        
        # Mark received messages as read when fetching
        Message.objects.filter(
            sender=partner,
            recipient=self.request.user,
            is_read=False
        ).update(is_read=True)
        
        return Message.objects.filter(
            (Q(sender=self.request.user) & Q(recipient=partner)) |
            (Q(sender=partner) & Q(recipient=self.request.user))
        ).order_by('timestamp')
    
    def perform_create(self, serializer):
        partner_id = self.kwargs['user_id']
        partner = get_object_or_404(CustomUser, id=partner_id)
        serializer.save(
            sender=self.request.user,
            recipient=partner
        )

# Chats
class ChatListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        conversations = []
        partners = CustomUser.objects.filter(
            Q(received_messages__sender=request.user) |
            Q(sent_messages__recipient=request.user)
        ).distinct().exclude(id=request.user.id)
        
        for partner in partners:
            latest_message = Message.objects.filter(
                Q(sender=request.user, recipient=partner) |
                Q(sender=partner, recipient=request.user)
            ).order_by('-timestamp').first()
            
            # Calculate unread count
            unread_count = Message.objects.filter(
                sender=partner,
                recipient=request.user,
                is_read=False
            ).count()
            
            conversations.append({
                "id": partner.id,
                "other_user": {
                    "username": partner.username,
                    "phone": partner.phone,
                },
                "latest_message": {
                    "content": latest_message.content if latest_message else "New conversation",
                    "timestamp": latest_message.timestamp if latest_message else timezone.now(),
                },
                "unread_count": unread_count
            })
        
        conversations.sort(key=lambda x: x['latest_message']['timestamp'], reverse=True)
        return Response(conversations)

# Community Hub
class CommunityHubView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        posts = Post.objects.all().order_by('-created_at')
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = CreatePostSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Post Comments
class PostCommentsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, post_id):
        comments = Comment.objects.filter(post_id=post_id).order_by('created_at')
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)
    
    def post(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        serializer = CreateCommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, post=post)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RideHistoryView(generics.ListAPIView):
    serializer_class = RideSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Return all user's rides regardless of status
        return Ride.objects.filter(
            user=self.request.user
        ).order_by('-departure_time')


# Fixed endpoint: unread message count
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_message_count(request):
    count = Message.objects.filter(
        recipient=request.user,
        is_read=False
    ).count()
    return Response({'unread_count': count or 0})  # Ensure 0 is returned