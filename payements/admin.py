from django.contrib import admin

from .models import Payments

@admin.register(Payments)

class PaymentAdmin(admin.ModelAdmin):

    list_display = ('user', 'amount', 'status', 'transaction_token', 'transaction_date')

    list_filter = ('status', 'amount')  

    search_fields = ('user__email', 'username') 

    date_hierarchy = 'transaction_date'  
