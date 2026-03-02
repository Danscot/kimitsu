
from rest_framework.decorators import api_view

from rest_framework.response import Response

from rest_framework import status

from django.contrib.auth import authenticate, login, logout

from rest_framework.decorators import api_view

from rest_framework.response import Response

from rest_framework import status

import random

from .wrapper import *


@api_view(["POST"])

def payment_api(request):

	number = request.data.get("number")

	pricing = request.data.get("pricing")

	user = request.user

	order_id = random.randint(100000, 999999)

	if not number or not pricing:

		return Response(

			{
				"status": "error",

				"message": "number and pricing are required"

			},

			status=status.HTTP_400_BAD_REQUEST
		)

	try:

		service = Payment()

		order = service.initiator(pricing, number, user.id, order_id)

		if order:

			return Response(

				{
					"status": "created",

					"message": "Order created successfully"

				},

				status=status.HTTP_201_CREATED
			)


		else:

			return Response(


				{
					"status": "error",

					"message": str(order)
				},

				status=status.HTTP_500_INTERNAL_SERVER_ERROR
			)


	except Exception as e:

		
		return Response(


			{
				"status": "error",

				"message": str(e)
			},

			status=status.HTTP_500_INTERNAL_SERVER_ERROR
		)