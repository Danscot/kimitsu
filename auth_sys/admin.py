from django.contrib import admin

from django.contrib.auth.admin import UserAdmin

from .models import CustomUser

@admin.register(CustomUser)

class CustomUserAdmin(UserAdmin):

    model = CustomUser

    fieldsets = UserAdmin.fieldsets + (

        (None, {'fields': ('bot_number', 'bot_exp', 'ver_code', 'email_ver', 'sub_format', 'paired_num', 'paired_lim')}),

    )
    add_fieldsets = UserAdmin.add_fieldsets + (
    	
        (None, {'fields': (' bot_number', 'bot_exp', 'ver_code', 'email_ver', 'sub_format', 'paired_num', 'paired_lim')}),
    )
