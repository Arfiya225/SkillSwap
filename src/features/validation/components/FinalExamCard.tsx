import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { FinalAssessment, AssessmentSubmission } from "@/types/validation";
import { Award, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

interface FinalExamCardProps {
  exam: FinalAssessment | null;
  onGenerate: () => Promise<void>;
  onSubmit: (answers: Record<string, string>) => Promise<void>;
  isTeacher: boolean;
  loading: boolean;
  submission: AssessmentSubmission | null;
  readOnly?: boolean;
}

export const FinalExamCard: React.FC<FinalExamCardProps> = ({ exam, onGenerate, onSubmit, isTeacher, loading, submission, readOnly }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exam) return;
    if (Object.keys(answers).length < exam.questions.length) {
      toast.error("Please answer all questions before submitting.");
      return;
    }
    await onSubmit(answers);
  };

  if (!exam) {
    return (
      <GlassCard className="p-8 text-center border border-white/5 flex flex-col items-center justify-center">
        <Award className="w-16 h-16 text-yellow-500/50 mb-4" />
        <h3 className="text-lg font-bold text-slate-100">Final Assessment</h3>
        <p className="text-sm text-slate-400 mt-2 mb-6 max-w-md mx-auto">
          The final exam evaluates all content learned in this room. Passing score is 70%.
        </p>
        {isTeacher && !readOnly ? (
          <GradientButton onClick={onGenerate} loading={loading}>
            Generate Final Exam
          </GradientButton>
        ) : (
          <p className="text-xs text-slate-500 bg-slate-900/50 px-4 py-2 rounded-lg border border-white/5">
            {readOnly ? "Exam generation is disabled in archived rooms." : "Waiting for teacher to generate the exam..."}
          </p>
        )}
      </GlassCard>
    );
  }

  if (submission) {
    return (
      <GlassCard className="p-6 border border-yellow-500/30 bg-yellow-500/5">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Award className="w-6 h-6 text-yellow-400" /> Final Exam Results
          </h4>
          <div className="flex items-center gap-3">
             <div className="text-base font-bold text-slate-200 bg-slate-900/80 px-4 py-1.5 rounded-lg border border-white/10">
              Score: {submission.score?.toFixed(0)}%
            </div>
            {submission.status === "passed" ? (
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-500/30 font-bold uppercase tracking-wider">Passed</span>
            ) : submission.status === "failed" ? (
              <span className="text-xs bg-red-500/20 text-red-400 px-3 py-1.5 rounded-full border border-red-500/30 font-bold uppercase tracking-wider">Failed</span>
            ) : (
              <span className="text-xs bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-full border border-blue-500/30 font-bold uppercase tracking-wider">Grading</span>
            )}
          </div>
        </div>
        
        {submission.feedback && submission.feedback.length > 0 && (
          <div className="mb-4 p-4 bg-slate-900/60 rounded-xl border border-white/10">
            <h5 className="text-sm font-bold text-slate-300 mb-3 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> AI Evaluation Feedback
            </h5>
            <ul className="space-y-2">
              {submission.feedback.map((f, i) => (
                <li key={i} className="text-sm text-slate-400 pl-5 relative leading-relaxed">
                  <span className="absolute left-0 top-2 w-2 h-2 rounded-full bg-emerald-500/50"></span>
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
    <GlassCard className="p-6 border border-white/10">
      <h4 className="text-lg font-bold text-slate-100 mb-2 flex items-center gap-2">
        <Award className="w-6 h-6 text-yellow-400" /> Final Comprehensive Exam
      </h4>
      <p className="text-sm text-slate-400 mb-6 pb-6 border-b border-white/10">
        This exam covers all topics, notes, and tasks. Good luck!
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {exam.questions.map((q, i) => (
          <div key={q.id} className="space-y-3 p-5 bg-slate-900/50 rounded-2xl border border-white/5 shadow-inner">
            <div className="flex gap-3">
              <span className="text-lg font-bold text-slate-500 bg-slate-800/50 w-8 h-8 flex items-center justify-center rounded-lg shrink-0">{i + 1}</span>
              <p className="text-base font-semibold text-slate-200 mt-1">{q.question}</p>
            </div>
            
            <div className="pl-11">
              {q.type === "mcq" && q.options && (
                <div className="space-y-2 mt-2">
                  {q.options.map((opt, optIdx) => (
                    <label key={optIdx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/20 hover:bg-slate-800/60 cursor-pointer transition-colors border border-transparent hover:border-white/10">
                      <input
                        type="radio"
                        name={q.id}
                        value={opt}
                        checked={answers[q.id] === opt}
                        onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                        disabled={readOnly}
                        className="w-4 h-4 accent-yellow-500 disabled:opacity-50"
                      />
                      <span className="text-sm text-slate-300">{opt}</span>
                    </label>
                  ))}
                </div>
              )}
              {(q.type === "short-answer" || q.type === "practical") && (
                <textarea
                  rows={q.type === "practical" ? 5 : 3}
                  value={answers[q.id] || ""}
                  onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                  disabled={readOnly}
                  className="w-full px-4 py-3 text-sm rounded-xl glass-input mt-2 font-mono leading-relaxed bg-slate-950/50 focus:bg-slate-900 transition-all disabled:opacity-50"
                  placeholder={q.type === "practical" ? "Write your detailed implementation or steps here..." : "Type your answer..."}
                />
              )}
            </div>
          </div>
        ))}
        {!readOnly && (
          <div className="flex justify-end pt-6 border-t border-white/10">
            <GradientButton type="submit" loading={loading} className="text-base py-3 px-8 font-bold">
              Submit Final Exam
            </GradientButton>
          </div>
        )}
      </form>
    </GlassCard>
  );
};
