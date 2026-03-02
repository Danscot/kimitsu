
from rest_framework.decorators import api_view

from rest_framework.response import Response

from rest_framework import status

from .models import CustomUser

from django.contrib.auth import authenticate, login, logout

from rest_framework.decorators import api_view

from rest_framework.response import Response

from rest_framework import status

import random



@api_view(["POST"])

def payment_api(request):

	number request.data.get("number")

	
