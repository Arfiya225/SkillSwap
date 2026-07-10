import { Timestamp } from "firebase/firestore";

export interface LearningTopic {
  id: string;
  roomId: string;
  learnerId: string;
  targetSkill: string;
  title: string;
  description: string;
  week: number;
  order: number;
  status: "pending" | "in-progress" | "completed";
  createdBy: string;
  completedBy?: string;
  completedAt?: Timestamp | any;
  createdAt: Timestamp | any;
}

export interface AssessmentQuestion {
  id: string;
  type: "mcq" | "short-answer" | "practical";
  question: string;
  options?: string[]; // for mcq
  correctAnswer?: string; // for mcq auto-grading
}

export interface Assessment {
  id: string;
  roomId: string;
  learnerId: string;
  targetSkill: string;
  week: number;
  generatedFrom: {
    topics: string;
    resources: string;
    notes: boolean;
    tasks: boolean;
  };
  questions: AssessmentQuestion[];
  createdAt: Timestamp | any;
}

export interface AssessmentSubmission {
  id: string;
  assessmentId: string;
  roomId: string;
  userId: string;
  answers: Record<string, string>; // questionId -> user answer
  score?: number;
  feedback?: string[];
  status?: "passed" | "failed";
  isFinal?: boolean;
  submittedAt: Timestamp | any;
}

export interface FinalAssessment {
  id: string;
  roomId: string;
  learnerId: string;
  targetSkill: string;
  questions: AssessmentQuestion[];
  passingScore: number;
  createdAt: Timestamp | any;
}

export interface PeerValidation {
  id: string;
  roomId: string;
  teacherId: string;
  studentId: string;
  status: "approved" | "rejected" | "improvement-required";
  feedback: string;
  createdAt: Timestamp | any;
}

export interface Certificate {
  id: string;
  roomId: string;
  studentId: string;
  studentName: string;
  mentorId: string;
  mentorName: string;
  skill: string;
  score: number;
  level: "Bronze" | "Silver" | "Gold";
  completionDate: Timestamp | any;
  verificationId: string;
  verificationUrl?: string;
  certificateUrl: string;
  issuedAt: Timestamp | any;
}
