from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import AuthenticationForm
from django.http import JsonResponse
from .models import Room, Booking
from django.utils import timezone
from datetime import datetime

# TESTER NOTE: Index view fetches all available rooms.
# Check if rooms are displayed correctly when the database is empty.
def index(request):
    rooms = Room.objects.all()
    return render(request, 'reservations/index.html', {'rooms': rooms})

# TESTER NOTE: Simple view for the About Us page.
def about(request):
    return render(request, 'reservations/about.html')

# TESTER NOTE: This endpoint handles room booking via POST.
# Test with overlapping times to ensure the 'is_booked' logic works.
@login_required
def book_room(request):
    if request.method == 'POST':
        room_id = request.POST.get('room_id')
        start_str = request.POST.get('start_time')
        end_str = request.POST.get('end_time')
        
        try:
            # Handling both ISO format and potential simple datetime strings
            start_time = datetime.fromisoformat(start_str.replace('Z', '+00:00'))
            end_time = datetime.fromisoformat(end_str.replace('Z', '+00:00'))
            
            if start_time >= end_time:
                return JsonResponse({'status': 'error', 'message': 'Start time must be before end time.'}, status=400)

            # TESTER NOTE: Basic overlap detection logic.
            # Verify this against edge cases (e.g., exact start/end matches).
            overlap = Booking.objects.filter(
                room_id=room_id,
                start_time__lt=end_time,
                end_time__gt=start_time
            ).exists()
            
            if overlap:
                return JsonResponse({'status': 'error', 'message': 'Room is already booked for this period.'}, status=400)
            
            Booking.objects.create(
                room_id=room_id,
                user=request.user,
                start_time=start_time,
                end_time=end_time
            )
            return JsonResponse({'status': 'success', 'message': 'Booking successful!'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    
    return redirect('index')

# TESTER NOTE: API-like endpoint to get room bookings for frontend calendar/list.
def get_bookings(request, room_id):
    bookings = Booking.objects.filter(room_id=room_id).values('start_time', 'end_time', 'user__username')
    return JsonResponse(list(bookings), safe=False)

# TESTER NOTE: Custom login view to avoid admin panel redirection.
def login_view(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return redirect('index')
    else:
        form = AuthenticationForm()
    return render(request, 'reservations/login.html', {'form': form})

# TESTER NOTE: Custom logout view.
def logout_view(request):
    logout(request)
    return redirect('index')
