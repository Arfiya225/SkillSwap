# SkillSwap Deployment Guide

This document outlines the deployment procedure, CI/CD pipeline setup, and environment requirements for deploying SkillSwap to production.

## 1. Prerequisites

Ensure you have the following accounts and tools ready:
- Google Cloud / Firebase Account
- Vercel or Firebase Hosting Account
- Node.js & npm installed locally
- Gemini API access

## 2. Environment Variables

Create a `.env.local` file in your root directory (do not commit this to version control). Include the following keys:

```env
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-auth-domain"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
NEXT_PUBLIC_GEMINI_API_KEY="your-gemini-key"
```

*Note: In a true production environment, sensitive keys like `GEMINI_API_KEY` should be moved to a secure backend or Next.js server actions, rather than exposing them via `NEXT_PUBLIC_` variables.*

## 3. Deployment Targets

### Option A: Firebase Hosting (Recommended)
Firebase Hosting fully supports Next.js applications, including server-side rendering (SSR) via Cloud Functions.

1. **Install Firebase CLI**: `npm install -g firebase-tools`
2. **Login**: `firebase login`
3. **Initialize**: `firebase init hosting` (Select your project and set public directory to `.next`)
4. **Deploy**: `firebase deploy --only hosting`

### Option B: Vercel
Vercel is the creator of Next.js and provides zero-config deployments.

1. Connect your GitHub repository to Vercel.
2. Add your Environment Variables in the Vercel Dashboard.
3. Click **Deploy**. Vercel will automatically run `npm run build` and provision the edge network.

## 4. CI/CD Pipeline (GitHub Actions)

To automate deployments on merges to `main`, set up a GitHub Action:

```yaml
name: Deploy to Firebase Hosting
on:
  push:
    branches:
      - main
jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci && npm run build
        env:
          NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
          # ... (include all secrets)
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: your-project-id
```

## 5. Security & Performance Checklist

Before making the app public, ensure the following are completed:
- [x] **Firestore Rules**: Ensure `firestore.rules` is deployed and restricts unauthorized writes.
- [x] **API Caching**: Ensure `aiCache` is functioning to prevent runaway Gemini API costs.
- [x] **Monitoring**: Check that the `systemLogs` and `usageMetrics` collections are receiving data.
- [x] **System Health Check**: Visit `/admin/system-health` to confirm all infrastructure is connected.
- [x] **Linting & Build**: Ensure `npm run lint` and `npm run build` pass without warnings.
