from django.shortcuts import render, redirect

from django.contrib.auth import login, get_user_model

from django.contrib import messages

from django.utils import timezone

from datetime import timedelta

import logging

logger = logging.getLogger(__name__)

User = get_user_model()
from urllib.parse import urlencode

def email_verification(request):

    token = request.GET.get('token')

    if not token:

        return render(request, 'verification.html', {

            'error': 'Votre Token est invalide. Vérifiez votre boîte mail pour recevoir le code.'
        })

    try:

        user = User.objects.get(ver_code=token)

        user.email_ver = True

        user.ver_code = None

        user.save()

        # Auto-login
        user.backend = 'django.contrib.auth.backends.ModelBackend'

        login(request, user)

        return redirect('profile')

    except User.DoesNotExist:

        return render(request, 'verification.html', {

            'error': 'Invalid verification token.'
        })

    except Exception as e:

        logger.error(f"Verification error: {e}")

        return render(request, 'verification.html', {

            'error': 'An error occurred. Please try again.'
        })
