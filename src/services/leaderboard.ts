import {
  collection,
  query,
  getDocs,
  orderBy,
  limit
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { LeaderboardEntry } from "@/types/admin";

const REPUTATION_COLLECTION = "reputation"; // Fallback to calculate dynamically for MVP

export async function getTopUsersByReputation(limitCount: number = 10): Promise<LeaderboardEntry[]> {
  const q = query(
    collection(db, REPUTATION_COLLECTION),
    orderBy("score", "desc"),
    limit(limitCount)
  );
  
  const snapshot = await getDocs(q);
  const leaders: LeaderboardEntry[] = [];
  
  let rank = 1;
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    leaders.push({
      userId: data.userId,
      displayName: `User ${data.userId.substring(0, 4)}`, // Would join with Users collection in prod
      score: data.score || 0,
      rank: rank++
    });
  });
  
  return leaders;
}
