// Import dependencies with fallback to root node_modules
const path = require('path');
// Load environment variables from .env
try { require('dotenv').config(); } catch (_) {}

// Robust resolver to pull deps from root without local installs
const { createRequire } = require('module');
const requireFromRoot = (id) => {
    try {
        return require(id);
    } catch (_) {
        const rootPkgJson = path.resolve(__dirname, '../../package.json');
        const rootRequire = createRequire(rootPkgJson);
        return rootRequire(id);
    }
};

const express = requireFromRoot('express');
const session = requireFromRoot('express-session');
const cors = requireFromRoot('cors');
const jwt = requireFromRoot('jsonwebtoken');
const cookieParser = requireFromRoot('cookie-parser');
const admin = requireFromRoot('firebase-admin');
const nodemailer = requireFromRoot('nodemailer');
const { MailerSend, EmailParams, Sender, Recipient } = requireFromRoot('mailersend');

// Import configuration
const config = require('./config');

// Initialize Firebase Admin
let firebaseApp;
try {
    // Try to load from environment variables first (for Vercel)
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
        // Fallback to JSON file (for local development)
        const serviceAccount = require(path.resolve(__dirname, '../../transportify-d94c3-firebase-adminsdk-fbsvc-79e313872d.json'));
        firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: 'transportify-d94c3'
        });
        console.log('Firebase initialized with JSON file');
    }
} catch (error) {
    console.error('Firebase initialization failed:', error);
    // Continue without Firebase for now
}

const db = admin.firestore();

// Email transporter (if configured)
let mailer = null;
let usingEthereal = false;
let mailerSendClient = null;
if (config.EMAIL && config.EMAIL.HOST && config.EMAIL.USER && config.EMAIL.PASS) {
    mailer = nodemailer.createTransport({
        host: config.EMAIL.HOST,
        port: config.EMAIL.PORT,
        secure: config.EMAIL.SECURE,
        auth: { user: config.EMAIL.USER, pass: config.EMAIL.PASS }
    });
}

// Initialize MailerSend client when configured
if (config.MAILERSEND && config.MAILERSEND.API_KEY) {
    try {
        mailerSendClient = new MailerSend({
            apiKey: config.MAILERSEND.API_KEY
        });
        console.log('MailerSend client initialized.');
    } catch (err) {
        console.error('Failed to initialize MailerSend client:', err);
        mailerSendClient = null;
    }
}

// Helper: ensure a mailer exists; use SMTP if configured, otherwise fall back to Ethereal
async function ensureMailer() {
    if (mailer) return mailer;
    
    // Try to use configured SMTP first
    if (config.EMAIL.HOST && config.EMAIL.USER && config.EMAIL.PASS) {
        console.log('Using configured SMTP:', config.EMAIL.HOST);
        mailer = nodemailer.createTransport({
            host: config.EMAIL.HOST,
            port: config.EMAIL.PORT,
            secure: config.EMAIL.SECURE,
            auth: { 
                user: config.EMAIL.USER, 
                pass: config.EMAIL.PASS 
            }
        });
        usingEthereal = false;
        return mailer;
    }
    
    // Fallback to Ethereal for testing
    console.log('No SMTP configured, using Ethereal for testing');
    const testAccount = await nodemailer.createTestAccount();
    mailer = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass }
    });
    usingEthereal = true;
    return mailer;
}

