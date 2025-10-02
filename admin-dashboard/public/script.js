// Main JavaScript for Transportify Admin Dashboard

// Global variables
let map;
let shipments = [];
let mapMarkers = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
});

// Check authentication before initializing
async function checkAuthentication() {
    try {
        const response = await fetch('/admin/check-auth', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.authenticated) {
            initializeApp();
        } else {
            window.location.href = '/admin/login';
        }
    } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = '/admin/login';
    }
}

async function initializeApp() {
    try {
        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        // Initialize Mapbox
        await initializeMap();
        
        // Load existing shipments
        await loadShipments();
        
        // Set up event listeners
        setupEventListeners();
        
        // Update statistics
        updateStatistics();
        
        console.log('Admin dashboard initialized successfully');
    } catch (error) {
        console.error('Error initializing admin dashboard:', error);
        utils.showNotification('Failed to initialize dashboard', 'error');
    }
}

// Initialize Leaflet map
async function initializeMap() {
    try {
        // Initialize the map centered on a default location
        map = L.map('map').setView([20, 0], 2);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        // Add scale control
        L.control.scale().addTo(map);
        
        // Add geolocate control (using browser geolocation)
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                map.setView([position.coords.latitude, position.coords.longitude], 10);
            });
        }
        
        console.log('Map initialized successfully');
    } catch (error) {
        console.error('Error initializing map:', error);
        // Fallback: show message instead of map
        document.getElementById('map').innerHTML = `
            <div class="flex items-center justify-center h-full bg-gray-100 rounded-lg">
                <div class="text-center">
                    <p class="text-gray-600 mb-2">Map initialization failed</p>
                    <p class="text-sm text-gray-500">Please check your internet connection</p>
                </div>
            </div>
        `;
    }
}

// Set up event listeners
function setupEventListeners() {
    // Form submission
    document.getElementById('shipmentForm').addEventListener('submit', handleFormSubmit);
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // Real-time listener for shipments
    if (window.db) {
        window.db.collection('shipments').onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added' || change.type === 'modified') {
                    const shipment = { id: change.doc.id, ...change.doc.data() };
                    updateShipmentInList(shipment);
                    updateMapMarker(shipment);
                } else if (change.type === 'removed') {
                    removeShipmentFromList(change.doc.id);
                    removeMapMarker(change.doc.id);
                }
            });
            updateStatistics();
        });
    }
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const shipmentData = {
        senderName: formData.get('senderName'),
        originAddress: formData.get('originAddress'),
        destinationName: formData.get('destinationName'),
        destinationAddress: formData.get('destinationAddress'),
        weight: parseFloat(formData.get('weight')),
        dimensions: formData.get('dimensions'),
        eta: formData.get('eta') ? new Date(formData.get('eta')) : null,
        status: 'pending',
        createdAt: new Date(),
        trackingID: utils.generateTrackingID()
    };
    
    // Validate form data
    const validation = utils.validateFormData(shipmentData);
    if (!validation.isValid) {
        showFormErrors(validation.errors);
        return;
    }
    
    // Clear any previous errors
    clearFormErrors();
    
    // Show loading state
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<div class="loading-spinner"></div> Creating...';
    submitButton.disabled = true;
    
    try {
        // Get coordinates for addresses (mock implementation)
        const originCoords = await utils.geocodeAddress(shipmentData.originAddress);
        const destinationCoords = await utils.geocodeAddress(shipmentData.destinationAddress);
        
        shipmentData.originCoords = originCoords;
        shipmentData.destinationCoords = destinationCoords;
        
        // Save to server
        const response = await fetch('/admin/api/shipments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(shipmentData)
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                // Add to local array for immediate update
                shipments.push(data.data);
                updateShipmentsTable();
                updateMapMarkers();
            } else {
                throw new Error(data.message);
            }
        } else if (response.status === 401) {
            window.location.href = '/admin/login';
            return;
        } else {
            throw new Error('Failed to create shipment');
        }
        
        // Show success message
        showSuccessMessage(shipmentData.trackingID);
        
        // Reset form
        e.target.reset();
        
        utils.showNotification('Shipment created successfully!', 'success');
        
    } catch (error) {
        console.error('Error creating shipment:', error);
        utils.showNotification('Failed to create shipment', 'error');
    } finally {
        // Reset button state
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
}

