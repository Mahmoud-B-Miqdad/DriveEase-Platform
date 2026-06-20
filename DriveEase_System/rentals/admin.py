from django.contrib import admin
from .models.car import Car
from .models.category import CarCategory

@admin.register(Car)
class CarAdmin(admin.ModelAdmin):
    list_display  = ('make', 'model', 'year', 'car_category', 'is_available')
    list_filter   = ('car_category', 'is_available')
    search_fields = ('make', 'model')
    list_editable = ('is_available',)

@admin.register(CarCategory)
class CarCategoryAdmin(admin.ModelAdmin):
    list_display = ('category_name', 'daily_rate')