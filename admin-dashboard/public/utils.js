// Utility Functions for Transportify Admin Dashboard

/**
 * Generate a unique tracking ID in format TRK-XXXXXXXXXX
 * @returns {string} Unique tracking ID
 */
function generateTrackingID() {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substr(2, 8).toUpperCase();
    return `TRK-${timestamp}-${randomStr}`;
}

/**
 * Format date to readable string
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Get status badge HTML with appropriate styling
 * @param {string} status - Shipment status
 * @returns {string} HTML for status badge
 */
function getStatusBadge(status) {
    const statusMap = {
        'pending': { class: 'status-pending', text: 'Pending' },
        'in-transit': { class: 'status-transit', text: 'In Transit' },
        'delivered': { class: 'status-delivered', text: 'Delivered' },
        'cancelled': { class: 'status-cancelled', text: 'Cancelled' }
    };
    
    const statusInfo = statusMap[status] || statusMap['pending'];
    return `<span class="status-badge ${statusInfo.class}">${statusInfo.text}</span>`;
}

/**
 * Show notification message
 * @param {string} message - Notification message
 * @param {string} type - Notification type ('success' or 'error')
 */
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

/**
 * Validate form data
 * @param {Object} formData - Form data to validate
 * @returns {Object} Validation result with isValid and errors
 */
function validateFormData(formData) {
    const errors = {};
    let isValid = true;
    
    // Required fields
    const requiredFields = [
        'senderName', 'originAddress', 'destinationName', 
        'destinationAddress', 'weight'
    ];
    
    requiredFields.forEach(field => {
        if (!formData[field] || formData[field].trim() === '') {
            errors[field] = `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`;
            isValid = false;
        }
    });
    
    // Validate weight is a positive number
    if (formData.weight && (isNaN(formData.weight) || parseFloat(formData.weight) <= 0)) {
        errors.weight = 'Weight must be a positive number';
        isValid = false;
    }
    
    // Validate ETA is in the future
    if (formData.eta) {
        const etaDate = new Date(formData.eta);
        const now = new Date();
        if (etaDate <= now) {
            errors.eta = 'Estimated delivery date must be in the future';
            isValid = false;
        }
    }
    
    return { isValid, errors };
}

/**
 * Get coordinates from address using a geocoding service
 * Note: In a real application, you would use a proper geocoding API
 * @param {string} address - Address to geocode
 * @returns {Promise<Object>} Promise resolving to coordinates
 */
async function geocodeAddress(address) {
    // Mock geocoding - in real app, use Google Maps API or similar
    return new Promise((resolve) => {
        setTimeout(() => {
            // Generate mock coordinates around the world
            const mockCoords = [
                { lat: 40.7128, lng: -74.0060 }, // New York
                { lat: 51.5074, lng: -0.1278 }, // London
                { lat: 35.6762, lng: 139.6503 }, // Tokyo
                { lat: -33.8688, lng: 151.2093 }, // Sydney
                { lat: 37.7749, lng: -122.4194 }, // San Francisco
                { lat: 48.8566, lng: 2.3522 }, // Paris
                { lat: 55.7558, lng: 37.6176 }, // Moscow
                { lat: -22.9068, lng: -43.1729 }, // Rio de Janeiro
            ];
            
            const randomCoord = mockCoords[Math.floor(Math.random() * mockCoords.length)];
            resolve(randomCoord);
        }, 500);
    });
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {number} lat1 - First latitude
 * @param {number} lng1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lng2 - Second longitude
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

/**
 * Format weight with units
 * @param {number} weight - Weight value
 * @param {string} unit - Weight unit (default: 'kg')
 * @returns {string} Formatted weight string
 */
function formatWeight(weight, unit = 'kg') {
    return `${parseFloat(weight).toFixed(1)} ${unit}`;
}

/**
 * Format dimensions string
 * @param {string} dimensions - Dimensions string
 * @returns {string} Formatted dimensions
 */
function formatDimensions(dimensions) {
    if (!dimensions) return 'N/A';
    return dimensions.replace(/\s+/g, '').replace(/×/g, ' × ');
}

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('Copied to clipboard!', 'success');
    } catch (err) {
        console.error('Failed to copy: ', err);
        showNotification('Failed to copy to clipboard', 'error');
    }
}

/**
 * Export shipments data as CSV
 * @param {Array} shipments - Array of shipment data
 */
function exportToCSV(shipments) {
    if (!shipments || shipments.length === 0) {
        showNotification('No data to export', 'error');
        return;
    }
    
    const headers = [
        'Tracking ID', 'Sender Name', 'Origin Address', 'Destination Name',
        'Destination Address', 'Weight (kg)', 'Dimensions', 'Status',
        'Created Date', 'ETA'
    ];
    
    const csvContent = [
        headers.join(','),
        ...shipments.map(shipment => [
            shipment.trackingID,
            `"${shipment.senderName}"`,
            `"${shipment.originAddress}"`,
            `"${shipment.destinationName}"`,
            `"${shipment.destinationAddress}"`,
            shipment.weight,
            `"${shipment.dimensions || ''}"`,
            shipment.status,
            `"${formatDate(shipment.createdAt)}"`,
            `"${shipment.eta ? formatDate(shipment.eta) : ''}"`
        ].join(','))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `shipments_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Data exported successfully!', 'success');
}

// Make functions globally available
window.utils = {
    generateTrackingID,
    formatDate,
    getStatusBadge,
    showNotification,
    validateFormData,
    geocodeAddress,
    calculateDistance,
    formatWeight,
    formatDimensions,
    debounce,
    copyToClipboard,
    exportToCSV
};
