import {
  collection,
  query,
  getDocs,
  orderBy,
  limit
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { LeaderboardEntry } from "@/types/admin";
import { getUserProfile } from "./profile";

const REPUTATION_COLLECTION = "reputation";
const ANALYTICS_COLLECTION = "userAnalytics";

export async function getTopUsersByReputation(limitCount: number = 10): Promise<LeaderboardEntry[]> {
  const q = query(
    collection(db, REPUTATION_COLLECTION),
    orderBy("score", "desc"),
    limit(limitCount)
  );
  
  const snapshot = await getDocs(q);
  const leaders: LeaderboardEntry[] = [];
  
  let rank = 1;
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const profile = await getUserProfile(data.userId);
    leaders.push({
      userId: data.userId,
      displayName: profile?.name || `User ${data.userId.substring(0, 4)}`,
      avatar: profile?.avatar,
      score: data.score || 0,
      rank: rank++
    });
  }
  
  return leaders;
}

export async function getTopTeachers(limitCount: number = 10): Promise<LeaderboardEntry[]> {
  const q = query(
    collection(db, ANALYTICS_COLLECTION),
    orderBy("completedSwaps", "desc"),
    limit(limitCount)
  );
  
  const snapshot = await getDocs(q);
  const leaders: LeaderboardEntry[] = [];
  
  let rank = 1;
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    if (data.completedSwaps > 0) {
      const profile = await getUserProfile(data.userId);
      leaders.push({
        userId: data.userId,
        displayName: profile?.name || `User ${data.userId.substring(0, 4)}`,
        avatar: profile?.avatar,
        score: data.completedSwaps,
        rank: rank++
      });
    }
  }
  
  return leaders;
}

export async function getMostActiveLearners(limitCount: number = 10): Promise<LeaderboardEntry[]> {
  const q = query(
    collection(db, ANALYTICS_COLLECTION),
    orderBy("totalHours", "desc"),
    limit(limitCount)
  );
  
  const snapshot = await getDocs(q);
  const leaders: LeaderboardEntry[] = [];
  
  let rank = 1;
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    if (data.totalHours > 0) {
      const profile = await getUserProfile(data.userId);
      leaders.push({
        userId: data.userId,
        displayName: profile?.name || `User ${data.userId.substring(0, 4)}`,
        avatar: profile?.avatar,
        score: Math.round(data.totalHours),
        rank: rank++
      });
    }
  }
  
  return leaders;
}
