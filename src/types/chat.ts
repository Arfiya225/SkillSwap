import { Timestamp } from "firebase/firestore";

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: Timestamp | null;
}
