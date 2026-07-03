"use client";
import React, { useState } from "react";
import { generateQuiz } from "@/services/assistant";
import { logError } from "@/services/monitoring";
import { motion } from "framer-motion";
import { Target, Loader2, CheckCircle, XCircle } from "lucide-react";

export function QuizGenerator() {
  const [topic, setTopic] = useState("");
  const [quizData, setQuizData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError("");
    setQuizData(null);
    setAnswers({});
    setSubmitted(false);
    
    try {
      const res = await generateQuiz(topic, 3);
      // AI returns markdown JSON sometimes, strip markdown block
      const jsonStr = res.replace(/```json/g, "").replace(/```/g, "").trim();
      setQuizData(JSON.parse(jsonStr));
    } catch (err: any) {
      setError("Failed to generate quiz. AI might have returned invalid format.");
      logError("QuizGenerator", err);
    } finally {
      setLoading(false);
    }
  };

  const score = quizData ? quizData.reduce((acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0), 0) : 0;

  return (
    <div className="bg-slate-900/50 backdrop-blur-md border border-emerald-500/20 rounded-xl p-5">
      <div className="flex items-center space-x-2 mb-4">
        <Target className="w-5 h-5 text-emerald-400" />
        <h3 className="text-lg font-bold text-white">AI Quiz Generator</h3>
      </div>
      
      {!quizData && (
        <div className="flex flex-col space-y-3">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Topic to test..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex justify-center items-center"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Generate Quick Quiz"}
          </button>
        </div>
      )}

      {error && <p className="text-rose-400 text-sm mt-4">{error}</p>}

      {quizData && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 mt-4">
          {quizData.map((q, i) => (
            <div key={i} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
              <p className="text-slate-200 font-medium mb-3">{i + 1}. {q.question}</p>
              <div className="space-y-2">
                {q.options.map((opt: string, optIdx: number) => {
                  const isSelected = answers[i] === opt;
                  const isCorrect = opt === q.answer;
                  const showResultClass = submitted
                    ? isCorrect 
                      ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300" 
                      : isSelected ? "bg-rose-500/20 border-rose-500/50 text-rose-300" : "bg-slate-800/30 border-slate-700/30 text-slate-500"
                    : isSelected ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300" : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700";

                  return (
                    <button
                      key={optIdx}
                      disabled={submitted}
                      onClick={() => setAnswers({ ...answers, [i]: opt })}
                      className={`w-full text-left px-4 py-2 rounded-lg border text-sm transition-colors flex justify-between items-center ${showResultClass}`}
                    >
                      {opt}
                      {submitted && isCorrect && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                      {submitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {!submitted ? (
            <button
              onClick={() => setSubmitted(true)}
              disabled={Object.keys(answers).length < quizData.length}
              className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Submit Answers
            </button>
          ) : (
            <div className="text-center p-4 bg-slate-800/80 rounded-lg border border-slate-700 flex flex-col items-center">
              <h4 className="text-xl font-bold text-white mb-1">Score: {score}/{quizData.length}</h4>
              <button onClick={() => setQuizData(null)} className="text-sm text-indigo-400 mt-2 hover:underline">
                Try another topic
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
