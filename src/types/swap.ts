export interface SwapRequest {
  id: string;
  senderId: string;
  receiverId: string;
  offeredSkill: string;
  requestedSkill: string;
  message: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  createdAt: any; // Firestore Timestamp or Date
}

// Extends SwapRequest with associated profile information for UI display
export interface SwapRequestWithProfiles extends SwapRequest {
  senderProfile?: {
    name: string;
    avatar: string;
    email: string;
  };
  receiverProfile?: {
    name: string;
    avatar: string;
    email: string;
  };
}
