// Vercel Serverless Function for Transportify Admin API
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const admin = require('firebase-admin');

// Initialize Express app
const app = express();

// Configuration
const config = {
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    SESSION_SECRET: process.env.SESSION_SECRET || 'your-super-secret-session-key-change-this-in-production',
    ADMIN_CREDENTIALS: {
        username: process.env.ADMIN_USERNAME || 'Transportify-admin',
        password: process.env.ADMIN_PASSWORD || '12345678$$'
    },
    EMAIL: {
        HOST: process.env.SMTP_HOST || '',
        PORT: parseInt(process.env.SMTP_PORT || '587', 10),
        SECURE: process.env.SMTP_SECURE === 'true',
        USER: process.env.SMTP_USER || '',
        PASS: process.env.SMTP_PASS || '',
        FROM: process.env.EMAIL_FROM || 'no-reply@transportify.com',
        TRACK_BASE_URL: process.env.TRACK_BASE_URL || 'https://transportifyy.netlify.app/track'
    },
    MAILERSEND: {
        API_KEY: process.env.MAILERSEND_API_KEY || '',
        FROM_EMAIL: process.env.MAILERSEND_FROM_EMAIL || 'noreply@test.mailersend.net',
        FROM_NAME: process.env.MAILERSEND_FROM_NAME || 'Transportify'
    }
};

