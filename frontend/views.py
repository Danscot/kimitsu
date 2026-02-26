from django.shortcuts import render, redirect

from django.contrib.auth.decorators import login_required

from django.contrib.auth import logout

from django.http import JsonResponse

from django.contrib import messages

def index(request):

    return render(request, 'index.html')

def login(request):

    return render(request, 'login.html')

def signup(request):

    return render(request, 'signup.html')

def pairing(request):

    return render(request, 'pairing.html')

def subscription(request):

    return render(request, 'subscription.html')


@login_required(login_url='login')
def profile(request):

    return render(request, 'profile.html')
