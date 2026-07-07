# Upload Authentication Audit Report

## Overview
An exhaustive audit was conducted to diagnose the `HTTP 401 Unauthorized` production error during avatar uploads on Vercel. 

## 1. Request Lifecycle Trace
The upload request lifecycle was verified end-to-end:
- **Client Trigger**: User selects a file in `AvatarUploader.tsx`.
- **Client Auth check**: The client validates `user` exists before proceeding.
- **Service Invocation**: `uploadAvatar` is called in `src/services/storage.ts`.
- **Token Generation**: The client awaits `auth.currentUser?.getIdToken()`.
- **Request Generation**: The client `fetch` calls `/api/upload/avatar` and embeds the token via `Authorization: Bearer <firebase-id-token>`.
- **Server Reception**: The API route extracts the Authorization header.
- **Server Verification**: `firebase-admin` dynamically loads and invokes `verifyIdToken(token)`.
- **Server Delegation**: If verified, the server leverages `SUPABASE_SERVICE_ROLE_KEY` to execute the Supabase upload bypassing client RLS.

## 2. Findings & Fixes Applied

### A. Missing Production Environment Variables Configuration
The primary cause of the Vercel `401 Unauthorized` is related to how `firebase-admin` validates JWT tokens. When run locally, it might leverage application default credentials or cached gcloud CLI credentials. 

In production on Vercel, `firebase-admin` requires the explicit `credential.cert()` initializer to mathematically verify token signatures. 
**Fix**: Updated `src/lib/firebaseAdmin.ts` to explicitly initialize with:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` (with a regex `.replace(/\\n/g, "\n")` fix to properly format multi-line keys passed from Vercel's environment variable UI).

### B. Opaque Error Responses
The API routes were previously returning a generic `401 Unauthorized` HTML or JSON string without context. This made debugging impossible.
**Fix**: Added rigorous structured JSON responses and `console.error` logs to `/api/upload/avatar`, `/api/upload/resource`, and `/api/upload/recording`.

Diagnostics now cover:
- `Missing Authorization header`
- `Authorization header missing Bearer prefix`
- `Empty Firebase token provided`
- Detailed `Firebase token verification failed` (with `err.message` attached)
- Missing `SUPABASE_SERVICE_ROLE_KEY` configuration.

## 3. Client Verification Checklist
- [x] Client is correctly sending `Authorization: Bearer <firebase-id-token>`.
- [x] `await auth.currentUser?.getIdToken()` is strictly executed immediately before every API `fetch` call in `src/services/storage.ts`.

## 4. Next Steps for Vercel Deployment
To restore uploads in production, ensure the following environment variables are correctly populated in the Vercel Dashboard Settings -> Environment Variables:

1. `FIREBASE_CLIENT_EMAIL`: Your Firebase Service Account Email.
2. `FIREBASE_PRIVATE_KEY`: Your Firebase Service Account Private Key (Ensure you paste the entire block including `-----BEGIN PRIVATE KEY-----`).
3. `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Your Firebase Project ID.

Redeploy the application after confirming these variables. The verbose API errors will instantly pinpoint the exact failure if it persists.