// Show form validation errors
function showFormErrors(errors) {
    Object.keys(errors).forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field) {
            field.classList.add('form-error');
            
            // Remove existing error message
            const existingError = field.parentNode.querySelector('.error-message');
            if (existingError) {
                existingError.remove();
            }
            
            // Add new error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = errors[fieldName];
            field.parentNode.appendChild(errorDiv);
        }
    });
}

// Clear form validation errors
function clearFormErrors() {
    const errorFields = document.querySelectorAll('.form-error');
    errorFields.forEach(field => {
        field.classList.remove('form-error');
    });
    
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(message => {
        message.remove();
    });
}

// Show success message with tracking ID
function showSuccessMessage(trackingID) {
    const successDiv = document.getElementById('successMessage');
    const successText = document.getElementById('successText');
    
    successText.textContent = `Shipment created successfully! Tracking ID: ${trackingID}`;
    successDiv.classList.remove('hidden');
    successDiv.classList.add('success-message');
    
    // Hide after 10 seconds
    setTimeout(() => {
        successDiv.classList.add('hidden');
    }, 10000);
}

// Load shipments from server
async function loadShipments() {
    try {
        const response = await fetch('/admin/api/shipments', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                shipments = data.data;
            } else {
                throw new Error(data.message);
            }
        } else if (response.status === 401) {
            // Redirect to login if not authenticated
            window.location.href = '/admin/login';
            return;
        } else {
            throw new Error('Failed to load shipments');
        }
        
        updateShipmentsTable();
        updateMapMarkers();
        
    } catch (error) {
        console.error('Error loading shipments:', error);
        utils.showNotification('Failed to load shipments', 'error');
    }
}

