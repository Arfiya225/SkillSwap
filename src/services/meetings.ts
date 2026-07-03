import {
  collection,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { Meeting } from "@/types/meeting";
import { activeMeetingProvider } from "./meeting-provider";
import { createNotification } from "./notifications";

/**
 * Listens to meetings scheduled for a specific learning room in real time.
 */
export function subscribeToMeetings(
  roomId: string,
  onUpdate: (meetings: Meeting[]) => void
) {
  const meetingsRef = collection(db, "meetings");
  const q = query(
    meetingsRef,
    where("roomId", "==", roomId),
    orderBy("startTime", "asc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: Meeting[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Meeting);
      });
      onUpdate(list);
    },
    (err) => {
      console.error("Error subscribing to meetings:", err);
    }
  );
}

/**
 * Schedules a new meeting, generates links, and notifies participants.
 */
export async function scheduleMeeting(
  roomId: string,
  title: string,
  description: string,
  hostId: string,
  participants: string[],
  startTime: string,
  endTime: string
): Promise<string> {
  try {
    const meetingsRef = collection(db, "meetings");
    const newDoc = doc(meetingsRef);

    const meetingLink = await activeMeetingProvider.createMeeting(
      roomId,
      title,
      description,
      startTime,
      endTime
    );

    const meetingData: Meeting = {
      id: newDoc.id,
      roomId,
      title: title.trim(),
      description: description.trim(),
      hostId,
      participants,
      meetingLink,
      startTime,
      endTime,
      createdAt: null,
      status: "scheduled",
    };

    await setDoc(newDoc, {
      ...meetingData,
      createdAt: serverTimestamp(),
    });

    // Notify other participants
    for (const userId of participants) {
      if (userId !== hostId) {
        await createNotification(
          userId,
          "New Meeting Scheduled",
          `A new learning session "${title.trim()}" has been scheduled for ${new Date(startTime).toLocaleString()}`,
          "meeting_scheduled",
          `/rooms/${roomId}?tab=meetings`
        );
      }
    }

    return newDoc.id;
  } catch (error) {
    console.error("Error scheduling meeting:", error);
    throw error;
  }
}

/**
 * Updates details of an existing meeting.
 */
export async function updateMeeting(
  roomId: string,
  meetingId: string,
  updates: Partial<Omit<Meeting, "id" | "roomId" | "createdAt">>
): Promise<void> {
  try {
    const meetingRef = doc(db, "meetings", meetingId);
    
    if (updates.startTime || updates.endTime) {
      // Let provider update if it needs to
      await activeMeetingProvider.updateMeeting(
        roomId,
        meetingId,
        updates.title || "",
        updates.description || "",
        updates.startTime || "",
        updates.endTime || ""
      );
    }

    await updateDoc(meetingRef, updates);
  } catch (error) {
    console.error("Error updating meeting:", error);
    throw error;
  }
}

/**
 * Cancels a scheduled meeting.
 */
export async function cancelMeeting(roomId: string, meetingId: string): Promise<void> {
  try {
    const meetingRef = doc(db, "meetings", meetingId);
    await updateDoc(meetingRef, { status: "cancelled" });
    await activeMeetingProvider.cancelMeeting(meetingId);
  } catch (error) {
    console.error("Error cancelling meeting:", error);
    throw error;
  }
}
