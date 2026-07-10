import { db } from "@/firebase/config";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";
import {
  LearningTopic,
  Assessment,
  AssessmentSubmission,
  FinalAssessment,
  PeerValidation,
  Certificate,
} from "@/types/validation";

// --- Learning Topics ---
export const subscribeToTopics = (roomId: string, cb: (topics: LearningTopic[]) => void) => {
  const q = query(
    collection(db, "learningTopics"),
    where("roomId", "==", roomId),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(q, (snap) => {
    const results = snap.docs.map((d) => ({ ...d.data(), id: d.id } as LearningTopic));
    results.sort((a, b) => {
      if (a.week !== b.week) return a.week - b.week;
      return a.order - b.order;
    });
    cb(results);
  });
};

export const addTopic = async (roomId: string, title: string, description: string, week: number, order: number, createdBy: string, learnerId: string, targetSkill: string) => {
  const ref = doc(collection(db, "learningTopics"));
  await setDoc(ref, {
    id: ref.id,
    roomId,
    learnerId,
    targetSkill,
    title,
    description,
    week,
    order,
    status: "pending",
    createdBy,
    createdAt: serverTimestamp(),
  });
};

export const editTopic = async (topicId: string, title: string, description: string, week: number, order: number) => {
  const ref = doc(db, "learningTopics", topicId);
  await updateDoc(ref, {
    title,
    description,
    week,
    order,
  });
};

export const deleteTopic = async (topicId: string) => {
  const ref = doc(db, "learningTopics", topicId);
  await import("firebase/firestore").then(m => m.deleteDoc(ref));
};

export const updateTopicStatus = async (topicId: string, status: string, userId?: string) => {
  const ref = doc(db, "learningTopics", topicId);
  const data: any = { status };
  
  if (status === "completed" && userId) {
    data.completedBy = userId;
    data.completedAt = serverTimestamp();
  }
  await updateDoc(ref, data);

  // Recalculate progress if it's completed and we have userId
  if (userId) {
    try {
      // 1. Fetch the topic to get roomId and learnerId
      const { getDoc } = await import("firebase/firestore");
      const topicSnap = await getDoc(ref);
      
      if (topicSnap.exists()) {
        const topicData = topicSnap.data();
        const roomId = topicData.roomId;
        const learnerId = topicData.learnerId || userId;
        
        if (roomId) {
          // 2. Fetch all topics for this room and learner
          const tSnap = await getDocs(query(collection(db, "learningTopics"), where("roomId", "==", roomId)));
          const allTopics = tSnap.docs.filter(d => !d.data().learnerId || d.data().learnerId === learnerId);
          
          if (allTopics.length > 0) {
            const completedTopics = allTopics.filter(d => d.data().status === "completed").length;
            // 3. Update the room's exchangeSkills progress
            const progress = Math.round((completedTopics / allTopics.length) * 100);
            
            const roomRef = doc(db, "learningRooms", roomId);
            const roomSnap = await getDoc(roomRef);
            if (roomSnap.exists()) {
              const roomData = roomSnap.data();
              if (roomData.exchangeSkills && roomData.exchangeSkills[learnerId]) {
                await updateDoc(roomRef, {
                  [`exchangeSkills.${learnerId}.progress`]: progress
                });
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("Failed to update progress:", err);
    }
  }
};

// --- Assessments ---
export const subscribeToAssessments = (roomId: string, cb: (assessments: Assessment[]) => void) => {
  const q = query(
    collection(db, "assessments"),
    where("roomId", "==", roomId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ ...d.data(), id: d.id } as Assessment)));
  });
};

export const subscribeToSubmissions = (
  roomId: string,
  userId: string,
  cb: (submissions: AssessmentSubmission[]) => void
) => {
  const q = query(
    collection(db, "assessmentSubmissions"),
    where("roomId", "==", roomId),
    where("userId", "==", userId)
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ ...d.data(), id: d.id } as AssessmentSubmission)));
  });
};

// --- Final Assessments ---
export const subscribeToFinalAssessments = (roomId: string, cb: (assessments: FinalAssessment[]) => void) => {
  const q = query(
    collection(db, "finalAssessments"),
    where("roomId", "==", roomId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ ...d.data(), id: d.id } as FinalAssessment)));
  });
};

// --- Peer Validations ---
export const subscribeToPeerValidations = (roomId: string, cb: (validations: PeerValidation[]) => void) => {
  const q = query(
    collection(db, "peerValidations"),
    where("roomId", "==", roomId)
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ ...d.data(), id: d.id } as PeerValidation)));
  });
};

export const submitPeerValidation = async (
  roomId: string,
  teacherId: string,
  studentId: string,
  status: "approved" | "rejected" | "improvement-required",
  feedback: string
) => {
  const ref = doc(collection(db, "peerValidations"));
  await setDoc(ref, {
    id: ref.id,
    roomId,
    teacherId,
    studentId,
    status,
    feedback,
    createdAt: serverTimestamp(),
  });
};

// --- Certificates ---
export const subscribeToCertificates = (roomId: string, cb: (certs: Certificate[]) => void) => {
  const q = query(
    collection(db, "certificates"),
    where("roomId", "==", roomId)
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ ...d.data(), id: d.id } as Certificate)));
  });
};

export const getCertificateByVerificationId = async (verificationId: string): Promise<Certificate | null> => {
  const q = query(collection(db, "certificates"), where("verificationId", "==", verificationId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as Certificate;
};
