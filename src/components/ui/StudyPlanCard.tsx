"use client";

import React, { useState } from "react";
import { StudyPlan } from "@/types/studyPlan";
import { GlassCard } from "./GlassCard";
import {
  Sparkles,
  BookOpen,
  Calendar,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  FileText,
  Bookmark,
  Loader2,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";

interface StudyPlanCardProps {
  studyPlan: StudyPlan | null;
  onGenerate: (skill: string, currentLevel: string, targetLevel: string, weeklyHours: number) => Promise<void>;
  loading: boolean;
  apiKeyMissing: boolean;
}

export const StudyPlanCard: React.FC<StudyPlanCardProps> = ({
  studyPlan,
  onGenerate,
  loading,
  apiKeyMissing,
}) => {
  const [skill, setSkill] = useState("");
  const [currentLevel, setCurrentLevel] = useState("beginner");
  const [targetLevel, setTargetLevel] = useState("intermediate");
  const [weeklyHours, setWeeklyHours] = useState(5);
  const [activeWeekTab, setActiveWeekTab] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skill.trim()) {
      toast.error("Please specify what skill you want to learn.");
      return;
    }
    if (weeklyHours <= 0) {
      toast.error("Please allocate a valid number of weekly hours.");
      return;
    }
    await onGenerate(skill.trim(), currentLevel, targetLevel, weeklyHours);
  };

  const handleRegenerate = async () => {
    if (!studyPlan) return;
    if (window.confirm("Regenerating the study plan will overwrite the current plan. Proceed?")) {
      await onGenerate(
        studyPlan.skill,
        studyPlan.currentLevel,
        studyPlan.targetLevel,
        studyPlan.weeklyHours
      );
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
              The AI Study Path Generator is currently disabled because the server environment is missing a Gemini API Key.
            </p>
          </div>
        </div>

        <div className="border-t border-red-500/10 pt-4 text-xs text-slate-400 space-y-2 leading-relaxed">
          <p className="font-bold text-slate-300">To enable AI study plans:</p>
          <ol className="list-decimal pl-4 space-y-1">
            <li>Obtain a free Gemini API Key from Google AI Studio.</li>
            <li>Open the local configuration file <code className="bg-slate-950 px-1 py-0.5 rounded text-pink-400 text-[10px] font-mono">.env.local</code>.</li>
            <li>Add the key using the variable name: <code className="bg-slate-950 px-1 py-0.5 rounded text-pink-400 text-[10px] font-mono">GEMINI_API_KEY=your_key_here</code>.</li>
            <li>Restart your development server and reload the page.</li>
          </ol>
        </div>
      </GlassCard>
    );
  }

  // 2. INPUT FORM FOR NEW PLANS
  if (!studyPlan) {
    return (
      <GlassCard className="border border-white/5 bg-slate-950/20 max-w-xl mx-auto p-6 space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-900">
          <Sparkles className="w-5 h-5 text-violet-400 animate-pulse" />
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">AI Study Path Builder</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              What skill do you want to learn? *
            </label>
            <input
              type="text"
              placeholder="e.g. Next.js Routing, UI/UX Prototyping, Go Web Services"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl glass-input font-medium text-slate-200"
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Current Level
              </label>
              <select
                value={currentLevel}
                onChange={(e) => setCurrentLevel(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input font-medium bg-slate-900"
                disabled={loading}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced / Professional</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Target Level
              </label>
              <select
                value={targetLevel}
                onChange={(e) => setTargetLevel(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input font-medium bg-slate-900"
                disabled={loading}
              >
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert Mastery</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Available Weekly Commitment (hours) *
            </label>
            <input
              type="number"
              min={1}
              max={80}
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl glass-input font-medium text-slate-200 bg-slate-900/60"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-500 to-pink-500 hover:opacity-95 text-white flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-violet-500/10 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                <span>Generating custom study plan...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4.5 h-4.5" />
                <span>Generate Study Path</span>
              </>
            )}
          </button>
        </form>
      </GlassCard>
    );
  }

  // 3. RENDER GENERATED STUDY PLAN
  const activeWeekData = studyPlan.roadmap.weeks.find((w) => w.weekNumber === activeWeekTab) || studyPlan.roadmap.weeks[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* Left sidebar: Specifications and Milestones */}
      <div className="lg:col-span-1 space-y-6">
        <GlassCard className="border border-white/5 p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2 border-b border-slate-900 pb-2">
            <BookOpen className="w-4 h-4 text-violet-400" />
            <span>Path Specifications</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-900/65">
              <span className="text-slate-500 font-bold uppercase">Learning Skill</span>
              <span className="text-slate-200 font-bold truncate max-w-[140px]" title={studyPlan.skill}>
                {studyPlan.skill}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-900/65">
              <span className="text-slate-500 font-bold uppercase">Curated Level</span>
              <span className="text-slate-200 font-bold capitalize">
                {studyPlan.currentLevel} → {studyPlan.targetLevel}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-900/65">
              <span className="text-slate-500 font-bold uppercase">Weekly Commitment</span>
              <span className="text-slate-200 font-bold">{studyPlan.weeklyHours} hours/week</span>
            </div>
            {studyPlan.generatedAt && (
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 font-bold uppercase">Generated</span>
                <span className="text-slate-400 font-medium">
                  {studyPlan.generatedAt.toDate
                    ? studyPlan.generatedAt.toDate().toLocaleDateString()
                    : new Date(studyPlan.generatedAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Milestones Card */}
        <GlassCard className="border border-white/5 p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2 border-b border-slate-900 pb-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Target Milestones</span>
          </h3>

          <div className="space-y-3">
            {studyPlan.roadmap.milestones.map((milestone, idx) => (
              <div key={idx} className="flex gap-2.5 p-2 rounded-xl bg-slate-900/30 border border-white/5 text-xs text-slate-300 font-medium leading-relaxed">
                <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                <span>{milestone}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Regenerate Action button */}
        <button
          onClick={handleRegenerate}
          disabled={loading}
          className="w-full py-2.5 border border-white/5 hover:border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer bg-slate-900/35"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RotateCcw className="w-3.5 h-3.5" />
          )}
          <span>Regenerate Study Plan</span>
        </button>
      </div>

      {/* Right Content: Roadmap Weeks display */}
      <div className="lg:col-span-2 space-y-5">
        <GlassCard className="border border-white/5 p-5">
          {/* Week Tab selector */}
          <div className="flex gap-1.5 overflow-x-auto pb-3 border-b border-slate-900/80">
            {studyPlan.roadmap.weeks.map((week) => (
              <button
                key={week.weekNumber}
                onClick={() => setActiveWeekTab(week.weekNumber)}
                className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 cursor-pointer transition-all ${
                  activeWeekTab === week.weekNumber
                    ? "bg-violet-500/10 text-violet-300 border border-violet-500/20"
                    : "text-slate-500 hover:text-slate-300 border border-transparent"
                }`}
              >
                Week {week.weekNumber}
              </button>
            ))}
          </div>

          {/* Week details container */}
          {activeWeekData && (
            <div className="pt-4 space-y-5">
              <div className="space-y-1">
                <span className="text-[9px] bg-violet-500/10 border border-violet-500/20 text-violet-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  Roadmap Scope
                </span>
                <h4 className="text-base font-bold text-slate-100 mt-1">{activeWeekData.title}</h4>
              </div>

              {/* Topics Coverage */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-blue-400" /> Core Concepts
                </h5>
                <div className="flex flex-wrap gap-2">
                  {activeWeekData.topics.map((t, i) => (
                    <span
                      key={i}
                      className="text-xs bg-slate-900 border border-white/5 text-slate-300 px-2.5 py-1 rounded-lg font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Practice Goals and Assignments */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 bg-slate-900/25 border border-white/5 p-4 rounded-2xl">
                  <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    🎯 Practice Targets
                  </h5>
                  <ul className="space-y-2 text-xs text-slate-400 font-medium">
                    {activeWeekData.practiceGoals.map((g, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-violet-400">•</span>
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2 bg-slate-900/25 border border-white/5 p-4 rounded-2xl">
                  <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    📝 Week Assignments
                  </h5>
                  <ul className="space-y-2 text-xs text-slate-400 font-medium">
                    {activeWeekData.assignments.map((a, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-pink-400">•</span>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Learning resources */}
              {activeWeekData.resources && activeWeekData.resources.length > 0 && (
                <div className="space-y-2 border-t border-slate-900/60 pt-4">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    📖 Suggested Resources
                  </h5>
                  <div className="space-y-2">
                    {activeWeekData.resources.map((res, i) => (
                      <a
                        key={i}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/40 border border-white/5 hover:border-slate-800 transition-all text-xs text-violet-400 font-bold hover:text-violet-300 w-fit cursor-pointer"
                      >
                        <FileText className="w-4 h-4 shrink-0" />
                        <span>{res.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};
