from django.contrib import admin
from django.urls import path, include
from TexiApp.views import LandingPageView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('TexiApp.urls')),
    path('', LandingPageView.as_view(), name='landing-page'),
]