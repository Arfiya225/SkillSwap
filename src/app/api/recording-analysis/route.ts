import { NextResponse } from "next/server";
import { doc, setDoc, serverTimestamp, collection } from "firebase/firestore";
import { db } from "@/firebase/config";

export async function POST(request: Request) {
  try {
    const { roomId, fileUrl, mimeType } = await request.json();

    if (!roomId || !fileUrl) {
      return NextResponse.json({ error: "Missing roomId or fileUrl" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: "GEMINI_API_KEY_MISSING",
      });
    }

    // 1. Download file from Firebase Storage
    const fileRes = await fetch(fileUrl);
    if (!fileRes.ok) {
      throw new Error("Failed to download file from Firebase Storage");
    }
    const arrayBuffer = await fileRes.arrayBuffer();

    // 2. Upload to Gemini File API
    const actualMimeType = mimeType || fileRes.headers.get("content-type") || "video/mp4";
    const uploadRes = await fetch(`https://generativelanguage.googleapis.com/upload/v1beta/files?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'X-Goog-Upload-Protocol': 'raw',
        'X-Goog-Upload-Command': 'start, upload',
        'X-Goog-Upload-Header-Content-Length': arrayBuffer.byteLength.toString(),
        'X-Goog-Upload-Header-Content-Type': actualMimeType,
        'Content-Type': actualMimeType,
      },
      body: arrayBuffer,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error("Gemini Upload API Error:", errText);
      throw new Error("Failed to upload to Gemini File API");
    }

    const uploadData = await uploadRes.json();
    const geminiFileUri = uploadData.file.uri;
    const geminiFileName = uploadData.file.name;

    // 3. Poll for ACTIVE state if processing
    for (let i = 0; i < 30; i++) {
      const checkRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/${geminiFileName}?key=${apiKey}`);
      const checkData = await checkRes.json();
      if (checkData.state === 'ACTIVE') break;
      if (checkData.state === 'FAILED') throw new Error("Gemini file processing failed");
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // 4. Generate Content
    const prompt = `
You are an expert AI learning assistant. Analyze this learning session recording.
Generate a comprehensive session summary in JSON format matching this strict structure:
{
  "transcript": "A brief simulated or actual transcript/summary of the spoken content.",
  "keyLearnings": ["List 2-4 key takeaways"],
  "actionItems": ["List 1-3 immediate action items"],
  "revisionNotes": "A short paragraph of study notes summarizing the core concepts discussed in the video.",
  "mcqQuiz": [
    {
      "question": "Sample question based on video?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option A"
    }
  ]
}
Return ONLY raw JSON. Do not wrap in markdown code block ticks.
`;

    const generateRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { fileData: { mimeType: actualMimeType, fileUri: geminiFileUri } },
                { text: prompt }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!generateRes.ok) {
      const errText = await generateRes.text();
      console.error("Gemini Generate API Error:", errText);
      throw new Error("Gemini generation failed");
    }

    const genData = await generateRes.json();
    let text = genData.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Sanitize markdown blocks if present
    if (text.includes("```json")) {
      text = text.split("```json")[1].split("```")[0];
    } else if (text.includes("```")) {
      text = text.split("```")[1].split("```")[0];
    }

    const parsedSummary = JSON.parse(text.trim());

    // 5. Save to Firestore
    const summariesCol = collection(db, "sessionSummaries");
    const newDoc = doc(summariesCol);
    const summaryData = {
      id: newDoc.id,
      roomId,
      generatedAt: serverTimestamp(),
      keyLearnings: parsedSummary.keyLearnings || [],
      actionItems: parsedSummary.actionItems || [],
      homework: [], // kept for backward compatibility if needed
      nextMeetingGoals: [], 
      transcript: parsedSummary.transcript || "",
      revisionNotes: parsedSummary.revisionNotes || "",
      mcqQuiz: parsedSummary.mcqQuiz || []
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
    console.error("Error in recording-analysis api:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
