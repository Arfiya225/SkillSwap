// Validates required environment variables for production readiness

const requiredEnvVars = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID"
];

export function validateEnv() {
  const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
  
  if (missingVars.length > 0) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`);
    } else {
      console.warn(`[DEV WARNING] Missing environment variables: ${missingVars.join(", ")}`);
    }
  }

  // Also check if Gemini key is available on the server (usually not NEXT_PUBLIC for security, but we've been using it client side for MVP maybe)
  if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY && !process.env.GEMINI_API_KEY) {
    console.warn("[DEV WARNING] Missing GEMINI_API_KEY. AI features will fail.");
  }
}
