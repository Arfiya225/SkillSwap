import { NextResponse } from "next/server";
import { collection, addDoc, getDocs, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import mammoth from "mammoth";
import { extractPdfText } from "@/utils/pdfExtractor";
import { createNotification } from "@/services/notifications";

const generatePrompt = (learningContextText: string, roomSkill: string, isFinal: boolean) => {
  const qCounts = isFinal ? 
    "10 Multiple Choice Questions (MCQs), 10 Short Answer questions, and 5 Practical/Coding questions" : 
    "5 Multiple Choice Questions (MCQs), 3 Short Answer questions, and 1 Practical/Coding question";

  return `
Generate assessment questions strictly from the educational material provided below.

Rules:
- Every question must be answerable from the provided content.
- Do not invent topics not present.
- Do not use room metadata.
- Do not use progress statistics.
- Do not create generic questions.
- Questions must test understanding of the uploaded material.

${learningContextText}

Create:
${qCounts}

Return the response STRICTLY as a JSON object with the following structure:
{
  "questions": [
    {
      "type": "mcq",
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option B"
    },
    {
      "type": "short-answer",
      "question": "Short answer question text here?"
    },
    {
      "type": "practical",
      "question": "Practical scenario or coding question here?"
    }
  ]
}

Only return raw JSON. Do not use markdown backticks like \`\`\`json.
`;
};

export async function POST(request: Request) {
  try {
    const { roomId, learnerId, sources, isFinal } = await request.json();

    if (!roomId || !learnerId) {
      return NextResponse.json({ error: "Missing roomId or learnerId" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY_MISSING" }, { status: 500 });
    }

    const roomSnap = await getDoc(doc(db, "learningRooms", roomId));
    if (!roomSnap.exists()) return NextResponse.json({ error: "Room not found" }, { status: 404 });
    const roomData = roomSnap.data();
    
    // Support backward compatibility for legacy rooms without exchangeSkills
    let targetSkill = "Unknown Skill";
    if (roomData.exchangeSkills && roomData.exchangeSkills[learnerId]) {
      targetSkill = roomData.exchangeSkills[learnerId].learnsSkill;
    } else if (roomData.swapRequestDetails) {
      if (roomData.participants[0] === learnerId) {
         targetSkill = roomData.swapRequestDetails.requestedSkill;
      } else {
         targetSkill = roomData.swapRequestDetails.offeredSkill;
      }
    }

    let resourceContent = "";
    let notesContent = "";
    let topicsContent = "";

    // PRIORITY 1: RESOURCES
    if (sources.resources || isFinal) {
      const rSnap = await getDocs(collection(db, "learningRooms", roomId, "resources"));
      const docs = rSnap.docs.map((d) => d.data());
      for (const res of docs) {
        // Only include resources for this learner if learnerId is set, or if it's a legacy resource (no learnerId)
        if (res.learnerId && res.learnerId !== learnerId) continue;
        
        if (res.type === "pdf" && res.url) {
          try {
             const resp = await fetch(res.url);
             if (!resp.ok) {
                 console.error(`Failed to fetch PDF from ${res.url}. Status: ${resp.status}`);
                 continue;
             }
             
             const contentType = resp.headers.get("content-type") || "";
             console.log(`Parsing PDF Resource -> URL: ${res.url} | Content-Type: ${contentType}`);
             
             if (!contentType.includes("application/pdf") && !contentType.includes("application/octet-stream")) {
                 console.warn(`Warning: Resource URL ${res.url} does not have application/pdf content type. Got ${contentType}. Will attempt to parse anyway.`);
             }
             
             const buffer = await resp.arrayBuffer();
             const extractedText = await extractPdfText(buffer, res.url);
             resourceContent += `${extractedText}\n\n`;
          } catch(e) {
             console.error(`PDF extraction failed for resource ${res.title} (${res.url}):`, e);
          }
        } else if (res.type === "document" && res.url) {
          try {
             const resp = await fetch(res.url);
             const buffer = await resp.arrayBuffer();
             const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
             resourceContent += `${result.value}\n\n`;
          } catch(e) {
             console.error("DOCX parse error:", e);
          }
        } else {
           resourceContent += `${res.title}\n\n`;
        }
      }
    }

    // PRIORITY 2: SHARED NOTES
    if (sources.notes || isFinal) {
      const noteRef = doc(db, "learningRooms", roomId, "notes", "main");
      const noteSnap = await getDoc(noteRef);
      if (noteSnap.exists()) {
         notesContent = noteSnap.data().content || "";
      }
    }

    // PRIORITY 3: COMPLETED TOPICS
    if (sources.topics || isFinal) {
      const tSnap = await getDocs(collection(db, "learningTopics"));
      const topics = tSnap.docs.filter(d => 
        d.data().roomId === roomId && 
        d.data().status === "completed" &&
        (!d.data().learnerId || d.data().learnerId === learnerId) // Only topics for this learner or legacy
      ).map(d => d.data().title).join("\n");
      if (topics) {
         topicsContent = topics;
      }
    }

    const actualContentLength = resourceContent.length + notesContent.length + topicsContent.length;

    // VALIDATION LAYER
    if (actualContentLength < 500) {
       return NextResponse.json({ error: "Insufficient study material available for assessment generation." }, { status: 400 });
    }

    const learningContextText = `=================================

RESOURCE CONTENT

${resourceContent || "None"}

---------------------------------

SHARED NOTES

${notesContent || "None"}

---------------------------------

COMPLETED TOPICS

${topicsContent || "None"}

=================================`;

    const prompt = generatePrompt(learningContextText, targetSkill, !!isFinal);

    // Debugging requirements
    console.log("---- Assessment Generation Stats ----");
    console.log("Resource text length:", resourceContent.length);
    console.log("Notes text length:", notesContent.length);
    console.log("Topics text length:", topicsContent.length);
    console.log("ASSESSMENT_CONTEXT", prompt.substring(0, 500));
    console.log("-------------------------------------");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      }
    );

    if (!response.ok) {
       const err = await response.text();
       console.error("Gemini failed:", err);
       return NextResponse.json({ error: "Gemini API failed" }, { status: 500 });
    }

    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (text.includes("\`\`\`json")) {
      text = text.split("\`\`\`json")[1].split("\`\`\`")[0];
    } else if (text.includes("\`\`\`")) {
      text = text.split("\`\`\`")[1].split("\`\`\`")[0];
    }

    let parsed;
    try {
        parsed = JSON.parse(text.trim());
        if (!parsed || !Array.isArray(parsed.questions)) {
            throw new Error("Parsed JSON does not contain a valid 'questions' array.");
        }
    } catch (parseError: any) {
        console.error("Gemini JSON parse error:", parseError);
        console.error("Raw text received from Gemini:", text);
        return NextResponse.json({ error: "Failed to parse assessment format from AI response.", details: parseError.message }, { status: 500 });
    }
    
    // Add unique IDs to questions
    const questions = parsed.questions.map((q: any) => ({ ...q, id: crypto.randomUUID() }));

    // Save to Firestore
    if (isFinal) {
      const finalRef = collection(db, "finalAssessments");
      await addDoc(finalRef, {
        roomId,
        learnerId,
        targetSkill,
        questions,
        passingScore: 70,
        createdAt: serverTimestamp()
      });
    } else {
      // Get week number
      const aSnap = await getDocs(collection(db, "assessments"));
      const week = aSnap.docs.filter(d => d.data().roomId === roomId && d.data().learnerId === learnerId).length + 1;

      const aRef = collection(db, "assessments");
      await addDoc(aRef, {
        roomId,
        learnerId,
        targetSkill,
        week,
        generatedFrom: sources,
        questions,
        createdAt: serverTimestamp()
      });
    }

    // Trigger Notification for the Learner only
    try {
      await createNotification(
        learnerId,
        "Assessment Generated",
        `A new ${isFinal ? "Final " : ""}Assessment for ${targetSkill} is ready for you.`,
        "assessment_generated",
        `/rooms/${roomId}?tab=assessments`
      );
    } catch (notifyErr) {
      console.error("Failed to send assessment_generated notification:", notifyErr);
    }

    return NextResponse.json({ success: true, questions });
  } catch (error: any) {
    console.error("Assessment generation route error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
