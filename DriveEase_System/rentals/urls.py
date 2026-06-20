from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='auth_index'),                  # Landing page (Login/Register)
    path('register/', views.register, name='auth_register'),    # Action to handle registration
    path('login/', views.login, name='auth_login'),            # Action to handle login
    path('logout/', views.logout, name='auth_logout'),          # Action to clear session

    path('catalog/', views.catalog, name='catalog'), 
    path('catalog/filter/', views.filter_cars, name='filter_cars'),

    path('catalog/car/<int:car_id>/', views.car_details_view, name='car_details'),

    path('booking/setup/<int:car_id>/', views.booking_setup, name='booking_setup'),
    path('booking/create/<int:car_id>/', views.create_booking_action, name='create_booking_action'),

    path('booking/payment/<int:booking_id>/', views.payment_gate, name='payment_gate'),
    path('booking/payment/process/<int:booking_id>/', views.process_payment_action, name='process_payment_action'),
]