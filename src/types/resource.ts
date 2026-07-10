import { Timestamp } from "firebase/firestore";

export type ResourceType = "pdf" | "document" | "github" | "link";

export interface Resource {
  id: string;
  learnerId?: string; // Optional for backward compatibility with older resources
  targetSkill?: string; // Optional for backward compatibility
  title: string;
  type: ResourceType;
  url: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: Timestamp | null;
}
