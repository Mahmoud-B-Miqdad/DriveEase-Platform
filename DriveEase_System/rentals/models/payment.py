from django.db import models
from .booking import Booking

class PaymentManager(models.Manager):
    def process_invoice(self, booking, payment_method):
        """
        Fat Model Behavior: Automatically generates an invoice tied strictly 
        to the booking's total calculated fees (1:1 Relationship).
        """
        payment = self.create(
            booking=booking,
            payment_method=payment_method,
            amount_paid=booking.total_fees
        )
        return payment

class Payment(models.Model):
    # One-to-One relationship ensures 1 Invoice per 1 Booking
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='payment')
    payment_method = models.CharField(max_length=50) # e.g., Stripe, PayPal, Mock Card
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateTimeField(auto_now_add=True)

    objects = PaymentManager()

    def __str__(self):
        return f"Payment #{self.id} for Booking #{self.booking.id}"