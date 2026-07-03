export interface UserAnalytics {
  userId: string;
  totalHours: number;
  completedSwaps: number;
  completedTasks: number;
  attendedSessions: number;
  averageRating: number;
  reputationScore: number;
  streakDays: number;
  updatedAt: any;
}

export interface ActivitySummary {
  date: string; // e.g. YYYY-MM-DD
  hours: number;
  sessions: number;
}
