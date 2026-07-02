import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";
import { DbUser } from "@/types/user";

/**
 * Fetch a user profile from Firestore by UID
 */
export async function getUserProfile(uid: string): Promise<DbUser | null> {
  try {
    const userRef = doc(db, "Users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data() as DbUser;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
}

/**
 * Update a user profile in Firestore
 */
export async function updateUserProfile(
  uid: string,
  profileData: Partial<DbUser>
): Promise<void> {
  try {
    const userRef = doc(db, "Users", uid);
    await setDoc(
      userRef,
      {
        ...profileData,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}

/**
 * Retrieve all registered users except the current logged-in user
 */
export async function getAllUsersExcept(currentUid: string): Promise<DbUser[]> {
  try {
    const usersRef = collection(db, "Users");
    const q = query(usersRef, where("uid", "!=", currentUid));
    const querySnapshot = await getDocs(q);
    const users: DbUser[] = [];
    querySnapshot.forEach((docSnap) => {
      users.push(docSnap.data() as DbUser);
    });
    return users;
  } catch (error) {
    console.error("Error fetching other users:", error);
    return [];
  }
}

