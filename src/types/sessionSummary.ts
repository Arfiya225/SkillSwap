export interface SessionSummary {
  id: string;
  roomId: string;
  generatedAt: any; // serverTimestamp / Timestamp / null
  keyLearnings: string[];
  actionItems: string[];
  homework: string[];
  nextMeetingGoals: string[];
  transcript?: string;
  revisionNotes?: string;
  mcqQuiz?: {
    question: string;
    options: string[];
    answer: string;
  }[];
}
