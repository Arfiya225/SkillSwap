export interface Review {
  id: string;
  swapRequestId: string;
  learningRoomId: string;
  reviewerId: string;
  reviewedUserId: string;
  teachingRating: number;
  communicationRating: number;
  reliabilityRating: number;
  overallRating: number;
  reviewText: string;
  createdAt: any; // Firestore Timestamp
}
