import { Timestamp } from "firebase/firestore";

export interface Note {
  content: string;
  updatedBy: string;
  updatedByName: string;
  updatedAt: Timestamp | null;
}
