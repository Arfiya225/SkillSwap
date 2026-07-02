"use client";

import React, { useState } from "react";
import { SessionSummary } from "@/types/sessionSummary";
import { GlassCard } from "./GlassCard";
import {
  Sparkles,
  Award,
  CheckSquare,
  BookOpen,
  Calendar,
  AlertTriangle,
  Loader2,
  Clock,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";

interface SessionSummaryCardProps {
  summaries: SessionSummary[];
  onGenerate: () => Promise<void>;
  loading: boolean;
  apiKeyMissing: boolean;
}

export const SessionSummaryCard: React.FC<SessionSummaryCardProps> = ({
  summaries,
  onGenerate,
  loading,
  apiKeyMissing,
}) => {
  const [selectedIdx, setSelectedIdx] = useState(0);

  const handleGenerateClick = async () => {
    try {
      await onGenerate();
      setSelectedIdx(0); // Reset selector to latest summary
      toast.success("Room session summary generated!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to generate summary.");
    }
  };

  // 1. API KEY MISSING FALLBACK UI
  if (apiKeyMissing) {
    return (
      <GlassCard className="border border-red-500/20 bg-red-500/5 p-6 max-w-xl mx-auto space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-red-300">Gemini AI Key Configuration Required</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              The AI Session Summarizer is currently disabled because the server environment is missing a Gemini API Key.
            </p>
          </div>
        </div>

        <div className="border-t border-red-500/10 pt-4 text-xs text-slate-400 space-y-2 leading-relaxed">
          <p className="font-bold text-slate-300">To enable AI summaries:</p>
          <ol className="list-decimal pl-4 space-y-1">
            <li>Obtain a Gemini API Key from Google AI Studio.</li>
            <li>Configure <code className="bg-slate-950 px-1 py-0.5 rounded text-pink-400 text-[10px] font-mono">.env.local</code>.</li>
            <li>Insert: <code className="bg-slate-950 px-1 py-0.5 rounded text-pink-400 text-[10px] font-mono">GEMINI_API_KEY=your_key_here</code>.</li>
          </ol>
        </div>
      </GlassCard>
    );
  }

  // 2. EMPTY STATE: NO SUMMARIES GENERATED YET
  if (summaries.length === 0) {
    return (
      <GlassCard className="border border-white/5 bg-slate-950/20 max-w-xl mx-auto p-6 text-center space-y-5">
        <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mx-auto">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Workspace AI Summarizer</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Generate instant workspace wrap-ups! Our AI reads your room's shared notes, tasks, and uploaded materials to outline key takeaways and goals.
          </p>
        </div>

        <button
          onClick={handleGenerateClick}
          disabled={loading}
          className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-500 to-pink-500 hover:opacity-95 text-white flex items-center justify-center gap-2 cursor-pointer shadow-md mx-auto disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4.5 h-4.5 animate-spin" />
              <span>Analyzing room logs...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4.5 h-4.5" />
              <span>Summarize Workspace Activity</span>
            </>
          )}
        </button>
      </GlassCard>
    );
  }

  // 3. DISPLAY LATEST AND PAST SUMMARIES
  const activeSummary = summaries[selectedIdx] || summaries[0];

  const formatDate = (dateValue: any) => {
    if (!dateValue) return "Recently";
    const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
      {/* Sidebar: Historical Log selection */}
      <div className="lg:col-span-1 space-y-4">
        <GlassCard className="border border-white/5 p-4 space-y-3.5">
          <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-2">
            <Clock className="w-4 h-4 text-violet-400" />
            <span>Summary History</span>
          </h3>

          <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
            {summaries.map((sum, index) => (
              <button
                key={sum.id}
                onClick={() => setSelectedIdx(index)}
                className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                  selectedIdx === index
                    ? "bg-violet-500/10 text-violet-300 border border-violet-500/20"
                    : "text-slate-400 hover:text-slate-200 border border-transparent"
                }`}
              >
                <span className="truncate pr-2 font-medium">{formatDate(sum.generatedAt)}</span>
                <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-40 hidden lg:block" />
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Trigger fresh summarizer action */}
        <button
          onClick={handleGenerateClick}
          disabled={loading}
          className="w-full py-2.5 bg-gradient-to-r from-violet-500 to-pink-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:opacity-90 shadow-md cursor-pointer transition-all disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          <span>Summarize Activity</span>
        </button>
      </div>

      {/* Main summary review deck */}
      <div className="lg:col-span-3">
        <GlassCard className="border border-white/5 p-6 space-y-6 relative overflow-hidden">
          {/* Decorative blur element */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-violet-500/5 rounded-full blur-3xl" />

          {/* Heading info */}
          <div className="flex justify-between items-start gap-4 border-b border-slate-900 pb-4 relative z-10">
            <div className="space-y-1">
              <span className="text-[9px] bg-gradient-to-r from-violet-500 to-pink-500 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                AI Summary
              </span>
              <h4 className="text-base font-bold text-slate-100 mt-1">Learning Session Highlights</h4>
            </div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-600" />
              {formatDate(activeSummary.generatedAt)}
            </span>
          </div>

          {/* Four core sections */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
            {/* Key Learnings */}
            <div className="space-y-2 bg-slate-900/35 border border-white/5 p-4 rounded-2xl">
              <h5 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-1.5">
                <Award className="w-4 h-4 text-violet-400 shrink-0" />
                <span>Key Learnings</span>
              </h5>
              <ul className="space-y-2 text-xs text-slate-400 font-medium">
                {activeSummary.keyLearnings.map((item, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-violet-400">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Items */}
            <div className="space-y-2 bg-slate-900/35 border border-white/5 p-4 rounded-2xl">
              <h5 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-1.5">
                <CheckSquare className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Action Items</span>
              </h5>
              <ul className="space-y-2 text-xs text-slate-400 font-medium">
                {activeSummary.actionItems.map((item, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-blue-400">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Homework */}
            <div className="space-y-2 bg-slate-900/35 border border-white/5 p-4 rounded-2xl">
              <h5 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-1.5">
                <BookOpen className="w-4 h-4 text-pink-400 shrink-0" />
                <span>Practice / Homework</span>
              </h5>
              <ul className="space-y-2 text-xs text-slate-400 font-medium">
                {activeSummary.homework.map((item, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-pink-400">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Next Goals */}
            <div className="space-y-2 bg-slate-900/35 border border-white/5 p-4 rounded-2xl">
              <h5 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Next Milestones</span>
              </h5>
              <ul className="space-y-2 text-xs text-slate-400 font-medium">
                {activeSummary.nextMeetingGoals.map((item, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-emerald-400">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
