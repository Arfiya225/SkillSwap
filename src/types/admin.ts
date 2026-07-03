export type UserStatus = "Active" | "Suspended" | "Banned";

export interface AdminAnalytics {
  id: string; // usually a singleton like "global"
  totalUsers: number;
  activeUsers: number;
  totalSwaps: number;
  completedSwaps: number;
  totalLearningRooms: number;
  totalMarketplaceListings: number;
  totalVerificationRequests: number;
  totalReviewsSubmitted: number;
  updatedAt: any;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatar?: string;
  score: number; // can be reputation, learning hours, etc.
  rank: number;
}
