export type NotificationType =
  | "swap_request"
  | "request_accepted"
  | "meeting_scheduled"
  | "task_assigned"
  | "study_plan_generated"
  | "verification_submitted"
  | "verification_approved"
  | "verification_rejected"
  | "chat_message";

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: any; // serverTimestamp / Timestamp / null
  link: string;   // Redirect URL when clicking the notification
}
