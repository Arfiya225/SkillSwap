export type MeetingStatus = "scheduled" | "completed" | "cancelled";

export interface Meeting {
  id: string;
  roomId: string;
  title: string;
  description: string;
  hostId: string;
  participants: string[];
  meetingLink: string;
  startTime: string; // ISO String (e.g. YYYY-MM-DDTHH:MM)
  endTime: string;   // ISO String (e.g. YYYY-MM-DDTHH:MM)
  createdAt: any;    // serverTimestamp / Timestamp / null
  status: MeetingStatus;
}
