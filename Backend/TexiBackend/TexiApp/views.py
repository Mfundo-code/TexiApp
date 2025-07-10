import random
from datetime import timedelta
from django.shortcuts import render
from django.views import View
from django.contrib.auth import authenticate, logout, get_user_model
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone
from django.conf import settings
from django.core.mail import send_mail

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from .models import CustomUser, Ride, Message, Post, Comment
from .serializers import (
    RegisterSerializer, RideSerializer, MessageSerializer,
    PostSerializer, CreatePostSerializer, CommentSerializer,
    CreateCommentSerializer,
)

class LandingPageView(View):
    def get(self, request):
        context = {
            'release_date': 'June 01, 2025',
            'creator': 'Mfundo',
            'current_year': timezone.now().year
        }
        return render(request, 'index.html', context)


# User Registration (with email confirmation)
class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        phone = request.data.get('phone')
        
        # Check if email or phone already exists (verified users)
        if CustomUser.objects.filter(email=email, is_email_verified=True).exists():
            return Response(
                {"error": "Email already registered"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        if CustomUser.objects.filter(phone=phone, is_email_verified=True).exists():
            return Response(
                {"error": "Phone number already registered"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if unverified user already exists (by email OR phone)
        try:
            existing_user = CustomUser.objects.get(
                Q(email=email) | Q(phone=phone),
                is_email_verified=False
            )
            # Resend code to existing unverified user
            return self.resend_code(existing_user)
        except CustomUser.DoesNotExist:
            pass
        
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate a 6-digit confirmation code
            confirmation_code = str(random.randint(100000, 999999))
            user.confirmation_code = confirmation_code
            user.confirmation_sent_at = timezone.now()
            user.save()
            
            # Send confirmation email
            send_mail(
                subject='Verify your email',
                message=f'Your verification code is: {confirmation_code}',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
            
            return Response(
                {
                    "message": "User registered successfully. Please check your email for a verification code.",
                    "user_id": user.id,
                    "email": user.email
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def resend_code(self, user):
        # Generate new code
        new_code = str(random.randint(100000, 999999))
        user.confirmation_code = new_code
        user.confirmation_sent_at = timezone.now()
        user.save()
        
        # Resend email
        send_mail(
            'New Verification Code',
            f'Your new verification code is: {new_code}',
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        
        return Response(
            {
                "message": "A new verification code has been sent to your email.",
                "user_id": user.id,
                "email": user.email
            },
            status=status.HTTP_200_OK
        )


# Email Confirmation Endpoint
class ConfirmEmailView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')
        
        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response(
                {'error': 'User with this email does not exist'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if there's a sent confirmation code
        if user.confirmation_sent_at is None:
            return Response(
                {'error': 'No verification code was sent for this email. Please register again.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate code and expiration (10-minute window)
        if (user.confirmation_code == code and 
            timezone.now() < user.confirmation_sent_at + timedelta(minutes=10)):
            
            user.is_email_verified = True
            user.confirmation_code = None
            user.confirmation_sent_at = None
            user.save()
            return Response({'message': 'Email verified successfully'})
        
        return Response(
            {'error': 'Invalid or expired verification code'},
            status=status.HTTP_400_BAD_REQUEST
        )


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
            'phone': user.phone,
            'mode': user.mode 
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


# Messaging
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
        partner = get_object_or_404(CustomUser, id=self.kwargs['user_id'])
        # Mark unread as read
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
        partner = get_object_or_404(CustomUser, id=self.kwargs['user_id'])
        serializer.save(sender=self.request.user, recipient=partner)


class ChatListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        conversations = []
        partners = CustomUser.objects.filter(
            Q(received_messages__sender=request.user) |
            Q(sent_messages__recipient=request.user)
        ).distinct().exclude(id=request.user.id)
        
        for partner in partners:
            latest = Message.objects.filter(
                Q(sender=request.user, recipient=partner) |
                Q(sender=partner, recipient=request.user)
            ).order_by('-timestamp').first()
            unread = Message.objects.filter(
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
                    "content": latest.content if latest else "New conversation",
                    "timestamp": latest.timestamp if latest else timezone.now(),
                },
                "unread_count": unread
            })
        
        conversations.sort(
            key=lambda x: x['latest_message']['timestamp'],
            reverse=True
        )
        return Response(conversations)


# Community Hub
class CommunityHubView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        posts = Post.objects.all().order_by('-created_at')
        return Response(PostSerializer(posts, many=True).data)
    
    def post(self, request):
        serializer = CreatePostSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PostCommentsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, post_id):
        comments = Comment.objects.filter(post_id=post_id).order_by('created_at')
        return Response(CommentSerializer(comments, many=True).data)
    
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
        return Ride.objects.filter(user=self.request.user).order_by('-departure_time')


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_message_count(request):
    count = Message.objects.filter(recipient=request.user, is_read=False).count()
    return Response({'unread_count': count or 0})


# Resend verification code
class ResendCodeView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        
        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response(
                {'error': 'User with this email does not exist'},
                status=status.HTTP_404_NOT_FOUND
            )
            
        # Generate new code
        new_code = str(random.randint(100000, 999999))
        user.confirmation_code = new_code
        user.confirmation_sent_at = timezone.now()
        user.save()
        
        # Resend email
        send_mail(
            'New Verification Code',
            f'Your new verification code is: {new_code}',
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        
        return Response({'message': 'New verification code sent'})


# Password reset endpoint
class PasswordResetView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        User = get_user_model()
        try:
            user = User.objects.get(email=email, is_email_verified=True)
        except User.DoesNotExist:
            return Response(
                {'error': 'No user found with this email or email not verified.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Generate a reset token
        reset_code = str(random.randint(100000, 999999))
        user.confirmation_code = reset_code
        user.confirmation_sent_at = timezone.now()
        user.save()
        
        # Send reset email
        send_mail(
            'Password Reset Code',
            f'Your password reset code is: {reset_code}',
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        
        return Response(
            {'message': 'Password reset code has been sent to your email.'},
            status=status.HTTP_200_OK
        )
