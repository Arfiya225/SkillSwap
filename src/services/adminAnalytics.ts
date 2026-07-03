import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { AdminAnalytics } from "@/types/admin";

const ADMIN_ANALYTICS_COLLECTION = "adminAnalytics";
const GLOBAL_DOC_ID = "global";

export async function getGlobalAdminAnalytics(): Promise<AdminAnalytics | null> {
  const docRef = doc(db, ADMIN_ANALYTICS_COLLECTION, GLOBAL_DOC_ID);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return snap.data() as AdminAnalytics;
}

export async function initializeGlobalAdminAnalytics(): Promise<void> {
  const docRef = doc(db, ADMIN_ANALYTICS_COLLECTION, GLOBAL_DOC_ID);
  const snap = await getDoc(docRef);
  if (!snap.exists()) {
    const initData: AdminAnalytics = {
      id: GLOBAL_DOC_ID,
      totalUsers: 0,
      activeUsers: 0,
      totalSwaps: 0,
      completedSwaps: 0,
      totalLearningRooms: 0,
      totalMarketplaceListings: 0,
      totalVerificationRequests: 0,
      totalReviewsSubmitted: 0,
      updatedAt: serverTimestamp(),
    };
    await setDoc(docRef, initData);
  }
}

export async function incrementAdminMetric(
  metric: keyof Omit<AdminAnalytics, "id" | "updatedAt">,
  amount: number = 1
): Promise<void> {
  const docRef = doc(db, ADMIN_ANALYTICS_COLLECTION, GLOBAL_DOC_ID);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    const data = snap.data() as AdminAnalytics;
    await updateDoc(docRef, {
      [metric]: (data[metric] || 0) + amount,
      updatedAt: serverTimestamp(),
    });
  }
}