// Unified email sender: prefer MailerSend if configured; otherwise use SMTP/Ethereal
async function sendEmailUnified(options) {
    const { to, subject, text, html } = options || {};
    if (!to || !subject || (!text && !html)) {
        throw new Error('sendEmailUnified requires to, subject, and text or html');
    }

    // Try SMTP first (for customer emails), MailerSend as backup
    if (config.EMAIL.HOST && config.EMAIL.USER && config.EMAIL.PASS) {
        try {
            const smtp = await ensureMailer();
            const info = await smtp.sendMail({
                from: config.EMAIL.FROM,
                to: Array.isArray(to) ? to.join(',') : to,
                subject,
                text: text || '',
                html: html || text || ''
            });
            console.log('SMTP email sent successfully');
            return { provider: 'smtp', data: info };
        } catch (err) {
            console.error('SMTP send failed, trying MailerSend:', err);
        }
    }

    // Fallback to MailerSend (trial restrictions apply)
    if (mailerSendClient && config.MAILERSEND && config.MAILERSEND.API_KEY) {
        try {
            const sentFrom = new Sender(
                config.MAILERSEND.FROM_EMAIL, 
                config.MAILERSEND.FROM_NAME
            );

            const recipients = (Array.isArray(to) ? to : [to]).map(email => 
                new Recipient(email, email)
            );

            const emailParams = new EmailParams()
                .setFrom(sentFrom)
                .setTo(recipients)
                .setReplyTo(new Sender('support@transportify.com', 'Transportify Support'))
                .setSubject(subject)
                .setText(text || '')
                .setHtml(html || text || '');

            const response = await mailerSendClient.email.send(emailParams);
            return { provider: 'mailersend', data: response };
        } catch (err) {
            console.error('MailerSend send failed, falling back to Ethereal:', err);
        }
    }

    // Fallback: SMTP configured or Ethereal
    const smtp = await ensureMailer();
    const info = await smtp.sendMail({
        from: config.EMAIL.FROM,
        to: Array.isArray(to) ? to.join(',') : to,
        subject,
        text,
        html
    });
    if (usingEthereal) {
        console.log('Ethereal email preview URL:', nodemailer.getTestMessageUrl(info));
    }
    return { provider: usingEthereal ? 'ethereal' : 'smtp', data: info };
}

// Initialize Express app
const app = express();

// Basic security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// CORS configuration (development-friendly)
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'https://transportifyy.netlify.app',
    'https://transportify-qrem85z84-swankys-projects-4b0bf2b3.vercel.app'
];

const corsGeneral = cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie']
});

// Apply general CORS
app.use(corsGeneral);
app.options('*', corsGeneral);

// Ensure public tracking endpoints always send CORS headers
const corsOpen = cors({ origin: true, credentials: false });
app.use('/track', corsOpen);
app.options('/track', corsOpen);
app.options('/track/*', corsOpen);

// Simple rate limiting (basic implementation)
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
app.use(cookieParser());

// Session configuration
app.use(session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to false for Vercel
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax', // Allow cross-site cookies
        domain: undefined // Don't set domain for Vercel
    },
    name: 'connect.sid' // Explicitly set session name
}));

// Firestore database integration
console.log('Using Firestore database for shipment management.');

// Helper function to generate TRANS tracking ID
const generateTrackingID = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `TRANS${timestamp}${random}`;
};

// Helper function to get shipments from Firestore
const getShipments = async () => {
    try {
        const snapshot = await db.collection('shipments').orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : null),
                estimatedDeliveryDate: data.estimatedDeliveryDate?.toDate ? data.estimatedDeliveryDate.toDate() : (data.estimatedDeliveryDate ? new Date(data.estimatedDeliveryDate) : null),
                lastUpdated: data.lastUpdated?.toDate ? data.lastUpdated.toDate() : (data.lastUpdated ? new Date(data.lastUpdated) : null)
            };
        });
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

// Helper function to update shipment in Firestore
const updateShipment = async (id, updateData) => {
    try {
        await db.collection('shipments').doc(id).update(updateData);
        const doc = await db.collection('shipments').doc(id).get();
        return { id: doc.id, ...doc.data() };
    } catch (error) {
        console.error('Error updating shipment:', error);
        throw error;
    }
};

// Helper function to delete shipment from Firestore
const deleteShipment = async (id) => {
    try {
        await db.collection('shipments').doc(id).delete();
        return true;
    } catch (error) {
        console.error('Error deleting shipment:', error);
        throw error;
    }
};

