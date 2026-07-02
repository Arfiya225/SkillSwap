import { Timestamp } from "firebase/firestore";

export type ResourceType = "pdf" | "document" | "github" | "link";

export interface Resource {
  id: string;
  title: string;
  type: ResourceType;
  url: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: Timestamp | null;
}
