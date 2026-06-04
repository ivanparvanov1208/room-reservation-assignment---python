from django.urls import path
from . import views

# TESTER NOTE: Ensure all endpoints are reachable.
# 'book/' requires authentication, test with and without a logged-in user.
urlpatterns = [
    path('', views.index, name='index'),
    path('about/', views.about, name='about'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('book/', views.book_room, name='book_room'),
    path('api/bookings/<int:room_id>/', views.get_bookings, name='get_bookings'),
]
