from apiMoneyFusion import PaymentClient

from pathlib import Path

from dotenv import load_dotenv

import os

load_dotenv('../.env')

class Payment:

	def __init__(self):

		self.client = PaymentClient(api_key_url=os.getenv('API_PAIEMENT'))

		self.return_url = "https://bothost.danscot.dev/callback"

		self.callback_api = "https://bothost.danscot.dev/callback"

	def initiator(self, price, numb, name, user_id, order_id):

		try:
				
			payment = self.client.create_payment(

				total_price=price,

				articles=[{"name": "bot subscription", "price": price, "quantity": 1}],

				numero_send=numb,

				nom_client=name,

				user_id=user_id,

				order_id=order_id,

				return_url=self.return_url,

				webhook_url=self.callback_api,
			)

			response = {

				'statut': payment.get('statut'),

				'token': payment.get('token'),

				'message': payment.get('message'),
				
				'url': payment.get('url'),
			}


			return response


		except Exception as e:

			return e

class PaymentChecker:

	def __init__(self):

		self.client = PaymentClient(api_key_url=os.getenv('API_PAIEMENT'))

	def checker(self, payment_id):

		status = self.client.get_payment(str(payment_id.strip().replace('"', '').replace("'", "")))

		return status
