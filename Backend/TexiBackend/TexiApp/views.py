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

from .models import Ride, Message
from .serializers import RegisterSerializer, RideSerializer, MessageSerializer


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


class RideListCreateView(generics.ListCreateAPIView):
    serializer_class = RideSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        ride_type = 'request' if self.request.query_params.get('mode') == 'driver' else 'offer'
        return Ride.objects.filter(ride_type=ride_type, is_active=True)

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
    """
    GET /api/rides/<ride_id>/matches/
    Finds and returns the closest opposite-type ride based on your route,
    and persists the mutual match relationship.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, ride_id):
        try:
            main_ride = Ride.objects.get(pk=ride_id, user=request.user)
            match = main_ride.find_matches()

            if match:
                # Persist the match relationship on both rides
                main_ride.matched_ride = match
                match.matched_ride = main_ride
                main_ride.save()
                match.save()

                return Response({
                    'match': {
                        'id': match.id,
                        'user': {
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


class MessageListView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        ride_id = self.kwargs['ride_id']
        return Message.objects.filter(
            ride_id=ride_id
        ).filter(
            Q(sender=self.request.user) | Q(recipient=self.request.user)
        ).order_by('timestamp')

    def perform_create(self, serializer):
        ride = get_object_or_404(Ride, id=self.kwargs['ride_id'])
        # determine the recipient: if the ride owner isn't you, message them;
        # otherwise message the matched ride's owner
        recipient = ride.user if ride.user != self.request.user else ride.matched_ride.user

        serializer.save(
            sender=self.request.user,
            recipient=recipient,
            ride=ride
        )
