// Admin Dashboard Script with Leaflet (OpenStreetMap)
// Global variables
let map;
let shipments = [];
let mapMarkers = [];
let selectedOriginCoords = null; // Allows user to set origin via map/search/current location

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
        
        // Initialize map
        await initializeMap();
        
        // Set up event listeners
        setupEventListeners();
        
        // Load initial data
        await loadShipments();
        
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

    // Map search
    const searchBtn = document.getElementById('mapSearchBtn');
    const searchInput = document.getElementById('mapSearchInput');
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', async () => {
            const query = searchInput.value.trim();
            if (!query) return;
            try {
                const coords = await utils.geocodeAddress(query);
                if (coords?.lat && coords?.lng) {
                    selectedOriginCoords = coords;
                    const tempMarker = L.marker([coords.lat, coords.lng]).addTo(map);
                    mapMarkers.push({ id: `search-${Date.now()}`, marker: tempMarker });
                    map.setView([coords.lat, coords.lng], 10);
                    utils.showNotification('Location selected from search', 'success');
                }
            } catch (e) {
                console.error('Search geocode error:', e);
                utils.showNotification('Failed to find that location', 'error');
            }
        });
    }

    // Use Current Location
    const currentBtn = document.getElementById('useCurrentLocationBtn');
    if (currentBtn) {
        currentBtn.addEventListener('click', () => {
            if (!navigator.geolocation) {
                utils.showNotification('Geolocation not supported', 'error');
                return;
            }
            navigator.geolocation.getCurrentPosition((pos) => {
                const { latitude, longitude } = pos.coords;
                selectedOriginCoords = { lat: latitude, lng: longitude };
                const tempMarker = L.marker([latitude, longitude]).addTo(map);
                mapMarkers.push({ id: `gps-${Date.now()}`, marker: tempMarker });
                map.setView([latitude, longitude], 12);
                utils.showNotification('Using current location for origin', 'success');
            }, (err) => {
                console.error('Geolocation error:', err);
                utils.showNotification('Failed to get current location', 'error');
            });
        });
    }
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    
    // Build comprehensive shipment data structure
    const shipmentData = {
        // Sender Information
        sender: {
            name: formData.get('senderName'),
            email: formData.get('senderEmail'),
            phone: formData.get('senderPhone'),
            address: formData.get('senderAddress')
        },
        
        // Receiver Information
        receiver: {
            name: formData.get('receiverName'),
            email: formData.get('receiverEmail'),
            phone: formData.get('receiverPhone'),
            address: formData.get('receiverAddress')
        },
        
        // Origin Details
        origin: {
            city: formData.get('originCity'),
            state: formData.get('originState'),
            country: formData.get('originCountry'),
            facility: formData.get('originFacility'),
            address: formData.get('senderAddress') // Use sender address as origin address
        },
        
        // Destination Details
        destination: {
            city: formData.get('destinationCity'),
            state: formData.get('destinationState'),
            country: formData.get('destinationCountry'),
            facility: formData.get('destinationFacility'),
            address: formData.get('receiverAddress') // Use receiver address as destination address
        },
        
        // Package Details
        package: {
            description: formData.get('packageDescription'),
            weight: parseFloat(formData.get('weight')),
            dimensions: formData.get('dimensions'),
            serviceType: formData.get('serviceType'),
            carrierId: formData.get('carrierId'),
            driverId: formData.get('driverId')
        },
        
        // Delivery Information
        status: formData.get('status'),
        estimatedDeliveryDate: formData.get('estimatedDeliveryDate') ? new Date(formData.get('estimatedDeliveryDate')) : null
    };
    
    try {
        // Prefer user-selected origin coordinates if provided
        if (selectedOriginCoords?.lat && selectedOriginCoords?.lng) {
            shipmentData.origin.coordinates = selectedOriginCoords;
        }

        // Get coordinates for addresses if not already set
        if (!shipmentData.origin.coordinates?.lat || !shipmentData.origin.coordinates?.lng) {
            const originAddress = `${shipmentData.origin.city}, ${shipmentData.origin.state}, ${shipmentData.origin.country}`;
            try {
                const originCoords = await utils.geocodeAddress(originAddress);
                shipmentData.origin.coordinates = originCoords;
            } catch (e) {
                console.warn('Origin geocoding failed:', e);
                shipmentData.origin.coordinates = { lat: null, lng: null };
            }
        }

        // Always attempt destination geocode
        const destinationAddress = `${shipmentData.destination.city}, ${shipmentData.destination.state}, ${shipmentData.destination.country}`;
        try {
            const destinationCoords = await utils.geocodeAddress(destinationAddress);
            shipmentData.destination.coordinates = destinationCoords;
        } catch (e) {
            console.warn('Destination geocoding failed:', e);
            shipmentData.destination.coordinates = { lat: null, lng: null };
        }
        
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
                
                // Show success message with TRANS tracking ID
                showSuccessMessage(data.data.trackingID);
                
                // Reset form
                event.target.reset();
            } else {
                throw new Error(data.message);
            }
        } else if (response.status === 401) {
            window.location.href = '/admin/login';
            return;
        } else {
            throw new Error('Failed to create shipment');
        }
        
    } catch (error) {
        console.error('Error creating shipment:', error);
        utils.showNotification('Failed to create shipment: ' + error.message, 'error');
    }
}

