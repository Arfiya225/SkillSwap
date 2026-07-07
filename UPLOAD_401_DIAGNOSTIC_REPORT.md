# Upload 401 Diagnostic Report

## Objective
Enhance the error reporting for `POST /api/upload/avatar` and `POST /api/upload/resource` to return specific 401 reasons instead of generic `Unauthorized` errors. This diagnostic telemetry will identify why the endpoints work on Localhost but fail with `401 Unauthorized` on Vercel.

## Updates Made

### 1. `src/services/storage.ts` (Client Upload Service)
Added explicit checks to differentiate missing user objects versus missing tokens:
- **`auth.currentUser is null`**: Indicates the Firebase auth state has not initialized on the client or the user is fully logged out before the upload initiates.
- **`getIdToken() returned empty`**: Indicates the user object exists, but Firebase could not generate or retrieve the bearer token.

### 2. `src/lib/firebaseAdmin.ts` (Server Initialization)
Wrapped `initializeApp` in a `try/catch` block to parse and categorize Firebase Admin SDK configuration errors. Vercel environment variables are often malformed (e.g. newline escaping issues in private keys). We now throw:
- **`Firebase project ID mismatch`**: Fails when the project ID environment variable is missing, invalid, or mismatched.
- **`Firebase service account invalid`**: Identifies malformed private keys or missing client email configurations.
- **`Firebase Admin initialization failed: <reason>`**: Catches any other initialization aborts.

### 3. `src/app/api/upload/avatar/route.ts` & `src/app/api/upload/resource/route.ts` (API Routes)
Updated the API handlers to catch the specific errors thrown by the Admin SDK and return structured diagnostic JSON in the format: `{ error: "Unauthorized", reason: "<exact failure reason>" }`.

The `reason` will now expose one of the following exact failures:
- `Missing Authorization header`
- `Missing Bearer token`
- `getIdToken() returned empty`
- `Firebase Admin initialization failed`
- `verifyIdToken() failed` (with details string attached)
- `decoded uid missing`
- `Firebase project ID mismatch`
- `Firebase service account invalid`

## Next Steps
Trigger a 401 error in the Vercel production environment and inspect the network response body (or Vercel function logs) to capture the exact `reason`. This will directly point to the failing step in the authentication pipeline.
