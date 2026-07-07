import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

let firebaseAdminApp: any = null;

export async function getFirebaseAdminApp() {
  if (!firebaseAdminApp) {
    if (getApps().length === 0) {
      if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
        console.warn("[Firebase Admin] NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing");
      }
      if (!process.env.FIREBASE_CLIENT_EMAIL) {
        console.warn("[Firebase Admin] FIREBASE_CLIENT_EMAIL is missing");
      }
      if (!process.env.FIREBASE_PRIVATE_KEY) {
        console.warn("[Firebase Admin] FIREBASE_PRIVATE_KEY is missing");
      }

      // Handle Vercel env variable newlines in private key
      const privateKey = process.env.FIREBASE_PRIVATE_KEY
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
        : undefined;

      try {
        firebaseAdminApp = initializeApp({
          credential: cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey,
          }),
        });
      } catch (err: any) {
        console.error("[Firebase Admin] Initialization error:", err);
        if (err.message.includes('project ID') || err.message.includes('projectId')) {
          throw new Error("Firebase project ID mismatch");
        }
        if (err.message.includes('service account') || err.message.includes('private key') || err.message.includes('credential')) {
          throw new Error("Firebase service account invalid");
        }
        throw new Error("Firebase Admin initialization failed: " + err.message);
      }
    } else {
      firebaseAdminApp = getApps()[0];
    }
  }
  return firebaseAdminApp;
}

export async function getFirebaseAdminAuth() {
  await getFirebaseAdminApp();
  return getAuth();
}
