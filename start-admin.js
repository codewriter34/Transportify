// Simple admin server startup script
// This uses the existing node_modules from the main project

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

// Initialize Express app
const app = express();

// Basic security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// CORS configuration
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
}));

// Simple rate limiting
const requestCounts = new Map();
app.use((req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const max = 100;
    
    if (!requestCounts.has(ip)) {
        requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
    } else {
        const data = requestCounts.get(ip);
        if (now > data.resetTime) {
            data.count = 1;
            data.resetTime = now + windowMs;
        } else {
            data.count++;
            if (data.count > max) {
                return res.status(429).json({ error: 'Too many requests' });
            }
        }
    }
    next();
});

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: 'your-super-secret-session-key-change-this-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Mock database
let mockShipments = [
    {
        id: '1',
        trackingID: 'TRK-001',
        senderName: 'John Doe',
        originAddress: '123 Main St, New York, NY',
        destinationName: 'Jane Smith',
        destinationAddress: '456 Oak Ave, Los Angeles, CA',
        weight: 2.5,
        dimensions: '30×20×15',
        status: 'in-transit',
        createdAt: new Date('2024-01-15'),
        eta: new Date('2024-01-20'),
        originCoords: { lat: 40.7128, lng: -74.0060 },
        destinationCoords: { lat: 34.0522, lng: -118.2437 }
    }
];

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (req.session && req.session.authenticated) {
        return next();
    } else {
        return res.status(401).json({ error: 'Authentication required' });
    }
};

// Serve static files from admin dashboard
app.use('/admin', express.static(path.join(__dirname, 'admin-dashboard/public')));

// Authentication routes
app.post('/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Simple authentication
        if (username === 'admin' && password === 'admin123') {
            req.session.authenticated = true;
            req.session.username = username;
            
            res.json({ 
                success: true, 
                message: 'Login successful',
                user: { username }
            });
        } else {
            res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

app.post('/admin/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: 'Logout failed' 
            });
        }
        res.json({ 
            success: true, 
            message: 'Logout successful' 
        });
    });
});

app.get('/admin/check-auth', (req, res) => {
    if (req.session && req.session.authenticated) {
        res.json({ 
            authenticated: true, 
            user: { username: req.session.username }
        });
    } else {
        res.json({ authenticated: false });
    }
});

// Protected admin routes
app.get('/admin/dashboard', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-dashboard/public/index.html'));
});

// API routes for shipments
app.get('/admin/api/shipments', requireAuth, (req, res) => {
    try {
        res.json({
            success: true,
            data: mockShipments
        });
    } catch (error) {
        console.error('Error fetching shipments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching shipments'
        });
    }
});

app.post('/admin/api/shipments', requireAuth, (req, res) => {
    try {
        const shipmentData = req.body;
        
        // Generate tracking ID
        const trackingID = `TRK-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
        
        const newShipment = {
            id: Date.now().toString(),
            trackingID,
            ...shipmentData,
            status: 'pending',
            createdAt: new Date()
        };
        
        mockShipments.push(newShipment);
        
        res.json({
            success: true,
            data: newShipment,
            message: 'Shipment created successfully'
        });
    } catch (error) {
        console.error('Error creating shipment:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating shipment'
        });
    }
});

app.delete('/admin/api/shipments/:id', requireAuth, (req, res) => {
    try {
        const { id } = req.params;
        
        const shipmentIndex = mockShipments.findIndex(s => s.id === id);
        if (shipmentIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Shipment not found'
            });
        }
        
        mockShipments.splice(shipmentIndex, 1);
        
        res.json({
            success: true,
            message: 'Shipment deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting shipment:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting shipment'
        });
    }
});

// Login page route
app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-dashboard/public/login.html'));
});

// Redirect root admin to login
app.get('/admin', (req, res) => {
    if (req.session && req.session.authenticated) {
        res.redirect('/admin/dashboard');
    } else {
        res.redirect('/admin/login');
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Start server
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🚚 Transportify Admin Server running on port ${PORT}`);
    console.log(`📊 Admin Dashboard: http://localhost:${PORT}/admin`);
    console.log(`🔐 Login: http://localhost:${PORT}/admin/login`);
    console.log(`📋 Default credentials: admin / admin123`);
    console.log(`⚠️  Change default credentials in production!`);
});

module.exports = app;