// Show success message
function showSuccessMessage(trackingID) {
    const successDiv = document.getElementById('successMessage');
    const successText = document.getElementById('successText');
    
    successText.textContent = `Shipment created successfully! Tracking ID: ${trackingID}`;
    successDiv.classList.remove('hidden');
    
    // Auto-hide after 10 seconds
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
        updateStats();
        
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
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="text-sm font-medium text-[#1E3A8A]">${shipment.trackingID}</div>
                    <button onclick="utils.copyToClipboard('${shipment.trackingID}')" 
                            class="ml-2 text-gray-400 hover:text-[#3B82F6]" title="Copy tracking ID">
                        <i data-lucide="copy" class="w-4 h-4"></i>
                    </button>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-[#374151]">${shipment.sender?.name || 'N/A'}</div>
                <div class="text-sm text-gray-500">${shipment.origin?.city || 'N/A'}, ${shipment.origin?.state || 'N/A'}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-[#374151]">${shipment.receiver?.name || 'N/A'}</div>
                <div class="text-sm text-gray-500">${shipment.destination?.city || 'N/A'}, ${shipment.destination?.state || 'N/A'}</div>
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
                    <button onclick="updateShipmentLocation('${shipment.id}')" 
                            class="text-green-600 hover:text-green-800" title="Update Location">
                        <i data-lucide="map-pin" class="w-4 h-4"></i>
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
        const preferred = shipment.currentLocation?.coordinates || shipment.origin?.coordinates;
        if (preferred?.lat && preferred?.lng) {
            updateMapMarker(shipment);
        }
    });
    
    // Fit map to show all markers
    if (shipments.length > 0 && shipments.some(s => s.origin?.coordinates?.lat && s.origin?.coordinates?.lng)) {
        fitMapToMarkers();
    }
}

// Update individual map marker
function updateMapMarker(shipment) {
    const coords = shipment.currentLocation?.coordinates || shipment.origin?.coordinates;
    if (!map || !coords?.lat || !coords?.lng) return;
    
    // Create custom icon
    const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${getStatusColor(shipment.status)}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2); cursor: pointer;"></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });
    
    // Create popup content
    const popupContent = `
        <div class="p-2">
            <h3 class="font-semibold text-[#1E3A8A] mb-2">${shipment.trackingID}</h3>
            <p class="text-sm text-[#374151] mb-1"><strong>From:</strong> ${shipment.sender?.name || 'N/A'}</p>
            <p class="text-sm text-[#374151] mb-1"><strong>To:</strong> ${shipment.receiver?.name || 'N/A'}</p>
            <p class="text-sm text-[#374151] mb-1"><strong>Status:</strong> ${shipment.status}</p>
            <p class="text-xs text-gray-500">Weight: ${shipment.package?.weight || 'N/A'}kg</p>
        </div>
    `;
    
    // Create marker
    const marker = L.marker([coords.lat, coords.lng], { icon })
        .bindPopup(popupContent)
        .addTo(map);
    
    // Store marker reference
    mapMarkers.push({ id: shipment.id, marker });
}

