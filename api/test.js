// Simple test endpoint for Vercel
module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    console.log('Test endpoint called:', req.method, req.url);
    
    res.json({ 
        success: true,
        message: 'Test endpoint working',
        method: req.method,
        url: req.url,
        timestamp: new Date().toISOString()
    });
};
