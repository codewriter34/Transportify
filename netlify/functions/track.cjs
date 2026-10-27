const { toPublicShipment } = require('../../api/publicShipment.cjs');

let db = null;

function getDb() {
    if (db) return db;
    const admin = require('firebase-admin');
    if (!admin.apps.length) {
        if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
            return null;
        }
        let privateKey = process.env.FIREBASE_PRIVATE_KEY;
        if (!privateKey.includes('\n')) {
            privateKey = privateKey.replace(/\\n/g, '\n');
        }
        admin.initializeApp({
            credential: admin.credential.cert({
                project_id: process.env.FIREBASE_PROJECT_ID,
                private_key: privateKey,
                client_email: process.env.FIREBASE_CLIENT_EMAIL
            }),
            projectId: process.env.FIREBASE_PROJECT_ID
        });
    }
    db = admin.firestore();
    return db;
}

function readTrackingId(event) {
    const fromQuery = event.queryStringParameters && event.queryStringParameters.id;
    const raw = fromQuery || String(event.path || '').split('/').filter(Boolean).pop() || '';
    try {
        return decodeURIComponent(raw).trim();
    } catch (_) {
        return raw.trim();
    }
}

function json(statusCode, body) {
    return {
        statusCode,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    };
}

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return json(200, { success: true });
    }
    if (event.httpMethod !== 'GET') {
        return json(405, { success: false, message: 'Method not allowed' });
    }

    const trackingID = readTrackingId(event);
    if (!trackingID || trackingID === 'track' || trackingID.length > 80) {
        return json(400, { success: false, message: 'Tracking ID required' });
    }

    const database = getDb();
    if (!database) {
        return json(500, { success: false, message: 'Tracking is not configured' });
    }

    try {
        const snap = await database.collection('shipments').where('trackingID', '==', trackingID).limit(1).get();
        if (snap.empty) {
            return json(404, { success: false, message: 'Tracking ID not found' });
        }
        return json(200, { success: true, data: toPublicShipment(snap.docs[0]) });
    } catch (error) {
        console.error('Tracking lookup failed');
        return json(500, { success: false, message: 'Database query failed' });
    }
};
