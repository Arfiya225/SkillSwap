export interface LearningRoom {
  roomId: string;
  participants: string[];
  swapRequestId: string;
  createdAt: any; // Firestore Timestamp
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
