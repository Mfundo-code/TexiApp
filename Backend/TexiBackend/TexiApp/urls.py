from django.urls import path
from .views import (
    RegisterView, login_view, logout_view, 
    RideListCreateView, RideDetailView, RideMatchesView,
    ChatListView, CommunityHubView, PostCommentsView,
    MessageListView, MessageDetailView, RideHistoryView,
    unread_message_count,  # newly added import
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    
    path('rides/', RideListCreateView.as_view(), name='ride-list'),
    path('rides/<int:pk>/', RideDetailView.as_view(), name='ride-detail'),
    path('rides/<int:ride_id>/matches/', RideMatchesView.as_view(), name='ride-matches'),
    path('rides/history/', RideHistoryView.as_view(), name='ride-history'),

    path('messages/', MessageListView.as_view(), name='message-list'),
    path('messages/<int:user_id>/', MessageDetailView.as_view(), name='message-detail'),
    path('messages/unread-count/', unread_message_count, name='unread-count'),  # new endpoint

    path('chats/', ChatListView.as_view(), name='chat-list'),
    
    path('community/posts/', CommunityHubView.as_view(), name='community-posts'),
    path('community/posts/<int:post_id>/comments/', PostCommentsView.as_view(), name='post-comments'),
]
