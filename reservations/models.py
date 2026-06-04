from django.db import models
from django.contrib.auth.models import User

# TESTER NOTE: This model defines the physical room properties. 
# Ensure that 'capacity' is always a positive integer during manual testing.
class Room(models.Model):
    name = models.CharField(max_length=100)
    capacity = models.IntegerField()
    description = models.TextField(blank=True)
    image_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.name

# TESTER NOTE: The Booking model handles the reservation logic.
# Overlapping reservations are checked at the view level, but 
# DB-level constraints could be added for extra safety.
class Booking(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='bookings')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.room.name} ({self.start_time} to {self.end_time})"
