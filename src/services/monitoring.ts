import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";

const USAGE_COLLECTION = "usageMetrics";
const LOGS_COLLECTION = "systemLogs";

export async function logUsage(action: string, metadata?: any): Promise<void> {
  try {
    const colRef = collection(db, USAGE_COLLECTION);
    const newDoc = doc(colRef);
    await setDoc(newDoc, {
      id: newDoc.id,
      action,
      metadata: metadata || {},
      timestamp: serverTimestamp()
    });
  } catch (e) {
    console.error("Failed to log usage:", e);
  }
}

export async function logError(source: string, error: any, context?: any): Promise<void> {
  try {
    const colRef = collection(db, LOGS_COLLECTION);
    const newDoc = doc(colRef);
    await setDoc(newDoc, {
      id: newDoc.id,
      source,
      error: error?.message || String(error),
      context: context || {},
      timestamp: serverTimestamp()
    });
  } catch (e) {
    console.error("Failed to log error:", e);
  }
}
