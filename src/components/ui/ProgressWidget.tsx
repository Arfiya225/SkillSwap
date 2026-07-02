"use client";

import React from "react";
import { Task } from "@/types/task";
import { GlassCard } from "./GlassCard";
import {
  ClipboardList,
  Sparkles,
  TrendingUp,
} from "lucide-react";

interface ProgressWidgetProps {
  tasks: Task[];
}

export const ProgressWidget: React.FC<ProgressWidgetProps> = ({ tasks }) => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const todo = tasks.filter((t) => t.status === "todo").length;
  const pending = todo + inProgress;

  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Derive Weekly Goal stats (Monday - Sunday)
  const getStartAndEndOfWeek = () => {
    const today = new Date();
    const day = today.getDay(); // 0 is Sunday, 1 is Monday...
    
    // Calculate Monday
    const startOfWeek = new Date(today);
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    // Calculate Sunday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return { startOfWeek, endOfWeek };
  };

  const { startOfWeek, endOfWeek } = getStartAndEndOfWeek();
  
  const weeklyTasks = tasks.filter((t) => {
    if (!t.dueDate) return false;
    const taskDate = new Date(t.dueDate + "T12:00:00");
    return taskDate >= startOfWeek && taskDate <= endOfWeek;
  });

  const weeklyTotal = weeklyTasks.length;
  const weeklyCompleted = weeklyTasks.filter((t) => t.status === "completed").length;
  const weeklyPct = weeklyTotal > 0 ? Math.round((weeklyCompleted / weeklyTotal) * 100) : 0;

  // Format date range for the weekly display
  const formatDateRange = () => {
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    return `${startOfWeek.toLocaleDateString(undefined, options)} - ${endOfWeek.toLocaleDateString(undefined, options)}`;
  };

  // Determine progress color gradient
  const getProgressBarColor = (pct: number) => {
    if (pct >= 80) return "from-emerald-500 to-green-400 shadow-[0_0_12px_rgba(52,211,153,0.3)]";
    if (pct >= 40) return "from-blue-500 to-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.3)]";
    return "from-slate-600 to-slate-500";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* 1. Main Completion Progress Card */}
      <GlassCard className="border border-white/5 md:col-span-2 p-6 flex flex-col justify-between gap-5 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-violet-500/5 rounded-full blur-3xl" />
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-violet-400" />
              <span>Workspace Progress</span>
            </h3>
            <span className="text-2xl font-black bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              {completionPercentage}%
            </span>
          </div>
          <p className="text-xs text-slate-400">Overall tasks completion rate for this swap request space.</p>
        </div>

        {/* Horizontal glowing bar */}
        <div className="space-y-2">
          <div className="w-full h-3 rounded-full bg-slate-950/80 border border-white/5 overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${getProgressBarColor(completionPercentage)}`}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            <span>0% Started</span>
            <span>100% Completed</span>
          </div>
        </div>

        {/* Small stats columns */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-900/60">
          <div className="bg-slate-950/20 border border-white/5 rounded-xl p-3 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Total</span>
            <span className="text-lg font-black text-slate-200">{total}</span>
          </div>
          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">Done</span>
            <span className="text-lg font-black text-emerald-400">{completed}</span>
          </div>
          <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-3 text-center">
            <span className="text-[10px] uppercase font-bold text-blue-400 block mb-1">Pending</span>
            <span className="text-lg font-black text-blue-400">{pending}</span>
          </div>
        </div>
      </GlassCard>

      {/* 2. Weekly Goal Widget */}
      <GlassCard className="border border-white/5 p-6 flex flex-col justify-between gap-4 h-full relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl" />
        
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-pink-400" />
              <span>Weekly Focus</span>
            </h3>
            <span className="text-[10px] bg-pink-500/10 border border-pink-500/20 text-pink-300 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
              Goal
            </span>
          </div>
          <span className="text-[10px] text-slate-500 block font-semibold">{formatDateRange()}</span>
        </div>

        <div className="space-y-4 py-2">
          {weeklyTotal > 0 ? (
            <div className="space-y-3.5">
              <div className="flex justify-between items-baseline">
                <span className="text-slate-300 text-xs">Tasks due this week:</span>
                <span className="text-sm font-black text-slate-100">
                  {weeklyCompleted} / {weeklyTotal}
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="w-full h-2 rounded-full bg-slate-950/80 border border-white/5 overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-pink-500 to-violet-500 transition-all duration-300"
                    style={{ width: `${weeklyPct}%` }}
                  />
                </div>
                <div className="text-right text-[9px] text-slate-500 font-bold">{weeklyPct}% completed</div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-3.5 text-center bg-slate-950/20 border border-white/5 rounded-xl min-h-[90px]">
              <Sparkles className="w-5 h-5 text-slate-600 mb-1 animate-pulse" />
              <p className="text-[11px] text-slate-400 font-semibold leading-snug">
                No tasks scheduled for completion this week.
              </p>
            </div>
          )}
        </div>

        <div className="text-[10px] text-slate-500 leading-relaxed border-t border-slate-900 pt-3">
          💡 Tip: Set realistic due dates in the Tasks tab to map out a structured learning weekly plan.
        </div>
      </GlassCard>

    </div>
  );
};
