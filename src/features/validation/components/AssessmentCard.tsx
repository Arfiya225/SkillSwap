import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { Assessment, AssessmentSubmission } from "@/types/validation";
import { CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

interface AssessmentCardProps {
  assessment: Assessment;
  onSubmit: (answers: Record<string, string>) => Promise<void>;
  loading: boolean;
  submission: AssessmentSubmission | null;
}

export const AssessmentCard: React.FC<AssessmentCardProps> = ({ assessment, onSubmit, loading, submission }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(answers).length < assessment.questions.length) {
      toast.error("Please answer all questions before submitting.");
      return;
    }
    await onSubmit(answers);
  };

  if (submission) {
    return (
      <GlassCard className="p-5 border border-white/5 opacity-80">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            Assessment Week {assessment.week}
            {submission.status === "passed" ? (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">Passed</span>
            ) : submission.status === "failed" ? (
              <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30">Failed</span>
            ) : (
              <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">Submitted - Grading</span>
            )}
          </h4>
          {submission.score !== undefined && (
            <div className="text-sm font-bold text-slate-200 bg-slate-900/80 px-3 py-1 rounded-lg border border-white/10">
              Score: {submission.score.toFixed(0)}%
            </div>
          )}
        </div>
        
        {submission.feedback && submission.feedback.length > 0 && (
          <div className="mb-4 p-3 bg-slate-900/50 rounded-xl border border-white/5">
            <h5 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" /> AI Feedback
            </h5>
            <ul className="space-y-1.5">
              {submission.feedback.map((f, i) => (
                <li key={i} className="text-xs text-slate-300 pl-4 relative">
                  <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-violet-500/50"></span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-5 border border-white/5">
      <h4 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
        <span className="bg-violet-600 w-6 h-6 rounded flex items-center justify-center text-xs text-white">W{assessment.week}</span>
        Weekly Assessment
      </h4>
      <form onSubmit={handleSubmit} className="space-y-6">
        {assessment.questions.map((q, i) => (
          <div key={q.id} className="space-y-2 p-4 bg-slate-900/40 rounded-xl border border-white/5">
            <p className="text-sm font-bold text-slate-200">
              <span className="text-slate-500 mr-2">{i + 1}.</span>
              {q.question}
            </p>
            {q.type === "mcq" && q.options && (
              <div className="space-y-2 mt-3">
                {q.options.map((opt, optIdx) => (
                  <label key={optIdx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 cursor-pointer transition-colors border border-transparent hover:border-white/5">
                    <input
                      type="radio"
                      name={q.id}
                      value={opt}
                      checked={answers[q.id] === opt}
                      onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                      className="w-4 h-4 accent-violet-500"
                    />
                    <span className="text-sm text-slate-300">{opt}</span>
                  </label>
                ))}
              </div>
            )}
            {(q.type === "short-answer" || q.type === "practical") && (
              <textarea
                rows={q.type === "practical" ? 4 : 2}
                value={answers[q.id] || ""}
                onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg glass-input mt-2 font-mono"
                placeholder={q.type === "practical" ? "Write your code or steps here..." : "Type your answer..."}
              />
            )}
          </div>
        ))}
        <div className="flex justify-end pt-4 border-t border-white/10">
          <GradientButton type="submit" loading={loading} className="text-sm py-2 px-6">
            Submit Assessment
          </GradientButton>
        </div>
      </form>
    </GlassCard>
  );
};
