import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { Attendance } from "@/types/attendance";
import { updateAnalyticsForAttendance } from "./analytics";

const ATTENDANCE_COLLECTION = "attendance";

export async function logAttendance(
  roomId: string,
  userId: string,
  meetingId: string,
  durationMinutes: number
): Promise<string> {
  const colRef = collection(db, ATTENDANCE_COLLECTION);
  const newDoc = doc(colRef);
  
  const attendanceData: Attendance = {
    id: newDoc.id,
    roomId,
    userId,
    meetingId,
    durationMinutes,
    attendedAt: null,
  };

  await setDoc(newDoc, {
    ...attendanceData,
    attendedAt: serverTimestamp(),
  });

  // Update analytics
  await updateAnalyticsForAttendance(userId, durationMinutes);

  return newDoc.id;
}

export async function getUserAttendanceHistory(userId: string): Promise<Attendance[]> {
  const q = query(
    collection(db, ATTENDANCE_COLLECTION),
    where("userId", "==", userId),
    orderBy("attendedAt", "desc")
  );
  
  const snapshot = await getDocs(q);
  const history: Attendance[] = [];
  snapshot.forEach(docSnap => history.push(docSnap.data() as Attendance));
  
  return history;
}
