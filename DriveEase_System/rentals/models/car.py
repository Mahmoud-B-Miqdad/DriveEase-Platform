from django.db import models
from .category import CarCategory

class CarManager(models.Manager):
    def get_available_cars(self, category_id=None):
        """
        Fat Model Behavior: Handles real-time filtering for AJAX catalog.
        Fetches only cars that are currently available, with optional category filtering.
        """
        queryset = self.filter(is_available=True)
        if category_id:
            queryset = queryset.filter(car_category_id=category_id)
        return queryset

class Car(models.Model):
    make = models.CharField(max_length=50)       # e.g., Toyota
    model = models.CharField(max_length=50)      # e.g., Camry
    year = models.IntegerField()                 # e.g., 2024
    is_available = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Establish Relationship: One Category has many Cars
    car_category = models.ForeignKey(CarCategory, on_delete=models.CASCADE, related_name='cars')

    # Attach the custom filtering manager
    objects = CarManager()

    def update_status(self, status):
        """
        Helper method to switch car availability instantly when booked or returned.
        """
        self.is_available = status
        self.save()

    def __str__(self):
        return f"{self.make} {self.model} ({self.year})"