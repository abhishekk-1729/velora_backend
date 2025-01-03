# chat/urls.py

from django.urls import path
from .views import check_lead, chat

urlpatterns = [
    path('check_lead/', check_lead, name='check_lead'),
    path('chat/', chat, name='chat'),
]
