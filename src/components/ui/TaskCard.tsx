"use client";

import React, { useState } from "react";
import { Task, TaskStatus } from "@/types/task";
import { useAuth } from "@/context/AuthContext";
import { GlassCard } from "./GlassCard";
import {
  User,
  Trash2,
  Edit3,
  Save,
  X,
  Loader2,
  Calendar,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

interface TaskCardProps {
  task: Task;
  roomParticipants: string[];
  participantProfiles: Record<string, { name: string; avatar: string; email: string }>;
  onUpdate: (id: string, updates: Partial<Task>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  roomParticipants,
  participantProfiles,
  onUpdate,
  onDelete,
}) => {
  const { dbUser } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form states for inline editing
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description);
  const [editAssignedTo, setEditAssignedTo] = useState(task.assignedTo);
  const [editDueDate, setEditDueDate] = useState(task.dueDate);

  // Status mapping
  const statusColors = {
    todo: "bg-slate-800 border-slate-700 text-slate-300",
    in_progress: "bg-blue-500/10 border-blue-500/20 text-blue-400 animate-pulse",
    completed: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  };

  const statusLabels = {
    todo: "To Do",
    in_progress: "In Progress",
    completed: "Completed",
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as TaskStatus;
    setUpdating(true);
    try {
      await onUpdate(task.id, { status: newStatus });
      toast.success("Task status updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      toast.error("Task title is required");
      return;
    }

    setUpdating(true);
    try {
      const assignedName = participantProfiles[editAssignedTo]?.name || "Unassigned";
      await onUpdate(task.id, {
        title: editTitle.trim(),
        description: editDesc.trim(),
        assignedTo: editAssignedTo,
        assignedToName: assignedName,
        dueDate: editDueDate,
      });
      setIsEditing(false);
      toast.success("Task updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save updates");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete task "${task.title}"?`)) return;
    setDeleting(true);
    try {
      await onDelete(task.id);
      toast.success("Task deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete task");
    } finally {
      setDeleting(false);
    }
  };

  // Overdue check
  const isOverdue =
    task.status !== "completed" &&
    task.dueDate &&
    new Date(task.dueDate + "T23:59:59") < new Date();

  return (
    <GlassCard className="border border-white/5 p-5 relative overflow-hidden flex flex-col justify-between gap-4 h-full">
      {isEditing ? (
        /* Edit Form Interface */
        <form onSubmit={handleSaveEdit} className="space-y-3.5">
          <div className="flex justify-between items-center border-b border-slate-900 pb-2">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Edit Task details</h4>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Title</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl glass-input font-medium"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
            <textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl glass-input font-medium resize-none"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Assignee</label>
              <select
                value={editAssignedTo}
                onChange={(e) => setEditAssignedTo(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input font-medium bg-slate-900"
              >
                {roomParticipants.map((uid) => (
                  <option key={uid} value={uid}>
                    {participantProfiles[uid]?.name || "Participant"} {uid === dbUser?.uid ? "(You)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Due Date</label>
              <input
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input font-medium bg-slate-900"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t border-slate-900">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="px-4 py-1.5 rounded-lg text-xs bg-gradient-to-r from-blue-500 to-violet-500 hover:opacity-90 text-white font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save</span>
            </button>
          </div>
        </form>
      ) : (
        /* Read Only Mode Interface */
        <>
          <div className="space-y-2.5">
            {/* Top row status badge and actions */}
            <div className="flex justify-between items-start gap-4">
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border shrink-0 ${statusColors[task.status]}`}>
                {statusLabels[task.status]}
              </span>

              <div className="flex gap-1.5">
                <button
                  onClick={() => setIsEditing(true)}
                  title="Edit task"
                  className="text-slate-500 hover:text-slate-200 hover:bg-slate-800/40 p-1.5 rounded-lg transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  title="Delete task"
                  className="text-slate-500 hover:text-red-400 hover:bg-slate-800/40 p-1.5 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {deleting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Task Info */}
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-200 leading-snug">{task.title}</h4>
              {task.description && (
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{task.description}</p>
              )}
            </div>
          </div>

          {/* Bottom row assignee & due date */}
          <div className="flex flex-col gap-3.5 pt-3.5 border-t border-slate-900/60 mt-auto">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate max-w-[125px] font-medium">Assigned to: {task.assignedToName}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {isOverdue ? (
                  <div className="flex items-center gap-1 text-red-400 font-bold animate-pulse">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Overdue ({task.dueDate})</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Due: {task.dueDate || "No Date"}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Update Status Dropdown */}
            <div className="flex items-center justify-between gap-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
                Change Status
              </label>
              <select
                value={task.status}
                onChange={handleStatusChange}
                disabled={updating}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-white/5 hover:border-slate-800 bg-slate-900/60 text-slate-300 font-bold transition-all focus:outline-none cursor-pointer w-32"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </>
      )}
    </GlassCard>
  );
};
