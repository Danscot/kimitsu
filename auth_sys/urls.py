from django.urls import path
from . import views

urlpatterns = [
    path('api/signup/', views.signin, name='signin_api'),   # kept name for template compat
    path('api/login/', views.login_view, name='login_api'),
    path('api/logout/', views.user_logout, name='logout_api'),
]
