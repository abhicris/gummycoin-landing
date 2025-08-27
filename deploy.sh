#!/bin/bash

# GummyCoin Landing Page Deploy Script
echo "🚀 Deploying GummyCoin Landing Page..."

# Add all changes
git add .

# Commit with timestamp
git commit -m "Update: Add /links route handling - $(date '+%Y-%m-%d %H:%M:%S')"

# Push to GitHub (triggers Vercel deployment)
git push origin main

echo "✅ Deployment initiated! Changes will be live in 1-2 minutes."
echo "🌐 Live site: https://gummyco.in"
echo "🔗 Links page: https://gummyco.in/links"
