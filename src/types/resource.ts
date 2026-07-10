import { Timestamp } from "firebase/firestore";

export type ResourceType = "pdf" | "document" | "github" | "link";

export interface Resource {
  id: string;
  learnerId?: string; // Legacy
  targetSkill?: string; // Legacy
  assignedTo?: string; // New field
  skill?: string; // New field
  title: string;
  type: ResourceType;
  url: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: Timestamp | null;
  extractedText?: string;
  textLength?: number;
  fileName?: string;
}
