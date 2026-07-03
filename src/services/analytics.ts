import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { UserAnalytics } from "@/types/analytics";

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
    await setDoc(docRef, {
      ...data,
      totalHours: data.totalHours + hoursToAdd,
      attendedSessions: data.attendedSessions + 1,
      // basic streak calculation (real app would check dates)
      streakDays: data.streakDays + 1, 
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
