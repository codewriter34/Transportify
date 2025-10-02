// Ultra-simple test function with no dependencies
module.exports = (req, res) => {
    console.log('Basic function called:', req.method, req.url);
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    try {
        res.json({
            success: true,
            message: 'Basic function working!',
            method: req.method,
            url: req.url,
            timestamp: new Date().toISOString(),
            nodeVersion: process.version,
            environment: process.env.NODE_ENV
        });
    } catch (error) {
        console.error('Error in basic function:', error);
        res.status(500).json({
            success: false,
            message: 'Error in basic function',
            error: error.message
        });
    }
};
