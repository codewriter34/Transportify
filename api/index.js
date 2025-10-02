// Simple Vercel API handler
const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
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
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: process.env.FIREBASE_PROJECT_ID
            });
        } else {
            admin.initializeApp({
                projectId: 'transportify-d94c3'
            });
        }
    } catch (error) {
        console.error('Firebase initialization failed:', error);
    }
}

const db = admin.firestore();

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    console.log('API called:', req.method, req.url);
    
    try {
        const url = req.url;
        
        // Root endpoint
        if (url === '/' || url === '') {
            return res.json({
                message: 'Transportify API Server',
                status: 'running',
                timestamp: new Date().toISOString(),
                cors: 'enabled',
                endpoints: {
                    health: '/health',
                    test: '/test',
                    track: '/track/:trackingID'
                }
            });
        }
        
        // Health check
        if (url === '/health') {
            return res.json({ 
                status: 'OK', 
                timestamp: new Date().toISOString() 
            });
        }
        
        // Test endpoint
        if (url === '/test') {
            return res.json({ 
                success: true,
                message: 'Test endpoint working',
                method: req.method,
                url: req.url,
                timestamp: new Date().toISOString()
            });
        }
        
        // Tracking endpoint
        if (url.startsWith('/track/')) {
            const trackingID = url.split('/track/')[1];
            
            console.log('Tracking request for ID:', trackingID);
            
            if (!trackingID) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Tracking ID required' 
                });
            }
            
            const snap = await db.collection('shipments').where('trackingID', '==', trackingID).limit(1).get();
            
            console.log('Firestore query result:', snap.empty ? 'No results' : 'Found shipment');
            
            if (snap.empty) {
                console.log('Tracking ID not found:', trackingID);
                return res.status(404).json({ 
                    success: false, 
                    message: 'Tracking ID not found' 
                });
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

            return res.json({ 
                success: true, 
                data: {
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
                }
            });
        }
        
        // 404 for unknown routes
        res.status(404).json({
            success: false,
            message: 'Route not found',
            url: url,
            method: req.method
        });
        
    } catch (error) {
        console.error('API error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
