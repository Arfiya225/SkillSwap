import { Timestamp } from "firebase/firestore";

export type TaskStatus = "todo" | "in_progress" | "completed";

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedToName: string;
  createdBy: string;
  createdByName: string;
  status: TaskStatus;
  dueDate: string; // YYYY-MM-DD format
  createdAt: Timestamp | null;
}
