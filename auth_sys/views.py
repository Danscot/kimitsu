from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, login, logout
from django.db import transaction
from .models import CustomUser
from mailing.emailer import Email
import random


def gen_code():
    """Generate a random 6-digit verification code."""
    return random.randint(100000, 999999)


@api_view(["POST"])
def signin(request):
    """Register a new user (signup endpoint)."""
    username = request.data.get("name")
    email = request.data.get("email")
    password = request.data.get("password")

    # Validation
    if not username or not email or not password:
        return Response(
            {"status": "error", "message": "Username, email and password are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Check duplicates separately to avoid leaking which field conflicts
    if CustomUser.objects.filter(username=username).exists() or CustomUser.objects.filter(email=email).exists():
        return Response(
            {"status": "conflict", "message": "Un compte existe déjà avec ces informations."},
            status=status.HTTP_409_CONFLICT,
        )

    try:
        with transaction.atomic():
            user = CustomUser.objects.create_user(
                username=username,
                email=email,
                password=password,
            )

            code = gen_code()
            user.ver_code = code
            user.sub_format = 'free'
            from django.utils import timezone
            from datetime import timedelta
            user.subscription_expiry = timezone.now() + timedelta(hours=24)
            user.paired_lim = 1
            user.save()

        smtp = Email(code, user.email)
        smtp.send_verification_code()

        return Response(
            {
                "status": "created",
                "message": "User created successfully",
                "email": user.email,
            },
            status=status.HTTP_201_CREATED,
        )

    except Exception as e:
        return Response(
            {"status": "error", "message": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
def login_view(request):
    """Authenticate a user by email + password."""
    email = request.data.get("email")
    password = request.data.get("password")

    if not email or not password:
        return Response(
            {"status": "error", "message": "Email and password required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate(request, email=email, password=password)

    if user is not None:
        if not user.email_ver:
            return Response(
                {
                    "status": "error",
                    "message": "Votre adresse email n'est pas vérifiée. Regardez le message envoyé dans votre boîte mail.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        login(request, user)
        return Response(
            {"status": "ok", "message": "Login successful"},
            status=status.HTTP_200_OK,
        )

    return Response(
        {"status": "error", "message": "Invalid credentials"},
        status=status.HTTP_401_UNAUTHORIZED,
    )


@api_view(["POST"])
def user_logout(request):
    """Log out the current user."""
    try:
        logout(request)
        return Response(
            {"status": "ok", "message": "User logged out successfully"},
            status=status.HTTP_200_OK,
        )
    except Exception as e:
        return Response(
            {"status": "error", "message": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
