from django.db import models
from .booking import Booking
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags

class PaymentManager(models.Manager):
    def process_invoice(self, booking, payment_method, amount_paid):
        """
        Fat Model Behavior: 
        1. Generates an immutable database payment record (1:1 with Booking).
        2. Automatically upgrades booking status from Pending to Confirmed.
        3. Dynamically compiles and dispatches the HTML invoice via SendGrid.
        """
        payment = self.create(
            booking=booking,
            payment_method=payment_method,
            amount_paid=amount_paid
        )
        
        booking.booking_status = 'Confirmed'
        booking.save()
        
        context = {
            'user': booking.user,
            'booking': booking,
            'payment': payment
        }
        
        html_message = render_to_string('emails/invoice_email.html', context)
        plain_message = strip_tags(html_message) 
        
        try:
            send_mail(
                subject=f"DriveEase Ticket secured! Invoice #DE-000{booking.id}",
                message=plain_message,
                from_email=None,  
                recipient_list=[booking.user.email], 
                html_message=html_message,
                fail_silently=False,  
            )
            print("Successfully processed invoice payment and dispatched Email via SendGrid SMTP!")
        except Exception as e:
            print(f"SendGrid SMTP delivery anomaly tracked: {e}")
            
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