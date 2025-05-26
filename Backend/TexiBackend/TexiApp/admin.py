from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Ride

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('email', 'username', 'phone', 'mode', 'is_active', 'is_staff')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'mode')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('username', 'phone', 'mode')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login',)}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'phone', 'password1', 'password2'),
        }),
    )
    search_fields = ('email', 'username', 'phone')
    ordering = ('email',)
    filter_horizontal = ('groups', 'user_permissions',)

class RideAdmin(admin.ModelAdmin):
    list_display = ('user', 'ride_type', 'pickup_name', 'dropoff_name', 'departure_time', 'created_at', 'is_active')
    list_filter = ('ride_type', 'is_active')
    search_fields = ('pickup_name', 'dropoff_name', 'user__email', 'user__username')
    raw_id_fields = ('user',)
    date_hierarchy = 'departure_time'
    readonly_fields = ('created_at',)

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Ride, RideAdmin)