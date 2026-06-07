#!/bin/bash
# Production setup script - Simple and direct

set -e  # Exit on any error

echo "🚀 Starting production setup..."
echo ""

# Step 1: Install Node.js (only if needed)
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js 24..."
    bash install-node.sh
else
    echo "✅ Node.js already installed: $(node --version)"
fi

echo ""

# Step 2: Install dependencies
echo "📚 Installing npm dependencies..."
npm ci --only=production

echo ""

# Step 3: Build the application
echo "🔨 Building application..."
npm run build

echo ""

# Step 4: Start the application
echo "▶️  Starting application..."
npm start

echo ""
echo "✅ Setup complete!"