// Fit map to show all markers
function fitMapToMarkers() {
    if (!map || mapMarkers.length === 0) return;
    
    const group = new L.featureGroup(mapMarkers.map(m => m.marker));
    map.fitBounds(group.getBounds().pad(0.1));
}

// Get status color for markers
function getStatusColor(status) {
    const colors = {
        'pending': '#F59E0B',
        'in-transit': '#3B82F6',
        'delivered': '#10B981',
        'cancelled': '#EF4444'
    };
    return colors[status] || '#6B7280';
}

// Update statistics
function updateStats() {
    const total = shipments.length;
    const inTransit = shipments.filter(s => s.status === 'in-transit').length;
    const pending = shipments.filter(s => s.status === 'pending').length;
    const delivered = shipments.filter(s => s.status === 'delivered').length;
    
    document.getElementById('totalShipments').textContent = total;
    document.getElementById('inTransitCount').textContent = inTransit;
    document.getElementById('pendingCount').textContent = pending;
    document.getElementById('deliveredCount').textContent = delivered;
}

// Edit shipment tracking info (status and ETA)
async function editShipment(shipmentId) {
    try {
        const status = prompt('Enter new status (pending, processing, in-transit, out-for-delivery, delivered, cancelled):');
        const etaInput = prompt('Enter Estimated Delivery (YYYY-MM-DDTHH:mm) or leave blank:');
        const updateData = {};
        if (status && status.trim()) {
            updateData.status = status.trim();
        }
        if (etaInput && etaInput.trim()) {
            const etaDate = new Date(etaInput.trim());
            if (!isNaN(etaDate.getTime())) {
                updateData.estimatedDeliveryDate = etaDate.toISOString();
            }
        }
        if (Object.keys(updateData).length === 0) {
            utils.showNotification('No changes provided', 'error');
            return;
        }
        const response = await fetch(`/admin/api/shipments/${shipmentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(updateData)
        });
        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/admin/login';
                return;
            }
            throw new Error('Failed to update shipment');
        }
        const data = await response.json();
        if (!data.success) throw new Error(data.message || 'Failed to update shipment');
        // Update local
        const idx = shipments.findIndex(s => s.id === shipmentId);
        if (idx !== -1) shipments[idx] = data.data;
        updateShipmentsTable();
        updateMapMarkers();
        updateStats();
        utils.showNotification('Shipment updated successfully', 'success');
    } catch (err) {
        console.error('Edit shipment error:', err);
        utils.showNotification('Failed to update shipment', 'error');
    }
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
                updateStats();
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

// Update shipment current location by entering any location text (geocoded) or raw coords
async function updateShipmentLocation(shipmentId) {
    try {
        // Ask for a human-friendly location first
        let locationName = prompt('Enter location (e.g., "Lagos, Nigeria" or facility name). Leave empty to input lat/lng:') || '';
        let latLng = null;

        if (locationName.trim()) {
            try {
                latLng = await utils.geocodeAddress(locationName.trim());
            } catch (e) {
                console.warn('Geocode failed for typed location:', e);
            }
        }

        // If no location text given or geocode failed, fall back to raw lat/lng prompts
        if (!latLng || typeof latLng.lat !== 'number' || typeof latLng.lng !== 'number') {
            const lat = parseFloat(prompt('Enter latitude:'));
            const lng = parseFloat(prompt('Enter longitude:'));
            if (isNaN(lat) || isNaN(lng)) {
                utils.showNotification('Invalid coordinates', 'error');
                return;
            }
            latLng = { lat, lng };
            // If user didn't supply a name earlier, keep it empty
        }

        const response = await fetch(`/admin/api/shipments/${shipmentId}/location`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ lat: latLng.lat, lng: latLng.lng, locationName })
        });

        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/admin/login';
                return;
            }
            throw new Error('Failed to update location');
        }

        const data = await response.json();
        if (!data.success) throw new Error(data.message || 'Failed to update location');

        // Update local state
        const idx = shipments.findIndex(s => s.id === shipmentId);
        if (idx !== -1) {
            shipments[idx] = data.data;
        }

        updateMapMarkers();
        updateShipmentsTable();
        utils.showNotification('Location updated', 'success');
    } catch (err) {
        console.error('Update location error:', err);
        utils.showNotification('Failed to update location', 'error');
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
    handleLogout,
    updateShipmentLocation
};

