"use client";

import React from "react";
import { Activity as ActivityType } from "@/types/activity";
import {
  FileText,
  Paperclip,
  Trash2,
  CheckSquare,
  Edit3,
  CheckCircle2,
  User,
  Activity,
} from "lucide-react";
import { EmptyState } from "./EmptyState";

interface ActivityFeedProps {
  activities: ActivityType[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  // Format relative time (e.g. 5m ago, 1h ago)
  const formatRelativeTime = (timestamp: any): string => {
    if (!timestamp) return "Just now";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffSec < 60) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay === 1) return "Yesterday";
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  // Maps action types to icons, border colors and icon colors
  const getActionConfig = (type: string) => {
    switch (type) {
      case "note_updated":
        return {
          icon: FileText,
          bg: "bg-violet-500/10 border-violet-500/20 text-violet-400",
        };
      case "resource_uploaded":
        return {
          icon: Paperclip,
          bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
        };
      case "resource_deleted":
        return {
          icon: Trash2,
          bg: "bg-red-500/10 border-red-500/20 text-red-400",
        };
      case "task_created":
        return {
          icon: CheckSquare,
          bg: "bg-blue-500/10 border-blue-500/20 text-blue-400",
        };
      case "task_updated":
        return {
          icon: Edit3,
          bg: "bg-amber-500/10 border-amber-500/20 text-amber-400",
        };
      case "task_completed":
        return {
          icon: CheckCircle2,
          bg: "bg-green-500/10 border-green-500/20 text-green-400",
        };
      default:
        return {
          icon: Activity,
          bg: "bg-slate-500/10 border-slate-500/20 text-slate-400",
        };
    }
  };

  if (activities.length === 0) {
    return (
      <div className="py-12 border border-white/5 bg-slate-950/20 rounded-2xl">
        <EmptyState
          icon={Activity}
          title="No activity recorded"
          description="Actions like updating notes, uploading resources, and completing tasks will create a historical timeline here."
        />
      </div>
    );
  }

  return (
    <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-6">
      {activities.map((act) => {
        const config = getActionConfig(act.type);
        const ActionIcon = config.icon;

        return (
          <div key={act.id} className="relative group animate-in fade-in slide-in-from-left-4 duration-300">
            
            {/* Timeline circle badge (overrides the absolute border position) */}
            <div className={`absolute -left-[35px] top-1.5 p-1.5 rounded-xl border-2 border-slate-950 flex items-center justify-center shrink-0 ${config.bg}`}>
              <ActionIcon className="w-3.5 h-3.5" />
            </div>

            {/* Main Activity card content */}
            <div className="bg-slate-900/40 border border-white/5 hover:border-slate-800 p-4 rounded-2xl flex items-start gap-3.5 transition-all duration-300">
              
              {/* User Avatar */}
              <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center shrink-0 shadow-md">
                {act.userAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={act.userAvatar} alt={act.userName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-slate-500" />
                )}
              </div>

              {/* Feed Text */}
              <div className="space-y-1 overflow-hidden flex-1">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <span className="text-xs font-bold text-slate-200 truncate">{act.userName}</span>
                  <span className="text-[10px] text-slate-500 font-semibold shrink-0">
                    {formatRelativeTime(act.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  {act.description}
                </p>
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
};
