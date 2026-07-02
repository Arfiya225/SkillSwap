import {
  collection,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  getDoc,
  runTransaction,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { SwapRequest, SwapRequestWithProfiles } from "@/types/swap";
import { getUserProfile } from "./profile";

/**
 * Send a new swap request from one user to another.
 */
export async function sendSwapRequest(
  senderId: string,
  receiverId: string,
  offeredSkill: string,
  requestedSkill: string,
  message: string
): Promise<void> {
  try {
    const swapRef = collection(db, "swapRequests");
    const newDocRef = doc(swapRef); // Pre-generate ID
    
    const requestData: SwapRequest = {
      id: newDocRef.id,
      senderId,
      receiverId,
      offeredSkill,
      requestedSkill,
      message: message.trim(),
      status: "pending",
      createdAt: serverTimestamp(),
    };
    
    await setDoc(newDocRef, requestData);
  } catch (error) {
    console.error("Error sending swap request:", error);
    throw error;
  }
}

/**
 * Updates a swap request's status.
 * If status is accepted, automatically sets up a learning room inside a Firestore transaction.
 */
export async function updateSwapRequestStatus(
  requestId: string,
  status: "accepted" | "rejected" | "cancelled"
): Promise<string | null> {
  try {
    const swapRequestRef = doc(db, "swapRequests", requestId);
    let createdRoomId: string | null = null;

    await runTransaction(db, async (transaction) => {
      const swapDoc = await transaction.get(swapRequestRef);
      if (!swapDoc.exists()) {
        throw new Error("Swap request does not exist");
      }

      const swapData = swapDoc.data() as SwapRequest;
      if (swapData.status !== "pending") {
        throw new Error(`Swap request is already ${swapData.status}`);
      }

      // 1. Update swap request status
      transaction.update(swapRequestRef, { status });

      // 2. If status is accepted, create a learning room doc
      if (status === "accepted") {
        const roomColRef = collection(db, "learningRooms");
        const roomDocRef = doc(roomColRef);
        createdRoomId = roomDocRef.id;

        transaction.set(roomDocRef, {
          roomId: createdRoomId,
          participants: [swapData.senderId, swapData.receiverId],
          swapRequestId: requestId,
          createdAt: serverTimestamp(),
        });
      }
    });

    return createdRoomId;
  } catch (error) {
    console.error(`Error updating swap request status to ${status}:`, error);
    throw error;
  }
}

/**
 * Listens to incoming swap requests for a user in real-time.
 */
export function subscribeToIncomingRequests(
  userId: string,
  onUpdate: (requests: SwapRequestWithProfiles[]) => void
) {
  const q = query(
    collection(db, "swapRequests"),
    where("receiverId", "==", userId)
  );

  return onSnapshot(q, async (snapshot) => {
    const requests: SwapRequest[] = [];
    snapshot.forEach((docSnap) => {
      requests.push(docSnap.data() as SwapRequest);
    });

    // Fetch sender profile details for each request
    const requestWithProfiles: SwapRequestWithProfiles[] = await Promise.all(
      requests.map(async (req) => {
        try {
          const profile = await getUserProfile(req.senderId);
          return {
            ...req,
            senderProfile: profile
              ? { name: profile.name, avatar: profile.avatar, email: profile.email }
              : undefined,
          };
        } catch {
          return req;
        }
      })
    );

    // Sort requests by creation date descending
    requestWithProfiles.sort((a, b) => {
      const dateA = a.createdAt?.seconds || 0;
      const dateB = b.createdAt?.seconds || 0;
      return dateB - dateA;
    });

    onUpdate(requestWithProfiles);
  });
}

/**
 * Listens to outgoing swap requests made by a user in real-time.
 */
export function subscribeToOutgoingRequests(
  userId: string,
  onUpdate: (requests: SwapRequestWithProfiles[]) => void
) {
  const q = query(
    collection(db, "swapRequests"),
    where("senderId", "==", userId)
  );

  return onSnapshot(q, async (snapshot) => {
    const requests: SwapRequest[] = [];
    snapshot.forEach((docSnap) => {
      requests.push(docSnap.data() as SwapRequest);
    });

    // Fetch receiver profile details for each request
    const requestWithProfiles: SwapRequestWithProfiles[] = await Promise.all(
      requests.map(async (req) => {
        try {
          const profile = await getUserProfile(req.receiverId);
          return {
            ...req,
            receiverProfile: profile
              ? { name: profile.name, avatar: profile.avatar, email: profile.email }
              : undefined,
          };
        } catch {
          return req;
        }
      })
    );

    // Sort requests by creation date descending
    requestWithProfiles.sort((a, b) => {
      const dateA = a.createdAt?.seconds || 0;
      const dateB = b.createdAt?.seconds || 0;
      return dateB - dateA;
    });

    onUpdate(requestWithProfiles);
  });
}
