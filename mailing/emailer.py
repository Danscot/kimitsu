from django.conf import settings
from django.core.mail.backends.smtp import EmailBackend
from django.core.mail import EmailMessage


class Email:

    def __init__(self, code, email):
        self.code = code
        self.email = email
        self.link = f"https://bothost.danscot.dev/verification/?token={self.code}"

    def send_verification_code(self):
        """
        Send the verification link using a fresh SMTP connection.
        We open and close the connection explicitly instead of relying
        on Django's connection pool, which can hold stale connections
        across gunicorn workers and trigger Brevo auth failures.
        """
        subject = "Vérifiez votre adresse email — Kimitsu"

        body = f"""Bonjour,

Merci de vous être inscrit sur Kimitsu !

Cliquez sur le lien ci-dessous pour vérifier votre adresse email et activer votre compte :

{self.link}

Ce lien est valable 24 heures.
Si vous n'avez pas créé de compte, ignorez simplement cet email.

— L'équipe Kimitsu
"""
        # Open a brand-new SMTP connection for every send
        connection = EmailBackend(
            host=settings.EMAIL_HOST,
            port=settings.EMAIL_PORT,
            username=settings.EMAIL_HOST_USER,
            password=settings.EMAIL_HOST_PASSWORD,
            use_tls=settings.EMAIL_USE_TLS,
            fail_silently=False,
            timeout=10,
        )

        mail = EmailMessage(
            subject=subject,
            body=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[self.email],
            connection=connection,
        )

        with connection:
            mail.send()
