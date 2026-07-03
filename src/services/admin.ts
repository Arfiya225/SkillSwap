import {
  collection,
  doc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { VerificationRequest } from "@/types/verification";
import { createNotification } from "./notifications";

const VERIFICATION_COLLECTION = "verificationRequests";

export function subscribeToPendingVerifications(
  onUpdate: (requests: VerificationRequest[]) => void
) {
  const colRef = collection(db, VERIFICATION_COLLECTION);
  // Sort by createdAt without where("status") to avoid missing index
  const q = query(colRef, orderBy("createdAt", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const requests: VerificationRequest[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as VerificationRequest;
        if (data.status === "Pending") {
            requests.push(data);
        }
      });
      onUpdate(requests);
    },
    (err) => {
      console.error("Error subscribing to pending verifications:", err);
    }
  );
}

export async function approveVerification(requestId: string, userId: string, adminNotes: string = ""): Promise<void> {
  const docRef = doc(db, VERIFICATION_COLLECTION, requestId);
  await updateDoc(docRef, {
    status: "Approved",
    adminNotes,
    updatedAt: new Date().toISOString(), // Mock timestamp for simplicity here
  });

  const userRef = doc(db, "Users", userId);
  await updateDoc(userRef, {
     verificationStatus: "Approved",
  });

  await createNotification(
    userId,
    "Verification Approved!",
    "Your verification request has been approved.",
    "verification_approved",
    "/profile"
  );
}

export async function rejectVerification(requestId: string, userId: string, adminNotes: string): Promise<void> {
  const docRef = doc(db, VERIFICATION_COLLECTION, requestId);
  await updateDoc(docRef, {
    status: "Rejected",
    adminNotes,
    updatedAt: new Date().toISOString(),
  });

  const userRef = doc(db, "Users", userId);
  await updateDoc(userRef, {
     verificationStatus: "Rejected",
  });

  await createNotification(
    userId,
    "Verification Rejected",
    "Your verification request was rejected. Check notes.",
    "verification_rejected",
    "/profile/verification"
  );
}
