import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { MarketplacePost } from "@/types/marketplace";
import { sendSwapRequest } from "./swap";

const MARKETPLACE_COLLECTION = "marketplacePosts";

export async function createMarketplacePost(
  post: Omit<MarketplacePost, "id" | "createdAt" | "status">
): Promise<string> {
  const colRef = collection(db, MARKETPLACE_COLLECTION);
  const newDoc = doc(colRef);
  
  const postData: MarketplacePost = {
    ...post,
    id: newDoc.id,
    createdAt: null,
    status: "open",
  };

  await setDoc(newDoc, {
    ...postData,
    createdAt: serverTimestamp(),
  });

  return newDoc.id;
}

export async function updateMarketplacePost(
  postId: string,
  updates: Partial<Omit<MarketplacePost, "id" | "createdAt" | "createdBy">>
): Promise<void> {
  const docRef = doc(db, MARKETPLACE_COLLECTION, postId);
  await updateDoc(docRef, updates);
}

export async function deleteMarketplacePost(postId: string): Promise<void> {
  const docRef = doc(db, MARKETPLACE_COLLECTION, postId);
  await deleteDoc(docRef);
}

export function subscribeToMarketplaceFeed(
  onUpdate: (posts: MarketplacePost[]) => void
) {
  const colRef = collection(db, MARKETPLACE_COLLECTION);
  const q = query(colRef, orderBy("createdAt", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const posts: MarketplacePost[] = [];
      snapshot.forEach((docSnap) => {
        posts.push(docSnap.data() as MarketplacePost);
      });
      onUpdate(posts);
    },
    (err) => {
      console.error("Error subscribing to marketplace feed:", err);
    }
  );
}

export async function applyForExchange(
  postId: string,
  applicantId: string,
  creatorId: string,
  skillOffered: string,
  skillRequested: string,
  message: string
): Promise<void> {
  // Uses existing swap request system
  await sendSwapRequest(
    applicantId,
    creatorId,
    skillOffered,
    skillRequested,
    `[Marketplace Application] ${message}`
  );
}
