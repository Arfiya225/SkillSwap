import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";

const CACHE_COLLECTION = "aiCache";

export interface AICacheEntry {
  id: string; // Hash of the prompt/context
  type: "quiz" | "flashcard" | "concept" | "summary" | "insight";
  content: string; // Serialized JSON or plain text
  createdAt: any;
}

// Simple hash function for client-side keys
function generateCacheKey(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

export async function getCachedAIResponse(prompt: string, type: string): Promise<string | null> {
  const key = `${type}_${generateCacheKey(prompt)}`;
  const docRef = doc(db, CACHE_COLLECTION, key);
  const snap = await getDoc(docRef);
  
  if (snap.exists()) {
    return snap.data().content;
  }
  return null;
}

export async function setCachedAIResponse(prompt: string, type: string, content: string): Promise<void> {
  const key = `${type}_${generateCacheKey(prompt)}`;
  const docRef = doc(db, CACHE_COLLECTION, key);
  
  await setDoc(docRef, {
    id: key,
    type,
    content,
    createdAt: serverTimestamp()
  });
}
