import { NextResponse } from "next/server";
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { createNotification } from "@/services/notifications";

export async function POST(request: Request) {
  try {
    const { roomId, userId, assessmentId, questions, answers, isFinal } = await request.json();

    if (!roomId || !userId || !assessmentId || !questions || !answers) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY_MISSING" }, { status: 500 });
    }

    // Prepare content for Gemini to grade short answers and practicals
    const evaluationPayload = questions.map((q: any) => ({
      questionId: q.id,
      question: q.question,
      type: q.type,
      correctAnswer: q.correctAnswer, // for MCQ
      userAnswer: answers[q.id] || "No answer provided"
    }));

    const prompt = `
You are an expert evaluator. Evaluate the following assessment submission.
There are Multiple Choice Questions (MCQs), Short Answers, and Practical Questions.
For MCQs, compare the userAnswer to the correctAnswer exactly.
For Short Answers and Practicals, evaluate the correctness and quality of the userAnswer.

Return the response STRICTLY as a JSON object with the following structure:
{
  "score": 85, // total score out of 100 based on the correctness of all answers
  "feedback": [
    "Good understanding of X.",
    "Improve your knowledge on Y."
  ]
}

Submission data to evaluate:
${JSON.stringify(evaluationPayload, null, 2)}

Only return raw JSON. Do not use markdown backticks like \`\`\`json.
`;

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
       return NextResponse.json({ error: "Gemini evaluation failed" }, { status: 500 });
    }

    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    if (text.includes("```json")) text = text.split("```json")[1].split("```")[0];
    else if (text.includes("```")) text = text.split("```")[1].split("```")[0];

    const parsed = JSON.parse(text.trim());
    
    const score = parsed.score || 0;
    const status = score >= 70 ? "passed" : "failed";

    // Save submission to Firestore
    const ref = collection(db, "assessmentSubmissions");
    await addDoc(ref, {
      roomId,
      userId,
      assessmentId,
      answers,
      score,
      feedback: parsed.feedback || [],
      status,
      isFinal: !!isFinal,
      submittedAt: serverTimestamp()
    });

    if (status === "passed") {
      if (isFinal) {
        try {
          const roomRef = doc(db, "learningRooms", roomId);
          const roomSnap = await getDoc(roomRef);
          if (roomSnap.exists()) {
            const roomData = roomSnap.data();
            if (roomData.exchangeSkills && roomData.exchangeSkills[userId]) {
              await updateDoc(roomRef, {
                [`exchangeSkills.${userId}.assessmentPassed`]: true
              });
            }
          }
        } catch (updateErr) {
          console.error("Failed to update assessmentPassed status:", updateErr);
        }
      }

      try {
        await createNotification(
          userId,
          "Assessment Passed",
          `Congratulations! You have passed the ${isFinal ? "final " : ""}assessment with a score of ${score}%.`,
          "assessment_passed",
          `/rooms/${roomId}?tab=assessments`
        );
      } catch (notifyErr) {
        console.error("Failed to send assessment_passed notification:", notifyErr);
      }
    }

    return NextResponse.json({ success: true, score, status, feedback: parsed.feedback });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
