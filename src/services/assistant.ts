import { getCachedAIResponse, setCachedAIResponse } from "./aiCache";
import { logUsage } from "./monitoring";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

async function fetchFromGemini(prompt: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini API key is missing");

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate content from AI");
  }

  const data = await response.json();
  const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  
  // Log the AI usage for monitoring
  await logUsage("gemini_api_call", { promptLength: prompt.length });
  
  return resultText;
}

export async function generateConceptExplanation(concept: string, context: string = ""): Promise<string> {
  const prompt = `Explain the concept of "${concept}" simply. Context: ${context}`;
  
  const cached = await getCachedAIResponse(prompt, "concept");
  if (cached) return cached;
  
  const result = await fetchFromGemini(prompt);
  await setCachedAIResponse(prompt, "concept", result);
  return result;
}

export async function generateQuiz(topic: string, count: number = 3): Promise<string> {
  const prompt = `Generate a ${count}-question multiple choice quiz on "${topic}". Return in JSON format with an array of objects containing 'question', 'options' (array of 4 strings), and 'answer' (the exact string from options).`;
  
  const cached = await getCachedAIResponse(prompt, "quiz");
  if (cached) return cached;
  
  const result = await fetchFromGemini(prompt);
  await setCachedAIResponse(prompt, "quiz", result);
  return result;
}

export async function generateFlashcards(topic: string, count: number = 5): Promise<string> {
  const prompt = `Generate ${count} flashcards for "${topic}". Return in JSON format with an array of objects containing 'front' and 'back'.`;
  
  const cached = await getCachedAIResponse(prompt, "flashcard");
  if (cached) return cached;
  
  const result = await fetchFromGemini(prompt);
  await setCachedAIResponse(prompt, "flashcard", result);
  return result;
}