// HTML email template for on-hold status (insurance fee)
const getOnHoldEmailHTML = (shipment, trackUrl) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Action Required: Insurance Fee Payment</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 20px 0; }
            .alert-box { background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .alert-box h2 { color: #856404; margin-top: 0; }
            .info-box { background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; }
            .track-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
            .footer { background-color: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px; margin: 20px -20px -20px -20px; text-align: center; color: #666; }
            .highlight { background-color: #fff3cd; padding: 2px 4px; border-radius: 3px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚨 Action Required</h1>
                <p>Insurance Fee Payment Required</p>
            </div>
            
            <div class="content">
                <p>Dear <strong>${shipment.receiver?.name || 'Valued Customer'}</strong>,</p>
                
                <p>We hope this message finds you well.</p>
                
                <div class="alert-box">
                    <h2>⚠️ Insurance Fee Required</h2>
                    <p>We would like to inform you that in order to proceed with the delivery of your package, our shipping partner <strong>Transportify</strong> requires a <span class="highlight">refundable insurance fee of $150</span>.</p>
                </div>
                
                <p>This fee is necessary to ensure the safe handling of your shipment while in transit. It serves as a security measure that covers any unforeseen risks during transportation. <strong>Please note that the amount is fully refundable upon successful delivery of your package.</strong></p>
                
                <p>At the moment, your package is on temporary hold until the insurance fee has been settled. Once payment is received, Transportify will immediately release your shipment for delivery.</p>
                
                <div class="info-box">
                    <h3>📦 Shipment Details</h3>
                    <p><strong>Tracking ID:</strong> ${shipment.trackingID}</p>
                    <p><strong>Current Status:</strong> On Hold - Insurance Fee Required</p>
                    <p><strong>Package:</strong> ${shipment.package?.name || 'Your shipment'}</p>
                    <p><strong>Current Location:</strong> ${shipment.currentLocation?.name || 'Processing Center'}</p>
                </div>
                
                <p>We sincerely apologize for any inconvenience this may cause and appreciate your understanding. This measure is in place to protect both your shipment and to ensure smooth delivery.</p>
                
                <div style="text-align: center;">
                    <a href="${trackUrl}" class="track-button">Track Your Shipment</a>
                </div>
                
                <p>If you have any questions or concerns, please feel free to reply directly to this email—we'll be happy to assist you.</p>
                
                <p>Thank you for your prompt attention to this matter.</p>
                
                <p>Warm regards,<br>
                <strong>Sarah Johnson</strong><br>
                Customer Relations Manager<br>
                Transportify Logistics</p>
            </div>
            
            <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>© 2025 Transportify Logistics. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>`;
};

// HTML email template for shipment notifications
const getShipmentEmailHTML = (shipment, trackingID, trackUrl, isReceiver) => {
    const recipientName = isReceiver ? shipment.receiver?.name : shipment.sender?.name;
    const recipientType = isReceiver ? 'receiver' : 'sender';
    
    return `<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shipment Created - ${trackingID}</title>
    <style type="text/css">
        @import url('https://fonts.mailersend.com/css?family=Inter:400,600');
    </style>
    <style type="text/css" rel="stylesheet" media="all">
        @media only screen and (max-width: 640px) {
            .ms-header { display: none !important; }
            .ms-content { width: 100% !important; border-radius: 0; }
            .ms-content-body { padding: 30px !important; }
            .ms-footer { width: 100% !important; }
            .mobile-wide { width: 100% !important; }
            .info-lg { padding: 30px; }
        }
    </style>
</head>
<body style="font-family:'Inter', Helvetica, Arial, sans-serif; width: 100% !important; height: 100%; margin: 0; padding: 0; -webkit-text-size-adjust: none; background-color: #f4f7fa; color: #4a5566;">
<div class="preheader" style="display:none !important;visibility:hidden;mso-hide:all;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;"></div>
<table class="ms-body" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;background-color:#f4f7fa;width:100%;margin:0;padding:0;">
    <tr>
        <td align="center" style="word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;font-size:16px;line-height:24px;">
            <table class="ms-container" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;margin:0;padding:0;">
                <tr>
                    <td align="center" style="word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;font-size:16px;line-height:24px;">
                        <table class="ms-header" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                            <tr><td height="40" style="font-size:0px;line-height:0px;word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;">&nbsp;</td></tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td align="center" style="word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;font-size:16px;line-height:24px;">
                        <table class="ms-content" width="640" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;width:640px;margin:0 auto;padding:0;background-color:#FFFFFF;border-radius:6px;box-shadow:0 3px 6px 0 rgba(0,0,0,.05);">
                            <tr>
                                <td class="ms-content-body" style="word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;font-size:16px;line-height:24px;padding:40px 50px;">
                                    <p class="logo" style="margin:0 0 40px 0;line-height:28px;font-weight:600;font-size:21px;color:#111111;text-align:center;">
                                        <span style="color:#0052e2;font-family:Arial, Helvetica, sans-serif;font-size:30px;vertical-align:bottom;">🚚&nbsp;</span>Transportify
                                    </p>
                                    <h1 style="margin:0 0 24px 0;color:#111111;font-size:24px;line-height:36px;font-weight:600;">Hi ${recipientName || 'Valued Customer'},</h1>
                                    <p style="color:#4a5566;margin:20px 0;font-size:16px;line-height:28px;">
                                        ${isReceiver ? 'Great news! A shipment has been created and is heading your way.' : 'Your shipment has been created and is ready for delivery.'}
                                    </p>
                                    <table width="100%" align="center" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;">
                                        <tr>
                                            <td align="center" style="padding:20px 0;word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;font-size:16px;line-height:24px;">
                                                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;">
                                                    <tr>
                                                        <td class="info info-lg" align="center" style="word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;font-size:16px;line-height:24px;border-radius:4px;background-color:#f4f7fa;padding:40px;">
                                                            <h1 style="margin:0 0 24px 0;color:#111111;font-size:24px;line-height:36px;font-weight:600;">Track Your Shipment</h1>
                                                            <p style="color:#4a5566;margin:20px 0;font-size:16px;line-height:28px;">Stay updated on your package's journey with real-time tracking.</p>
                                                            <table width="100%" align="center" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;">
                                                                <tr>
                                                                    <td align="center" style="word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;font-size:16px;line-height:24px;">
                                                                        <table class="mobile-wide" border="0" cellspacing="0" cellpadding="0" role="presentation" style="border-collapse:collapse;">
                                                                            <tr>
                                                                                <td align="center" class="btn" style="word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;font-size:16px;line-height:24px;background-color:#0052e2;box-shadow:0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -1px rgba(0,0,0,.06);border-radius:3px;">
                                                                                    <a href="${trackUrl}" target="_blank" style="background-color:#0052e2;padding:14px 30px;display:inline-block;color:#FFF;text-decoration:none;border-radius:3px;-webkit-text-size-adjust:none;box-sizing:border-box;border-width:0px;border-style:solid;border-color:#0052e2;font-weight:600;font-size:15px;line-height:21px;letter-spacing:0.25px;">Track Shipment</a>
                                                                                </td>
                                                                            </tr>
                                                                        </table>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                        <tr>
                                            <td style="padding:20px 0;word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;font-size:16px;line-height:24px;">
                                                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                                    <tr>
                                                        <td valign="middle" style="word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;font-size:16px;line-height:24px;">
                                                            <h3 style="margin:0 0 24px 0;color:#111111;font-size:18px;line-height:26px;font-weight:600;">${trackingID}</h3>
                                                        </td>
                                                        <td align="right" valign="middle" style="word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;font-size:16px;line-height:24px;">
                                                            <h3 style="margin:0 0 24px 0;color:#111111;font-size:18px;line-height:26px;font-weight:600;">${new Date().toLocaleDateString()}</h3>
                                                        </td>
                                                    </tr>
                                                </table>
                                                <table class="table" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                                    <tr>
                                                        <th align="left" style="font-family:'Inter', Helvetica, Arial, sans-serif;padding:10px 0;color:#85878E;font-size:13px;font-weight:600;line-height:18px;">Origin</th>
                                                        <th align="right" style="font-family:'Inter', Helvetica, Arial, sans-serif;padding:10px 0;color:#85878E;font-size:13px;font-weight:600;line-height:18px;">Destination</th>
                                                    </tr>
                                                    <tr>
                                                        <td valign="middle" style="word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;font-size:16px;line-height:24px;padding:14px 0;border-top:1px solid #e2e8f0;">
                                                            ${shipment.origin.city}, ${shipment.origin.state}<br>
                                                            ${shipment.origin.country}
                                                        </td>
                                                        <td valign="middle" align="right" style="word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;font-size:16px;line-height:24px;padding:14px 0;border-top:1px solid #e2e8f0;">
                                                            ${shipment.destination.city}, ${shipment.destination.state}<br>
                                                            ${shipment.destination.country}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;font-size:16px;line-height:24px;padding:14px 0;border-top:1px solid #e2e8f0;">
                                                            <h4 style="margin:0 0 16px 0;color:#111111;font-size:16px;line-height:24px;font-weight:600;">Status</h4>
                                                        </td>
                                                        <td align="right" style="word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;font-size:16px;line-height:24px;padding:14px 0;border-top:1px solid #e2e8f0;">
                                                            <h4 style="margin:0 0 16px 0;color:#111111;font-size:16px;line-height:24px;font-weight:600;text-transform:capitalize;">${shipment.status}</h4>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                    <p style="color:#4a5566;margin:20px 0;font-size:16px;line-height:28px;">
                                        If you have any questions about this shipment, simply reply to this email or reach out to our 
                                        <a href="mailto:support@transportify.com" style="color:#0052e2;">support team</a> for help.
                                    </p>
                                    <p style="color:#4a5566;margin:20px 0;font-size:16px;line-height:28px;">
                                        Best regards,<br>The Transportify Team
                                    </p>
                                    <table width="100%" style="border-collapse:collapse;">
                                        <tr><td height="20" style="font-size:0px;line-height:0px;word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;">&nbsp;</td></tr>
                                        <tr><td height="20" style="font-size:0px;line-height:0px;border-top:1px solid #e2e8f0;word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;">&nbsp;</td></tr>
                                    </table>
                                    <p class="small" style="color:#4a5566;margin:20px 0;font-size:14px;line-height:21px;">
                                        Need to track another shipment? <a href="${config.EMAIL.TRACK_BASE_URL}" style="color:#0052e2;">Visit our tracking page</a>.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td align="center" style="word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;font-size:16px;line-height:24px;">
                        <table class="ms-footer" width="640" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;width:640px;margin:0 auto;">
                            <tr>
                                <td class="ms-content-body" align="center" style="word-break:break-word;font-family:'Inter', Helvetica, Arial, sans-serif;font-size:16px;line-height:24px;padding:40px 50px;">
                                    <p class="small" style="margin:20px 0;color:#96a2b3;font-size:14px;line-height:21px;">&copy; 2024 Transportify. All rights reserved.</p>
                                    <p class="small" style="margin:20px 0;color:#96a2b3;font-size:14px;line-height:21px;">
                                        1234 Main Street<br>
                                        Suite 567<br>
                                        Henderson, Colorado 80640
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>`;
};

// Authentication middleware - JWT-based for serverless
const requireAuth = (req, res, next) => {
    console.log('=== AUTH DEBUG ===');
    console.log('Headers:', req.headers);
    console.log('Cookies:', req.cookies);
    console.log('Authorization header:', req.headers.authorization);
    
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.token;
    console.log('Extracted token:', token ? 'Present' : 'Missing');
    
    if (!token) {
        console.log('No token found - returning 401');
        return res.status(401).json({ error: 'Authentication required' });
    }
    
    try {
        const decoded = jwt.verify(token, config.SESSION_SECRET);
        console.log('JWT decoded successfully:', decoded);
        req.user = decoded;
        next();
    } catch (error) {
        console.log('JWT verification failed:', error.message);
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Serve static files from public directory
app.use('/admin', express.static(path.join(__dirname, '../public')));

// Authentication routes
app.post('/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('Login attempt - Username:', username);
        
        // Simple authentication (in production, use proper user management)
        if (username === config.ADMIN_CREDENTIALS.username && 
            password === config.ADMIN_CREDENTIALS.password) {
            
            // Create JWT token
            const token = jwt.sign(
                { username, authenticated: true },
                config.SESSION_SECRET,
                { expiresIn: '24h' }
            );
            
            console.log('Login success - Token created');
            
            // Set token as cookie and return in response
            res.cookie('token', token, {
                httpOnly: false, // Set to false for debugging
                secure: false, // Set to true in production with HTTPS
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            });
            
            console.log('Token created and cookie set:', token);
            
            res.json({ 
                success: true, 
                message: 'Login successful',
                user: { username },
                token: token
            });
        } else {
            console.log('Login failed - Invalid credentials');
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
    
    console.log('=== CHECK AUTH DEBUG ===');
    console.log('Headers:', req.headers);
    console.log('Cookies:', req.cookies);
    console.log('Token:', token ? 'Present' : 'Missing');
    
    if (!token) {
        return res.json({ authenticated: false, debug: 'No token found' });
    }
    
    try {
        const decoded = jwt.verify(token, config.SESSION_SECRET);
        res.json({ 
            authenticated: true, 
            user: { username: decoded.username },
            debug: 'Token verified successfully'
        });
    } catch (error) {
        res.json({ authenticated: false, debug: `Token verification failed: ${error.message}` });
    }
});

// Protected admin routes
app.get('/admin/dashboard', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
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
        
        // Generate tracking ID with TRANS prefix
        const trackingID = generateTrackingID();
        
        // Create comprehensive shipment object with all required fields
        const newShipment = {
            // Core Required Fields
            trackingID,
            status: shipmentData.status || 'pending',
            estimatedDeliveryDate: shipmentData.estimatedDeliveryDate ? new Date(shipmentData.estimatedDeliveryDate) : null,
            lastUpdated: new Date(),
            createdAt: new Date(),
            
            // Origin Details
            origin: {
                city: shipmentData.origin?.city || '',
                state: shipmentData.origin?.state || '',
                country: shipmentData.origin?.country || '',
                facility: shipmentData.origin?.facility || '',
                address: shipmentData.origin?.address || '',
                coordinates: {
                    lat: shipmentData.origin?.coordinates?.lat || null,
                    lng: shipmentData.origin?.coordinates?.lng || null
                }
            },
            
            // Destination Details
            destination: {
                city: shipmentData.destination?.city || '',
                state: shipmentData.destination?.state || '',
                country: shipmentData.destination?.country || '',
                facility: shipmentData.destination?.facility || '',
                address: shipmentData.destination?.address || '',
                coordinates: {
                    lat: shipmentData.destination?.coordinates?.lat || null,
                    lng: shipmentData.destination?.coordinates?.lng || null
                }
            },
            
            // Sender Information
            sender: {
                name: shipmentData.sender?.name || '',
                email: shipmentData.sender?.email || '',
                phone: shipmentData.sender?.phone || '',
                address: shipmentData.sender?.address || ''
            },
            
            // Receiver Information
            receiver: {
                name: shipmentData.receiver?.name || '',
                email: shipmentData.receiver?.email || '',
                phone: shipmentData.receiver?.phone || '',
                address: shipmentData.receiver?.address || ''
            },
            
            // Package Details
            package: {
                name: shipmentData.packageName || shipmentData.package?.name || '',
                description: shipmentData.packageDescription || shipmentData.package?.description || '',
                category: shipmentData.packageCategory || shipmentData.package?.category || '',
                cost: shipmentData.cost || shipmentData.package?.cost || null,
                weight: shipmentData.weight || shipmentData.package?.weight || null,
                dimensions: shipmentData.dimensions || shipmentData.package?.dimensions || '',
                paymentMethod: shipmentData.paymentMethod || shipmentData.package?.paymentMethod || '',
                serviceType: shipmentData.serviceType || shipmentData.package?.serviceType || 'standard',
                carrierId: shipmentData.carrierId || shipmentData.package?.carrierId || '',
                driverId: shipmentData.driverId || shipmentData.package?.driverId || ''
            },
            
            // Tracking History
            trackingHistory: [{
            status: 'pending',
                location: shipmentData.origin?.city || 'Origin',
                timestamp: new Date(),
                coordinates: shipmentData.origin?.coordinates || null,
                notes: 'Shipment created'
            }]
        };
        
        const savedShipment = await saveShipment(newShipment);

        // Send notification emails (best effort) - send separate emails to avoid recipient limit
        try {
            const trackUrl = `${config.EMAIL.TRACK_BASE_URL}/${trackingID}`;
            const subject = `Shipment Created: ${trackingID}`;
            const body = `Hello,\n\nA new shipment has been created.\n\n` +
                `Tracking ID: ${trackingID}\n` +
                `Status: ${newShipment.status}\n` +
                `Estimated Delivery: ${newShipment.estimatedDeliveryDate ? newShipment.estimatedDeliveryDate.toISOString() : 'N/A'}\n` +
                `Origin: ${newShipment.origin.city}, ${newShipment.origin.state}, ${newShipment.origin.country}\n` +
                `Destination: ${newShipment.destination.city}, ${newShipment.destination.state}, ${newShipment.destination.country}\n\n` +
                `Track your shipment: ${trackUrl}\n\n` +
                `— Transportify`;
            
            // Send email only to receiver
            const recipients = [
                newShipment.receiver?.email
            ].filter(Boolean);
            
            for (const recipient of recipients) {
                try {
                    await sendEmailUnified({ to: [recipient], subject, text: body, html: getShipmentEmailHTML(newShipment, trackingID, trackUrl, recipient === newShipment.receiver?.email) });
                    console.log(`Email sent to: ${recipient}`);
                } catch (emailErr) {
                    console.error(`Failed to send email to ${recipient}:`, emailErr);
                }
            }
        } catch (err) {
            console.error('Email send error:', err);
        }
        
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

app.put('/admin/api/shipments/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        // Add lastUpdated timestamp
        updateData.lastUpdated = new Date();
        
        // If status is being updated, add to tracking history
        if (updateData.status) {
            const doc = await db.collection('shipments').doc(id).get();
            if (!doc.exists) {
            return res.status(404).json({
                success: false,
                message: 'Shipment not found'
            });
        }
        
            const currentData = doc.data();
            const newHistoryEntry = {
                status: updateData.status,
                location: updateData.currentLocation || 'Unknown',
                timestamp: new Date(),
                coordinates: updateData.currentCoordinates || null,
                notes: updateData.notes || `Status changed to ${updateData.status}`
            };
            
            updateData.trackingHistory = [
                ...(currentData.trackingHistory || []),
                newHistoryEntry
            ];
        }
        
        const updatedShipment = await updateShipment(id, updateData);
        
        // Send email notification if status was updated
        if (updateData.status && updatedShipment.receiver?.email) {
            try {
                const trackUrl = `${config.EMAIL.TRACK_BASE_URL}/${updatedShipment.trackingID}`;
                
                let subject, body, html;
                
                // Special email for "on-hold" status
                if (updateData.status === 'on-hold') {
                    subject = `Action Required: Insurance Fee Payment for Your Shipment ${updatedShipment.trackingID}`;
                    body = `Dear ${updatedShipment.receiver.name || 'Valued Customer'},\n\n` +
                        `We hope this message finds you well.\n\n` +
                        `We would like to inform you that in order to proceed with the delivery of your package, our shipping partner Transportify requires a refundable insurance fee of $150.\n\n` +
                        `This fee is necessary to ensure the safe handling of your shipment while in transit. It serves as a security measure that covers any unforeseen risks during transportation. Please note that the amount is fully refundable upon successful delivery of your package.\n\n` +
                        `At the moment, your package is on temporary hold until the insurance fee has been settled. Once payment is received, Transportify will immediately release your shipment for delivery.\n\n` +
                        `Tracking ID: ${updatedShipment.trackingID}\n` +
                        `Current Status: On Hold - Insurance Fee Required\n` +
                        `Package: ${updatedShipment.package?.name || 'Your shipment'}\n` +
                        `Current Location: ${updateData.currentLocation?.name || 'Processing Center'}\n\n` +
                        `We sincerely apologize for any inconvenience this may cause and appreciate your understanding. This measure is in place to protect both your shipment and to ensure smooth delivery.\n\n` +
                        `Track your shipment: ${trackUrl}\n\n` +
                        `If you have any questions or concerns, please feel free to reply directly to this email—we'll be happy to assist you.\n\n` +
                        `Thank you for your prompt attention to this matter.\n\n` +
                        `Warm regards,\n` +
                        `Sarah Johnson\n` +
                        `Customer Relations Manager\n` +
                        `Transportify Logistics`;
                        
                    html = getOnHoldEmailHTML(updatedShipment, trackUrl);
                } else {
                    // Regular status update email
                    subject = `Shipment Status Update: ${updatedShipment.trackingID}`;
                    body = `Hello ${updatedShipment.receiver.name || 'Customer'},\n\n` +
                        `Your shipment status has been updated.\n\n` +
                        `Tracking ID: ${updatedShipment.trackingID}\n` +
                        `New Status: ${updateData.status}\n` +
                        `Current Location: ${updateData.currentLocation?.name || 'Not specified'}\n` +
                        `Last Updated: ${new Date().toLocaleString()}\n\n` +
                        `Track your shipment: ${trackUrl}\n\n` +
                        `— Transportify`;
                        
                    html = getShipmentEmailHTML(updatedShipment, updatedShipment.trackingID, trackUrl, true);
                }

                await sendEmailUnified({ 
                    to: [updatedShipment.receiver.email], 
                    subject, 
                    text: body, 
                    html: html
                });
                console.log(`Status update email sent to: ${updatedShipment.receiver.email}`);
            } catch (emailError) {
                console.error('Failed to send status update email:', emailError);
                // Don't fail the request if email fails
            }
        }
        
        res.json({
            success: true,
            data: updatedShipment,
            message: 'Shipment updated successfully'
        });
    } catch (error) {
        console.error('Error updating shipment:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating shipment'
        });
    }
});

