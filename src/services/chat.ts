import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { ChatMessage } from "@/types/chat";
import { createNotification } from "./notifications";

/**
 * Listens to realtime changes in room chat messages.
 */
export function subscribeToMessages(
  roomId: string,
  onUpdate: (messages: ChatMessage[]) => void
) {
  const messagesRef = collection(db, "learningRooms", roomId, "messages");
  const q = query(messagesRef, orderBy("createdAt", "asc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const messages: ChatMessage[] = [];
      snapshot.forEach((docSnap) => {
        messages.push(docSnap.data() as ChatMessage);
      });
      onUpdate(messages);
    },
    (err) => {
      console.error("Error subscribing to chat messages:", err);
    }
  );
}

/**
 * Sends a new message and notifies other participants.
 */
export async function sendMessage(
  roomId: string,
  text: string,
  senderId: string,
  senderName: string,
  otherParticipants: string[]
): Promise<string> {
  try {
    const messagesCol = collection(db, "learningRooms", roomId, "messages");
    const newDoc = doc(messagesCol);

    const messageData: ChatMessage = {
      id: newDoc.id,
      roomId,
      senderId,
      senderName,
      text: text.trim(),
      createdAt: null,
    };

    await setDoc(newDoc, {
      ...messageData,
      createdAt: serverTimestamp(),
    });

    // Notify other participants
    const notifications = otherParticipants.map((uid) =>
      createNotification(
        uid,
        `New message from ${senderName}`,
        text.length > 50 ? text.substring(0, 50) + "..." : text,
        "chat_message",
        `/rooms/${roomId}?tab=chat`
      )
    );
    await Promise.allSettled(notifications);

    return newDoc.id;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}
