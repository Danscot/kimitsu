from django.shortcuts import render, redirect
from django.contrib.auth import login, get_user_model
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

User = get_user_model()


def email_verification(request):
    """
    Handle the email verification link: GET /verification/?token=<code>
    Looks up the user by ver_code, marks email as verified, auto-logs in,
    then redirects to profile.
    """
    token = request.GET.get('token')

    if not token:
        return render(request, 'verification.html', {
            'error': 'Token manquant. Vérifiez votre boîte mail pour recevoir le lien.'
        })

    try:
        token_int = int(token)
    except (ValueError, TypeError):
        return render(request, 'verification.html', {
            'error': 'Token invalide.'
        })

    try:
        user = User.objects.get(ver_code=token_int, email_ver=False)
    except User.DoesNotExist:
        return render(request, 'verification.html', {
            'error': 'Lien de vérification invalide ou déjà utilisé.'
        })

    # Check token hasn't expired (subscription_expiry is set at signup)
    if user.subscription_expiry and timezone.now() > user.subscription_expiry:
        user.delete()
        return render(request, 'verification.html', {
            'error': 'Votre lien de vérification a expiré. Veuillez vous réinscrire.'
        })

    user.email_ver = True
    user.ver_code = None
    user.save(update_fields=['email_ver', 'ver_code'])

    # Auto-login using the custom email backend
    user.backend = 'auth_sys.backend.EmailAuthBackend'
    login(request, user)

    return redirect('profile')
