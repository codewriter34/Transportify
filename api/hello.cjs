// Minimal test function for Vercel
module.exports = (req, res) => {
    console.log('Hello function called:', req.method, req.url);
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    res.json({
        success: true,
        message: 'Hello from Vercel!',
        method: req.method,
        url: req.url,
        timestamp: new Date().toISOString()
    });
};
