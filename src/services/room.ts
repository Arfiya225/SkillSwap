import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { LearningRoom, LearningRoomWithDetails } from "@/types/room";
import { getUserProfile } from "./profile";
import { SwapRequest } from "@/types/swap";

/**
 * Fetches a learning room document by ID and resolves participant profile names and avatars.
 */
export async function getLearningRoom(roomId: string): Promise<LearningRoomWithDetails | null> {
  try {
    const roomRef = doc(db, "learningRooms", roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) return null;
    
    const roomData = roomSnap.data() as LearningRoom;
    const details: LearningRoomWithDetails = { ...roomData };

    // Resolve profiles for all participants
    const profiles: Record<string, { name: string; avatar: string; email: string }> = {};
    await Promise.all(
      roomData.participants.map(async (uid) => {
        try {
          const profile = await getUserProfile(uid);
          if (profile) {
            profiles[uid] = {
              name: profile.name,
              avatar: profile.avatar,
              email: profile.email,
            };
          }
        } catch (err) {
          console.error(`Error resolving profile for participant ${uid}:`, err);
        }
      })
    );
    details.participantProfiles = profiles;

    // Resolve swap request details
    if (roomData.swapRequestId) {
      try {
        const swapRef = doc(db, "swapRequests", roomData.swapRequestId);
        const swapSnap = await getDoc(swapRef);
        if (swapSnap.exists()) {
          const swapData = swapSnap.data() as SwapRequest;
          details.swapRequestDetails = {
            offeredSkill: swapData.offeredSkill,
            requestedSkill: swapData.requestedSkill,
          };
        }
      } catch (err) {
        console.error("Error resolving swap request for room:", err);
      }
    }

    return details;
  } catch (error) {
    console.error("Error fetching learning room:", error);
    throw error;
  }
}
