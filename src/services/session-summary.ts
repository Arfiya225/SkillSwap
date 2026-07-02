import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { SessionSummary } from "@/types/sessionSummary";

/**
 * Listens to all generated session summaries for a learning room in real time.
 */
export function subscribeToSessionSummaries(
  roomId: string,
  onUpdate: (summaries: SessionSummary[]) => void
) {
  const summariesRef = collection(db, "sessionSummaries");
  const q = query(
    summariesRef,
    where("roomId", "==", roomId),
    orderBy("generatedAt", "desc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: SessionSummary[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as SessionSummary);
      });
      onUpdate(list);
    },
    (err) => {
      console.error("Error subscribing to session summaries:", err);
    }
  );
}

/**
 * Calls the server endpoint to generate a session summary from Notes, Tasks, and Resources.
 */
export async function generateSessionSummary(roomId: string): Promise<SessionSummary> {
  const res = await fetch("/api/session-summary", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ roomId }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to generate session summary");
  }

  return data.sessionSummary as SessionSummary;
}
