// DOM Elements
const eventForm = document.getElementById('event-form');
const eventsContainer = document.getElementById('events-container');
const eventNameInput = document.getElementById('event-name');
const eventDateInput = document.getElementById('event-date');
const eventTimeInput = document.getElementById('event-time');
const eventLocationInput = document.getElementById('event-location');

// Error message elements
const nameError = document.getElementById('name-error');
const dateError = document.getElementById('date-error');
const timeError = document.getElementById('time-error');
const locationError = document.getElementById('location-error');

// Local Storage Key
const EVENTS_STORAGE_KEY = 'eventlitez-events';

// Event Listeners
document.addEventListener('DOMContentLoaded', loadEvents);
eventForm.addEventListener('submit', handleFormSubmit);

/**
 * Validates the form inputs
 * @returns {boolean} - Whether the form is valid
 */
function validateForm() {
    let isValid = true;
    
    // Reset error messages
    nameError.textContent = '';
    dateError.textContent = '';
    timeError.textContent = '';
    locationError.textContent = '';
    
    // Validate event name
    if (!eventNameInput.value.trim()) {
        nameError.textContent = 'Event name is required';
        isValid = false;
    }
    
    // Validate date
    if (!eventDateInput.value) {
        dateError.textContent = 'Date is required';
        isValid = false;
    } else {
        const selectedDate = new Date(eventDateInput.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            dateError.textContent = 'Date cannot be in the past';
            isValid = false;
        }
    }
    
    // Validate time
    if (!eventTimeInput.value) {
        timeError.textContent = 'Time is required';
        isValid = false;
    }
    
    // Validate location
    if (!eventLocationInput.value.trim()) {
        locationError.textContent = 'Location is required';
        isValid = false;
    }
    
    return isValid;
}

/**
 * Handles form submission
 * @param {Event} e - The submit event
 */
function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    // Create event object
    const event = {
        id: Date.now(), // Use timestamp as unique ID
        name: eventNameInput.value.trim(),
        date: eventDateInput.value,
        time: eventTimeInput.value,
        location: eventLocationInput.value.trim(),
        createdAt: new Date().toISOString()
    };
    
    // Add event to storage
    saveEvent(event);
    
    // Create and add event card to DOM
    createEventCard(event);
    
    // Reset form
    eventForm.reset();
    
    // Show success message
    showNotification('Event added successfully!', 'success');
}

/**
 * Saves event to localStorage
 * @param {Object} event - The event to save
 */
function saveEvent(event) {
    const events = getEventsFromStorage();
    events.push(event);
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
}

/**
 * Retrieves events from localStorage
 * @returns {Array} - Array of events
 */
function getEventsFromStorage() {
    const eventsJSON = localStorage.getItem(EVENTS_STORAGE_KEY);
    return eventsJSON ? JSON.parse(eventsJSON) : [];
}

/**
 * Loads events from localStorage and displays them
 */
function loadEvents() {
    eventsContainer.innerHTML = '';
    const events = getEventsFromStorage();
    
    // Sort events by date (ascending)
    events.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA - dateB;
    });
    
    if (events.length === 0) {
        eventsContainer.innerHTML = '<p class="no-events">No events yet. Add your first event above!</p>';
        return;
    }
    
    events.forEach(event => createEventCard(event));
}

/**
 * Creates an event card and adds it to the DOM
 * @param {Object} event - The event object
 */
function createEventCard(event) {
    const card = document.createElement('div');
    card.classList.add('event-card');
    card.dataset.id = event.id;
    card.classList.add('fade-in');
    
    // Format date for display
    const eventDate = new Date(`${event.date}T${event.time}`);
    const formattedDate = eventDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Format time for display
    const formattedTime = eventDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    card.innerHTML = `
        <h3>${event.name}</h3>
        <div class="event-info">
            <i class="fas fa-calendar"></i>
            <span>${formattedDate}</span>
        </div>
        <div class="event-info">
            <i class="fas fa-clock"></i>
            <span>${formattedTime}</span>
        </div>
        <div class="event-info">
            <i class="fas fa-map-marker-alt"></i>
            <span>${event.location}</span>
        </div>
        <button class="delete-btn" title="Delete event">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    // Add delete event listener
    const deleteBtn = card.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => deleteEvent(event.id));
    
    // If there's a "no events" message, remove it
    const noEventsMsg = eventsContainer.querySelector('.no-events');
    if (noEventsMsg) {
        eventsContainer.removeChild(noEventsMsg);
    }
    
    eventsContainer.appendChild(card);
}

/**
 * Deletes an event
 * @param {number} id - The event ID to delete
 */
function deleteEvent(id) {
    // Remove from storage
    let events = getEventsFromStorage();
    events = events.filter(event => event.id !== id);
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
    
    // Remove from DOM
    const card = eventsContainer.querySelector(`.event-card[data-id="${id}"]`);
    if (card) {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.8)';
        
        // Wait for animation to complete before removing
        setTimeout(() => {
            eventsContainer.removeChild(card);
            
            // If no events left, show message
            if (events.length === 0) {
                eventsContainer.innerHTML = '<p class="no-events">No events yet. Add your first event above!</p>';
            }
        }, 300);
    }
    
    showNotification('Event deleted successfully!', 'success');
}

/**
 * Shows a notification message
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success, error)
 */
function showNotification(message, type) {
    // Check if notification container exists, create if not
    let notificationContainer = document.querySelector('.notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.classList.add('notification-container');
        document.body.appendChild(notificationContainer);
        
        // Add styles for notification container
        const style = document.createElement('style');
        style.textContent = `
            .notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
            }
            
            .notification {
                padding: 12px 20px;
                margin-bottom: 10px;
                border-radius: var(--border-radius);
                color: white;
                box-shadow: var(--box-shadow);
                animation: slideIn 0.3s ease-out forwards, fadeOut 0.5s ease-out 2.5s forwards;
                max-width: 300px;
            }
            
            .notification.success {
                background-color: var(--success-color);
            }
            
            .notification.error {
                background-color: var(--error-color);
            }
            
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; visibility: hidden; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.classList.add('notification', type);
    notification.textContent = message;
    
    // Add to container
    notificationContainer.appendChild(notification);
    
    // Remove after animation completes
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Set min date for date input to today
const today = new Date().toISOString().split('T')[0];
eventDateInput.setAttribute('min', today);
