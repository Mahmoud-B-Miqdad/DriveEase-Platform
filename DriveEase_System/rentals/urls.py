from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='auth_index'),                  # Landing page (Login/Register)
    path('register/', views.register, name='auth_register'),    # Action to handle registration
    path('login/', views.login, name='auth_login'),            # Action to handle login
    path('logout/', views.logout, name='auth_logout'),          # Action to clear session

    path('catalog/', views.catalog, name='catalog'), 
    path('catalog/filter/', views.filter_cars, name='filter_cars'),
]