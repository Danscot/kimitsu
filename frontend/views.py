from django.shortcuts import render, redirect

from django.contrib.auth.decorators import login_required

from django.contrib.auth import logout

from django.http import JsonResponse

from django.contrib import messages

from payements.models import Payments

from payements.wrapper import PaymentChecker

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

def payment_status(request):


    user = request.user

    token = request.GET.get('token')

    if not token:

        return render(request, 'payement_status.html', {

            'error': 'This page requires a token as a parameter.'
        })

    try:

        operator = PaymentChecker()

        result = operator.checker(token)

        if result.get('statut'):

            statut = result.get('data').get('statut')

            payment_data = Payments.objects.filter(user=user).first()

            # Prepare context for the template
            context = {

                'status': statut,

                'plan': user.get_sub_format_display if user.get_sub_format_display else 'Gratuit',  

                'amount': payment_data.amount if payment_data else '0',   

                'expiry': user.subscription_expiry if user.subscription_expiry else '24 hr',   
            }

            return render(request, 'payement_status.html', context)

    except Exception as e:

        return render(request, 'payement_status.html', {

            'error': f'An error occurred: {str(e)}'
        })


@login_required

def web_logout(request):

    logout(request)

    return redirect("login")