from django.urls import path

from . import views

urlpatterns = [

    path('api/payment/', views.payment_api, name='payment_api'),

    path('api/callback/', views.callback_api, name='callback'),

]
