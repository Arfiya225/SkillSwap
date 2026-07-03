import {
  collection,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { Report, ReportStatus, ReportType } from "@/types/moderation";

const REPORTS_COLLECTION = "reports";

export async function submitReport(
  reporterId: string,
  reportedEntityId: string,
  type: ReportType,
  reason: string,
  details?: string
): Promise<string> {
  const colRef = collection(db, REPORTS_COLLECTION);
  const newDoc = doc(colRef);
  
  const reportData: Report = {
    id: newDoc.id,
    reporterId,
    reportedEntityId,
    type,
    reason,
    details: details || "",
    status: "Pending",
    createdAt: null,
  };

  await setDoc(newDoc, {
    ...reportData,
    createdAt: serverTimestamp(),
  });

  return newDoc.id;
}

export async function getAllPendingReports(): Promise<Report[]> {
  const q = query(
    collection(db, REPORTS_COLLECTION),
    where("status", "==", "Pending"),
    orderBy("createdAt", "asc")
  );
  
  const snapshot = await getDocs(q);
  const reports: Report[] = [];
  snapshot.forEach((docSnap) => reports.push(docSnap.data() as Report));
  return reports;
}

export async function updateReportStatus(
  reportId: string,
  status: ReportStatus,
  notes?: string
): Promise<void> {
  const docRef = doc(db, REPORTS_COLLECTION, reportId);
  await updateDoc(docRef, {
    status,
    moderationNotes: notes || "",
    updatedAt: serverTimestamp(),
  });
}
