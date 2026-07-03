"use client";
import React, { useState } from "react";
import { CheckCircle, XCircle, Target } from "lucide-react";
import { motion } from "framer-motion";

export function MCQQuizCard({ quizData }: { quizData: any[] }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!quizData || quizData.length === 0) return null;

  const score = quizData.reduce((acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0), 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/40 backdrop-blur-md border border-indigo-500/20 rounded-xl p-6 w-full"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-indigo-500/10 rounded-lg">
          <Target className="w-5 h-5 text-indigo-400" />
        </div>
        <h3 className="text-xl font-bold text-white">Session Knowledge Check</h3>
      </div>
      
      <div className="space-y-6">
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
      </div>

      <div className="mt-6">
        {!submitted ? (
          <button
            onClick={() => setSubmitted(true)}
            disabled={Object.keys(answers).length < quizData.length}
            className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
          >
            Submit Answers
          </button>
        ) : (
          <div className="text-center p-4 bg-slate-800/80 rounded-lg border border-slate-700">
            <h4 className="text-xl font-bold text-white mb-1">Score: {score}/{quizData.length}</h4>
            <p className="text-sm text-slate-400">Great job reviewing the session material!</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
