from django.shortcuts import render, redirect
from django.contrib import messages
from .models import User
import bcrypt

def index(request):
    """Renders the main authentication page containing both Login and Registration forms."""
    # If user is already logged in, redirect them straight to the dashboard
    if 'user_id' in request.session:
        return redirect('dashboard')
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
                return redirect('dashboard')
        
        messages.error(request, "Invalid email or password credentials.")
    return redirect('auth_index')

def dashboard(request):
    """Route Protection: Prevents unauthenticated users from accessing the platform."""
    if 'user_id' not in request.session:
        messages.error(request, "Authentication required. Please sign in first.")
        return redirect('auth_index')
    return render(request, 'dashboard.html')

def logout(request):
    """Clears the session completely and logs out the user."""
    request.session.flush()
    return redirect('auth_index')