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
    }

    bindEvents() {
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.clearBtn.addEventListener('click', () => this.clearForm());
        this.downloadBtn.addEventListener('click', () => this.downloadQRCode());
        this.copyBtn.addEventListener('click', () => this.copyVCardData());
        this.testBtn.addEventListener('click', () => this.testAPI());
        
        // Photo upload handling
        this.photoInput.addEventListener('change', (e) => this.handlePhotoUpload(e));
        
        // Remove photo button
        this.removePhotoBtn = document.getElementById('removePhotoBtn');
        this.removePhotoBtn.addEventListener('click', () => this.removePhoto());
        
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

    async handleFormSubmit(e) {
        e.preventDefault();

        if (!this.validateForm()) {
            this.showToast('Please fix the errors in the form', 'error');
            return;
        }

        const formData = this.getFormData();
        const vCardData = this.generateVCard(formData);
        
        try {
            console.log('Generating QR code for vCard data:', vCardData);
            await this.generateQRCode(vCardData);
            this.showToast('QR Code generated successfully!', 'success');
        } catch (error) {
            console.error('Error generating QR code:', error);
            this.showToast(`Error generating QR code: ${error.message}`, 'error');
        }
    }

    getFormData() {
        const formData = new FormData(this.form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value.trim();
        }
        
        return data;
    }

    generateVCard(data) {
        // Create vCard 3.0 format for maximum compatibility
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
        
        // Photo (if available)
        if (this.currentPhotoData) {
            // Convert data URL to base64 and add to vCard
            const base64Data = this.currentPhotoData.split(',')[1];
            vCard += `PHOTO;ENCODING=BASE64;TYPE=JPEG:${base64Data}\r\n`;
        }
        
        // Add creation date
        vCard += `REV:${new Date().toISOString()}\r\n`;
        
        vCard += 'END:VCARD';
        
        this.currentVCardData = vCard;
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
            
            // Generate QR code using server API
            const response = await fetch('/api/generate-qr', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ vCardData })
            });
            
            console.log('API Response status:', response.status);
            console.log('API Response headers:', response.headers);
            
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
            
            // Create image element from data URL
            const img = document.createElement('img');
            img.src = data.qrCode;
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
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showToast('Please select a valid image file', 'error');
            return;
        }

        // Validate file size (2MB limit)
        if (file.size > 2 * 1024 * 1024) {
            this.showToast('Image size should be less than 2MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            // Create image element to get dimensions
            const img = new Image();
            img.onload = () => {
                // Update preview
                this.photoPreview.innerHTML = `<img src="${e.target.result}" alt="Contact Photo" class="w-full h-full object-cover rounded-full">`;
                
                // Store the photo data
                this.currentPhotoData = e.target.result;
                
                // Show remove button
                this.removePhotoBtn.classList.remove('hidden');
                
                this.showToast('Photo uploaded successfully!', 'success');
            };
            img.src = e.target.result;
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
        this.removePhotoBtn.classList.add('hidden');
        
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
        
        // Hide remove button
        this.removePhotoBtn.classList.add('hidden');
        
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
    new VCardGenerator();
    
    // Add service worker for PWA functionality (optional)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    }
});

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