import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { StudyPlan } from "@/types/studyPlan";

/**
 * Subscribes to the latest generated study plan for a room.
 */
export function subscribeToStudyPlan(
  roomId: string,
  onUpdate: (plan: StudyPlan | null) => void
) {
  const plansRef = collection(db, "studyPlans");
  const q = query(
    plansRef,
    where("roomId", "==", roomId),
    orderBy("generatedAt", "desc"),
    limit(1)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      if (!snapshot.empty) {
        onUpdate(snapshot.docs[0].data() as StudyPlan);
      } else {
        onUpdate(null);
      }
    },
    (err) => {
      console.error("Error subscribing to study plan:", err);
    }
  );
}

/**
 * Triggers the server endpoint to generate and save a new study plan.
 */
export async function generateStudyPlan(
  roomId: string,
  userId: string,
  skill: string,
  currentLevel: string,
  targetLevel: string,
  weeklyHours: number
): Promise<StudyPlan> {
  const res = await fetch("/api/study-plan", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      roomId,
      userId,
      skill,
      currentLevel,
      targetLevel,
      weeklyHours,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to generate study plan");
  }

  return data.studyPlan as StudyPlan;
}