// Update current location endpoint
app.post('/admin/api/shipments/:id/location', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { lat, lng, locationName } = req.body || {};
        if (typeof lat !== 'number' || typeof lng !== 'number') {
            return res.status(400).json({ success: false, message: 'lat and lng are required numbers' });
        }

        const docRef = db.collection('shipments').doc(id);
        const snap = await docRef.get();
        if (!snap.exists) {
            return res.status(404).json({ success: false, message: 'Shipment not found' });
        }

        const currentData = snap.data();
        const newHistoryEntry = {
            status: currentData.status || 'in-transit',
            location: locationName || 'Current Location',
            timestamp: new Date(),
            coordinates: { lat, lng },
            notes: 'Location updated'
        };

        const updateData = {
            lastUpdated: new Date(),
            currentLocation: {
                coordinates: { lat, lng },
                name: locationName || null
            },
            trackingHistory: [ ...(currentData.trackingHistory || []), newHistoryEntry ]
        };

        await docRef.update(updateData);
        const updated = await docRef.get();
        return res.json({ success: true, data: { id: updated.id, ...updated.data() } });
    } catch (error) {
        console.error('Error updating location:', error);
        res.status(500).json({ success: false, message: 'Error updating location' });
    }
});

app.delete('/admin/api/shipments/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        
        await deleteShipment(id);
        
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

// Public tracking lookup (no auth)
app.get('/track/:trackingID', async (req, res) => {
    try {
        const { trackingID } = req.params;
        const snap = await db.collection('shipments').where('trackingID', '==', trackingID).limit(1).get();
        if (snap.empty) {
            return res.status(404).json({ success: false, message: 'Tracking ID not found' });
        }
        const doc = snap.docs[0];
        const data = doc.data();

        // Helper to normalize Firestore Timestamp to ISO string
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

// Login page route
app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

// Public track page
app.get('/track', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/track.html'));
});

// Test email endpoint (for debugging)
app.post('/admin/test-email', requireAuth, async (req, res) => {
    try {
        // Debug: Check MailerSend configuration
        console.log('MailerSend config check:');
        console.log('- API Key exists:', !!config.MAILERSEND.API_KEY);
        console.log('- From Email:', config.MAILERSEND.FROM_EMAIL);
        console.log('- Client exists:', !!mailerSendClient);
        
        const result = await sendEmailUnified({
            to: ['gele9450@gmail.com'],
            subject: 'Test Email from Transportify',
            text: 'This is a test email to verify MailerSend is working correctly.',
            html: '<h2>Test Email</h2><p>This is a test email to verify MailerSend is working correctly.</p>'
        });
        
        console.log('Email sent successfully via:', result.provider);
        
        res.json({
            success: true,
            message: 'Test email sent successfully',
            provider: result.provider,
            data: result.data,
            debug: {
                mailersendConfigured: !!config.MAILERSEND.API_KEY,
                mailersendClientExists: !!mailerSendClient,
                fromEmail: config.MAILERSEND.FROM_EMAIL
            }
        });
    } catch (error) {
        console.error('Test email error:', error);
        res.status(500).json({
            success: false,
            message: 'Test email failed',
            error: error.message
        });
    }
});

// Redirect root admin to login
app.get('/admin', (req, res) => {
    const token = req.cookies?.token;
    
    if (token) {
        try {
            jwt.verify(token, config.SESSION_SECRET);
            res.redirect('/admin/dashboard');
        } catch (error) {
            res.redirect('/admin/login');
        }
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
const PORT = config.PORT || process.env.PORT || 3000;

// Only start server if not in Vercel environment
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚚 Transportify Admin Server running on port ${PORT}`);
    console.log(`📊 Admin Dashboard: http://localhost:${PORT}/admin`);
    console.log(`🔐 Login: http://localhost:${PORT}/admin/login`);
    console.log(`📧 Email notifications: MailerSend enabled`);
  });
}

// Export for Vercel
module.exports = app;