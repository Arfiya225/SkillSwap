import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  where,
  orderBy,
  getDocs
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { UserAnalytics, ActivitySummary } from "@/types/analytics";

const ANALYTICS_COLLECTION = "userAnalytics";

export async function getUserAnalytics(userId: string): Promise<UserAnalytics | null> {
  const docRef = doc(db, ANALYTICS_COLLECTION, userId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return snap.data() as UserAnalytics;
}

export async function updateAnalyticsForAttendance(
  userId: string,
  durationMinutes: number
): Promise<void> {
  const docRef = doc(db, ANALYTICS_COLLECTION, userId);
  const snap = await getDoc(docRef);
  
  const hoursToAdd = durationMinutes / 60;
  
  if (snap.exists()) {
    const data = snap.data() as UserAnalytics;
    
    let streakDays = data.streakDays || 1;
    if (data.updatedAt) {
      const lastUpdate = data.updatedAt.toDate();
      const today = new Date();
      // Normalize dates to midnight to check day differences
      const lastUpdateDate = new Date(lastUpdate.getFullYear(), lastUpdate.getMonth(), lastUpdate.getDate());
      const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const diffTime = todayDate.getTime() - lastUpdateDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streakDays += 1;
      } else if (diffDays > 1) {
        streakDays = 1;
      }
    }

    await setDoc(docRef, {
      ...data,
      totalHours: data.totalHours + hoursToAdd,
      attendedSessions: data.attendedSessions + 1,
      streakDays,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } else {
    // Initializer
    const newAnalytics: UserAnalytics = {
      userId,
      totalHours: hoursToAdd,
      completedSwaps: 0,
      completedTasks: 0,
      attendedSessions: 1,
      averageRating: 0,
      reputationScore: 0,
      streakDays: 1,
      updatedAt: null,
    };
    await setDoc(docRef, {
      ...newAnalytics,
      updatedAt: serverTimestamp(),
    });
  }
}

export async function getChartData(userId: string, days: number = 7): Promise<ActivitySummary[]> {
  const chartData: ActivitySummary[] = [];
  
  // Initialize with 0s
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    chartData.push({
      date: d.toLocaleDateString(undefined, { weekday: 'short' }),
      hours: 0,
      sessions: 0
    });
  }

  const q = query(
    collection(db, "attendance"),
    where("userId", "==", userId),
    orderBy("attendedAt", "desc")
  );
  
  const snapshot = await getDocs(q);
  
  const now = new Date();
  const startOfRange = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1));

  snapshot.forEach(docSnap => {
    const att = docSnap.data();
    const attDate = att.attendedAt ? att.attendedAt.toDate() : new Date();
    
    if (attDate >= startOfRange) {
      const attNormalized = new Date(attDate.getFullYear(), attDate.getMonth(), attDate.getDate());
      const todayNormalized = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const diffTime = todayNormalized.getTime() - attNormalized.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      const index = (days - 1) - diffDays;
      if (index >= 0 && index < days) {
        chartData[index].hours += (att.durationMinutes || 0) / 60;
        chartData[index].sessions += 1;
      }
    }
  });

  return chartData;
}
