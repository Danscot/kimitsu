from django.db import models

from django.contrib.auth.models import AbstractUser

from django.utils import timezone

from datetime import timedelta


class CustomUser(AbstractUser):

	SUBSCRIPTION_CHOICES = [

		('free', '24 hours'),
		('500', ' 14 Jours'),
		('1000', '30 Jours'),
	]

	bot_number = models.JSONField(default=list) 

	email = models.EmailField(unique=True)

	USERNAME_FIELD = 'email'

	REQUIRED_FIELDS = ['username']

	bot_exp = models.JSONField(default=list) 

	ver_code = models.PositiveIntegerField(default=0, null=True)

	email_ver = models.BooleanField(default=False)

	sub_format = models.CharField(max_length=20, choices=SUBSCRIPTION_CHOICES, verbose_name="Catégorie", default=SUBSCRIPTION_CHOICES[0])

	paired_num = models.PositiveIntegerField(default=0)

	paired_lim = models.PositiveIntegerField(default=1)

	def __str__(self):

		return self.username

	def can_pair(self):

		if self.paired_lim == self.self.paired_num:

			return False

		else:

			return True

