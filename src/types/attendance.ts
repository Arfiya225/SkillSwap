export interface Attendance {
  id: string;
  roomId: string;
  userId: string;
  meetingId: string;
  durationMinutes: number;
  attendedAt: any; // Firestore Timestamp
}
