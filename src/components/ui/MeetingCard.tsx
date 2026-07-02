"use client";

import React from "react";
import { Meeting } from "@/types/meeting";
import { GlassCard } from "./GlassCard";
import { Video, Calendar, Clock, User, CheckCircle, XCircle, ExternalLink } from "lucide-react";

interface MeetingCardProps {
  meeting: Meeting;
  currentUserId: string;
  participantProfiles: Record<string, { name: string; avatar: string; email: string }>;
  onCancel?: (id: string) => Promise<void>;
}

export const MeetingCard: React.FC<MeetingCardProps> = ({
  meeting,
  currentUserId,
  participantProfiles,
  onCancel,
}) => {
  const hostProfile = participantProfiles[meeting.hostId];
  const isHost = meeting.hostId === currentUserId;

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDuration = () => {
    const diff = new Date(meeting.endTime).getTime() - new Date(meeting.startTime).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} mins`;
    const hrs = (mins / 60).toFixed(1);
    return `${hrs} hrs`;
  };

  const statusConfigs = {
    scheduled: {
      color: "bg-blue-500/10 border-blue-500/20 text-blue-400",
      label: "Scheduled",
      icon: Video,
    },
    completed: {
      color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
      label: "Completed",
      icon: CheckCircle,
    },
    cancelled: {
      color: "bg-red-500/10 border-red-500/20 text-red-400",
      label: "Cancelled",
      icon: XCircle,
    },
  };

  const currentConfig = statusConfigs[meeting.status];
  const StatusIcon = currentConfig.icon;

  const isMeetingActive = () => {
    if (meeting.status !== "scheduled") return false;
    const now = new Date().getTime();
    const start = new Date(meeting.startTime).getTime();
    const end = new Date(meeting.endTime).getTime();
    // Allow joining 15 minutes before and until the meeting ends
    return now >= start - 15 * 60 * 1000 && now <= end;
  };

  const handleCancelClick = async () => {
    if (onCancel && window.confirm("Are you sure you want to cancel this meeting?")) {
      try {
        await onCancel(meeting.id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <GlassCard className="border border-white/5 p-5 flex flex-col justify-between gap-4 h-full relative overflow-hidden transition-all duration-300 hover:border-slate-800">
      <div className="space-y-3">
        {/* Top Header Badge & Date */}
        <div className="flex justify-between items-center gap-3">
          <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border flex items-center gap-1 ${currentConfig.color}`}>
            <StatusIcon className="w-3 h-3 shrink-0" />
            <span>{currentConfig.label}</span>
          </span>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-600" />
            {formatDate(meeting.startTime)}
          </span>
        </div>

        {/* Title and Description */}
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-200 leading-snug truncate">
            {meeting.title}
          </h4>
          {meeting.description && (
            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
              {meeting.description}
            </p>
          )}
        </div>
      </div>

      {/* Meet metadata details */}
      <div className="space-y-2 border-t border-slate-900/60 pt-3.5 mt-auto">
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>
              {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
            </span>
          </div>
          <div className="text-right text-slate-500 font-semibold">
            Duration: {getDuration()}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 min-w-0">
            <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">
              Host: <span className="font-semibold text-slate-300">{hostProfile?.name || "Participant"}</span> {isHost && "(You)"}
            </span>
          </div>
          
          {/* Cancel button for scheduled host */}
          {meeting.status === "scheduled" && isHost && onCancel && (
            <button
              onClick={handleCancelClick}
              className="text-[10px] uppercase font-bold text-red-500 hover:text-red-400 cursor-pointer"
            >
              Cancel Meet
            </button>
          )}
        </div>

        {/* Action Button */}
        {meeting.status === "scheduled" ? (
          <a
            href={meeting.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full mt-2"
          >
            <button
              disabled={!isMeetingActive()}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isMeetingActive()
                  ? "bg-gradient-to-r from-blue-500 to-violet-500 text-white hover:opacity-90 shadow-md shadow-violet-500/10"
                  : "bg-slate-950/40 border border-white/5 text-slate-500 cursor-not-allowed"
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Join Session</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </a>
        ) : (
          <div className="w-full text-center py-2 text-[10px] text-slate-600 font-bold uppercase tracking-wider mt-2 border border-dashed border-white/5 rounded-xl">
            {meeting.status === "completed" ? "Session Concluded" : "Session Cancelled"}
          </div>
        )}
      </div>
    </GlassCard>
  );
};
