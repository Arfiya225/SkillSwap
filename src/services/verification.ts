import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { VerificationRequest, VerificationStatus } from "@/types/verification";
import { createNotification } from "./notifications";

const VERIFICATION_COLLECTION = "verificationRequests";

export async function submitVerificationRequest(
  request: Omit<VerificationRequest, "id" | "status" | "createdAt" | "updatedAt">
): Promise<string> {
  const colRef = collection(db, VERIFICATION_COLLECTION);
  const newDoc = doc(colRef);
  
  const reqData: VerificationRequest = {
    ...request,
    id: newDoc.id,
    status: "Pending",
    createdAt: null,
  };

  await setDoc(newDoc, {
    ...reqData,
    createdAt: serverTimestamp(),
  });

  // Notify user
  await createNotification(
    request.userId,
    "Verification Submitted",
    "Your verification request has been submitted and is under review.",
    "verification_submitted",
    "/profile/verification"
  );

  return newDoc.id;
}

export function subscribeToUserVerifications(
  userId: string,
  onUpdate: (requests: VerificationRequest[]) => void
) {
  const colRef = collection(db, VERIFICATION_COLLECTION);
  const q = query(colRef, where("userId", "==", userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const requests: VerificationRequest[] = [];
      snapshot.forEach((docSnap) => {
        requests.push(docSnap.data() as VerificationRequest);
      });
      // Sort in memory by createdAt descending since we can't composite index right now easily
      requests.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      });
      onUpdate(requests);
    },
    (err) => {
      console.error("Error subscribing to user verifications:", err);
    }
  );
}

export async function getAllPendingVerifications(): Promise<VerificationRequest[]> {
  const colRef = collection(db, VERIFICATION_COLLECTION);
  const q = query(colRef, where("status", "==", "Pending"));
  const snapshot = await getDocs(q);
  
  const requests: VerificationRequest[] = [];
  snapshot.forEach((docSnap) => {
    requests.push(docSnap.data() as VerificationRequest);
  });
  
  requests.sort((a, b) => {
    const timeA = a.createdAt?.toMillis?.() || 0;
    const timeB = b.createdAt?.toMillis?.() || 0;
    return timeB - timeA;
  });
  
  return requests;
}

export async function updateVerificationStatus(
  requestId: string,
  userId: string,
  status: VerificationStatus,
  adminNotes?: string
): Promise<void> {
  const docRef = doc(db, VERIFICATION_COLLECTION, requestId);
  
  await updateDoc(docRef, {
    status,
    adminNotes: adminNotes || "",
    updatedAt: serverTimestamp(),
  });

  const title = status === "Approved" ? "Verification Approved" : "Verification Rejected";
  const message = status === "Approved" 
    ? "Your verification request has been approved! You now have a verified badge."
    : `Your verification request was rejected. ${adminNotes ? "Note: " + adminNotes : ""}`;
  const type = status === "Approved" ? "verification_approved" : "verification_rejected";

  await createNotification(userId, title, message, type, "/profile/verification");
}
