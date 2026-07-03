export type ReputationBadge = 
  | "New Member" 
  | "Trusted Learner" 
  | "Top Teacher" 
  | "Expert Mentor";

export interface Reputation {
  userId: string;
  score: number;
  badges: ReputationBadge[];
  totalReviews: number;
  averageRating: number;
  updatedAt: any;
}
