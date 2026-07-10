import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { uploadResource } from "./storage";
import { Note } from "@/types/note";
import { Resource, ResourceType } from "@/types/resource";
import { Task } from "@/types/task";
import { Activity, ActivityType } from "@/types/activity";
import { createNotification } from "./notifications";

// ==========================================
// 1. SHARED NOTES
// ==========================================

/**
 * Listens to realtime changes in the main shared note document of a learning room.
 */
export function subscribeToNotes(
  roomId: string,
  onUpdate: (note: Note | null) => void
) {
  const noteRef = doc(db, "learningRooms", roomId, "notes", "main");
  
  return onSnapshot(
    noteRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data() as Note);
      } else {
        onUpdate(null);
      }
    },
    (err) => {
      console.error("Error subscribing to notes:", err);
    }
  );
}

/**
 * Saves/updates the content of the main shared note.
 */
export async function saveNotes(
  roomId: string,
  content: string,
  userId: string,
  userName: string
): Promise<void> {
  try {
    const noteRef = doc(db, "learningRooms", roomId, "notes", "main");
    await setDoc(
      noteRef,
      {
        content,
        updatedBy: userId,
        updatedByName: userName,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error saving notes:", error);
    throw error;
  }
}

// ==========================================
// 2. RESOURCE MANAGEMENT
// ==========================================

/**
 * Listens to realtime changes in resources list.
 */
export function subscribeToResources(
  roomId: string,
  onUpdate: (resources: Resource[]) => void
) {
  const resourcesRef = collection(db, "learningRooms", roomId, "resources");
  const q = query(resourcesRef, orderBy("uploadedAt", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const resources: Resource[] = [];
      snapshot.forEach((docSnap) => {
        resources.push(docSnap.data() as Resource);
      });
      onUpdate(resources);
    },
    (err) => {
      console.error("Error subscribing to resources:", err);
    }
  );
}

/**
 * Adds a new resource link or document descriptor.
 */
export async function addResource(
  roomId: string,
  title: string,
  type: ResourceType,
  url: string,
  userId: string,
  userName: string,
  learnerId?: string,
  targetSkill?: string
): Promise<string> {
  try {
    const resourcesCol = collection(db, "learningRooms", roomId, "resources");
    const newDoc = doc(resourcesCol);
    
    const resourceData: Resource = {
      id: newDoc.id,
      learnerId,
      targetSkill,
      title: title.trim(),
      type,
      url: url.trim(),
      uploadedBy: userId,
      uploadedByName: userName,
      uploadedAt: null, // setDoc with serverTimestamp next
    };

    await setDoc(newDoc, {
      ...resourceData,
      uploadedAt: serverTimestamp(),
    });

    return newDoc.id;
  } catch (error) {
    console.error("Error adding resource:", error);
    throw error;
  }
}

/**
 * Deletes a resource document from the room subcollection.
 */
export async function deleteResource(
  roomId: string,
  resourceId: string
): Promise<void> {
  try {
    const resourceRef = doc(db, "learningRooms", roomId, "resources", resourceId);
    await deleteDoc(resourceRef);
  } catch (error) {
    console.error("Error deleting resource:", error);
    throw error;
  }
}

/**
 * Uploads a raw file (PDF or Document) to Firebase Storage and returns download URL.
 */
export async function uploadResourceFile(
  roomId: string,
  file: File
): Promise<string> {
  try {
    return await uploadResource(roomId, file);
  } catch (error) {
    console.error("Error uploading resource file:", error);
    throw error;
  }
}

// ==========================================
// 3. TASK MANAGEMENT
// ==========================================

/**
 * Listens to realtime changes in tasks list.
 */
export function subscribeToTasks(
  roomId: string,
  onUpdate: (tasks: Task[]) => void
) {
  const tasksRef = collection(db, "learningRooms", roomId, "tasks");
  const q = query(tasksRef, orderBy("createdAt", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const tasks: Task[] = [];
      snapshot.forEach((docSnap) => {
        tasks.push(docSnap.data() as Task);
      });
      onUpdate(tasks);
    },
    (err) => {
      console.error("Error subscribing to tasks:", err);
    }
  );
}

/**
 * Creates a new learning task.
 */
export async function createTask(
  roomId: string,
  title: string,
  description: string,
  assignedTo: string,
  assignedToName: string,
  createdBy: string,
  createdByName: string,
  dueDate: string
): Promise<string> {
  try {
    const tasksCol = collection(db, "learningRooms", roomId, "tasks");
    const newDoc = doc(tasksCol);

    const taskData: Task = {
      id: newDoc.id,
      title: title.trim(),
      description: description.trim(),
      assignedTo,
      assignedToName,
      createdBy,
      createdByName,
      status: "todo",
      dueDate,
      createdAt: null,
    };

    await setDoc(newDoc, {
      ...taskData,
      createdAt: serverTimestamp(),
    });

    // Notify assignee if not the creator
    if (assignedTo !== createdBy) {
      await createNotification(
        assignedTo,
        "New Task Assigned",
        `You have been assigned the task: "${title.trim()}" by ${createdByName}.`,
        "task_assigned",
        `/rooms/${roomId}?tab=tasks`
      );
    }

    return newDoc.id;
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
}

/**
 * Updates an existing task properties (e.g. status, assignee).
 */
export async function updateTask(
  roomId: string,
  taskId: string,
  updates: Partial<Omit<Task, "id" | "createdAt">>
): Promise<void> {
  try {
    const taskRef = doc(db, "learningRooms", roomId, "tasks", taskId);
    await updateDoc(taskRef, updates);

    // Notify assignee if task assignment changed
    if (updates.assignedTo) {
      await createNotification(
        updates.assignedTo,
        "Task Reassigned",
        `You have been assigned the task: "${updates.title || "Roadmap Task"}".`,
        "task_assigned",
        `/rooms/${roomId}?tab=tasks`
      );
    }
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
}

/**
 * Deletes a task.
 */
export async function deleteTask(
  roomId: string,
  taskId: string
): Promise<void> {
  try {
    const taskRef = doc(db, "learningRooms", roomId, "tasks", taskId);
    await deleteDoc(taskRef);
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
}

// ==========================================
// 4. ACTIVITY TIMELINE FEED
// ==========================================

/**
 * Listens to activities timeline events in realtime.
 */
export function subscribeToActivities(
  roomId: string,
  onUpdate: (activities: Activity[]) => void
) {
  const activitiesRef = collection(db, "learningRooms", roomId, "activities");
  const q = query(activitiesRef, orderBy("createdAt", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const activities: Activity[] = [];
      snapshot.forEach((docSnap) => {
        activities.push(docSnap.data() as Activity);
      });
      onUpdate(activities);
    },
    (err) => {
      console.error("Error subscribing to activities:", err);
    }
  );
}

/**
 * Records an activity event in the timeline logs.
 */
export async function logActivity(
  roomId: string,
  type: ActivityType,
  userId: string,
  userName: string,
  description: string,
  userAvatar?: string
): Promise<void> {
  try {
    const activitiesCol = collection(db, "learningRooms", roomId, "activities");
    const newDoc = doc(activitiesCol);

    const activityData: Activity = {
      id: newDoc.id,
      type,
      userId,
      userName,
      userAvatar,
      description: description.trim(),
      createdAt: null,
    };

    await setDoc(newDoc, {
      ...activityData,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error logging activity:", error);
  }
}
