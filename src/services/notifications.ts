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
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import { app, db } from "@/firebase/config";
import { AppNotification, NotificationType } from "@/types/notification";
import { sendEmailToUser } from "./emailNotifications";

/**
 * Listens to active notifications for a specific user in real time.
 */
export function subscribeToNotifications(
  userId: string,
  onUpdate: (notifications: AppNotification[]) => void
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
      const list: AppNotification[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as AppNotification);
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

    const notificationData: AppNotification = {
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

    const emailEvents = [
      "swap_request",
      "request_accepted",
      "meeting_scheduled",
      "chat_message",
      "verification_approved",
      "verification_rejected",
      "room_created",
      "assessment_generated",
      "assessment_passed",
      "certificate_issued"
    ];

    if (emailEvents.includes(type)) {
      let eventName: string = type;
      switch(type) {
        case "swap_request": eventName = "Swap Request Sent"; break;
        case "request_accepted": eventName = "Swap Request Accepted"; break;
        case "meeting_scheduled": eventName = "Meeting Scheduled"; break;
        case "chat_message": eventName = "Chat Message Received"; break;
        case "verification_approved": eventName = "Verification Approved"; break;
        case "verification_rejected": eventName = "Verification Rejected"; break;
        case "room_created": eventName = "Learning Room Created"; break;
        case "assessment_generated": eventName = "Assessment Generated"; break;
        case "assessment_passed": eventName = "Assessment Passed"; break;
        case "certificate_issued": eventName = "Certificate Issued"; break;
      }
      
      // Await the email dispatch to prevent serverless isolate from dropping the floating promise
      await sendEmailToUser(userId, eventName, message).catch(console.error);
    }

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

/**
 * Initializes FCM and requests browser push notification permissions.
 */
export async function requestNotificationPermission(userId: string): Promise<void> {
  try {
    const supported = await isSupported();
    if (!supported) {
      console.log("FCM is not supported in this browser.");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const messaging = getMessaging(app);
      
      // Use the VAPID key from environment variables
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_KEY || "PLACEHOLDER_VAPID_KEY";
      
      const currentToken = await getToken(messaging, { vapidKey });
      
      if (currentToken) {
        // Save token to user document
        const userRef = doc(db, "Users", userId);
        await updateDoc(userRef, { fcmToken: currentToken });
        
        // Listen to foreground messages
        onMessage(messaging, (payload) => {
          console.log("Foreground message received:", payload);
          // In a real app, you might trigger a toast here if not using the Firestore listener
        });
      }
    }
  } catch (error) {
    console.error("Error requesting FCM permission:", error);
  }
}
