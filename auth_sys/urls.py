from django.urls import path

from . import views

urlpatterns = [

    path('api/signin/', views.signin, name='signin_api'),

    path('api/login/', views.login_view, name='login_api'),

    path('api/logout/', views.user_logout, name="logout_api"),

    path('api/email/ver', views.email_verification, name="email_ver")
]
