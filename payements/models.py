from django.db import models

from django.contrib.auth import get_user_model

User = get_user_model()

class Payments(models.Model):

    # Status choices
    PENDING = 'pending'

    COMPLETED = 'completed'

    FAILED = 'failed'

    STATUS_CHOICES = [

        (PENDING, 'Pending'),

        (COMPLETED, 'Completed'),

        (FAILED, 'Failed'),

    ]

    # Fields
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')

    amount = models.DecimalField(max_digits=10, decimal_places=0)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING)

    transaction_token = models.CharField(max_length=100, unique=True)

    transaction_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):

        return f"{self.user.email} - {self.amount} ({self.status})"

    class Meta:

        ordering = ['-transaction_date']
        
        verbose_name_plural = "Payments"
