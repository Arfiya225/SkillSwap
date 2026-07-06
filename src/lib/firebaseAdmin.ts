/**
 * Lazy load firebase-admin to prevent Vercel Serverless Function ERR_REQUIRE_ESM crashes.
 * Top-level imports of firebase-admin are intentionally omitted.
 */
let firebaseAdminApp: any = null;

export async function getFirebaseAdminApp() {
  if (!firebaseAdminApp) {
    const { getApps, initializeApp } = await import("firebase-admin/app");

    if (getApps().length === 0) {
      firebaseAdminApp = initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    } else {
      firebaseAdminApp = getApps()[0];
    }
  }
  return firebaseAdminApp;
}

export async function getFirebaseAdminAuth() {
  await getFirebaseAdminApp();
  const { getAuth } = await import("firebase-admin/auth");
  return getAuth();
}
