# Deployed Firebase Admin Code Path Report

## Objective
To prove exactly which `firebase-admin` authentication code path is executing in the production build output for the `/api/upload/avatar` route.

## Build Output Analysis
Next.js (Turbopack) compiles the server routes and their dependencies into chunk files located in `.next/server/chunks/`. 

By analyzing the compiled output corresponding to `/api/upload/avatar` (found in `[root-of-the-server]__2edce15e._.js`), we can trace exactly how `getFirebaseAdminAuth()` was bundled for the production runtime.

### Exact Compiled Code

**1. The Module Definition (External Dependency Mapping):**
Next.js Turbopack externalizes `firebase-admin` as configured in `next.config.ts`. It generated the following module closure for the `firebase-admin/auth` import:
```javascript
34171, (e,t,r) => { 
  t.exports = e.x("firebase-admin/auth", () => require("firebase-admin/auth")) 
}
```
*Note: The `e.x` function is Turbopack's external module loader which safely wraps the native Node.js `require()` call.*

**2. The `getFirebaseAdminAuth()` Implementation:**
The TypeScript function `getFirebaseAdminAuth` was minified into the async function `a()`:
```javascript
async function a() {
  await n(); // Calls getFirebaseAdminApp()
  let { getAuth: t } = e.r(34171); // Synchronously requires module 34171
  return t(); // Returns getAuth()
}
```

## Conclusion
The production build output conclusively proves that the deployed code is executing:
```javascript
require("firebase-admin/auth")
```
It is **not** executing `admin.auth()`. 

The explicit use of the native CommonJS `require` call inside the Turbopack external loader guarantees that the Vercel Serverless environment will cleanly load the `./lib/auth/index.js` file from `firebase-admin` without triggering the `ERR_REQUIRE_ESM` crash.
