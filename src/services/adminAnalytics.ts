import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  orderBy,
  getDocs
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

export async function getAdminChartData(): Promise<{date: string, users: number}[]> {
  const chartData: {date: string, users: number}[] = [];
  const now = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    chartData.push({
      date: d.toLocaleDateString(undefined, { weekday: 'short' }),
      users: 0,
    });
  }

  try {
    const usersRef = collection(db, "Users");
    const q = query(usersRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.createdAt) {
        const createdAt = typeof data.createdAt === 'string' 
          ? new Date(data.createdAt) 
          : data.createdAt.toDate();
        const diffTime = now.getTime() - createdAt.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        const index = 6 - diffDays;
        if (index >= 0 && index <= 6) {
          chartData[index].users += 1;
        }
      }
    });
  } catch (error) {
    console.error("Error fetching admin chart data", error);
  }

  return chartData;
}
