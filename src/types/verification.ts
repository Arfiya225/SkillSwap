export type VerificationType = "Certificate" | "Project" | "GitHub";
export type VerificationStatus = "Pending" | "Approved" | "Rejected";

export interface VerificationRequest {
  id: string;
  userId: string;
  type: VerificationType;
  skillName?: string;
  documentUrl?: string;
  githubUsername?: string;
  status: VerificationStatus;
  adminNotes?: string;
  createdAt: any;
  updatedAt?: any;
}
