import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { PeerValidation } from "@/types/validation";
import { submitPeerValidation } from "@/services/validationService";
import { UserCheck, Check, X, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

interface PeerValidationCardProps {
  roomId: string;
  isTeacher: boolean;
  studentId: string;
  teacherId: string;
  validation: PeerValidation | null;
}

export const PeerValidationCard: React.FC<PeerValidationCardProps> = ({ roomId, isTeacher, studentId, teacherId, validation }) => {
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState<"approved" | "rejected" | "improvement-required" | "">("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!status) {
      toast.error("Please select a validation status");
      return;
    }
    setLoading(true);
    try {
      await submitPeerValidation(roomId, teacherId, studentId, status as any, feedback);
      toast.success("Peer validation submitted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit validation");
    } finally {
      setLoading(false);
    }
  };

  if (validation) {
    return (
      <GlassCard className="p-6 border border-white/5">
        <h4 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-4">
          <UserCheck className="w-5 h-5 text-blue-400" /> Peer Validation Result
        </h4>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm text-slate-400">Teacher Decision:</span>
          {validation.status === "approved" ? (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
              <Check className="w-4 h-4" /> Approved
            </span>
          ) : validation.status === "rejected" ? (
            <span className="flex items-center gap-1 text-xs font-bold text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
              <X className="w-4 h-4" /> Rejected
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-bold text-yellow-400 bg-yellow-500/10 px-3 py-1.5 rounded-lg border border-yellow-500/20">
              <AlertTriangle className="w-4 h-4" /> Improvement Required
            </span>
          )}
        </div>
        {validation.feedback && (
          <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5 text-sm text-slate-300 italic">
            &quot;{validation.feedback}&quot;
          </div>
        )}
      </GlassCard>
    );
  }

  if (!isTeacher) {
    return (
      <GlassCard className="p-6 text-center border border-white/5">
        <UserCheck className="w-12 h-12 text-blue-400/50 mx-auto mb-3" />
        <h4 className="text-sm font-bold text-slate-200">Pending Peer Validation</h4>
        <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto">
          Your teacher needs to review your overall performance and approve your learning journey before a certificate can be issued.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6 border border-blue-500/30 bg-blue-500/5">
      <h4 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-2">
        <UserCheck className="w-5 h-5 text-blue-400" /> Teacher Peer Validation
      </h4>
      <p className="text-xs text-slate-400 mb-6">
        As the teacher, evaluate the student&apos;s overall performance, engagement, and mastery of the skill.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${status === "approved" ? "border-emerald-500 bg-emerald-500/10" : "border-white/5 bg-slate-900/50 hover:bg-slate-800"}`}>
            <input type="radio" name="status" value="approved" className="hidden" onChange={(e) => setStatus(e.target.value as any)} />
            <Check className={`w-8 h-8 mb-2 ${status === "approved" ? "text-emerald-400" : "text-slate-500"}`} />
            <span className={`text-sm font-bold ${status === "approved" ? "text-emerald-300" : "text-slate-400"}`}>Approve</span>
          </label>
          <label className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${status === "improvement-required" ? "border-yellow-500 bg-yellow-500/10" : "border-white/5 bg-slate-900/50 hover:bg-slate-800"}`}>
            <input type="radio" name="status" value="improvement-required" className="hidden" onChange={(e) => setStatus(e.target.value as any)} />
            <AlertTriangle className={`w-8 h-8 mb-2 ${status === "improvement-required" ? "text-yellow-400" : "text-slate-500"}`} />
            <span className={`text-sm font-bold text-center ${status === "improvement-required" ? "text-yellow-300" : "text-slate-400"}`}>Needs Work</span>
          </label>
          <label className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${status === "rejected" ? "border-red-500 bg-red-500/10" : "border-white/5 bg-slate-900/50 hover:bg-slate-800"}`}>
            <input type="radio" name="status" value="rejected" className="hidden" onChange={(e) => setStatus(e.target.value as any)} />
            <X className={`w-8 h-8 mb-2 ${status === "rejected" ? "text-red-400" : "text-slate-500"}`} />
            <span className={`text-sm font-bold ${status === "rejected" ? "text-red-300" : "text-slate-400"}`}>Reject</span>
          </label>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Final Feedback</label>
          <textarea
            rows={3}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            required
            className="w-full px-4 py-3 text-sm rounded-xl glass-input bg-slate-900/80 focus:bg-slate-900 transition-colors"
            placeholder="Provide a final assessment of the student's learning journey..."
          />
        </div>

        <div className="flex justify-end pt-2">
          <GradientButton type="submit" loading={loading} className="text-sm py-2 px-6">
            Submit Validation
          </GradientButton>
        </div>
      </form>
    </GlassCard>
  );
};
