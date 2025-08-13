#!/bin/bash

# Vercel build script for QR vCard Generator

echo "🚀 Starting build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Create build directory if it doesn't exist
mkdir -p .vercel/output

# Copy static files
echo "📁 Copying static files..."
cp -r *.html *.css *.js *.json .vercel/output/ 2>/dev/null || true

# Copy server file
echo "🔧 Setting up server..."
cp server.js .vercel/output/

# Create function configuration
echo "⚙️ Creating function configuration..."
cat > .vercel/output/functions/server.js.func << EOF
{
  "runtime": "nodejs18.x"
}
EOF

echo "✅ Build completed successfully!" 