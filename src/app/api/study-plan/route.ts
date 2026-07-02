import { NextResponse } from "next/server";
import { doc, setDoc, serverTimestamp, getDoc, collection } from "firebase/firestore";
import { db } from "@/firebase/config";

export async function GET() {
  return NextResponse.json({
    keyConfigured: !!process.env.GEMINI_API_KEY,
  });
}

export async function POST(request: Request) {
  try {
    const { roomId, userId, skill, currentLevel, targetLevel, weeklyHours } = await request.json();

    if (!roomId || !userId || !skill || !currentLevel || !targetLevel || !weeklyHours) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: "GEMINI_API_KEY_MISSING",
      });
    }

    const prompt = `
Generate a structured weekly study plan for a peer skill swap.
User is learning the skill: "${skill}"
Current proficiency level: "${currentLevel}"
Target proficiency level: "${targetLevel}"
Time commitment: ${weeklyHours} hours per week

Format the output strictly as a JSON object matching this structure:
{
  "roadmap": {
    "weeks": [
      {
        "weekNumber": 1,
        "title": "Week 1 Topic Name",
        "topics": ["subtopic 1", "subtopic 2"],
        "practiceGoals": ["hands-on goal 1", "hands-on goal 2"],
        "assignments": ["short task or challenge"],
        "resources": [{"name": "Suggested Guide/Reference", "url": "https://example.com"}]
      }
    ],
    "milestones": ["Milestone 1 description", "Milestone 2 description"]
  }
}
Generate at least 4 weeks of structured roadmap details matching the target level. Return ONLY raw JSON. Do not write any description, intro, or wrap in markdown backticks.
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
    
    // Sanitize in case model returned markdown fences
    if (text.includes("```json")) {
      text = text.split("```json")[1].split("```")[0];
    } else if (text.includes("```")) {
      text = text.split("```")[1].split("```")[0];
    }

    const parsedPlan = JSON.parse(text.trim());

    // Generate studyPlan Document
    const plansColRef = doc(db, "studyPlans", `${roomId}_${userId}`);
    const planData = {
      id: `${roomId}_${userId}`,
      roomId,
      userId,
      skill,
      currentLevel,
      targetLevel,
      weeklyHours: Number(weeklyHours),
      roadmap: parsedPlan.roadmap,
      generatedAt: serverTimestamp(),
    };

    await setDoc(plansColRef, planData);

    // Notify room participants
    try {
      const roomSnap = await getDoc(doc(db, "learningRooms", roomId));
      if (roomSnap.exists()) {
        const roomData = roomSnap.data();
        const participants = roomData.participants as string[];
        
        // Write notifications directly to keep API route completely self-contained
        for (const pId of participants) {
          const notifRef = doc(collection(db, "notifications"));
          await setDoc(notifRef, {
            id: notifRef.id,
            userId: pId,
            title: "Study Plan Generated",
            message: `A new study path for learning "${skill}" has been generated in your learning room.`,
            type: "study_plan_generated",
            read: false,
            createdAt: serverTimestamp(),
            link: `/rooms/${roomId}?tab=study-plan`,
          });
        }
      }
    } catch (notifErr) {
      console.error("Error creating notifications for study plan:", notifErr);
    }

    return NextResponse.json({
      success: true,
      studyPlan: {
        ...planData,
        generatedAt: new Date().toISOString(), // Mock value for client convenience before snapshot reload
      },
    });
  } catch (error: any) {
    console.error("Error in study-plan api:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
