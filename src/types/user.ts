export interface SkillCanTeach {
  skillName: string;
  experienceLevel: "beginner" | "intermediate" | "expert";
  yearsOfExperience: number;
}

export interface SkillWantToLearn {
  skillName: string;
  targetLevel: "beginner" | "intermediate" | "expert";
}

export interface DbUser {
  uid: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  college: string;
  degree: string;
  skillsCanTeach: SkillCanTeach[];
  skillsWantToLearn: SkillWantToLearn[];
  github: string;
  linkedin: string;
  portfolio: string;
  verificationLevel?: "Basic" | "Verified" | "Expert";
  isGithubVerified?: boolean;
  approvedSkills?: string[];
  verificationStatus?: "Pending" | "Approved" | "Rejected" | "None";
  createdAt: any; // Firebase Timestamp or ISO string
  updatedAt: any; // Firebase Timestamp or ISO string
}
