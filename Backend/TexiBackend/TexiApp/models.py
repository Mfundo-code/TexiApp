from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser, PermissionsMixin, BaseUserManager
)
from django.utils import timezone
from django.db.models import Q
from math import radians, sin, cos, sqrt, atan2, asin, acos
from datetime import timedelta

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
    phone = models.CharField(max_length=20, unique=True)  # Increased from 15 to 20
    mode = models.CharField(
        max_length=10, 
        choices=MODE_CHOICES, 
        blank=True, 
        null=True
    )
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)
    confirmation_code = models.CharField(max_length=6, blank=True, null=True)
    confirmation_sent_at = models.DateTimeField(null=True, blank=True)

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
    user = models.ForeignKey(
        CustomUser, 
        on_delete=models.SET_NULL,  
        null=True,
        blank=True
    )
    ride_type = models.CharField(max_length=10, choices=RIDE_TYPE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    departure_time = models.DateTimeField(default=timezone.now)
    pickup_name = models.CharField(max_length=255)
    pickup_lat = models.FloatField()
    pickup_lng = models.FloatField()
    dropoff_name = models.CharField(max_length=255)
    dropoff_lat = models.FloatField()
    dropoff_lng = models.FloatField()
    _is_active = models.BooleanField(default=True, db_column='is_active')
    matched_ride = models.ForeignKey(
        'self', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='matches'
    )
    expires_at = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return f"{self.user.email if self.user else 'Unknown User'} – {self.get_ride_type_display()}"
    
    @staticmethod
    def calculate_distance(lat1, lon1, lat2, lon2):
        R = 6371
        lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
        dlon = lon2 - lon1
        dlat = lat2 - lat1
        a = sin(dlat/2)**2 + cos(lat1)*cos(lat2)*sin(dlon/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1 - a))
        return R * c

    def save(self, *args, **kwargs):
        if not self.pk:
            distance = self.calculate_distance(
                self.pickup_lat, self.pickup_lng,
                self.dropoff_lat, self.dropoff_lng
            )
            
            if distance <= 25:
                expires_hours = 1.5
            elif distance <= 50:
                expires_hours = 3
            elif distance <= 100:
                expires_hours = 4.5
            else:
                expires_hours = 6
                
            self.expires_at = timezone.now() + timedelta(hours=expires_hours)
        
        super().save(*args, **kwargs)

    @property
    def is_expired(self):
        return timezone.now() > self.expires_at

    @property
    def is_active(self):
        return self._is_active and not self.is_expired
    
    @is_active.setter
    def is_active(self, value):
        self._is_active = value

    @staticmethod
    def calculate_route_metrics(a_lat, a_lon, b_lat, b_lon, c_lat, c_lon):
        a_lat, a_lon = radians(a_lat), radians(a_lon)
        b_lat, b_lon = radians(b_lat), radians(b_lon)
        c_lat, c_lon = radians(c_lat), radians(c_lon)
        R = 6371
        
        dlon_ab = b_lon - a_lon
        dlat_ab = b_lat - a_lat
        a_ab = sin(dlat_ab/2)**2 + cos(a_lat)*cos(b_lat)*sin(dlon_ab/2)**2
        route_dist = 2 * R * atan2(sqrt(a_ab), sqrt(1 - a_ab))
        
        y_ab = sin(dlon_ab)*cos(b_lat)
        x_ab = cos(a_lat)*sin(b_lat) - sin(a_lat)*cos(b_lat)*cos(dlon_ab)
        bearing_ab = atan2(y_ab, x_ab)
        
        dlon_ac = c_lon - a_lon
        dlat_ac = c_lat - a_lat
        a_ac = sin(dlat_ac/2)**2 + cos(a_lat)*cos(c_lat)*sin(dlon_ac/2)**2
        dist_ac = 2 * R * atan2(sqrt(a_ac), sqrt(1 - a_ac))
        y_ac = sin(dlon_ac)*cos(c_lat)
        x_ac = cos(a_lat)*sin(c_lat) - sin(a_lat)*cos(c_lat)*cos(dlon_ac)
        bearing_ac = atan2(y_ac, x_ac)
        
        delta_bearing = bearing_ac - bearing_ab
        cross_track = asin(sin(dist_ac/R)*sin(delta_bearing)) * R
        
        along_track = acos(cos(dist_ac/R)/cos(cross_track/R)) * R
        return route_dist, abs(cross_track), along_track

    def is_point_acceptable(self, driver_ride, point_type='pickup'):
        if point_type == 'pickup':
            c_lat, c_lon = self.pickup_lat, self.pickup_lng
        else:
            c_lat, c_lon = self.dropoff_lat, self.dropoff_lng
            
        route_dist, cross_dist, along_dist = self.calculate_route_metrics(
            driver_ride.pickup_lat, driver_ride.pickup_lng,
            driver_ride.dropoff_lat, driver_ride.dropoff_lng,
            c_lat, c_lon
        )
        
        if route_dist > 100:
            max_dev_percent = 0.12
        elif route_dist > 50:
            max_dev_percent = 0.20
        elif route_dist > 30:
            max_dev_percent = 0.25
        else:
            max_dev_percent = 0.30
            
        max_dev = route_dist * max_dev_percent
        
        return cross_dist <= max_dev and 0 <= along_dist <= route_dist

    def find_matches(self, max_deviation_percent=10):
        if self.ride_type == 'offer':
            target_types = ['request', 'parcel']
        else:
            target_types = ['offer']
        
        candidates = Ride.objects.filter(
            ride_type__in=target_types,
            _is_active=True,
            expires_at__gt=timezone.now()
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
    is_read = models.BooleanField(default=False)
    
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