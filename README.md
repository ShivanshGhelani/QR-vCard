# QR Code vCard Generator

A modern, responsive web application that generates QR codes containing contact information in vCard format. When scanned, the QR code automatically prompts mobile devices to save the contact information to their native contacts app.

## Features

### Core Features
- **Contact Form**: Complete form with all essential vCard fields
  - Full Name, Phone Number, Email Address (required)
  - Company Name, Job Title, Website, Address, Notes (optional)
- **Real-time Validation**: Input validation for phone numbers, emails, and URLs
- **QR Code Generation**: Instant QR code generation using client-side library
- **vCard Compatibility**: Generates vCard 3.0 format for maximum cross-platform compatibility
- **Download Functionality**: Download QR codes as PNG images
- **Copy vCard Data**: Copy raw vCard data to clipboard

### Technical Features
- **Responsive Design**: Mobile-first design that works on all devices
- **PWA Support**: Progressive Web App with offline functionality
- **Fast Performance**: Optimized for sub-2-second load times
- **Cross-browser Compatibility**: Works on all modern browsers
- **Accessibility**: WCAG compliant with keyboard navigation and screen reader support
- **Dark Mode Support**: Automatic dark mode detection and styling

## Quick Start

### Option 1: Direct Usage (Recommended)
1. Simply open `index.html` in any modern web browser
2. Fill out the contact form
3. Click "Generate QR Code"
4. Download or share the generated QR code

### Option 2: Local Server
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000` in your browser.

### Option 3: Docker (if you prefer containerized deployment)
```bash
# Build and run with Docker
docker build -t vcard-qr-generator .
docker run -p 8080:80 vcard-qr-generator
```

## File Structure

```
QR vCard/
├── index.html          # Main HTML file
├── styles.css          # Custom CSS styles
├── script.js           # Main JavaScript functionality
├── sw.js              # Service Worker for PWA
├── manifest.json      # Web App Manifest
├── README.md          # This file
└── prd.txt           # Product Requirements Document
```

## How It Works

1. **Form Input**: Users fill out contact information in a responsive form
2. **Validation**: Real-time validation ensures data quality
3. **vCard Generation**: Contact data is converted to vCard 3.0 format
4. **QR Code Creation**: vCard data is encoded into a QR code using qrcode.js
5. **Download/Share**: Users can download the QR code as a PNG image
6. **Scanning**: When scanned, mobile devices recognize the vCard format and prompt to save contact

## Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## PWA Features

The application includes Progressive Web App features:
- **Offline Support**: Works without internet connection after first load
- **Installable**: Can be installed as a native app on mobile devices
- **Fast Loading**: Cached resources for instant loading
- **App-like Experience**: Full-screen mode and native app behavior

## API Reference

### VCardGenerator Class

The main JavaScript class that handles all functionality:

```javascript
const generator = new VCardGenerator();

// Generate vCard from form data
const vCardData = generator.generateVCard(formData);

// Generate QR code
await generator.generateQRCode(vCardData);

// Download QR code
generator.downloadQRCode();

// Copy vCard data to clipboard
generator.copyVCardData();
```

### vCard Format

The application generates vCard 3.0 format:

```
BEGIN:VCARD
VERSION:3.0
FN:John Doe
N:John Doe;;;;
TEL;TYPE=CELL:+1234567890
EMAIL:john@example.com
ORG:Acme Corporation
TITLE:Software Engineer
URL:https://example.com
ADR;TYPE=HOME:;;123 Main St;;;;;
NOTE:Additional information
REV:2024-01-01T00:00:00.000Z
END:VCARD
```

## Customization

### Styling
Modify `styles.css` to customize the appearance:
- Color scheme
- Typography
- Layout spacing
- Dark mode colors

### Functionality
Extend `script.js` to add features:
- Custom validation rules
- Additional vCard fields
- QR code styling options
- Analytics tracking

## Troubleshooting

### Common Issues

1. **QR Code Not Generating**
   - Check browser console for JavaScript errors
   - Ensure all required fields are filled
   - Verify internet connection for CDN resources

2. **QR Code Not Scanning**
   - Ensure vCard format is correct
   - Test with different QR code scanners
   - Verify QR code size and quality

3. **PWA Not Working**
   - Check if service worker is registered
   - Verify manifest.json is accessible
   - Test on HTTPS or localhost

### Debug Mode

Enable debug logging by adding this to the browser console:
```javascript
localStorage.setItem('debug', 'true');
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Test with different browsers/devices
4. Create an issue with detailed information

## Future Enhancements

- [ ] User account system for multiple profiles
- [ ] QR code analytics tracking
- [ ] Custom QR code styling (colors, logos)
- [ ] Bulk QR code generation
- [ ] Contact import from existing vCard files
- [ ] Social media integration
- [ ] Advanced vCard field support 