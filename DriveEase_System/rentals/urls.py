from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='auth_index'),                  # Landing page (Login/Register)
    path('register/', views.register, name='auth_register'),    # Action to handle registration
    path('login/', views.login, name='auth_login'),            # Action to handle login
    path('dashboard/', views.dashboard, name='dashboard'),      # Temporary success dashboard
    path('logout/', views.logout, name='auth_logout'),          # Action to clear session
]