#!/bin/bash
# ═══════════════════════════════════════════════════
# FairLens Deployment Script
# Firebase Hosting (Client) ONLY
# (Backend is deployed automatically by Render on push)
# ═══════════════════════════════════════════════════

set -e

# ── Configuration ──
PROJECT_ID="${GCP_PROJECT_ID:-fairlens-f1922}"

echo "╔══════════════════════════════════════════╗"
echo "║     FairLens Frontend Deployment         ║"
echo "╚══════════════════════════════════════════╝"
echo "  Project:  $PROJECT_ID"
echo ""

# ── Step 1: Build the client ──
echo "🔨 [1/2] Building client..."
cd client
npm install
npm run build
cd ..
echo "✅ Client built → client/dist/"

# ── Step 2: Deploy frontend to Firebase Hosting ──
echo "🌐 [2/2] Deploying client to Firebase Hosting..."
firebase deploy --only hosting --project $PROJECT_ID
echo "✅ Client deployed → https://${PROJECT_ID}.web.app"

# ── Done ──
echo ""
echo "╔══════════════════════════════════════════╗"
echo "║       🎉 Deployment Complete!            ║"
echo "╠══════════════════════════════════════════╣"
echo "  Frontend: https://${PROJECT_ID}.web.app"
echo "  Backend:  Auto-deployed via GitHub/Render"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "⚠️  Ensure you have pushed your code to GitHub to trigger the Render backend build."
