#!/bin/bash

# RapidPro Deployment Script
# Deploys hosting, functions, and rules to Firebase

set -e  # Exit on error

echo "🚀 RapidPro Deployment Script"
echo "=============================="
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if authenticated
if ! firebase projects:list &> /dev/null; then
    echo "🔐 Not authenticated. Please login to Firebase..."
    firebase login
fi

# Navigate to project directory
cd "$(dirname "$0")"
echo "📁 Working directory: $(pwd)"
echo ""

# Install function dependencies
echo "📦 Installing Cloud Function dependencies..."
cd functions
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "✅ Dependencies already installed"
fi
cd ..
echo ""

# Check if GEMINI_API_KEY is set
echo "🔑 Checking for Gemini API key..."
if ! firebase functions:secrets:access GEMINI_API_KEY &> /dev/null; then
    echo "⚠️  GEMINI_API_KEY not set!"
    echo ""
    echo "You need to set your Gemini API key as a Firebase secret."
    echo "Run this command:"
    echo ""
    echo "  firebase functions:secrets:set GEMINI_API_KEY"
    echo ""
    echo "Get your API key from: https://makersuite.google.com/app/apikey"
    echo ""
    read -p "Have you set the API key? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled. Please set the API key first."
        exit 1
    fi
else
    echo "✅ GEMINI_API_KEY is configured"
fi
echo ""

# Deploy
echo "🚀 Deploying to Firebase..."
echo ""
echo "This will deploy:"
echo "  - Hosting (updated website with new phone number)"
echo "  - Cloud Functions (backend for assignment tracking)"
echo "  - Firestore Rules (security rules)"
echo "  - Storage Rules (image upload security)"
echo ""

read -p "Continue with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 0
fi

echo ""
echo "Deploying..."
firebase deploy

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your site: https://rapidpro-memphis.web.app"
echo ""
echo "Next steps:"
echo "  1. Visit https://rapidpro-memphis.web.app"
echo "  2. Hard refresh (Ctrl+Shift+R) to see phone number update"
echo "  3. Login and test 'CLOCK IN - GET MISSION'"
echo "  4. Verify KPIs update after logging interactions"
echo ""
echo "Monitor logs: firebase functions:log --follow"
echo "View console: https://console.firebase.google.com/project/rapidpro-memphis"
echo ""
