from django.db import models
from .user import User
from .car import Car
from datetime import date

class BookingManager(models.Manager):
    def booking_validator(self, post_data):
        """
        Handles server-side validation for vehicle booking.
        Ensures dates are logical, in the future, and the car is actually available.
        """
        errors = {}
        start_date_str = post_data.get('start_date', '')
        end_date_str = post_data.get('end_date', '')
        car_id = post_data.get('car_id', '')

        if not start_date_str or not end_date_str:
            errors['dates'] = "Both start date and end date are required."
            return errors

        try:
            start_date = date.fromisoformat(start_date_str)
            end_date = date.fromisoformat(end_date_str)
            today = date.today()

            # 1. Date Logic Validation
            if start_date < today:
                errors['start_date'] = "Start date cannot be in the past."
            if end_date <= start_date:
                errors['end_date'] = "End date must be after the start date."

            # 2. Car Availability Validation
            if car_id:
                car = Car.objects.filter(id=car_id).first()
                if not car:
                    errors['car'] = "The selected car does not exist."
                elif not car.is_available:
                    errors['car'] = "This car is currently unavailable or already rented."

        except ValueError:
            errors['dates'] = "Invalid date format provided."

        return errors

    def create_booking(self, post_data, user_id):
        """
        Fat Model Behavior: Calculates total fees automatically based on daily rates,
        creates the booking, and instantly locks the car status.
        """
        car = Car.objects.get(id=post_data['car_id'])
        user = User.objects.get(id=user_id)
        
        start_date = date.fromisoformat(post_data['start_date'])
        end_date = date.fromisoformat(post_data['end_date'])
        
        location = post_data.get('location', 'Main Office')
        notes = post_data.get('notes', '')

        # Calculate rental duration in days
        rental_days = (end_date - start_date).days
        if rental_days == 0:
            rental_days = 1 # Minimum 1 day charge
            
        # Total Fees calculation (Fat Model core logic)
        total_fees = rental_days * car.car_category.daily_rate

        # Create the booking record
        booking = self.create(
            user=user,
            car=car,
            start_date=start_date,
            end_date=end_date,
            delivery_location=location,
            special_requests=notes,
            total_fees=total_fees,
            booking_status='Confirmed'
        )

        # Update the car availability to False immediately
        car.update_status(False)
        return booking


class Booking(models.Model):
    STATUS_CHOICES = (
        ('Confirmed', 'Confirmed'),
        ('Cancelled', 'Cancelled'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='bookings')
    start_date = models.DateField()
    end_date = models.DateField()

    delivery_location = models.CharField(max_length=255, default='Main Office')
    special_requests = models.TextField(blank=True, null=True)

    total_fees = models.DecimalField(max_digits=10, decimal_places=2)
    booking_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Confirmed')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = BookingManager()

    def cancel_booking(self):
        """
        Changes booking status and releases the car back to the available pool.
        """
        self.booking_status = 'Cancelled'
        self.save()
        self.car.update_status(True)

    def __str__(self):
        return f"Booking #{self.id} - {self.user.username}"