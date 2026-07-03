import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
  onSnapshot
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { Review } from "@/types/review";
import { updateReputationFromReview } from "./reputation";
import { createNotification } from "./notifications";

const REVIEWS_COLLECTION = "reviews";

export async function submitReview(
  swapRequestId: string,
  learningRoomId: string,
  reviewerId: string,
  reviewedUserId: string,
  teachingRating: number,
  communicationRating: number,
  reliabilityRating: number,
  reviewText: string
): Promise<string> {
  // Prevent duplicate reviews
  const q = query(
    collection(db, REVIEWS_COLLECTION),
    where("swapRequestId", "==", swapRequestId),
    where("reviewerId", "==", reviewerId)
  );
  
  const existingDocs = await getDocs(q);
  if (!existingDocs.empty) {
    throw new Error("You have already reviewed this user for this swap.");
  }

  const overallRating = (teachingRating + communicationRating + reliabilityRating) / 3;

  const colRef = collection(db, REVIEWS_COLLECTION);
  const newDoc = doc(colRef);
  
  const reviewData: Review = {
    id: newDoc.id,
    swapRequestId,
    learningRoomId,
    reviewerId,
    reviewedUserId,
    teachingRating,
    communicationRating,
    reliabilityRating,
    overallRating,
    reviewText,
    createdAt: null,
  };

  await setDoc(newDoc, {
    ...reviewData,
    createdAt: serverTimestamp(),
  });

  // Update reputation asynchronously
  await updateReputationFromReview(reviewedUserId, overallRating);

  // Notify the user
  await createNotification(
    reviewedUserId,
    "New Review Received",
    "Someone left you a new review for a completed swap!",
    "task_assigned", // reused generic type for MVP, or we can add new type in notifications
    `/profile`
  );

  return newDoc.id;
}

export function subscribeToUserReviews(
  userId: string,
  onUpdate: (reviews: Review[]) => void
) {
  const colRef = collection(db, REVIEWS_COLLECTION);
  const q = query(
    colRef,
    where("reviewedUserId", "==", userId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const reviews: Review[] = [];
      snapshot.forEach((docSnap) => {
        reviews.push(docSnap.data() as Review);
      });
      onUpdate(reviews);
    },
    (err) => {
      console.error("Error subscribing to user reviews:", err);
    }
  );
}

export async function hasUserReviewedSwap(
  swapRequestId: string,
  reviewerId: string
): Promise<boolean> {
  const q = query(
    collection(db, REVIEWS_COLLECTION),
    where("swapRequestId", "==", swapRequestId),
    where("reviewerId", "==", reviewerId)
  );
  const existingDocs = await getDocs(q);
  return !existingDocs.empty;
}
