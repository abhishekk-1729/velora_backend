# lead_checker/urls.py

from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

# Define the view for the root path
def root_view(request):
    return HttpResponse("<h1>Congrats, Backend is running well !!</h1>")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', root_view),  # Add the root view for the '/' path
    path('api/v1/chat', include('chat.urls')),  # Include the URLs from the chat app
]
