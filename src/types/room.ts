export interface LearningRoom {
  roomId: string;
  participants: string[];
  swapRequestId: string;
  createdAt: any; // Firestore Timestamp
  
  // Lifecycle Management
  status?: "active" | "completed" | "archived" | "deleted";
  completedAt?: any;
  archivedAt?: any;
  deletedAt?: any;
  deletedBy?: string;
  completionStatus?: {
    [userId: string]: boolean;
  };
  createdBy?: string;
  lastActivityAt?: any;
  
  stats?: {
    topicsCompleted: number;
    assessmentsPassed: number;
    certificatesIssued: number;
    resourcesShared: number;
  };

  exchangeSkills?: {
    [userId: string]: {
      teachesSkill: string;
      learnsSkill: string;
      progress: number;
      assessmentPassed: boolean;
      certificateIssued: boolean;
    };
  };
}

export interface LearningRoomWithDetails extends LearningRoom {
  participantProfiles?: {
    [uid: string]: {
      name: string;
      avatar: string;
      email: string;
    };
  };
  swapRequestDetails?: {
    offeredSkill: string;
    requestedSkill: string;
  };
}