// Initialize Firebase Admin
let firebaseApp;
try {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
        const serviceAccount = {
            type: "service_account",
            project_id: process.env.FIREBASE_PROJECT_ID,
            private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
            private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            client_id: process.env.FIREBASE_CLIENT_ID,
            auth_uri: "https://accounts.google.com/o/oauth2/auth",
            token_uri: "https://oauth2.googleapis.com/token",
            auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
            client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL)}`,
            universe_domain: "googleapis.com"
        };
        firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: process.env.FIREBASE_PROJECT_ID
        });
        console.log('Firebase initialized with environment variables');
    } else {
        // Fallback to default project
        firebaseApp = admin.initializeApp({
            projectId: 'transportify-d94c3'
        });
        console.log('Firebase initialized with default project');
    }
} catch (error) {
    console.error('Firebase initialization failed:', error);
}

const db = admin.firestore();

// CORS configuration
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'https://transportifyy.netlify.app',
    'https://transportify-2mf215b8a-swankys-projects-4b0bf2b3.vercel.app'
];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Authentication middleware
const requireAuth = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.token;
    
    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    
    try {
        const decoded = jwt.verify(token, config.SESSION_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Helper function to generate tracking ID
const generateTrackingID = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `TRANS${timestamp}${random}`;
};

// Helper function to get shipments from Firestore
const getShipments = async () => {
    try {
        const snapshot = await db.collection('shipments').orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            estimatedDeliveryDate: doc.data().estimatedDeliveryDate?.toDate(),
            lastUpdated: doc.data().lastUpdated?.toDate()
        }));
    } catch (error) {
        console.error('Error fetching shipments:', error);
        return [];
    }
};

// Helper function to save shipment to Firestore
const saveShipment = async (shipmentData) => {
    try {
        const docRef = await db.collection('shipments').add(shipmentData);
        return { id: docRef.id, ...shipmentData };
    } catch (error) {
        console.error('Error saving shipment:', error);
        throw error;
    }
};

// Authentication routes
app.post('/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (username === config.ADMIN_CREDENTIALS.username && 
            password === config.ADMIN_CREDENTIALS.password) {
            
            const token = jwt.sign(
                { username, authenticated: true },
                config.SESSION_SECRET,
                { expiresIn: '24h' }
            );
            
            res.cookie('token', token, {
                httpOnly: false,
                secure: false,
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000
            });
            
            res.json({ 
                success: true, 
                message: 'Login successful',
                user: { username },
                token: token
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
    res.clearCookie('token');
    res.json({ 
        success: true, 
        message: 'Logout successful' 
    });
});

app.get('/admin/check-auth', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.token;
    
    if (!token) {
        return res.json({ authenticated: false });
    }
    
    try {
        const decoded = jwt.verify(token, config.SESSION_SECRET);
        res.json({ 
            authenticated: true, 
            user: { username: decoded.username }
        });
    } catch (error) {
        res.json({ authenticated: false });
    }
});

// API routes for shipments
app.get('/admin/api/shipments', requireAuth, async (req, res) => {
    try {
        const shipments = await getShipments();
        res.json({
            success: true,
            data: shipments
        });
    } catch (error) {
        console.error('Error fetching shipments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching shipments'
        });
    }
});

app.post('/admin/api/shipments', requireAuth, async (req, res) => {
    try {
        const shipmentData = req.body;
        const trackingID = generateTrackingID();
        
        const newShipment = {
            trackingID,
            status: shipmentData.status || 'pending',
            estimatedDeliveryDate: shipmentData.estimatedDeliveryDate ? new Date(shipmentData.estimatedDeliveryDate) : null,
            lastUpdated: new Date(),
            createdAt: new Date(),
            origin: shipmentData.origin || {},
            destination: shipmentData.destination || {},
            sender: shipmentData.sender || {},
            receiver: shipmentData.receiver || {},
            package: shipmentData.package || {},
            trackingHistory: [{
                status: 'pending',
                location: shipmentData.origin?.city || 'Origin',
                timestamp: new Date(),
                coordinates: shipmentData.origin?.coordinates || null,
                notes: 'Shipment created'
            }]
        };
        
        const savedShipment = await saveShipment(newShipment);
        
        res.json({
            success: true,
            data: savedShipment,
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

// Public tracking lookup
app.get('/track/:trackingID', async (req, res) => {
    try {
        const { trackingID } = req.params;
        const snap = await db.collection('shipments').where('trackingID', '==', trackingID).limit(1).get();
        
        if (snap.empty) {
            return res.status(404).json({ success: false, message: 'Tracking ID not found' });
        }
        
        const doc = snap.docs[0];
        const data = doc.data();

        const toISO = (ts) => {
            try {
                if (!ts) return null;
                if (typeof ts.toDate === 'function') return ts.toDate().toISOString();
                if (typeof ts.seconds === 'number') return new Date(ts.seconds * 1000).toISOString();
                if (typeof ts._seconds === 'number') return new Date(ts._seconds * 1000).toISOString();
                const asDate = new Date(ts);
                return isNaN(asDate.getTime()) ? null : asDate.toISOString();
            } catch (_) { return null; }
        };

        const normalizedHistory = (data.trackingHistory || []).map((h) => ({
            ...h,
            timestamp: toISO(h?.timestamp)
        }));

        return res.json({ success: true, data: {
            id: doc.id,
            trackingID: data.trackingID,
            status: data.status,
            estimatedDeliveryDate: toISO(data.estimatedDeliveryDate),
            lastUpdated: toISO(data.lastUpdated),
            origin: data.origin || null,
            destination: data.destination || null,
            sender: data.sender || null,
            receiver: data.receiver || null,
            package: data.package || null,
            currentLocation: data.currentLocation || null,
            trackingHistory: normalizedHistory
        }});
    } catch (error) {
        console.error('Tracking lookup error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Root route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Transportify API Server',
        status: 'running',
        timestamp: new Date().toISOString(),
        endpoints: {
            health: '/health',
            admin: {
                login: '/admin/login',
                logout: '/admin/logout',
                checkAuth: '/admin/check-auth',
                shipments: '/admin/api/shipments'
            },
            public: {
                track: '/track/:trackingID'
            }
        }
    });
});

// Favicon handler
app.get('/favicon.ico', (req, res) => {
    res.status(204).end(); // No content
});

app.get('/favicon.png', (req, res) => {
    res.status(204).end(); // No content
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
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

// Export for Vercel
module.exports = app;
