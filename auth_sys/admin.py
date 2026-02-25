from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):

    model = CustomUser

    # =========================
    # ADMIN LIST VIEW
    # =========================
    list_display = (
        "id",
        "username",
        "email",
        "sub_format",
        "subscription_expiry",
        "paired_num",
        "paired_lim",
        "is_staff",
    )

    list_filter = (
        "sub_format",
        "is_staff",
        "is_superuser",
        "is_active",
    )

    search_fields = ("username", "email")
    ordering = ("-date_joined",)

    # =========================
    # EDIT USER PAGE
    # =========================
    fieldsets = UserAdmin.fieldsets + (
        ("Bot System", {
            "fields": (
                "bot_number",
                "bot_exp",
                "paired_num",
                "paired_lim",
            )
        }),
        ("Subscription", {
            "fields": (
                "sub_format",
                "subscription_expiry",
                "payment_method",
            )
        }),
        ("Verification", {
            "fields": (
                "ver_code",
                "email_ver",
            )
        }),
    )

    # =========================
    # ADD USER PAGE
    # =========================
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {
            "fields": (
                "username",
                "email",
                "bot_number",
                "bot_exp",
                "paired_num",
                "paired_lim",
                "sub_format",
                "subscription_expiry",
                "payment_method",
                "ver_code",
                "email_ver",
            ),
        }),
    )