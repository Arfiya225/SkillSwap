import { NextResponse } from "next/server";
import { doc, setDoc, serverTimestamp, getDoc, getDocs, collection } from "firebase/firestore";
import { db } from "@/firebase/config";

export async function POST(request: Request) {
  try {
    const { roomId } = await request.json();

    if (!roomId) {
      return NextResponse.json({ error: "Missing roomId" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: "GEMINI_API_KEY_MISSING",
      });
    }

    // 1. Fetch Room Note
    const noteSnap = await getDoc(doc(db, "learningRooms", roomId, "notes", "main"));
    const notesContent = noteSnap.exists() ? noteSnap.data().content : "No notes drafted yet.";

    // 2. Fetch Tasks
    const tasksSnapshot = await getDocs(collection(db, "learningRooms", roomId, "tasks"));
    const tasks: any[] = [];
    tasksSnapshot.forEach((d) => tasks.push(d.data()));
    const tasksText = tasks.length > 0
      ? tasks.map((t) => `- [${t.status}] ${t.title}: ${t.description || "(No description)"}`).join("\n")
      : "No tasks created yet.";

    // 3. Fetch Resources
    const resourcesSnapshot = await getDocs(collection(db, "learningRooms", roomId, "resources"));
    const resources: any[] = [];
    resourcesSnapshot.forEach((d) => resources.push(d.data()));
    const resourcesText = resources.length > 0
      ? resources.map((r) => `- [${r.type}] ${r.title}: ${r.url}`).join("\n")
      : "No resources shared yet.";

    const prompt = `
You are an expert educational study assistant summarizing a collaborative learning session.
Here is the context of the learning room:

Shared Notes drafted by participants:
"${notesContent}"

Roadmap Tasks:
${tasksText}

Shared Learning Resources:
${resourcesText}

Analyze this room context and generate a session summary in JSON format.
Format the output strictly as a JSON object matching this structure:
{
  "keyLearnings": ["List 2-4 key takeaways or concepts covered in notes/discussions"],
  "actionItems": ["List 2-4 immediate action items for the participants"],
  "homework": ["List 1-2 specific practice goals or exercises to try"],
  "nextMeetingGoals": ["List 1-2 targets to achieve by the next sync session"]
}
Return ONLY raw JSON. Do not wrap in markdown code block ticks.
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API Error details:", errText);
      return NextResponse.json({ error: "Gemini API request failed" }, { status: 502 });
    }

    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Sanitize markdown blocks if present
    if (text.includes("```json")) {
      text = text.split("```json")[1].split("```")[0];
    } else if (text.includes("```")) {
      text = text.split("```")[1].split("```")[0];
    }

    const parsedSummary = JSON.parse(text.trim());

    // Generate sessionSummary Document
    const summariesCol = collection(db, "sessionSummaries");
    const newDoc = doc(summariesCol);
    const summaryData = {
      id: newDoc.id,
      roomId,
      generatedAt: serverTimestamp(),
      keyLearnings: parsedSummary.keyLearnings || [],
      actionItems: parsedSummary.actionItems || [],
      homework: parsedSummary.homework || [],
      nextMeetingGoals: parsedSummary.nextMeetingGoals || [],
    };

    await setDoc(newDoc, summaryData);

    return NextResponse.json({
      success: true,
      sessionSummary: {
        ...summaryData,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Error in session-summary api:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
