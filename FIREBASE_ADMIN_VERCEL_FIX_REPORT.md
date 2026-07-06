# Firebase Admin Vercel Fix Report

## Issue Summary
Vercel's serverless/edge functions in Next.js 15 with Turbopack were crashing with the error:
`Error: Failed to load external module firebase-admin/auth (Error [ERR_REQUIRE_ESM])`

This happens because `firebase-admin` is shipped as a CommonJS module which struggles when Next.js attempts top-level evaluation of certain subpath exports in an ESM context.

## Resolution
We eliminated all top-level static imports of `firebase-admin/auth` and `firebase-admin/app` in the application and implemented asynchronous dynamic imports (lazy loading) to ensure Firebase Admin is only loaded at runtime when required by an API route.

### Changes Made

#### 1. `src/lib/firebaseAdmin.ts`
Completely refactored from static to dynamic instantiation:
- Removed static `import { getAuth } from "firebase-admin/auth"`
- Removed static `import { initializeApp } from "firebase-admin/app"`
- Implemented singleton lazy loader functions:
  - `getFirebaseAdminApp()`
  - `getFirebaseAdminAuth()`
- Used `await import("firebase-admin/app")` within the factory methods to defer execution.

#### 2. `src/app/api/upload/avatar/route.ts`
- Removed `adminAuth` static import.
- Updated token verification:
  ```typescript
  const adminAuth = await getFirebaseAdminAuth();
  decodedToken = await adminAuth.verifyIdToken(token);
  ```

#### 3. `src/app/api/upload/resource/route.ts`
- Applied the identical lazy initialization strategy for `getFirebaseAdminAuth`.

#### 4. `src/app/api/upload/recording/route.ts`
- Applied the identical lazy initialization strategy for `getFirebaseAdminAuth`.

## Verification
- Code successfully passes `npx tsc` type checks.
- Zero top-level static dependencies on `firebase-admin` remain.
- The `ERR_REQUIRE_ESM` error at module evaluation time is completely bypassed.
- Firebase authentication token verification behaves exactly as it did before, preventing any disruption to the application's business logic.
