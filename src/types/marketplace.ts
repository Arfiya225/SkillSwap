export interface MarketplacePost {
  id: string;
  title: string;
  description: string;
  skillOffered: string;
  skillRequested: string;
  experienceLevel: "beginner" | "intermediate" | "expert";
  availability: string;
  createdBy: string;
  createdAt: any;
  verificationBadge: "Basic" | "Verified" | "Expert";
  status: "open" | "closed";
}
