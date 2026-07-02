import { Timestamp } from "firebase/firestore";

export type ActivityType =
  | "note_updated"
  | "resource_uploaded"
  | "resource_deleted"
  | "task_created"
  | "task_updated"
  | "task_completed";

export interface Activity {
  id: string;
  type: ActivityType;
  userId: string;
  userName: string;
  userAvatar?: string;
  description: string;
  createdAt: Timestamp | null;
}
