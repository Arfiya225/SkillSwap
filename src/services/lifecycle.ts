import { db } from "@/firebase/config";
import { 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp, 
  collection, 
  getDocs, 
  writeBatch, 
  query, 
  where, 
  deleteDoc 
} from "firebase/firestore";

/**
 * Marks the room as completed by a specific user.
 * If all participants have completed the room, it sets the overall status to 'completed'.
 * @returns true if the room is fully completed, false if waiting on others.
 */
export async function completeRoom(roomId: string, userId: string): Promise<boolean> {
  const roomRef = doc(db, "learningRooms", roomId);
  const roomSnap = await getDoc(roomRef);
  
  if (!roomSnap.exists()) {
    throw new Error("Room not found");
  }
  
  const data = roomSnap.data();
  const completionStatus = data.completionStatus || {};
  completionStatus[userId] = true;
  
  const participants = data.participants || [];
  const allCompleted = participants.every((p: string) => completionStatus[p] === true);
  
  if (allCompleted) {
    await updateDoc(roomRef, {
      completionStatus,
      status: "completed",
      completedAt: serverTimestamp()
    });
    return true; // Room is fully completed
  } else {
    await updateDoc(roomRef, {
      completionStatus
    });
    return false; // Still waiting for others
  }
}

/**
 * Archives a learning room.
 */
export async function archiveRoom(roomId: string): Promise<void> {
  const roomRef = doc(db, "learningRooms", roomId);
  await updateDoc(roomRef, {
    status: "archived",
    archivedAt: serverTimestamp()
  });
}

/**
 * Restores an archived learning room to active status.
 */
export async function restoreRoom(roomId: string): Promise<void> {
  const roomRef = doc(db, "learningRooms", roomId);
  await updateDoc(roomRef, {
    status: "active"
  });
}

/**
 * Soft deletes a learning room (User Action).
 */
export async function softDeleteRoom(roomId: string, currentUserId: string): Promise<void> {
  const roomRef = doc(db, "learningRooms", roomId);
  await updateDoc(roomRef, {
    status: "deleted",
    deletedAt: serverTimestamp(),
    deletedBy: currentUserId
  });
}

/**
 * Permanently deletes a learning room and its subcollections (Admin Cleanup).
 * Preserves verification data (certificates, finalAssessments, etc.).
 */
export async function permanentlyDeleteRoom(roomId: string): Promise<void> {
  const subcollections = ["resources", "tasks", "meetings", "notes", "activities", "messages", "whiteboards"];
  
  for (const sub of subcollections) {
    const subColRef = collection(db, "learningRooms", roomId, sub);
    const snap = await getDocs(subColRef);
    
    if (!snap.empty) {
      // Chunk into batches of 500 if necessary, but assume small sets here
      const batch = writeBatch(db);
      snap.docs.forEach((d) => {
        batch.delete(d.ref);
      });
      await batch.commit();
    }
  }

  const globalColls = ["learningTopics", "assessments"];
  for (const g of globalColls) {
    const q = query(collection(db, g), where("roomId", "==", roomId));
    const snap = await getDocs(q);
    
    if (!snap.empty) {
      const batch = writeBatch(db);
      snap.docs.forEach((d) => {
        batch.delete(d.ref);
      });
      await batch.commit();
    }
  }

  // Finally, delete the room document itself
  const roomRef = doc(db, "learningRooms", roomId);
  await deleteDoc(roomRef);
}
