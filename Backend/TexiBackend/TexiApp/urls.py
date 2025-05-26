from django.urls import path
from .views import (
    RegisterView,
    login_view,
    logout_view,
    RideListCreateView,
    RideDetailView,
    RideMatchesView, 
    MessageListView
       
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('rides/', RideListCreateView.as_view(), name='ride-list'),
    path('rides/<int:pk>/', RideDetailView.as_view(), name='ride-detail'),
    path(
        'rides/<int:ride_id>/matches/',
        RideMatchesView.as_view(),
        name='ride-matches'
    ),
    path('rides/<int:ride_id>/messages/', MessageListView.as_view(), name='message-list'),
]
