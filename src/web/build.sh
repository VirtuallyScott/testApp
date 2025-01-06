#!/bin/bash

# Set error handling
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node >/dev/null 2>&1; then
    log_error "Node.js is not installed"
    exit 1
fi

# Check if npm is installed
if ! command -v npm >/dev/null 2>&1; then
    log_error "npm is not installed"
    exit 1
fi

# Clean previous build
log_info "Cleaning previous build..."
rm -rf build

# Install dependencies
log_info "Installing dependencies..."
npm ci

# Run build
log_info "Building web package..."
if npm run build; then
    log_info "Build completed successfully!"
else
    log_error "Build failed"
    exit 1
fi
