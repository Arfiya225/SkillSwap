import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { Certificate } from "@/types/validation";
import { Medal, Download, CheckCircle, ExternalLink } from "lucide-react";

interface CertificateCardProps {
  certificate: Certificate | null;
  onGenerate: () => Promise<void>;
  loading: boolean;
  canGenerate: boolean; // Computed from avg >= 70, final >= 70, peer approved
  reason?: string; // Why they can't generate
}

export const CertificateCard: React.FC<CertificateCardProps> = ({ certificate, onGenerate, loading, canGenerate, reason }) => {
  if (certificate) {
    return (
      <GlassCard className="p-8 border-2 border-yellow-500/30 bg-gradient-to-br from-slate-900 to-slate-950 relative overflow-hidden">
        {/* Certificate Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/20 mb-6">
            <Medal className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Certificate of Completion</h2>
          <p className="text-slate-400 mb-8 max-w-md">
            This certifies that the user has successfully demonstrated mastery of <span className="text-emerald-400 font-bold">{certificate.skill}</span> with a score of <span className="text-white font-bold">{certificate.score.toFixed(0)}%</span>.
          </p>

          <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-8">
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Level</p>
              <p className={`text-lg font-bold mt-1 ${certificate.level === 'Gold' ? 'text-yellow-400' : certificate.level === 'Silver' ? 'text-slate-300' : 'text-amber-600'}`}>
                {certificate.level}
              </p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Verification ID</p>
              <p className="text-sm font-mono text-slate-200 mt-1 truncate" title={certificate.verificationId}>
                {certificate.verificationId.substring(0,8).toUpperCase()}...
              </p>
            </div>
          </div>

          <div className="flex gap-4">
             <a
              href={certificate.certificateUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-bold shadow-md shadow-violet-500/20 transition-all"
            >
              <Download className="w-4 h-4" /> Download PDF
            </a>
            <a
              href={`/verify/${certificate.verificationId}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-all border border-white/5"
            >
              <ExternalLink className="w-4 h-4" /> Verify Publicly
            </a>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-8 text-center border border-white/5 flex flex-col items-center justify-center">
      <Medal className="w-16 h-16 text-slate-700 mb-4" />
      <h3 className="text-lg font-bold text-slate-100">Claim Your Certificate</h3>
      
      {canGenerate ? (
        <>
          <p className="text-sm text-slate-400 mt-2 mb-6 max-w-md mx-auto">
            Congratulations! You have met all requirements. You passed the weekly assessments, aced the final exam, and received your teacher&apos;s approval.
          </p>
          <GradientButton onClick={onGenerate} loading={loading} className="px-8 py-3 text-base">
            Generate Certificate
          </GradientButton>
        </>
      ) : (
        <div className="mt-4 p-4 bg-slate-900/50 rounded-2xl border border-white/5 max-w-md w-full">
          <p className="text-sm font-bold text-slate-300 mb-3 flex items-center justify-center gap-2">
            Requirements to unlock:
          </p>
          <ul className="text-xs text-slate-400 text-left space-y-2">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-slate-600 shrink-0" />
              Weekly Assessment Average &gt;= 70%
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-slate-600 shrink-0" />
              Final Exam Score &gt;= 70%
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-slate-600 shrink-0" />
              Teacher Peer Validation Approved
            </li>
          </ul>
          {reason && (
             <div className="mt-4 p-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg font-medium">
               Current Status: {reason}
             </div>
          )}
        </div>
      )}
    </GlassCard>
  );
};
