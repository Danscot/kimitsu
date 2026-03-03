
from rest_framework.decorators import api_view

from rest_framework.response import Response

from rest_framework import status

from django.contrib.auth import authenticate, login, logout

from rest_framework.decorators import api_view

from rest_framework.response import Response

from rest_framework import status

from .models import Payments

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

		order = service.initiator(pricing, number, user.email, user.id, order_id)

		if order.get("statut"):

			payment = Payments.objects.create(

    			user=user, 

    			amount=pricing,

    			status=Payments.PENDING,

    			transaction_token=order.get('token'),
			)

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


@api_view(["GET"])

def callback_api(request):

	token = request.query_params.get('token')

	if not token:

		return Response({

			"status": "failed",

			"message": "This api requires token as a parameter"

		})

	try:

		operator = PaymentChecker()

		result = operator.checker(token)

		if result.get('statut'):

			if result.get('data').get('statut') == "paid":

				user_bill = Payments.objects.filter(user=request.user).first()

				user_bill.status = Payments.COMPLETED

				user_bill.save()

				return Response(

						{
							"status": "paid",

							"message": "Order has been paid"

						},

						status=status.HTTP_200_OK
					)


			if result.get('data').get('statut') == "pending":

				return Response(

						{
							"status": "unpaid",

							"message": "Order has not been paid"

						},

						status=status.HTTP_200_OK
					)

	except Exception as e:

		return Response(


			{
				"status": "error",

				"message": str(e)
			},

			status=status.HTTP_500_INTERNAL_SERVER_ERROR
		)
