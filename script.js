// QR Code vCard Generator - Main JavaScript

class VCardGenerator {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.currentVCardData = '';
    }

    initializeElements() {
        this.form = document.getElementById('contactForm');
        this.qrPlaceholder = document.getElementById('qrPlaceholder');
        this.qrResult = document.getElementById('qrResult');
        this.qrCode = document.getElementById('qrCode');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.toast = document.getElementById('toast');
        this.toastMessage = document.getElementById('toastMessage');
        this.photoPreview = document.getElementById('photoPreview');
        this.photoInput = document.getElementById('photo');
        
        // Debug logging
        console.log('VCardGenerator initialized');
        console.log('Photo input found:', !!this.photoInput);
        console.log('Photo preview found:', !!this.photoPreview);
        
        if (!this.photoInput) {
            console.error('Photo input element not found!');
        }
        if (!this.photoPreview) {
            console.error('Photo preview element not found!');
        }
    }

    bindEvents() {
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.clearBtn.addEventListener('click', () => this.clearForm());
        this.downloadBtn.addEventListener('click', () => this.downloadQRCode());
        this.copyBtn.addEventListener('click', () => this.copyVCardData());
        
        // Test button (optional)
        this.testBtn = document.getElementById('testBtn');
        if (this.testBtn) {
            this.testBtn.addEventListener('click', () => this.testAPI());
        }
        
        // Photo upload handling
        if (this.photoInput) {
            console.log('Binding change event to photo input');
            this.photoInput.addEventListener('change', (e) => this.handlePhotoUpload(e));
        } else {
            console.error('Cannot bind photo input - element not found');
        }
        
        // Remove photo button
        this.removePhotoBtn = document.getElementById('removePhotoBtn');
        if (this.removePhotoBtn) {
            this.removePhotoBtn.addEventListener('click', () => this.removePhoto());
        }
        
        // Real-time validation
        this.form.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', () => this.validateField(input));
            input.addEventListener('blur', () => this.validateField(input));
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';

        // Remove existing error styling
        field.classList.remove('border-red-500');
        this.removeErrorMessage(field);

        // Validation rules
        switch (fieldName) {
            case 'fullName':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Full name is required';
                } else if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'Name must be at least 2 characters';
                }
                break;

            case 'phone':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Phone number is required';
                } else if (!this.isValidPhone(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid phone number';
                }
                break;

            case 'email':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Email is required';
                } else if (!this.isValidEmail(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
                break;

            case 'website':
                if (value && !this.isValidUrl(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid URL';
                }
                break;
        }

        if (!isValid) {
            field.classList.add('border-red-500');
            this.showErrorMessage(field, errorMessage);
        }

        return isValid;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        // Allow various phone number formats
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
        return phoneRegex.test(cleanPhone);
    }

    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    showErrorMessage(field, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'text-red-500 text-sm mt-1';
        errorDiv.textContent = message;
        errorDiv.id = `${field.id}-error`;
        field.parentNode.appendChild(errorDiv);
    }

    removeErrorMessage(field) {
        const errorDiv = field.parentNode.querySelector(`#${field.id}-error`);
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    validateForm() {
        const fields = this.form.querySelectorAll('input[required], textarea[required]');
        let isValid = true;

        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    handleFormSubmit(e) {
        e.preventDefault();

        console.log('Form submitted');
        
        if (!this.validateForm()) {
            this.showToast('Please fix the errors in the form', 'error');
            return;
        }

        try {
            const formData = this.getFormData();
            console.log('Form data retrieved:', formData);
            
            // Try to generate QR code with smart fallback
            this.generateQRCodeWithFallback(formData);
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.showToast(`Error processing form: ${error.message}`, 'error');
        }
    }

    async generateQRCodeWithFallback(formData) {
        try {
            // Generate vCard (photos are now handled as logos, not embedded)
            let vCardData = this.generateVCard(formData);
            console.log('Generating QR code with photo as center logo, vCard size:', vCardData.length);
            
            await this.generateQRCode(vCardData);
            
            if (this.currentPhotoData) {
                this.showToast('QR Code generated with your photo as center logo!', 'success');
            } else {
                this.showToast('QR Code generated successfully!', 'success');
            }
            
        } catch (error) {
            console.log('QR generation failed, trying minimal vCard:', error.message);
            
            try {
                // Fallback: Try minimal vCard (only essential fields)
                let minimalVCard = this.generateMinimalVCard(formData);
                console.log('Attempting QR generation with minimal vCard, size:', minimalVCard.length);
                
                await this.generateQRCode(minimalVCard);
                this.showToast('QR Code generated with essential contact info!', 'info');
                
            } catch (minimalError) {
                console.error('All QR generation strategies failed:', minimalError);
                this.showToast(`Error generating QR code: ${minimalError.message}`, 'error');
            }
        }
    }

    generateMinimalVCard(data) {
        // Ultra-minimal vCard with only essential info
        let vCard = 'BEGIN:VCARD\r\n';
        vCard += 'VERSION:3.0\r\n';
        
        // Only include essential fields
        if (data.fullName) {
            vCard += `FN:${this.escapeVCardValue(data.fullName)}\r\n`;
        }
        
        if (data.phone) {
            const cleanPhone = data.phone.replace(/[\s\-\(\)\.]/g, '');
            vCard += `TEL:${cleanPhone}\r\n`;
        }
        
        if (data.email) {
            vCard += `EMAIL:${data.email}\r\n`;
        }
        
        vCard += 'END:VCARD';
        
        console.log('Generated minimal vCard length:', vCard.length);
        return vCard;
    }

    getFormData() {
        const formData = new FormData(this.form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            // Skip file inputs or handle them separately
            if (value instanceof File) {
                // Skip file inputs in form data - we handle photos separately
                continue;
            }
            data[key] = typeof value === 'string' ? value.trim() : value;
        }
        
        return data;
    }

    generateVCard(data) {
        // Create vCard 3.0 format for maximum compatibility
        // Photos will be handled as QR code logos, not embedded in vCard
        let vCard = 'BEGIN:VCARD\r\n';
        vCard += 'VERSION:3.0\r\n';
        
        // Name
        if (data.fullName) {
            vCard += `FN:${this.escapeVCardValue(data.fullName)}\r\n`;
            vCard += `N:${this.escapeVCardValue(data.fullName)};;;;\r\n`;
        }
        
        // Phone
        if (data.phone) {
            const cleanPhone = data.phone.replace(/[\s\-\(\)\.]/g, '');
            vCard += `TEL;TYPE=CELL:${cleanPhone}\r\n`;
        }
        
        // Email
        if (data.email) {
            vCard += `EMAIL:${data.email}\r\n`;
        }
        
        // Organization
        if (data.company || data.jobTitle) {
            vCard += `ORG:${this.escapeVCardValue(data.company || '')}\r\n`;
            if (data.jobTitle) {
                vCard += `TITLE:${this.escapeVCardValue(data.jobTitle)}\r\n`;
            }
        }
        
        // Website
        if (data.website) {
            vCard += `URL:${data.website}\r\n`;
        }
        
        // Address
        if (data.address) {
            vCard += `ADR;TYPE=HOME:;;${this.escapeVCardValue(data.address)};;;;\r\n`;
        }
        
        // Notes
        if (data.notes) {
            vCard += `NOTE:${this.escapeVCardValue(data.notes)}\r\n`;
        }
        
        // Add creation date
        vCard += `REV:${new Date().toISOString()}\r\n`;
        
        vCard += 'END:VCARD';
        
        this.currentVCardData = vCard;
        console.log('Generated vCard total length:', vCard.length);
        return vCard;
    }

    escapeVCardValue(value) {
        // Escape special characters in vCard values
        return value
            .replace(/\\/g, '\\\\')
            .replace(/;/g, '\\;')
            .replace(/,/g, '\\,')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r');
    }

    async generateQRCode(vCardData) {
        try {
            // Clear previous QR code
            this.qrCode.innerHTML = '';
            
            // Show loading state
            this.qrPlaceholder.classList.add('hidden');
            this.qrResult.classList.remove('hidden');
            this.qrCode.classList.add('loading');
            
            console.log('Making API request to /api/generate-qr');
            
            // Generate QR code using server API (without logo for now)
            const response = await fetch('/api/generate-qr', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ vCardData: vCardData })
            });
            
            console.log('API Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error response:', errorText);
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch (e) {
                    errorData = { error: errorText };
                }
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('API Success response:', data);
            
            if (!data.qrCode) {
                throw new Error('No QR code data received from server');
            }
            
            // If we have a photo, composite it onto the QR code
            let finalQRCode = data.qrCode;
            if (this.currentPhotoData) {
                console.log('Adding logo to QR code...');
                try {
                    finalQRCode = await this.addLogoToQR(data.qrCode, this.currentPhotoData);
                    console.log('Logo added successfully');
                } catch (logoError) {
                    console.error('Failed to add logo, using plain QR code:', logoError);
                    // Continue with plain QR code if logo fails
                }
            }
            
            // Create image element from data URL
            const img = document.createElement('img');
            img.src = finalQRCode;
            img.alt = 'QR Code';
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            
            // Add error handling for image loading
            img.onerror = () => {
                throw new Error('Failed to load QR code image');
            };
            
            img.onload = () => {
                console.log('QR code image loaded successfully');
            };
            
            this.qrCode.appendChild(img);
            
            // Remove loading state
            this.qrCode.classList.remove('loading');
            
        } catch (error) {
            console.error('QR Code generation error:', error);
            // Reset UI state on error
            this.qrPlaceholder.classList.remove('hidden');
            this.qrResult.classList.add('hidden');
            this.qrCode.classList.remove('loading');
            throw new Error('Failed to generate QR code: ' + error.message);
        }
    }

    // Method to composite logo onto QR code using Canvas API
    async addLogoToQR(qrDataURL, logoDataURL) {
        return new Promise((resolve, reject) => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                const qrImage = new Image();
                const logoImage = new Image();
                
                let imagesLoaded = 0;
                const totalImages = 2;
                
                const checkIfComplete = () => {
                    imagesLoaded++;
                    if (imagesLoaded === totalImages) {
                        // Set canvas size to match QR code
                        canvas.width = qrImage.width;
                        canvas.height = qrImage.height;
                        
                        // Draw QR code as background
                        ctx.drawImage(qrImage, 0, 0);
                        
                        // Calculate logo size (about 20% of QR code width, but not more than 120px)
                        const logoSize = Math.min(qrImage.width * 0.2, 120);
                        const logoX = (qrImage.width - logoSize) / 2;
                        const logoY = (qrImage.height - logoSize) / 2;
                        
                        // Draw white circle background for logo (slightly larger)
                        const bgRadius = logoSize / 2 + 6;
                        const centerX = qrImage.width / 2;
                        const centerY = qrImage.height / 2;
                        
                        ctx.fillStyle = 'white';
                        ctx.beginPath();
                        ctx.arc(centerX, centerY, bgRadius, 0, 2 * Math.PI);
                        ctx.fill();
                        
                        // Create circular clip for logo
                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(centerX, centerY, logoSize / 2, 0, 2 * Math.PI);
                        ctx.clip();
                        
                        // Draw logo
                        ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
                        ctx.restore();
                        
                        // Return as data URL
                        resolve(canvas.toDataURL('image/png'));
                    }
                };
                
                qrImage.onload = checkIfComplete;
                logoImage.onload = checkIfComplete;
                
                qrImage.onerror = () => reject(new Error('Failed to load QR code image'));
                logoImage.onerror = () => reject(new Error('Failed to load logo image'));
                
                qrImage.src = qrDataURL;
                logoImage.src = logoDataURL;
                
            } catch (error) {
                reject(error);
            }
        });
    }

    downloadQRCode() {
        const img = this.qrCode.querySelector('img');
        if (!img) {
            this.showToast('No QR code to download', 'error');
            return;
        }

        // Get the full name from the form for the filename
        const fullName = document.getElementById('fullName').value.trim();
        let filename = 'vcard-qr-code.png';
        
        if (fullName) {
            // Sanitize the filename by removing special characters and spaces
            const sanitizedName = fullName
                .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
                .replace(/\s+/g, '-') // Replace spaces with hyphens
                .toLowerCase();
            filename = `${sanitizedName}-qr-code.png`;
        }

        // Create canvas to convert image to downloadable format
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
        // Draw image on canvas
        ctx.drawImage(img, 0, 0);
        
        // Create download link
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showToast(`QR Code downloaded as ${filename}!`, 'success');
    }

    async copyVCardData() {
        try {
            await navigator.clipboard.writeText(this.currentVCardData);
            this.showToast('vCard data copied to clipboard!', 'success');
        } catch (error) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = this.currentVCardData;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showToast('vCard data copied to clipboard!', 'success');
        }
    }

    handlePhotoUpload(event) {
        console.log('handlePhotoUpload called', event);
        const file = event.target.files[0];
        if (!file) {
            console.log('No file selected');
            return;
        }

        console.log('File selected:', file.name, file.type, file.size);

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            console.error('Invalid file type:', file.type);
            this.showToast('Please select a valid image file (JPG, PNG, GIF, WebP)', 'error');
            return;
        }

        // Validate file size (2MB limit)
        if (file.size > 2 * 1024 * 1024) {
            console.error('File too large:', file.size);
            this.showToast('Image size should be less than 2MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            console.log('File read successfully');
            // Create image element to validate and resize if needed
            const img = new Image();
            img.onload = () => {
                console.log('Image loaded, dimensions:', img.width, 'x', img.height);
                // Create canvas for resizing for QR logo use
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Optimal size for QR code center logo
                const logoSize = 120; // Good size for QR logo visibility
                let { width, height } = img;
                
                // Calculate crop area for square logo (center crop)
                const size = Math.min(width, height);
                const startX = (width - size) / 2;
                const startY = (height - size) / 2;
                
                console.log('Creating QR logo from image:', logoSize, 'x', logoSize);
                
                // Set canvas size for square logo
                canvas.width = logoSize;
                canvas.height = logoSize;
                
                // Draw cropped and resized image
                ctx.drawImage(img, startX, startY, size, size, 0, 0, logoSize, logoSize);
                
                // Get logo data URL with good quality (since it's not embedded in vCard)
                const logoDataURL = canvas.toDataURL('image/png', 0.9); // PNG for better logo quality
                
                // Also create a display version for preview
                const displayCanvas = document.createElement('canvas');
                const displayCtx = displayCanvas.getContext('2d');
                displayCanvas.width = 150;
                displayCanvas.height = 150;
                displayCtx.drawImage(img, startX, startY, size, size, 0, 0, 150, 150);
                const displayDataURL = displayCanvas.toDataURL('image/jpeg', 0.8);
                
                // Update preview with the display version (better quality for UI)
                if (this.photoPreview) {
                    this.photoPreview.innerHTML = `<img src="${displayDataURL}" alt="Contact Photo" class="w-full h-full object-cover rounded-full">`;
                    console.log('Photo preview updated');
                } else {
                    console.error('Photo preview element not found for update');
                }
                
                // Store the logo version for QR code center
                this.currentPhotoData = logoDataURL;
                
                // Update UI indicator - photos as logos always work!
                const sizeIndicator = document.getElementById('photoSizeIndicator');
                if (sizeIndicator) {
                    sizeIndicator.classList.remove('hidden');
                    sizeIndicator.textContent = '✅ Perfect! Photo will appear as QR code logo';
                    sizeIndicator.className = 'text-green-600';
                }
                
                this.showToast('Photo uploaded! It will appear as a logo in the center of your QR code.', 'success');
                
                // Show remove button
                if (this.removePhotoBtn) {
                    this.removePhotoBtn.classList.remove('hidden');
                    console.log('Remove button shown');
                }
            };
            
            img.onerror = () => {
                console.error('Failed to load image');
                this.showToast('Failed to load image. Please try a different file.', 'error');
            };
            
            img.src = e.target.result;
        };
        
        reader.onerror = () => {
            console.error('Failed to read file');
            this.showToast('Failed to read file. Please try again.', 'error');
        };
        
        reader.readAsDataURL(file);
    }

    clearForm() {
        this.form.reset();
        this.qrPlaceholder.classList.remove('hidden');
        this.qrResult.classList.add('hidden');
        this.qrCode.innerHTML = '';
        this.currentVCardData = '';
        this.currentPhotoData = null;
        
        // Reset photo preview
        this.photoPreview.innerHTML = '<i class="fas fa-user text-gray-400 text-xl"></i>';
        
        // Hide remove button
        if (this.removePhotoBtn) {
            this.removePhotoBtn.classList.add('hidden');
        }
        
        // Clear validation errors
        this.form.querySelectorAll('.border-red-500').forEach(field => {
            field.classList.remove('border-red-500');
        });
        this.form.querySelectorAll('[id$="-error"]').forEach(error => {
            error.remove();
        });
        
        this.showToast('Form cleared', 'info');
    }

    removePhoto() {
        // Clear photo data
        this.currentPhotoData = null;
        
        // Reset photo input
        this.photoInput.value = '';
        
        // Reset photo preview
        this.photoPreview.innerHTML = '<i class="fas fa-user text-gray-400 text-xl"></i>';
        
        // Hide remove button and size indicator
        if (this.removePhotoBtn) {
            this.removePhotoBtn.classList.add('hidden');
        }
        
        const sizeIndicator = document.getElementById('photoSizeIndicator');
        if (sizeIndicator) {
            sizeIndicator.classList.add('hidden');
        }
        
        this.showToast('Photo removed', 'info');
    }

    async testAPI() {
        try {
            console.log('Testing API endpoints...');
            
            // Test health endpoint
            const healthResponse = await fetch('/api/health');
            console.log('Health endpoint status:', healthResponse.status);
            const healthData = await healthResponse.json();
            console.log('Health endpoint data:', healthData);
            
            // Test QR generation endpoint
            const testResponse = await fetch('/api/test');
            console.log('Test endpoint status:', testResponse.status);
            const testData = await testResponse.json();
            console.log('Test endpoint data:', testData);
            
            if (testData.success && testData.qrCode) {
                // Display test QR code
                this.qrCode.innerHTML = '';
                const img = document.createElement('img');
                img.src = testData.qrCode;
                img.alt = 'Test QR Code';
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                this.qrCode.appendChild(img);
                
                this.qrPlaceholder.classList.add('hidden');
                this.qrResult.classList.remove('hidden');
                
                this.showToast('API test successful! Test QR code generated.', 'success');
            } else {
                this.showToast('API test failed: ' + (testData.error || 'Unknown error'), 'error');
            }
            
        } catch (error) {
            console.error('API test error:', error);
            this.showToast('API test failed: ' + error.message, 'error');
        }
    }

    showToast(message, type = 'success') {
        this.toastMessage.textContent = message;
        
        // Update toast styling based on type
        this.toast.className = 'fixed top-4 right-4 px-6 py-3 rounded-md shadow-lg transform translate-x-full transition-transform duration-300 z-50';
        
        switch (type) {
            case 'success':
                this.toast.classList.add('bg-green-500', 'text-white');
                break;
            case 'error':
                this.toast.classList.add('bg-red-500', 'text-white');
                break;
            case 'info':
                this.toast.classList.add('bg-blue-500', 'text-white');
                break;
            default:
                this.toast.classList.add('bg-green-500', 'text-white');
        }
        
        // Show toast
        setTimeout(() => {
            this.toast.classList.add('toast-show');
        }, 100);
        
        // Hide toast after 3 seconds
        setTimeout(() => {
            this.toast.classList.remove('toast-show');
        }, 3000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    window.vCardGenerator = new VCardGenerator();
    
    // Temporarily disable service worker during development
    // Add service worker for PWA functionality (optional)
    // if ('serviceWorker' in navigator) {
    //     navigator.serviceWorker.register('/sw.js')
    //         .then(registration => console.log('SW registered'))
    //         .catch(error => console.log('SW registration failed'));
    // }
});

// Global fallback function for photo upload button
window.choosePhoto = function() {
    console.log('Global choosePhoto function called');
    const photoInput = document.getElementById('photo');
    if (photoInput) {
        console.log('Photo input found, triggering click');
        photoInput.click();
    } else {
        console.error('Photo input not found');
        alert('Photo input not found. Please refresh the page.');
    }
};

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to generate QR code
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('generateBtn').click();
    }
    
    // Escape to clear form
    if (e.key === 'Escape') {
        document.getElementById('clearBtn').click();
    }
}); 