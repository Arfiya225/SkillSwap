"use client";

import React, { useState } from "react";
import { GlassCard } from "./GlassCard";
import { X, Calendar, Clock, Video, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface MeetingSchedulerProps {
  roomParticipants: string[];
  participantProfiles: Record<string, { name: string; avatar: string; email: string }>;
  onSchedule: (title: string, description: string, startTime: string, endTime: string) => Promise<void>;
  onClose: () => void;
}

export const MeetingScheduler: React.FC<MeetingSchedulerProps> = ({
  roomParticipants,
  participantProfiles,
  onSchedule,
  onClose,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date || !startTime || !endTime) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const startISO = `${date}T${startTime}`;
    const endISO = `${date}T${endTime}`;

    const startMs = new Date(startISO).getTime();
    const endMs = new Date(endISO).getTime();

    if (isNaN(startMs) || isNaN(endMs)) {
      toast.error("Invalid date or time format.");
      return;
    }

    if (startMs >= endMs) {
      toast.error("End time must be after start time.");
      return;
    }

    if (startMs < Date.now() - 5 * 60 * 1000) {
      toast.error("Cannot schedule meetings in the past.");
      return;
    }

    setSubmitting(true);
    try {
      await onSchedule(title, description, startISO, endISO);
      toast.success("Meeting scheduled successfully!");
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to schedule meeting.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <GlassCard className="border border-white/10 bg-slate-950/90 max-w-lg w-full p-6 animate-in zoom-in-95 duration-200 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-900 pb-3.5 mb-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Video className="w-5 h-5 text-violet-400" />
            <span>Schedule Workspace Meeting</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Meeting Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Code Review & Troubleshooting"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl glass-input font-medium text-slate-200"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Description / Agenda
            </label>
            <textarea
              placeholder="Outline what you plan to cover, references, or setup notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl glass-input font-medium text-slate-200 resize-none"
              rows={3}
            />
          </div>

          {/* Date Picker */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl glass-input font-medium bg-slate-900/60 text-slate-200"
                required
              />
            </div>
          </div>

          {/* Start and End Times */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Start Time *
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl glass-input font-medium bg-slate-900/60 text-slate-200"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                End Time *
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl glass-input font-medium bg-slate-900/60 text-slate-200"
                  required
                />
              </div>
            </div>
          </div>

          {/* Alert Info */}
          <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3.5 text-[11px] text-slate-400 leading-normal">
            💡 This will schedule a local session. Other workspace partners will receive immediate real-time notifications with redirect links.
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 justify-end pt-3 border-t border-slate-900 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-xs bg-gradient-to-r from-violet-500 to-pink-500 hover:opacity-90 text-white font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Scheduling...</span>
                </>
              ) : (
                <>
                  <Video className="w-3.5 h-3.5" />
                  <span>Schedule Meeting</span>
                </>
              )}
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};
