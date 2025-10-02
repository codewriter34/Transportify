// Configuration for Admin Server
module.exports = {
    // Server Configuration
    PORT: process.env.PORT || 3009,
    NODE_ENV: process.env.NODE_ENV || 'development',
    
    // Session Configuration
    SESSION_SECRET: process.env.SESSION_SECRET || 'your-super-secret-session-key-change-this-in-production',
    
    // Admin Credentials (Change these in production!)
    ADMIN_CREDENTIALS: {
        username: process.env.ADMIN_USERNAME || 'Transportify-admin',
        password: process.env.ADMIN_PASSWORD || '12345678$$'
    },
    
    // Firebase Configuration
    FIREBASE_CONFIG: {
        projectId: 'transportify-d94c3',
        // Add your Firebase Admin SDK credentials here
        // You can get these from your Firebase project settings
    },

    // Email (SMTP) Configuration
    EMAIL: {
        HOST: process.env.SMTP_HOST || '',
        PORT: parseInt(process.env.SMTP_PORT || '587', 10),
        SECURE: process.env.SMTP_SECURE === 'true',
        USER: process.env.SMTP_USER || '',
        PASS: process.env.SMTP_PASS || '',
        FROM: process.env.EMAIL_FROM || 'no-reply@transportify.com',
        TRACK_BASE_URL: process.env.TRACK_BASE_URL || 'https://transportifyy.netlify.app/track'
    }
    ,
    // MailerSend Configuration
    MAILERSEND: {
        API_KEY: process.env.MAILERSEND_API_KEY || '',
        FROM_EMAIL: process.env.MAILERSEND_FROM_EMAIL || 'noreply@test.mailersend.net',
        FROM_NAME: process.env.MAILERSEND_FROM_NAME || 'Transportify'
    }
};
