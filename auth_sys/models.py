from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from datetime import timedelta


class CustomUser(AbstractUser):

    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'

    REQUIRED_FIELDS = []

    email_ver = models.BooleanField(default=False)

    ver_code = models.PositiveIntegerField(null=True, blank=True)

    bot_number = models.JSONField(default=list, blank=True)

    bot_exp = models.JSONField(default=list, blank=True)

    paired_num = models.PositiveIntegerField(default=0)

    paired_lim = models.PositiveIntegerField(default=1)

    SUBSCRIPTION_CHOICES = [

        ('Aucun', 'Aucun abonnement'),
        ('free', '24 heures'),
        ('500', '14 Jours'),
        ('1000', '30 Jours'),
    ]

    sub_format = models.CharField(

        max_length=20,
        choices=SUBSCRIPTION_CHOICES,
        default='Aucun'
    )

    subscription_expiry = models.DateTimeField(null=True, blank=True)

    payment_method = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return self.email

    def can_pair(self):

        return self.paired_num < self.paired_lim

    def activate_subscription(self, plan_code):

        self.sub_format = plan_code

        if plan_code == 'free':

            self.subscription_expiry = timezone.now() + timedelta(hours=24)

            self.paired_lim = 1

        elif plan_code == '500':

            self.subscription_expiry = timezone.now() + timedelta(days=14)

            self.paired_lim = 2

        elif plan_code == '1000':

            self.subscription_expiry = timezone.now() + timedelta(days=30)

            self.paired_lim = 5

        else:

            self.subscription_expiry = None

            self.paired_lim = 1

        self.save()

    # 🔹 Check if subscription is active
    def is_subscription_active(self):

        if self.subscription_expiry:

            return timezone.now() < self.subscription_expiry
            
        return False

    # 🔹 Auto downgrade if expired
    def check_subscription_status(self):
        if self.subscription_expiry and timezone.now() >= self.subscription_expiry:
            self.sub_format = 'Aucun'
            self.subscription_expiry = None
            self.paired_lim = 1
            self.save()

    # 🔹 Get price (for templates)
    def get_price(self):
        if self.sub_format == '500':
            return 500
        elif self.sub_format == '1000':
            return 1000
        return 0