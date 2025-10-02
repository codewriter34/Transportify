// Vercel Serverless Function for Transportify Admin API
console.log('Starting Transportify API...');
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

// CORS configuration - Allow specific origins
const corsOptions = {
    origin: [
        'https://transportifyy.netlify.app',
        'https://transportify-2mf215b8a-swankys-projects-4b0bf2b3.vercel.app',
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Set-Cookie'],
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

// Apply CORS to all routes
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Additional CORS middleware for all responses
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Authentication middleware
const requireAuth = (req, res, next) => {
    console.log('=== AUTH CHECK ===');
    console.log('Headers:', req.headers);
    console.log('Cookies:', req.cookies);
    
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.token;
    console.log('Token found:', token ? 'Yes' : 'No');
    
    if (!token) {
        console.log('No token - returning 401');
        return res.status(401).json({ error: 'Authentication required' });
    }
    
    try {
        const decoded = jwt.verify(token, config.SESSION_SECRET);
        console.log('Token verified successfully:', decoded);
        req.user = decoded;
        next();
    } catch (error) {
        console.log('Token verification failed:', error.message);
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
        console.log('Login attempt:', req.body);
        const { username, password } = req.body;
        
        if (username === config.ADMIN_CREDENTIALS.username && 
            password === config.ADMIN_CREDENTIALS.password) {
            
            const token = jwt.sign(
                { username, authenticated: true },
                config.SESSION_SECRET,
                { expiresIn: '24h' }
            );
            
            console.log('Login successful for user:', username);
            
            // Set CORS headers explicitly
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Credentials', 'true');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
            
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
            console.log('Login failed - invalid credentials');
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
        console.log('=== TRACKING REQUEST ===');
        console.log('Tracking ID:', req.params.trackingID);
        console.log('Origin:', req.headers.origin);
        console.log('User-Agent:', req.headers['user-agent']);
        
        const { trackingID } = req.params;
        const snap = await db.collection('shipments').where('trackingID', '==', trackingID).limit(1).get();
        
        console.log('Firestore query result:', snap.empty ? 'No results' : 'Found shipment');
        
        if (snap.empty) {
            console.log('Tracking ID not found:', trackingID);
            return res.status(404).json({ success: false, message: 'Tracking ID not found' });
        }
        
        const doc = snap.docs[0];
        const data = doc.data();
        console.log('Shipment found:', data.trackingID);

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
        cors: 'enabled',
        endpoints: {
            health: '/health',
            test: '/test',
            corsTest: '/cors-test',
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

// Simple test route to verify CORS
app.get('/simple-test', (req, res) => {
    res.json({ 
        message: 'Simple test successful',
        cors: 'working',
        timestamp: new Date().toISOString()
    });
});

// Favicon handler
app.get('/favicon.ico', (req, res) => {
    res.status(204).end(); // No content
});

app.get('/favicon.png', (req, res) => {
    res.status(204).end(); // No content
});

// Admin dashboard routes
app.get('/admin/dashboard', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Transportify Admin Dashboard</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 20px;
        }
        .header {
            border-bottom: 1px solid #eee;
            padding-bottom: 20px;
            margin-bottom: 20px;
        }
        .header h1 {
            color: #333;
            margin: 0;
        }
        .status {
            background: #e8f5e8;
            border: 1px solid #4caf50;
            color: #2e7d32;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
        .endpoints {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 4px;
            margin-top: 20px;
        }
        .endpoints h3 {
            margin-top: 0;
            color: #333;
        }
        .endpoint {
            margin: 5px 0;
            font-family: monospace;
            background: white;
            padding: 5px 10px;
            border-radius: 3px;
            border-left: 3px solid #007bff;
        }
        .login-form {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
        }
        .form-group {
            margin-bottom: 15px;
        }
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
        }
        .form-group input {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }
        .btn {
            background: #007bff;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        .btn:hover {
            background: #0056b3;
        }
        .error {
            background: #f8d7da;
            color: #721c24;
            padding: 10px;
            border-radius: 4px;
            margin-top: 10px;
            display: none;
        }
        .success {
            background: #d4edda;
            color: #155724;
            padding: 10px;
            border-radius: 4px;
            margin-top: 10px;
            display: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚚 Transportify Admin Dashboard</h1>
        </div>
        
        <div class="status">
            ✅ API Server is running and connected to Firebase
        </div>
        
        <div class="login-form">
            <h3>Admin Login</h3>
            <form id="loginForm">
                <div class="form-group">
                    <label for="username">Username:</label>
                    <input type="text" id="username" name="username" required>
                </div>
                <div class="form-group">
                    <label for="password">Password:</label>
                    <input type="password" id="password" name="password" required>
                </div>
                <button type="submit" class="btn">Login</button>
            </form>
            <div id="error" class="error"></div>
            <div id="success" class="success"></div>
        </div>
        
        <div class="endpoints">
            <h3>Available API Endpoints:</h3>
            <div class="endpoint">GET /health - Health check</div>
            <div class="endpoint">POST /admin/login - Admin login</div>
            <div class="endpoint">POST /admin/logout - Admin logout</div>
            <div class="endpoint">GET /admin/check-auth - Check authentication</div>
            <div class="endpoint">GET /admin/api/shipments - Get shipments (requires auth)</div>
            <div class="endpoint">POST /admin/api/shipments - Create shipment (requires auth)</div>
            <div class="endpoint">GET /track/:trackingID - Public tracking</div>
        </div>
    </div>

    <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('error');
            const successDiv = document.getElementById('success');
            
            // Hide previous messages
            errorDiv.style.display = 'none';
            successDiv.style.display = 'none';
            
            try {
                // Use a more compatible fetch approach
                const response = await fetch('/admin/login', {
                    method: 'POST',
                    mode: 'cors',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });
                
                console.log('Response status:', response.status);
                console.log('Response headers:', response.headers);
                
                if (!response.ok) {
                    throw new Error(\`HTTP error! status: \${response.status}\`);
                }
                
                const data = await response.json();
                console.log('Response data:', data);
                
                if (data.success) {
                    successDiv.textContent = 'Login successful! Token: ' + data.token.substring(0, 20) + '...';
                    successDiv.style.display = 'block';
                    
                    // Store token for future requests
                    localStorage.setItem('adminToken', data.token);
                    
                    // Redirect to a simple dashboard
                    setTimeout(() => {
                        window.location.href = '/admin/dashboard?authenticated=true';
                    }, 1000);
                } else {
                    errorDiv.textContent = data.message || 'Login failed';
                    errorDiv.style.display = 'block';
                }
    } catch (error) {
                console.error('Login error:', error);
                errorDiv.textContent = 'Network error: ' + error.message;
                errorDiv.style.display = 'block';
            }
        });
        
        // Check if already authenticated
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('authenticated') === 'true') {
            document.querySelector('.login-form').style.display = 'none';
            document.querySelector('.status').innerHTML = '✅ Logged in successfully! <a href="/admin/api/shipments">View Shipments</a>';
        }
    </script>
</body>
</html>
    `);
});

app.get('/admin/login', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Transportify Admin Login</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .login-container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 15px 35px rgba(0,0,0,0.1);
            width: 100%;
            max-width: 400px;
        }
        .logo {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo h1 {
            color: #333;
            margin: 0;
            font-size: 28px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        .form-group label {
            display: block;
            margin-bottom: 8px;
            color: #555;
            font-weight: 500;
        }
        .form-group input {
            width: 100%;
            padding: 12px;
            border: 2px solid #e1e5e9;
            border-radius: 6px;
            font-size: 16px;
            transition: border-color 0.3s;
            box-sizing: border-box;
        }
        .form-group input:focus {
            outline: none;
            border-color: #667eea;
        }
        .btn {
            width: 100%;
            background: #667eea;
            color: white;
            padding: 12px;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            cursor: pointer;
            transition: background 0.3s;
        }
        .btn:hover {
            background: #5a6fd8;
        }
        .error {
            background: #f8d7da;
            color: #721c24;
            padding: 10px;
            border-radius: 4px;
            margin-top: 15px;
            display: none;
        }
        .success {
            background: #d4edda;
            color: #155724;
            padding: 10px;
            border-radius: 4px;
            margin-top: 15px;
            display: none;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="logo">
            <h1>🚚 Transportify</h1>
            <p>Admin Login</p>
        </div>
        
        <form id="loginForm">
            <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="username" name="username" required>
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required>
            </div>
            <button type="submit" class="btn">Login</button>
        </form>
        
        <div id="error" class="error"></div>
        <div id="success" class="success"></div>
    </div>

    <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('error');
            const successDiv = document.getElementById('success');
            
            errorDiv.style.display = 'none';
            successDiv.style.display = 'none';
            
            try {
                // Use a more compatible fetch approach
                const response = await fetch('/admin/login', {
                    method: 'POST',
                    mode: 'cors',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });
                
                console.log('Response status:', response.status);
                console.log('Response headers:', response.headers);
                
                if (!response.ok) {
                    throw new Error(\`HTTP error! status: \${response.status}\`);
                }
                
                const data = await response.json();
                console.log('Response data:', data);
                
                if (data.success) {
                    successDiv.textContent = 'Login successful! Redirecting...';
                    successDiv.style.display = 'block';
                    
                    localStorage.setItem('adminToken', data.token);
                    
                    setTimeout(() => {
                        window.location.href = '/admin/dashboard';
                    }, 1000);
    } else {
                    errorDiv.textContent = data.message || 'Login failed';
                    errorDiv.style.display = 'block';
                }
            } catch (error) {
                console.error('Login error:', error);
                errorDiv.textContent = 'Network error: ' + error.message;
                errorDiv.style.display = 'block';
            }
        });
    </script>
</body>
</html>
    `);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test endpoint for CORS debugging
app.get('/test', (req, res) => {
    res.json({ 
        message: 'CORS test successful',
        timestamp: new Date().toISOString(),
        headers: req.headers
    });
});

// Test POST endpoint for CORS debugging
app.post('/test', (req, res) => {
    res.json({ 
        message: 'POST CORS test successful',
        timestamp: new Date().toISOString(),
        body: req.body
    });
});

// Simple test page to verify CORS
app.get('/cors-test', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>CORS Test</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .test-section { margin: 20px 0; padding: 15px; border: 1px solid #ccc; }
        .success { color: green; }
        .error { color: red; }
        button { padding: 10px 20px; margin: 5px; }
    </style>
</head>
<body>
    <h1>🚚 Transportify CORS Test Page</h1>
    
    <div class="test-section">
        <h3>Test 1: Simple GET Request</h3>
        <button onclick="testSimple()">Test Simple GET</button>
        <div id="simple-result"></div>
    </div>
    
    <div class="test-section">
        <h3>Test 2: POST Request</h3>
        <button onclick="testPOST()">Test POST</button>
        <div id="post-result"></div>
    </div>
    
    <div class="test-section">
        <h3>Test 3: Login Request</h3>
        <button onclick="testLogin()">Test Login</button>
        <div id="login-result"></div>
    </div>
    
    <script>
        async function testSimple() {
            const resultDiv = document.getElementById('simple-result');
            try {
                const response = await fetch('/simple-test');
                const data = await response.json();
                resultDiv.innerHTML = '<p class="success">✅ Simple GET Test Successful!</p><pre>' + JSON.stringify(data, null, 2) + '</pre>';
            } catch (error) {
                resultDiv.innerHTML = '<p class="error">❌ Simple GET Test Failed: ' + error.message + '</p>';
            }
        }
        
        async function testPOST() {
            const resultDiv = document.getElementById('post-result');
            try {
                const response = await fetch('/test', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ test: 'data' })
                });
                const data = await response.json();
                resultDiv.innerHTML = '<p class="success">✅ POST Test Successful!</p><pre>' + JSON.stringify(data, null, 2) + '</pre>';
            } catch (error) {
                resultDiv.innerHTML = '<p class="error">❌ POST Test Failed: ' + error.message + '</p>';
            }
        }
        
        async function testLogin() {
            const resultDiv = document.getElementById('login-result');
            try {
                const response = await fetch('/admin/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        username: 'Transportify-admin', 
                        password: '12345678$$' 
                    })
                });
                const data = await response.json();
                if (data.success) {
                    resultDiv.innerHTML = '<p class="success">✅ Login Test Successful!</p><pre>' + JSON.stringify(data, null, 2) + '</pre>';
                } else {
                    resultDiv.innerHTML = '<p class="error">❌ Login Test Failed: ' + data.message + '</p>';
                }
            } catch (error) {
                resultDiv.innerHTML = '<p class="error">❌ Login Test Failed: ' + error.message + '</p>';
            }
        }
    </script>
</body>
</html>
    `);
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

// Debug logging
console.log('API loaded successfully');
console.log('Available routes:');
app._router.stack.forEach(function(r){
  if (r.route && r.route.path){
    console.log('Route:', r.route.path, 'Methods:', Object.keys(r.route.methods));
  }
});

// Export for Vercel
module.exports = app;
