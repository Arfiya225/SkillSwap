import { db } from "@/firebase/config";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  limit,
} from "firebase/firestore";
import { WhiteboardData, Stroke } from "@/types/whiteboard";

export const subscribeToWhiteboard = (
  roomId: string,
  onUpdate: (data: WhiteboardData | null) => void
) => {
  const whiteboardsRef = collection(db, "whiteboards");
  const q = query(whiteboardsRef, where("roomId", "==", roomId), limit(1));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate(null);
        return;
      }
      
      const docData = snapshot.docs[0];
      const data = docData.data() as WhiteboardData;
      data.id = docData.id;
      onUpdate(data);
    },
    (error) => {
      console.error("Error subscribing to whiteboard:", error);
      onUpdate(null);
    }
  );

  return unsubscribe;
};

export const saveWhiteboardStrokes = async (
  roomId: string,
  strokes: Stroke[],
  userId: string
) => {
  const whiteboardsRef = collection(db, "whiteboards");
  const q = query(whiteboardsRef, where("roomId", "==", roomId), limit(1));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    // Create new whiteboard document
    const newDocRef = doc(whiteboardsRef);
    await setDoc(newDocRef, {
      roomId,
      strokes,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });
  } else {
    // Update existing whiteboard document
    const existingDocRef = doc(db, "whiteboards", snapshot.docs[0].id);
    await setDoc(
      existingDocRef,
      {
        roomId,
        strokes,
        updatedAt: serverTimestamp(),
        updatedBy: userId,
      },
      { merge: true }
    );
  }
};
