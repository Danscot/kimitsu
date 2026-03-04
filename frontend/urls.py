from django.urls import path

from . import views

urlpatterns = [

    path('', views.index, name='index'),

    path('profile/', views.profile, name='profile'),

    path('login/', views.login, name='login'),

    path('signup', views.signup, name='signup'),

    path("pairing/", views.pairing, name="pairing"),

    path('subscription/', views.subscription, name="subscription"),

    path('callback/', views.payment_status, name='callback'),

    path("logout/", views.web_logout, name="web_logout"),


]