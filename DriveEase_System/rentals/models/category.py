from django.db import models

class CarCategory(models.Model):
    category_name = models.CharField(max_length=50)
    daily_rate = models.DecimalField(max_digits=10, decimal_places=2) # e.g., $50.00
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.category_name