"use client";

import React from "react";
import { Notification } from "@/types/notification";
import {
  Inbox,
  CheckCircle,
  Video,
  CheckSquare,
  Sparkles,
  Circle,
  Calendar,
} from "lucide-react";
import Link from "next/link";

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => Promise<void>;
  onClose?: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onRead,
  onClose,
}) => {
  const getRelativeTime = (timestamp: any) => {
    if (!timestamp) return "Just now";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const configs = {
    swap_request: {
      icon: Inbox,
      color: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    },
    request_accepted: {
      icon: CheckCircle,
      color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    },
    meeting_scheduled: {
      icon: Video,
      color: "bg-violet-500/10 border-violet-500/20 text-violet-400",
    },
    task_assigned: {
      icon: CheckSquare,
      color: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    },
    study_plan_generated: {
      icon: Sparkles,
      color: "bg-pink-500/10 border-pink-500/20 text-pink-400",
    },
  };

  const currentConfig = configs[notification.type] || {
    icon: Calendar,
    color: "bg-slate-500/10 border-slate-500/20 text-slate-400",
  };
  const IconComp = currentConfig.icon;

  const handleClick = async () => {
    if (!notification.read) {
      try {
        await onRead(notification.id);
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
      }
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <Link
      href={notification.link || "#"}
      onClick={handleClick}
      className={`block p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
        notification.read
          ? "bg-slate-950/20 border-white/5 hover:border-slate-800"
          : "bg-slate-900/60 border-violet-500/15 hover:border-violet-500/30"
      }`}
    >
      <div className="flex gap-3">
        {/* Icon Badge */}
        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${currentConfig.color}`}>
          <IconComp className="w-4 h-4" />
        </div>

        {/* Text Area */}
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex justify-between items-baseline gap-2">
            <span className={`text-[11px] font-bold truncate ${notification.read ? "text-slate-300" : "text-slate-100 font-extrabold"}`}>
              {notification.title}
            </span>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider shrink-0">
              {getRelativeTime(notification.createdAt)}
            </span>
          </div>

          <p className="text-[11px] text-slate-400 leading-normal font-medium break-words line-clamp-2">
            {notification.message}
          </p>
        </div>

        {/* Unread dot */}
        {!notification.read && (
          <div className="flex items-center shrink-0 pr-1">
            <Circle className="w-2.5 h-2.5 text-violet-400 fill-violet-400" />
          </div>
        )}
      </div>
    </Link>
  );
};
