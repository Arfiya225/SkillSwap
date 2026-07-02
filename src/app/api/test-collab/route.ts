import { NextResponse } from "next/server";
import { doc, setDoc, deleteDoc, getDoc, collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/firebase/config";
import { saveNotes } from "@/services/collaboration";
import { addResource, deleteResource } from "@/services/collaboration";
import { createTask, updateTask, deleteTask } from "@/services/collaboration";
import { logActivity } from "@/services/collaboration";
import { getLearningRoom } from "@/services/room";

export async function GET() {
  const log: string[] = [];
  const testRoomId = "test_room_gamma";
  const user1 = { uid: "test_user_collab_1", name: "Test Partner 1", avatar: "" };
  const user2 = { uid: "test_user_collab_2", name: "Test Partner 2", avatar: "" };

  try {
    log.push("Starting Phase 2A Collaboration Integration Tests...");

    // 1. Setup mock room
    log.push(`Creating mock learning room: "${testRoomId}"...`);
    await setDoc(doc(db, "learningRooms", testRoomId), {
      roomId: testRoomId,
      participants: [user1.uid, user2.uid],
      swapRequestId: "test_swap_id",
      createdAt: new Date(),
    });
    // Create corresponding user profile references
    await setDoc(doc(db, "Users", user1.uid), {
      uid: user1.uid,
      name: user1.name,
      email: "partner1@test.com",
      avatar: user1.avatar,
      skillsCanTeach: [],
      skillsWantToLearn: [],
    });
    await setDoc(doc(db, "Users", user2.uid), {
      uid: user2.uid,
      name: user2.name,
      email: "partner2@test.com",
      avatar: user2.avatar,
      skillsCanTeach: [],
      skillsWantToLearn: [],
    });
    log.push("Mock room and profiles initialized.");

    // 2. Test Shared Notes
    log.push("Testing Shared Notes save notes...");
    const noteText = "Collaborative note iteration 1";
    await saveNotes(testRoomId, noteText, user1.uid, user1.name);

    // Verify note document structure in Firestore
    const noteSnap = await getDoc(doc(db, "learningRooms", testRoomId, "notes", "main"));
    if (!noteSnap.exists()) throw new Error("Note main document not found");
    const noteData = noteSnap.data();
    log.push(`Note main doc: content = "${noteData.content}", updatedBy = "${noteData.updatedBy}"`);
    if (noteData.content !== noteText || noteData.updatedBy !== user1.uid || noteData.updatedByName !== user1.name) {
      throw new Error("Notes document data mismatch");
    }
    log.push("✅ VERIFIED: Shared Notes saves correctly to subcollection.");

    // 3. Test Resources
    log.push("Testing Resource Management add resource...");
    const resId = await addResource(testRoomId, "NextJS 15 Doc", "link", "https://nextjs.org", user1.uid, user1.name);
    log.push(`Resource added with ID: "${resId}"`);

    // Verify resource doc exists
    const resSnap = await getDoc(doc(db, "learningRooms", testRoomId, "resources", resId));
    if (!resSnap.exists()) throw new Error("Resource document not found");
    const resData = resSnap.data();
    log.push(`Resource doc: title = "${resData.title}", type = "${resData.type}", url = "${resData.url}"`);
    if (resData.title !== "NextJS 15 Doc" || resData.type !== "link" || resData.url !== "https://nextjs.org") {
      throw new Error("Resource document content mismatch");
    }
    log.push("✅ VERIFIED: Resource created in resources subcollection.");

    // 4. Test Tasks
    log.push("Testing Task Management task creation...");
    const taskId = await createTask(
      testRoomId,
      "React Hooks Practice",
      "Solve react homework challenges",
      user2.uid,
      user2.name,
      user1.uid,
      user1.name,
      "2026-07-10"
    );
    log.push(`Task created with ID: "${taskId}"`);

    // Verify task doc exists
    const taskSnap = await getDoc(doc(db, "learningRooms", testRoomId, "tasks", taskId));
    if (!taskSnap.exists()) throw new Error("Task document not found");
    const taskData = taskSnap.data();
    log.push(`Task doc: title = "${taskData.title}", status = "${taskData.status}", assignedTo = "${taskData.assignedTo}"`);
    if (taskData.title !== "React Hooks Practice" || taskData.status !== "todo" || taskData.assignedTo !== user2.uid) {
      throw new Error("Task document content mismatch");
    }

    // Update task status to completed
    log.push("Updating task status to completed...");
    await updateTask(testRoomId, taskId, { status: "completed" });
    const taskSnap2 = await getDoc(doc(db, "learningRooms", testRoomId, "tasks", taskId));
    const taskData2 = taskSnap2.data();
    log.push(`Updated task status: "${taskData2?.status}"`);
    if (taskData2?.status !== "completed") {
      throw new Error("Task status was not updated successfully");
    }
    log.push("✅ VERIFIED: Task created and status updated successfully.");

    // 5. Test Progress Tracking calculations
    log.push("Testing progress calculations...");
    const tasksCol = collection(db, "learningRooms", testRoomId, "tasks");
    const tasksSnapshot = await getDocs(tasksCol);
    const tasksList: any[] = [];
    tasksSnapshot.forEach(d => tasksList.push(d.data()));
    
    const total = tasksList.length;
    const completed = tasksList.filter(t => t.status === "completed").length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    log.push(`Derived Progress: Total = ${total}, Completed = ${completed}, Percentage = ${pct}%`);
    if (pct !== 100) {
      throw new Error(`Expected progress percentage 100%, got: ${pct}%`);
    }
    log.push("✅ VERIFIED: Progress tracking metrics correctly computed.");

    // 6. Test Activity timeline logging
    log.push("Testing Activity Feed logging...");
    await logActivity(testRoomId, "note_updated", user1.uid, user1.name, "updated note main", user1.avatar);
    await logActivity(testRoomId, "task_completed", user2.uid, user2.name, "completed target task", user2.avatar);

    const activitiesCol = collection(db, "learningRooms", testRoomId, "activities");
    const actSnapshot = await getDocs(activitiesCol);
    const actList: any[] = [];
    actSnapshot.forEach(d => actList.push(d.data()));
    log.push(`Activities Count in subcollection: ${actList.length}`);
    if (actList.length < 2) {
      throw new Error("Expected at least 2 logged activities");
    }
    log.push("✅ VERIFIED: Activities timeline records events correctly.");

    // 7. Verify room details resolution
    log.push("Verifying getLearningRoom resolver functionality...");
    const roomDetails = await getLearningRoom(testRoomId);
    if (!roomDetails) throw new Error("getLearningRoom returned null");
    log.push(`getLearningRoom details: name 1 = "${roomDetails.participantProfiles?.[user1.uid]?.name}"`);
    if (roomDetails.participantProfiles?.[user1.uid]?.name !== user1.name) {
      throw new Error("getLearningRoom could not resolve participant profile names");
    }
    log.push("✅ VERIFIED: Room details and participants details resolve correctly.");

    // Clean up created testing artifacts
    log.push("Cleaning up all test documents...");
    await deleteDoc(doc(db, "learningRooms", testRoomId, "notes", "main"));
    await deleteDoc(doc(db, "learningRooms", testRoomId, "resources", resId));
    await deleteDoc(doc(db, "learningRooms", testRoomId, "tasks", taskId));
    
    // Clear subcollections query list
    for (const act of actList) {
      await deleteDoc(doc(db, "learningRooms", testRoomId, "activities", act.id));
    }
    
    await deleteDoc(doc(db, "learningRooms", testRoomId));
    await deleteDoc(doc(db, "Users", user1.uid));
    await deleteDoc(doc(db, "Users", user2.uid));
    log.push("Cleanup complete.");

    return NextResponse.json({
      success: true,
      log,
    });
  } catch (error: any) {
    // Attempt cleanup on error
    try {
      await deleteDoc(doc(db, "learningRooms", testRoomId, "notes", "main"));
      await deleteDoc(doc(db, "learningRooms", testRoomId));
      await deleteDoc(doc(db, "Users", user1.uid));
      await deleteDoc(doc(db, "Users", user2.uid));
    } catch {}
    return NextResponse.json({
      success: false,
      error: error.message || error,
      log,
    });
  }
}
