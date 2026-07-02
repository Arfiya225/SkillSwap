export interface SessionSummary {
  id: string;
  roomId: string;
  generatedAt: any; // serverTimestamp / Timestamp / null
  keyLearnings: string[];
  actionItems: string[];
  homework: string[];
  nextMeetingGoals: string[];
}
