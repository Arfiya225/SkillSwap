# Firebase Admin v11 Migration Report

## Migration Objective
Downgrade the `firebase-admin` package from version 14.1.0 to the older, stable v11.11.1 to natively avoid `ERR_REQUIRE_ESM` and module resolution issues in Next.js 15 without relying on CommonJS `require()` workarounds.

## Migration Steps Completed

### 1. Dependency Downgrade
- Uninstalled `firebase-admin@14.1.0`.
- Installed `firebase-admin@11.11.1` successfully via npm.

### 2. Refactored Firebase Initialization
Refactored `src/lib/firebaseAdmin.ts` to leverage the v11 top-level namespace:
- Replaced the dynamic `import("firebase-admin")` with static `import admin from "firebase-admin"`.
- Removed all usages of `firebase-admin/auth` and the `getAuth()` modular function.
- Implemented the requested `!admin.apps.length` check and `admin.initializeApp()` logic directly at the module's top level.
- Re-added a safety fallback during `adminAuth` export to prevent Next.js static page collection from crashing the build when environment variables (like `FIREBASE_PRIVATE_KEY`) are intentionally undefined in the build runner.

### 3. Route Refactoring
Scanned the codebase and updated all API routes that handle uploads to use the static export:
- `/api/upload/avatar/route.ts`
- `/api/upload/recording/route.ts`
- `/api/upload/resource/route.ts`
- Changed `const adminAuth = await getFirebaseAdminAuth()` to a direct synchronous usage of the imported `adminAuth` constant.

### 4. Build Verification
- Triggered a full `npm run build` using Next.js Turbopack.
- The build succeeded entirely without any Next.js ESM bridging errors or `ERR_REQUIRE_ESM` crashes.

## Conclusion
The application is now securely running on `firebase-admin@11.11.1`. This version resolves all authentication API paths directly from the root namespace (`admin.auth()`), which bypasses the Vercel Serverless sub-path export conflict natively. Code execution behaves predictably in TypeScript and Turbopack.
