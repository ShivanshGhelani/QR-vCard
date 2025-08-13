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
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://vercel.live"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "blob:"],
            connectSrc: ["'self'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"]
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

// Serve static files with proper MIME types
app.use(express.static(path.join(__dirname, './'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        } else if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        } else if (path.endsWith('.json')) {
            res.setHeader('Content-Type', 'application/json');
        } else if (path.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html');
        }
    }
}));

// API endpoint for QR code generation
app.post('/api/generate-qr', async (req, res) => {
    try {
        const { vCardData } = req.body;
        
        if (!vCardData) {
            return res.status(400).json({ error: 'vCard data is required' });
        }

        console.log('Generating QR code for vCard data length:', vCardData.length);

        // Dynamic settings based on data size
        let qrOptions = {
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        };

        // Adjust QR code settings based on data size
        if (vCardData.length > 3000) {
            // Large data - use maximum size and lowest error correction
            qrOptions.width = 1024;
            qrOptions.errorCorrectionLevel = 'L';
        } else if (vCardData.length > 2000) {
            // Medium data - balanced settings
            qrOptions.width = 768;
            qrOptions.errorCorrectionLevel = 'M';
        } else if (vCardData.length > 1000) {
            // Moderate data - good quality
            qrOptions.width = 512;
            qrOptions.errorCorrectionLevel = 'Q';
        } else {
            // Small data - highest quality
            qrOptions.width = 512;
            qrOptions.errorCorrectionLevel = 'H';
        }

        // Check if data is within reasonable limits (QR codes can handle up to ~7000 chars with low error correction)
        if (vCardData.length > 6000) {
            return res.status(400).json({ 
                error: 'The amount of data is too big to be stored in a QR Code',
                details: `Data size: ${vCardData.length} characters (max: 6000)`
            });
        }

        console.log(`Using QR settings: ${qrOptions.width}px, error correction: ${qrOptions.errorCorrectionLevel}`);

        // Generate QR code as data URL
        const qrDataURL = await QRCode.toDataURL(vCardData, qrOptions);

        res.json({ 
            success: true, 
            qrCode: qrDataURL,
            message: 'QR code generated successfully',
            dataSize: vCardData.length,
            qrSettings: {
                width: qrOptions.width,
                errorCorrection: qrOptions.errorCorrectionLevel
            }
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

// Specific routes for static files
app.get('/script.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, 'script.js'));
});

app.get('/styles.css', (req, res) => {
    res.setHeader('Content-Type', 'text/css');
    res.sendFile(path.join(__dirname, 'styles.css'));
});

app.get('/manifest.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(path.join(__dirname, 'manifest.json'));
});

app.get('/sw.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, 'sw.js'));
});

// Serve index.html for all other routes (SPA)
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