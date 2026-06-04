#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from reservations.models import Room

# TESTER NOTE: Create a test user for manual testing
if not User.objects.filter(username='testuser').exists():
    user = User.objects.create_user(username='testuser', password='testpass123', email='test@example.com')
    user.is_superuser = True
    print("Test user 'testuser' created with password 'testpass123'")

# TESTER NOTE: Create sample rooms for testing with real images from the static folder
rooms_data = [
    {
        'name': 'Conference Room A',
        'capacity': 10,
        'description': 'A sleek, modern space equipped with high-end conferencing technology and ergonomic seating.',
        'image_url': '/static/images/8xevIBjs1sH0.jpg'
    },
    {
        'name': 'Board Room',
        'capacity': 20,
        'description': 'An expansive room designed for executive meetings, featuring a large mahogany table and panoramic views.',
        'image_url': '/static/images/nKTzhoSYzkpe.jpg'
    },
    {
        'name': 'Training Room',
        'capacity': 30,
        'description': 'A versatile training area with interactive whiteboards and modular furniture for various workshop styles.',
        'image_url': '/static/images/kV9tuuApBHKL.jpg'
    },
    {
        'name': 'Executive Suite',
        'capacity': 8,
        'description': 'An intimate and luxurious setting for high-level negotiations and private executive discussions.',
        'image_url': '/static/images/LOOQiUbHKwog.jpg'
    },
    {
        'name': 'Collaboration Space',
        'capacity': 15,
        'description': 'A creative hub designed to foster innovation, with comfortable lounge areas and shared workspaces.',
        'image_url': '/static/images/dOrwAh2fbYNf.jpg'
    }
]

for room_data in rooms_data:
    room, created = Room.objects.update_or_create(
        name=room_data['name'],
        defaults=room_data
    )
    if created:
        print(f"Room '{room_data['name']}' created")
    else:
        print(f"Room '{room_data['name']}' updated")

print("Data initialization complete!")
