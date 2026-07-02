export interface StudyPlanRoadmapWeek {
  weekNumber: number;
  title: string;
  topics: string[];
  practiceGoals: string[];
  assignments: string[];
  resources: { name: string; url: string }[];
}

export interface StudyPlanRoadmap {
  weeks: StudyPlanRoadmapWeek[];
  milestones: string[];
}

export interface StudyPlan {
  id: string;
  roomId: string;
  userId: string;
  skill: string;
  currentLevel: string;
  targetLevel: string;
  weeklyHours: number;
  roadmap: StudyPlanRoadmap;
  generatedAt: any; // serverTimestamp / Timestamp / null
}
