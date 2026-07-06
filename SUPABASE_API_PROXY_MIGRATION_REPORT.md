# Supabase API Proxy Migration Report

## Overview
This report details the implementation of a secure server-side API Proxy architecture for Supabase Storage. The primary goal was to resolve the Row Level Security (RLS) conflicts caused by using Firebase Authentication alongside Supabase Storage without relying on insecure public/anonymous upload policies.

## Implementation Details

### 1. Server-Side Infrastructure
- **`firebase-admin` Installed**: Added the Firebase Admin SDK to verify the authenticity of user tokens securely on the server.
- **`src/lib/firebaseAdmin.ts`**: Created a centralized instance of the Firebase Admin app using modern modular imports (`firebase-admin/app`, `firebase-admin/auth`).
- **`src/services/serverStorage.ts`**: Introduced a backend-only Supabase client initialized with the `SUPABASE_SERVICE_ROLE_KEY`. This key securely bypasses RLS and handles the direct file upload to the storage buckets.

### 2. Secure API Routes Created
Three new Next.js App Router API routes were created to act as authenticated proxies:
1. **`/api/upload/avatar`**
2. **`/api/upload/resource`**
3. **`/api/upload/recording`**

Each route enforces the following strict pipeline:
- **Authentication**: Extracts the `Authorization: Bearer <token>` header and verifies it via `adminAuth.verifyIdToken()`.
- **Validation**: Rejects invalid file types and enforces strict file size limits (e.g., Avatars max 5MB, Resources max 50MB, Recordings max 100MB).
- **Execution**: Invokes `serverStorage.ts` to upload the file and returns the generated public URL.

### 3. Client-Side Modifications
- **`src/services/storage.ts`**: Modified all client-side upload functions (`uploadAvatar`, `uploadResource`, `uploadRecording`) to:
  - Automatically retrieve the current user's Firebase Auth ID token.
  - Package the file into a `FormData` object.
  - Make a secure `POST` fetch request to the respective API route.
- This change completely abstracts the proxy from the UI components (`AvatarUploader`, `RecordingUploader`, etc.), meaning no UI components needed to be refactored.

## Security Posture & Production Readiness
- **Zero Anonymous Uploads**: Client-side anonymous uploads are no longer performed. The Supabase `anon` key is strictly relegated to public read operations.
- **RLS Compliant**: Because the server uses the `service_role` key, Supabase RLS is successfully bypassed without compromising bucket security.
- **Strict Validation**: The server validates file types and sizes *before* hitting the Supabase storage API, reducing the risk of malicious uploads or unexpected billing spikes.

## Build Verification
- **Linting**: Passed (0 errors)
- **Compilation**: The Next.js build completed successfully with the new API routes optimized dynamically.
