from django.urls import path

from . import views

urlpatterns = [

    path('verification/', views.email_verification, name="email_verification")
]
