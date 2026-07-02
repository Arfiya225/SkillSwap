import {
  collection,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
  getDocs,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { Notification, NotificationType } from "@/types/notification";

/**
 * Listens to active notifications for a specific user in real time.
 */
export function subscribeToNotifications(
  userId: string,
  onUpdate: (notifications: Notification[]) => void
) {
  const notificationsRef = collection(db, "notifications");
  const q = query(
    notificationsRef,
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: Notification[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Notification);
      });
      onUpdate(list);
    },
    (err) => {
      console.error("Error subscribing to notifications:", err);
    }
  );
}

/**
 * Creates and writes a new notification to Firestore.
 */
export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: NotificationType,
  link: string
): Promise<string> {
  try {
    const notificationsRef = collection(db, "notifications");
    const newDoc = doc(notificationsRef);

    const notificationData: Notification = {
      id: newDoc.id,
      userId,
      title: title.trim(),
      message: message.trim(),
      type,
      read: false,
      createdAt: null,
      link: link.trim(),
    };

    await setDoc(newDoc, {
      ...notificationData,
      createdAt: serverTimestamp(),
    });

    return newDoc.id;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

/**
 * Marks a specific notification as read.
 */
export async function markAsRead(notificationId: string): Promise<void> {
  try {
    const notificationRef = doc(db, "notifications", notificationId);
    await updateDoc(notificationRef, { read: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
}

/**
 * Marks all notifications for a specific user as read.
 */
export async function markAllAsRead(userId: string): Promise<void> {
  try {
    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("userId", "==", userId),
      where("read", "==", false)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) return;

    const batch = writeBatch(db);
    snapshot.forEach((docSnap) => {
      batch.update(docSnap.ref, { read: true });
    });

    await batch.commit();
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
}
