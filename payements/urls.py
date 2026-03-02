from django.urls import path

from . import views

urlpatterns = [

    path('api/payment/', views.payment_api, name='payment_api'),

]
