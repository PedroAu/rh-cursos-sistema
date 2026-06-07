#!/bin/bash
# Node.js 24 installation script for Locaweb server
# This script downloads and installs Node.js 24 locally

set -e

echo "🔍 Checking for curl..."
if ! command -v curl &> /dev/null; then
  echo "❌ curl is not installed. Cannot download Node.js."
  exit 1
fi

APP_DIR="${APP_DIR:-.}"
NODE_INSTALL_DIR="$APP_DIR/.node"

echo "📦 Node.js 24 Installation"
echo "Install directory: $NODE_INSTALL_DIR"

# Check if already installed
if [ -f "$NODE_INSTALL_DIR/bin/node" ]; then
  echo "✅ Node.js already installed"
  $NODE_INSTALL_DIR/bin/node --version
  exit 0
fi

# Create install directory
mkdir -p "$NODE_INSTALL_DIR"
cd "$NODE_INSTALL_DIR"

echo "📥 Downloading Node.js v24.9.0..."
NODE_VERSION="v24.9.0"
NODE_URL="https://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}-linux-x64.tar.xz"

if ! curl -fsSL "$NODE_URL" -o node.tar.xz; then
  echo "❌ Failed to download Node.js from $NODE_URL"
  exit 1
fi

echo "📂 Extracting..."
if ! tar -xf node.tar.xz; then
  echo "❌ Failed to extract Node.js tarball"
  exit 1
fi

rm node.tar.xz

# Move extracted files to root of install directory
if [ -d "node-${NODE_VERSION}-linux-x64" ]; then
  mv node-${NODE_VERSION}-linux-x64/* .
  rmdir node-${NODE_VERSION}-linux-x64
fi

echo "✅ Node.js installed successfully!"
./bin/node --version
./bin/npm --version
