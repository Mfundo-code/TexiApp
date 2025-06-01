# admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils import timezone
from .models import CustomUser, Ride, Message, Post, Comment

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('email', 'username', 'phone', 'mode', 'is_active', 'is_staff', 'is_superuser')
    list_filter = ('mode', 'is_active', 'is_staff', 'is_superuser')
    fieldsets = (
        (None, {'fields': ('email', 'username', 'phone', 'password')}),
        ('Permissions', {'fields': ('mode', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Verification', {'fields': ('is_email_verified',)}),
        ('Important dates', {'fields': ('last_login',)}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'phone', 'password1', 'password2', 'mode'),
        }),
    )
    search_fields = ('email', 'username', 'phone')
    ordering = ('email',)
    filter_horizontal = ('groups', 'user_permissions',)

class RideAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'ride_type', 'pickup_name', 'dropoff_name', 
                    'departure_time', 'is_active_display', 'is_expired_display', 'matched_ride')
    list_filter = ('ride_type', '_is_active', 'expires_at')
    search_fields = ('user__email', 'user__username', 'pickup_name', 'dropoff_name')
    readonly_fields = ('created_at', 'expires_at', 'is_active_display', 'is_expired_display')
    raw_id_fields = ('user', 'matched_ride')
    
    fieldsets = (
        (None, {'fields': ('user', 'ride_type')}),
        ('Location Details', {'fields': (
            'pickup_name', 'pickup_lat', 'pickup_lng',
            'dropoff_name', 'dropoff_lat', 'dropoff_lng'
        )}),
        ('Timing', {'fields': ('departure_time', 'created_at', 'expires_at')}),
        ('Status', {'fields': ('_is_active', 'matched_ride', 'is_active_display', 'is_expired_display')}),
    )
    
    @admin.display(boolean=True, description='Active')
    def is_active_display(self, obj):
        return obj.is_active
    
    @admin.display(boolean=True, description='Expired')
    def is_expired_display(self, obj):
        return obj.is_expired

class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'sender', 'recipient', 'truncated_content', 'timestamp', 'is_read')
    list_filter = ('is_read', 'timestamp')
    search_fields = ('sender__email', 'recipient__email', 'content')
    raw_id_fields = ('sender', 'recipient')
    
    def truncated_content(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    truncated_content.short_description = 'Content'

class CommentInline(admin.TabularInline):
    model = Comment
    extra = 1
    raw_id_fields = ('user',)

class PostAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'truncated_content', 'created_at', 'comment_count')
    search_fields = ('user__email', 'content')
    raw_id_fields = ('user',)
    inlines = [CommentInline]
    
    def truncated_content(self, obj):
        return obj.content[:100] + '...' if len(obj.content) > 100 else obj.content
    truncated_content.short_description = 'Content'
    
    def comment_count(self, obj):
        return obj.comments.count()
    comment_count.short_description = 'Comments'

class CommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'truncated_content', 'post', 'created_at')
    search_fields = ('user__email', 'content')
    raw_id_fields = ('user', 'post')
    
    def truncated_content(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    truncated_content.short_description = 'Content'

# Register models
admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Ride, RideAdmin)
admin.site.register(Message, MessageAdmin)
admin.site.register(Post, PostAdmin)
admin.site.register(Comment, CommentAdmin)