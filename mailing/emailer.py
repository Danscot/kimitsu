from django.core.mail import send_mail
from django.conf import settings


class Email:

    def __init__(self, code, email):
        self.code = code
        self.email = email
        self.link = f"https://bothost.danscot.dev/verification/?token={self.code}"

    def send_verification_code(self):
        """Send the verification link to the user's email."""
        subject = "Vérifiez votre adresse email — Kimitsu"

        message = f"""Bonjour,

Merci de vous être inscrit sur Kimitsu !

Cliquez sur le lien ci-dessous pour vérifier votre adresse email et activer votre compte :

{self.link}

Ce lien est valable 24 heures.
Si vous n'avez pas créé de compte, ignorez simplement cet email.

— L'équipe Kimitsu
"""

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[self.email],
            fail_silently=False,
        )
