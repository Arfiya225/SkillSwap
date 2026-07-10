import { NextResponse } from "next/server";
import { collection, addDoc, getDocs, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
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
      console.error("---- 400 ERROR: Missing roomId or learnerId ----");
      console.error("roomId:", roomId);
      console.error("learnerId:", learnerId);
      console.error("isFinal:", isFinal);
      console.error("-------------------------------------------------");
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

    // Diagnostics
    let totalTopicsFound = 0;
    let completedTopicsFound = 0;
    let totalResourcesFound = 0;
    const resourceDiagnostics: any[] = [];

    // PRIORITY 1: RESOURCES
    if (sources.resources || isFinal) {
      const rSnap = await getDocs(collection(db, "learningRooms", roomId, "resources"));
      const docs = rSnap.docs.map((d) => ({ ...d.data(), docId: d.id } as any));
      totalResourcesFound = docs.length;

      for (const res of docs) {
        resourceDiagnostics.push({
          id: res.id || res.docId,
          title: res.title,
          assignedTo: res.assignedTo,
          learnerId: res.learnerId,
          targetSkill: res.targetSkill,
          skill: res.skill,
          type: res.type,
          url: res.url
        });

        // Filter: Must belong to current learner
        const owner = res.assignedTo || res.learnerId;
        if (owner && owner !== learnerId) continue;
        
        if (res.extractedText) {
          console.log(`Using pre-extracted text for: ${res.title} | Length: ${res.extractedText.length}`);
          resourceContent += `${res.extractedText}\n\n`;
        } else if (res.type === "pdf" && res.url) {
          try {
             console.log(`Attempting PDF extraction for ${res.title}...`);
             const extracted = await extractPdfText(res.url);
             resourceContent += `${extracted.text}\n\n`;
             
             const docIdToUpdate = res.id || res.docId;
             if (docIdToUpdate) {
               const resDocRef = doc(db, "learningRooms", roomId, "resources", docIdToUpdate);
               await updateDoc(resDocRef, {
                   extractedText: extracted.text,
                   textLength: extracted.textLength
               });
               console.log(`Saved extracted text to Firestore for ${res.title}`);
             }
          } catch(e) {
             console.error(`Legacy PDF extraction failed for ${res.title}:`, e);
          }
        } else if (res.type === "document" && res.url) {
          try {
             const resp = await fetch(res.url);
             if (resp.ok) {
                 const buffer = await resp.arrayBuffer();
                 const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
                 resourceContent += `${result.value}\n\n`;
                 
                 const docIdToUpdate = res.id || res.docId;
                 if (docIdToUpdate) {
                   const resDocRef = doc(db, "learningRooms", roomId, "resources", docIdToUpdate);
                   await updateDoc(resDocRef, {
                       extractedText: result.value,
                       textLength: result.value.length
                   });
                   console.log(`Saved extracted document text to Firestore for ${res.title}`);
                 }
             }
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
      const allRoomTopics = tSnap.docs.filter(d => d.data().roomId === roomId);
      totalTopicsFound = allRoomTopics.length;

      const completedTopics = allRoomTopics.filter(d => 
        d.data().status === "completed" &&
        (!d.data().learnerId || d.data().learnerId === learnerId) // Only topics for this learner
      );
      
      completedTopicsFound = completedTopics.length;
      
      const topicsText = completedTopics.map(d => d.data().title).join("\n");
      if (topicsText) {
         topicsContent = topicsText;
      }
    }

    const actualContentLength = resourceContent.length + notesContent.length + topicsContent.length;

    // Output all diagnostics requested by user
    console.log("---- Assessment Generation Diagnostics ----");
    console.log("Current User (learnerId):", learnerId);
    console.log("Learning Skill:", targetSkill);
    console.log("Total Topics Found:", totalTopicsFound);
    console.log("Resources Found:", resourceDiagnostics.filter(r => (r.assignedTo || r.learnerId) === learnerId || !(r.assignedTo || r.learnerId)).length);
    console.log("Topics Found:", completedTopicsFound);
    console.log("Total Extracted Characters:", resourceContent.length);
    console.log("Actual Content Length:", actualContentLength);
    console.log("-------------------------------------------");

    // VALIDATION LAYER
    if (totalResourcesFound === 0 || resourceDiagnostics.filter(r => (r.assignedTo || r.learnerId) === learnerId || !(r.assignedTo || r.learnerId)).length === 0) {
       return NextResponse.json({ 
         error: "Upload at least one resource for this learning path.",
         details: { resourcesFound: 0 }
       }, { status: 400 });
    }

    if (actualContentLength < 500) {
       return NextResponse.json({ 
         error: "More study material is required before an assessment can be generated.",
         details: { actualContentLength, required: 500 }
       }, { status: 400 });
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

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    };

    let response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
       console.warn(`gemini-2.5-flash failed with status ${response.status}. Attempting fallback to gemini-2.0-flash...`);
       response = await fetch(
         `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
         {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify(payload)
         }
       );
       
       if (!response.ok) {
           const err = await response.text();
           console.error("Gemini API (both primary and fallback) failed:", err);
           return NextResponse.json({ error: "AI assessment service is temporarily busy. Please try again in a few minutes." }, { status: 500 });
       }
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
