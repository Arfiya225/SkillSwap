import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import { logError } from "@/services/monitoring";

const MAKE_WEBHOOK_URL = process.env.NEXT_PUBLIC_MAKE_WEBHOOK_URL || process.env.MAKE_WEBHOOK_URL || "";

interface EmailNotificationParams {
  email: string;
  name: string;
  event: string;
  message: string;
}

export async function sendEmailNotification({
  email,
  name,
  event,
  message,
}: EmailNotificationParams): Promise<void> {
  if (!MAKE_WEBHOOK_URL) {
    console.warn("MAKE_WEBHOOK_URL is not configured.");
    return;
  }

  try {
    const logId = `${email}_${event.replace(/\s+/g, '_')}`;
    const logRef = doc(db, "emailLogs", logId);

    // Attempt deduplication
    try {
      const logSnap = await getDoc(logRef);
      if (logSnap.exists()) {
        const data = logSnap.data();
        // Check if sent within the last 5 minutes (300,000 ms)
        if (data.lastSentAt && typeof data.lastSentAt.toMillis === 'function') {
          const lastSentTime = data.lastSentAt.toMillis();
          if (Date.now() - lastSentTime < 300000) {
            console.log(`Duplicate email prevented: ${event} for ${email}`);
            return;
          }
        }
      }
      // Update log
      await setDoc(logRef, { lastSentAt: serverTimestamp() }, { merge: true });
    } catch (logErr) {
      console.warn("Could not check email duplicate logs:", logErr);
      // Proceed even if log check fails to ensure delivery
    }

    const payload = {
      email,
      name,
      event,
      message,
      timestamp: new Date().toISOString(),
    };

    fetch(MAKE_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }).catch((error) => {
      logError("emailNotifications.fetch", error, { payload });
    });
  } catch (error) {
    logError("emailNotifications.send", error, { email, event });
  }
}
console.log("MAKE_WEBHOOK_URL:", MAKE_WEBHOOK_URL);

export async function sendEmailToUser(userId: string, event: string, message: string): Promise<void> {
  try {
    const userDoc = await getDoc(doc(db, "Users", userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      const email = data.email || "";
      const name = data.name || data.displayName || "User";

      if (email) {
        // Non-blocking call
        sendEmailNotification({
          email,
          name,
          event,
          message,
        });
      }
    }
  } catch (error) {
    logError("emailNotifications.sendEmailToUser", error, { userId, event });
  }
}
