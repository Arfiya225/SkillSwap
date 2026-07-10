import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

if (!getApps().length) {
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (privateKey) {
    privateKey = privateKey.replace(/^"|"$/g, ''); // Remove wrapping quotes
    privateKey = privateKey.replace(/\\n/g, '\n'); // Replace literal \n
  }

  try {
    if (privateKey) {
      initializeApp({
        credential: cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey,
        }),
      });
      console.log("[Firebase Admin] Initialized successfully");
    } else {
      console.warn("[Firebase Admin] Missing FIREBASE_PRIVATE_KEY");
    }
  } catch (err: any) {
    console.error("[Firebase Admin] Initialization error:", err);
  }
}

// Ensure adminAuth is exported as an initialized Auth instance, not a function reference.
export const adminAuth = getApps().length > 0 ? getAuth() : ({} as any);

console.log("DEBUG: typeof adminAuth?.verifyIdToken =", typeof adminAuth?.verifyIdToken);
