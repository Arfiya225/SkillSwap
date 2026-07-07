import admin from "firebase-admin";

if (!admin.apps.length) {
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (privateKey) {
    privateKey = privateKey.replace(/^"|"$/g, ''); // Remove wrapping quotes
    privateKey = privateKey.replace(/\\n/g, '\n'); // Replace literal \n
  }

  try {
    if (privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey,
        }),
      });
    }
  } catch (err: any) {
    console.error("[Firebase Admin] Initialization error:", err);
  }
}

export const adminAuth = admin.apps.length ? admin.auth() : {} as any;
