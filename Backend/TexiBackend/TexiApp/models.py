from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser, PermissionsMixin, BaseUserManager
)
from django.utils import timezone
from django.db.models import Q
from math import radians, sin, cos, sqrt, atan2, asin, acos

class CustomUserManager(BaseUserManager):
    def create_user(self, username, email, phone, password=None):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, phone=phone)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, phone, password):
        user = self.create_user(username, email, phone, password)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user

class CustomUser(AbstractBaseUser, PermissionsMixin):
    MODE_CHOICES = [
        ('driver', 'Driver'),
        ('passenger', 'Passenger'),
    ]
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, unique=True)
    mode = models.CharField(
        max_length=10, 
        choices=MODE_CHOICES, 
        blank=True, 
        null=True
    )
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'phone']
    
    objects = CustomUserManager()
    
    def __str__(self):
        return self.email

class Ride(models.Model):
    RIDE_TYPE_CHOICES = [
        ('request', 'Ride Request'),
        ('offer', 'Ride Offer'),
        ('parcel', 'Parcel Delivery'),
    ]
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    ride_type = models.CharField(max_length=10, choices=RIDE_TYPE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    departure_time = models.DateTimeField(default=timezone.now)
    pickup_name = models.CharField(max_length=255)
    pickup_lat = models.FloatField()
    pickup_lng = models.FloatField()
    dropoff_name = models.CharField(max_length=255)
    dropoff_lat = models.FloatField()
    dropoff_lng = models.FloatField()
    is_active = models.BooleanField(default=True)
    matched_ride = models.ForeignKey(
        'self', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='matches'
    )
    
    def __str__(self):
        return f"{self.user.email} – {self.get_ride_type_display()}"
    
    @staticmethod
    def calculate_route_metrics(a_lat, a_lon, b_lat, b_lon, c_lat, c_lon):
        """ Calculate route distance A→B, cross-track and along-track distances for point C. """
        a_lat, a_lon = radians(a_lat), radians(a_lon)
        b_lat, b_lon = radians(b_lat), radians(b_lon)
        c_lat, c_lon = radians(c_lat), radians(c_lon)
        R = 6371  # Earth radius in km
        
        # A→B distance
        dlon_ab = b_lon - a_lon
        dlat_ab = b_lat - a_lat
        a_ab = sin(dlat_ab/2)**2 + cos(a_lat)*cos(b_lat)*sin(dlon_ab/2)**2
        route_dist = 2 * R * atan2(sqrt(a_ab), sqrt(1 - a_ab))
        
        # Bearing A→B
        y_ab = sin(dlon_ab)*cos(b_lat)
        x_ab = cos(a_lat)*sin(b_lat) - sin(a_lat)*cos(b_lat)*cos(dlon_ab)
        bearing_ab = atan2(y_ab, x_ab)
        
        # A→C distance & bearing
        dlon_ac = c_lon - a_lon
        dlat_ac = c_lat - a_lat
        a_ac = sin(dlat_ac/2)**2 + cos(a_lat)*cos(c_lat)*sin(dlon_ac/2)**2
        dist_ac = 2 * R * atan2(sqrt(a_ac), sqrt(1 - a_ac))
        y_ac = sin(dlon_ac)*cos(c_lat)
        x_ac = cos(a_lat)*sin(c_lat) - sin(a_lat)*cos(c_lat)*cos(dlon_ac)
        bearing_ac = atan2(y_ac, x_ac)
        
        # Cross-track distance
        delta_bearing = bearing_ac - bearing_ab
        cross_track = asin(sin(dist_ac/R)*sin(delta_bearing)) * R
        
        # Along-track distance
        along_track = acos(cos(dist_ac/R)/cos(cross_track/R)) * R
        return route_dist, abs(cross_track), along_track

    def is_point_acceptable(self, driver_ride, point_type='pickup'):
        """ Check if point lies within 30% deviation from driver's route """
        if point_type == 'pickup':
            c_lat, c_lon = self.pickup_lat, self.pickup_lng
        else:
            c_lat, c_lon = self.dropoff_lat, self.dropoff_lng
            
        route_dist, cross_dist, along_dist = self.calculate_route_metrics(
            driver_ride.pickup_lat, driver_ride.pickup_lng,
            driver_ride.dropoff_lat, driver_ride.dropoff_lng,
            c_lat, c_lon
        )
        max_dev = route_dist * 0.30
        return cross_dist <= max_dev and 0 <= along_dist <= route_dist

    def find_matches(self, max_deviation_percent=10):
        """ Find best matching ride of compatible types """
        # Driver offers match with both passengers and parcels
        if self.ride_type == 'offer':
            target_types = ['request', 'parcel']
        # Passengers and parcels only match with driver offers
        else:
            target_types = ['offer']
        
        candidates = Ride.objects.filter(
            ride_type__in=target_types,
            is_active=True
        ).exclude(user=self.user)
        
        scored = []
        for cand in candidates:
            if (self.is_point_acceptable(cand, 'pickup') and 
                self.is_point_acceptable(cand, 'dropoff')):
                
                _, cross_pick, along_pick = self.calculate_route_metrics(
                    cand.pickup_lat, cand.pickup_lng,
                    cand.dropoff_lat, cand.dropoff_lng,
                    self.pickup_lat, self.pickup_lng
                )
                scored.append({
                    'ride': cand,
                    'deviation': cross_pick,
                    'position': along_pick
                })
                
        scored.sort(key=lambda x: (x['deviation'], x['position']))
        return scored[0]['ride'] if scored else None

class Message(models.Model):
    sender = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='sent_messages'
    )
    recipient = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='received_messages'
    )
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.sender} to {self.recipient}: {self.content[:20]}"

class Post(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.content[:20]}"

class Comment(models.Model):
    post = models.ForeignKey(
        Post, 
        on_delete=models.CASCADE, 
        related_name='comments'
    )
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username}: {self.content[:20]}"