// Update shipments table
function updateShipmentsTable() {
    const tbody = document.getElementById('shipmentsTableBody');
    tbody.innerHTML = '';
    
    shipments.forEach(shipment => {
        const row = document.createElement('tr');
        row.className = 'table-row';
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <span class="text-sm font-medium text-[#1E3A8A]">${shipment.trackingID}</span>
                    <button onclick="utils.copyToClipboard('${shipment.trackingID}')" 
                            class="ml-2 text-gray-400 hover:text-[#3B82F6]" title="Copy tracking ID">
                        <i data-lucide="copy" class="w-4 h-4"></i>
                    </button>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-[#374151]">${shipment.senderName}</div>
                <div class="text-sm text-gray-500">${shipment.originAddress}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-[#374151]">${shipment.destinationName}</div>
                <div class="text-sm text-gray-500">${shipment.destinationAddress}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                ${utils.getStatusBadge(shipment.status)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">
                ${utils.formatDate(shipment.createdAt)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                    <button onclick="editShipment('${shipment.id}')" 
                            class="text-[#3B82F6] hover:text-[#1E3A8A]" title="Edit">
                        <i data-lucide="edit" class="w-4 h-4"></i>
                    </button>
                    <button onclick="deleteShipment('${shipment.id}')" 
                            class="text-red-600 hover:text-red-800" title="Delete">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Re-initialize icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Update map markers
function updateMapMarkers() {
    if (!map) return;
    
    // Clear existing markers
    mapMarkers.forEach(marker => map.removeLayer(marker));
    mapMarkers = [];
    
    // Add markers for each shipment
    shipments.forEach(shipment => {
        if (shipment.originCoords) {
            updateMapMarker(shipment);
        }
    });
    
    // Fit map to show all markers
    if (shipments.length > 0 && shipments.some(s => s.originCoords)) {
        fitMapToMarkers();
    }
}

// Update individual map marker
function updateMapMarker(shipment) {
    if (!map || !shipment.originCoords) return;
    
    // Remove existing marker if it exists
    removeMapMarker(shipment.id);
    
    // Create marker
    const el = document.createElement('div');
    el.className = 'map-marker';
    el.style.width = '30px';
    el.style.height = '30px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = getStatusColor(shipment.status);
    el.style.border = '3px solid white';
    el.style.cursor = 'pointer';
    el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    
    // Create popup
    const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false
    }).setHTML(`
        <div class="p-2">
            <h3 class="font-semibold text-[#1E3A8A] mb-2">${shipment.trackingID}</h3>
            <p class="text-sm text-[#374151] mb-1"><strong>From:</strong> ${shipment.senderName}</p>
            <p class="text-sm text-[#374151] mb-1"><strong>To:</strong> ${shipment.destinationName}</p>
            <p class="text-sm text-[#374151] mb-2"><strong>Status:</strong> ${utils.getStatusBadge(shipment.status)}</p>
            <p class="text-xs text-gray-500">Weight: ${utils.formatWeight(shipment.weight)}</p>
        </div>
    `);
    
    // Create marker
    const marker = new mapboxgl.Marker(el)
        .setLngLat([shipment.originCoords.lng, shipment.originCoords.lat])
        .setPopup(popup)
        .addTo(map);
    
    // Store marker reference
    mapMarkers.push({ id: shipment.id, marker });
}

// Remove map marker
function removeMapMarker(shipmentId) {
    const markerIndex = mapMarkers.findIndex(m => m.id === shipmentId);
    if (markerIndex !== -1) {
        mapMarkers[markerIndex].marker.remove();
        mapMarkers.splice(markerIndex, 1);
    }
}

// Get status color for marker
function getStatusColor(status) {
    const colors = {
        'pending': '#f59e0b',
        'in-transit': '#3b82f6',
        'delivered': '#10b981',
        'cancelled': '#ef4444'
    };
    return colors[status] || colors['pending'];
}

// Fit map to show all markers
function fitMapToMarkers() {
    if (!map || mapMarkers.length === 0) return;
    
    const bounds = new mapboxgl.LngLatBounds();
    mapMarkers.forEach(({ marker }) => {
        bounds.extend(marker.getLngLat());
    });
    
    map.fitBounds(bounds, { padding: 50 });
}

// Update statistics
function updateStatistics() {
    const totalShipments = shipments.length;
    const inTransitCount = shipments.filter(s => s.status === 'in-transit').length;
    const pendingCount = shipments.filter(s => s.status === 'pending').length;
    const deliveredCount = shipments.filter(s => s.status === 'delivered').length;
    
    document.getElementById('totalShipments').textContent = totalShipments;
    document.getElementById('inTransitCount').textContent = inTransitCount;
    document.getElementById('pendingCount').textContent = pendingCount;
    document.getElementById('deliveredCount').textContent = deliveredCount;
}

// Update shipment in list (for real-time updates)
function updateShipmentInList(shipment) {
    const existingIndex = shipments.findIndex(s => s.id === shipment.id);
    if (existingIndex !== -1) {
        shipments[existingIndex] = shipment;
    } else {
        shipments.push(shipment);
    }
    updateShipmentsTable();
}

// Remove shipment from list (for real-time updates)
function removeShipmentFromList(shipmentId) {
    shipments = shipments.filter(s => s.id !== shipmentId);
    updateShipmentsTable();
}

// Edit shipment (placeholder function)
function editShipment(shipmentId) {
    utils.showNotification('Edit functionality coming soon!', 'success');
}

// Delete shipment
async function deleteShipment(shipmentId) {
    if (!confirm('Are you sure you want to delete this shipment?')) {
        return;
    }
    
    try {
        const response = await fetch(`/admin/api/shipments/${shipmentId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                // Remove from local array
                shipments = shipments.filter(s => s.id !== shipmentId);
                updateShipmentsTable();
                updateMapMarkers();
                utils.showNotification('Shipment deleted successfully', 'success');
            } else {
                throw new Error(data.message);
            }
        } else if (response.status === 401) {
            window.location.href = '/admin/login';
            return;
        } else {
            throw new Error('Failed to delete shipment');
        }
    } catch (error) {
        console.error('Error deleting shipment:', error);
        utils.showNotification('Failed to delete shipment', 'error');
    }
}

// Handle logout
async function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        try {
            const response = await fetch('/admin/logout', {
                method: 'POST',
                credentials: 'include'
            });
            
            if (response.ok) {
                // Redirect to login page
                window.location.href = '/admin/login';
            } else {
                utils.showNotification('Logout failed', 'error');
            }
        } catch (error) {
            console.error('Logout error:', error);
            utils.showNotification('Logout failed', 'error');
        }
    }
}

// Export functions to global scope
window.adminDashboard = {
    editShipment,
    deleteShipment,
    updateStatistics,
    loadShipments
};
