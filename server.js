const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const QRCode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "blob:"],
            connectSrc: ["'self'"]
        }
    }
}));

// Compression middleware
app.use(compression());

// CORS middleware with specific configuration
app.use(cors({
    origin: ['http://localhost:3000', 'https://*.vercel.app', 'https://*.vercel.app/*'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, './')));

// API endpoint for QR code generation
app.post('/api/generate-qr', async (req, res) => {
    try {
        const { vCardData } = req.body;
        
        if (!vCardData) {
            return res.status(400).json({ error: 'vCard data is required' });
        }

        // Generate QR code as data URL
        const qrDataURL = await QRCode.toDataURL(vCardData, {
            width: 256,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            },
            errorCorrectionLevel: 'M'
        });

        res.json({ 
            success: true, 
            qrCode: qrDataURL,
            message: 'QR code generated successfully'
        });

    } catch (error) {
        console.error('Error generating QR code:', error);
        res.status(500).json({ 
            error: 'Failed to generate QR code',
            details: error.message 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'QR vCard Generator',
        environment: process.env.NODE_ENV || 'development',
        vercel: !!process.env.VERCEL
    });
});

// Test QR generation endpoint
app.get('/api/test', async (req, res) => {
    try {
        const testData = 'BEGIN:VCARD\r\nVERSION:3.0\r\nFN:Test User\r\nTEL:+1234567890\r\nEMAIL:test@example.com\r\nEND:VCARD';
        const qrDataURL = await QRCode.toDataURL(testData, {
            width: 128,
            margin: 1
        });
        res.json({ 
            success: true, 
            qrCode: qrDataURL,
            message: 'Test QR code generated successfully'
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Test QR generation failed',
            details: error.message 
        });
    }
});

// Serve index.html for all routes (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Start server (only if not in Vercel environment)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`🚀 QR vCard Generator server running on port ${PORT}`);
        console.log(`📱 Open http://localhost:${PORT} in your browser`);
        console.log(`🔧 API available at http://localhost:${PORT}/api`);
        console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
    });
}

module.exports = app; 