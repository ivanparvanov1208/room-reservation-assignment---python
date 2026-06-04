// TESTER NOTE: Global state for modal management
let currentRoomId = null;
let currentRoomName = null;

// TESTER NOTE: Opens the booking modal and populates room information
// Test: Verify modal appears and room data is correctly displayed
function openBookingModal(roomId, roomName) {
    currentRoomId = roomId;
    currentRoomName = roomName;
    
    document.getElementById('roomId').value = roomId;
    document.getElementById('modalRoomName').textContent = `Book: ${roomName}`;
    document.getElementById('bookingModal').style.display = 'block';
    
    // TESTER NOTE: Set minimum datetime to current time
    const now = new Date();
    const minDateTime = now.toISOString().slice(0, 16);
    document.getElementById('startTime').min = minDateTime;
    document.getElementById('endTime').min = minDateTime;
    
    // TESTER NOTE: Clear previous messages and form
    clearBookingMessage();
    document.getElementById('bookingForm').reset();
}

// TESTER NOTE: Closes the booking modal
function closeBookingModal() {
    document.getElementById('bookingModal').style.display = 'none';
    clearBookingMessage();
}

// TESTER NOTE: Clears the booking message display
function clearBookingMessage() {
    const messageEl = document.getElementById('bookingMessage');
    messageEl.textContent = '';
    messageEl.className = 'message';
}

// TESTER NOTE: Handles form submission via AJAX to prevent page reload
// Test: Submit valid booking, overlapping booking, and invalid time ranges
document.addEventListener('DOMContentLoaded', function() {
    const bookingForm = document.getElementById('bookingForm');
    
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const roomId = document.getElementById('roomId').value;
            const startTime = document.getElementById('startTime').value;
            const endTime = document.getElementById('endTime').value;
            const messageEl = document.getElementById('bookingMessage');
            
            // TESTER NOTE: Client-side validation before sending to server
            if (!startTime || !endTime) {
                showMessage('Please fill in all fields.', 'error');
                return;
            }
            
            const startDate = new Date(startTime);
            const endDate = new Date(endTime);
            
            if (startDate >= endDate) {
                showMessage('Start time must be before end time.', 'error');
                return;
            }
            
            // TESTER NOTE: Convert to ISO format for backend compatibility
            const startISO = startDate.toISOString();
            const endISO = endDate.toISOString();
            
            // TESTER NOTE: Send booking request via AJAX
            const formData = new FormData();
            formData.append('room_id', roomId);
            formData.append('start_time', startISO);
            formData.append('end_time', endISO);
            formData.append('csrfmiddlewaretoken', getCookie('csrftoken'));
            
            fetch('/book/', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    showMessage(data.message, 'success');
                    setTimeout(() => {
                        closeBookingModal();
                        loadBookings(roomId);
                    }, 1500);
                } else {
                    showMessage(data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showMessage('An error occurred. Please try again.', 'error');
            });
        });
    }
    
    // TESTER NOTE: Load bookings for the first room on page load
    const firstRoomCard = document.querySelector('[data-room-id]');
    if (firstRoomCard) {
        const firstRoomId = firstRoomCard.getAttribute('data-room-id');
        loadBookings(firstRoomId);
    }
});

// TESTER NOTE: Displays success or error messages in the modal
function showMessage(message, type) {
    const messageEl = document.getElementById('bookingMessage');
    messageEl.textContent = message;
    messageEl.className = `message ${type}`;
}

// TESTER NOTE: Fetches bookings from the API endpoint
// Test: Verify bookings are displayed correctly for each room
function loadBookings(roomId) {
    fetch(`/api/bookings/${roomId}/`)
        .then(response => response.json())
        .then(bookings => {
            displayBookings(bookings);
        })
        .catch(error => {
            console.error('Error loading bookings:', error);
        });
}

// TESTER NOTE: Displays bookings in the bookings list section
function displayBookings(bookings) {
    const bookingsList = document.getElementById('bookingsList');
    
    if (!bookingsList) return;
    
    // TESTER NOTE: Clear existing bookings
    bookingsList.innerHTML = '';
    
    if (bookings.length === 0) {
        bookingsList.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #7f8c8d;">No bookings yet.</p>';
        return;
    }
    
    // TESTER NOTE: Render each booking as a card
    bookings.forEach(booking => {
        const startDate = new Date(booking.start_time);
        const endDate = new Date(booking.end_time);
        
        const bookingCard = document.createElement('div');
        bookingCard.className = 'booking-item';
        bookingCard.innerHTML = `
            <h4>${booking.user__username}</h4>
            <p><strong>Start:</strong> ${formatDateTime(startDate)}</p>
            <p><strong>End:</strong> ${formatDateTime(endDate)}</p>
            <p><strong>Duration:</strong> ${calculateDuration(startDate, endDate)}</p>
        `;
        
        bookingsList.appendChild(bookingCard);
    });
}

// TESTER NOTE: Formats date and time for display
function formatDateTime(date) {
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
}

// TESTER NOTE: Calculates and displays booking duration
function calculateDuration(startDate, endDate) {
    const diffMs = endDate - startDate;
    const diffMins = Math.round(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    
    if (hours === 0) {
        return `${mins} minutes`;
    } else if (mins === 0) {
        return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
        return `${hours}h ${mins}m`;
    }
}

// TESTER NOTE: Utility function to get CSRF token from cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// TESTER NOTE: Close modal when clicking outside the modal content
window.addEventListener('click', function(event) {
    const modal = document.getElementById('bookingModal');
    if (event.target === modal) {
        closeBookingModal();
    }
});

// TESTER NOTE: Add event listeners to room cards for better UX
document.addEventListener('DOMContentLoaded', function() {
    const roomCards = document.querySelectorAll('.room-card');
    roomCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // TESTER NOTE: Only trigger if not clicking the button
            if (e.target.tagName !== 'BUTTON') {
                const bookBtn = this.querySelector('.btn-book');
                if (bookBtn) {
                    bookBtn.click();
                }
            }
        });
    });
});
