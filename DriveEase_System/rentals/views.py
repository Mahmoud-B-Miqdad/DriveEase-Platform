from django.shortcuts import render, redirect
from django.http import JsonResponse
from .models import *
from django.contrib import messages
import bcrypt

def index(request):
    """Renders the main authentication page containing both Login and Registration forms."""
    # If user is already logged in, redirect them straight to the dashboard
    if 'user_id' in request.session:
        return redirect('catalog')
    return render(request, 'auth.html')

def register(request):
    """Validates the data using the custom model manager, hashes password, and creates the client."""
    if request.method == "POST":
        # Call our custom Fat Model validator
        errors = User.objects.register_validator(request.POST)
        
        if errors:
            for key, value in errors.items():
                messages.error(request, value, extra_tags=key)
            return redirect('auth_index')
        
        # Create user safely inside the Fat Model
        User.objects.register_user(request.POST)
        messages.success(request, "Registration successful! Please sign in with your new credentials.")
        return redirect('auth_index')
        
    return redirect('auth_index')

def login(request):
    """Processes login attempts with safe database fetching and bcrypt check."""
    if request.method == "POST":
        email = request.POST.get('email', '')
        password = request.POST.get('password', '')
        
        user = User.objects.filter(email=email).first()
        
        if user:
            # Check bcrypt password match safely
            if bcrypt.checkpw(password.encode(), user.password.encode()):
                # Store vital info in Django Session
                request.session['user_id'] = user.id
                request.session['username'] = user.username
                request.session['role'] = user.role
                return redirect('catalog')
        
        messages.error(request, "Invalid email or password credentials.")
    return redirect('auth_index')

def catalog(request):
    """Route Protection: Renders the premium car catalog with initial categories."""
    if 'user_id' not in request.session:
        messages.error(request, "Authentication required. Please sign in first.")
        return redirect('auth_index')
        
    categories = CarCategory.objects.all()
    return render(request, 'catalog.html', {'categories': categories})


def filter_cars(request):
    """AJAX Endpoint: Fetches available cars filtered by category as JSON."""
    if 'user_id' not in request.session:
        return JsonResponse({'error': 'Unauthorized'}, status=401)
        
    category_id = request.GET.get('category_id', None)
    
    if category_id == 'all' or not category_id:
        cars_queryset = Car.objects.get_available_cars()
    else:
        cars_queryset = Car.objects.get_available_cars(category_id=category_id)
        
    cars_list = []
    for car in cars_queryset:
        cars_list.append({
            'id': car.id,
            'make': car.make,
            'model': car.model,
            'year': car.year,
            'category': car.car_category.category_name,
            'rate': str(car.car_category.daily_rate) 
        })
        
    return JsonResponse({'cars': cars_list})

def logout(request):
    """Clears the session completely and logs out the user."""
    request.session.flush()
    return redirect('auth_index')

def booking_setup(request, car_id):
    """Route Protection: Displays the booking form for a specific car."""
    if 'user_id' not in request.session:
        messages.error(request, "Authentication required. Please sign in first.")
        return redirect('auth_index')
        
    car = Car.objects.filter(id=car_id, is_available=True).first()
    if not car:
        messages.error(request, "The selected car is not available for booking.")
        return redirect('catalog')
        
    return render(request, 'booking.html', {'car': car})


def create_booking_action(request, car_id):
    """Processes the booking creation after executing fat model validations."""
    if request.method == "POST":
        if 'user_id' not in request.session:
            return redirect('auth_index')
            
        errors = Booking.objects.booking_validator(request.POST)
        
        if errors:
            for key, value in errors.items():
                messages.error(request, value)
            return redirect('booking_setup', car_id=car_id)
            
        user_id = request.session['user_id']
        booking = Booking.objects.create_booking(request.POST, user_id)
        
        messages.warning(request, f"Reservation #{booking.id} is temporarily held as PENDING. Please complete your payment below to secure your vehicle.")
        return redirect('payment_gate', booking_id=booking.id)
        
    return redirect('catalog')

def payment_gate(request, booking_id):
    """Route Protection: Displays the professional invoice and mock credit card form."""
    if 'user_id' not in request.session:
        messages.error(request, "Authentication required.")
        return redirect('auth_index')
        
    booking = Booking.objects.filter(id=booking_id, user_id=request.session['user_id']).first()
    if not booking:
        messages.error(request, "Reservation record not found.")
        return redirect('catalog')
        
    return render(request, 'payment.html', {'booking': booking})


def process_payment_action(request, booking_id):
    """Executes the financial transaction logic and issues the immutable database Payment invoice."""
    if request.method == "POST":
        if 'user_id' not in request.session:
            return redirect('auth_index')
            
        booking = Booking.objects.filter(id=booking_id, user_id=request.session['user_id']).first()
        if not booking:
            messages.error(request, "Critical billing error. Transaction halted.")
            return redirect('catalog')
            
        payment_method = request.POST.get('card_type', 'Visa')
        
        Payment.objects.process_invoice(
            booking=booking,
            payment_method=payment_method,
            amount_paid=booking.total_fees
        )
        
        messages.success(request, f"Payment received successfully! Your luxury rental is secured.", extra_tags='success')
        
        booking.booking_status = 'Confirmed'
        booking.save()
        return redirect('catalog')
        
    return redirect('catalog')