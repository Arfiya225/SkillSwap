import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { Reputation, ReputationBadge } from "@/types/reputation";

const REPUTATION_COLLECTION = "reputation";

export async function getUserReputation(userId: string): Promise<Reputation | null> {
  const docRef = doc(db, REPUTATION_COLLECTION, userId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return snap.data() as Reputation;
}

export async function updateReputationFromReview(
  userId: string,
  newOverallRating: number
): Promise<void> {
  const docRef = doc(db, REPUTATION_COLLECTION, userId);
  const snap = await getDoc(docRef);
  
  let rep: Reputation;

  if (snap.exists()) {
    const data = snap.data() as Reputation;
    const totalReviews = data.totalReviews + 1;
    // Calculate new average
    const averageRating = ((data.averageRating * data.totalReviews) + newOverallRating) / totalReviews;
    const score = data.score + Math.round(newOverallRating * 10); // simple scoring system
    
    rep = {
      ...data,
      totalReviews,
      averageRating,
      score,
      badges: determineBadges(totalReviews, averageRating, score)
    };
  } else {
    rep = {
      userId,
      totalReviews: 1,
      averageRating: newOverallRating,
      score: Math.round(newOverallRating * 10),
      badges: determineBadges(1, newOverallRating, Math.round(newOverallRating * 10)),
      updatedAt: null,
    };
  }

  await setDoc(docRef, {
    ...rep,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

function determineBadges(reviews: number, avg: number, score: number): ReputationBadge[] {
  const badges: ReputationBadge[] = ["New Member"];
  if (reviews >= 5 && avg >= 4.0) badges.push("Trusted Learner");
  if (reviews >= 10 && avg >= 4.5) badges.push("Top Teacher");
  if (score >= 500) badges.push("Expert Mentor");
  return badges;
}
