"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navbar } from "@/components/Navbar";
import { PageHeader } from "@/components/ui/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { getLearningRoom } from "@/services/room";
import { LearningRoomWithDetails } from "@/types/room";
import {
  BookOpen,
  Calendar,
  Users,
  FileText,
  Paperclip,
  CheckSquare,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Lock,
  ArrowRightLeft,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RoomPage({ params }: PageProps) {
  const { user } = useAuth();
  const [roomId, setRoomId] = useState<string | null>(null);
  const [room, setRoom] = useState<LearningRoomWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // Notes state placeholder
  const [notesText, setNotesText] = useState(
    "// Shared Session Notes\n// Both participants can jot down notes here.\n// Realtime typing collaboration will be introduced in Phase 2!\n\n- React custom hooks explanation\n- Python decorator patterns\n- Setting up PostgreSQL database connection"
  );

  // Tasks placeholder state
  const [tasks, setTasks] = useState([
    { id: 1, text: "Read through React hooks documentation", completed: true },
    { id: 2, text: "Implement custom useFetch hook", completed: false },
    { id: 3, text: "Push code to GitHub repository", completed: false },
  ]);

  // Links placeholder state
  const [resources, setResources] = useState([
    { title: "React State Management Guide", url: "https://react.dev", type: "documentation" },
    { title: "Next.js App Router Architecture", url: "https://nextjs.org", type: "reference" },
  ]);

  useEffect(() => {
    params.then((p) => setRoomId(p.id));
  }, [params]);

  useEffect(() => {
    if (!roomId || !user) return;
    const currentRoomId = roomId;
    const currentUser = user;

    async function loadRoom() {
      try {
        setLoading(true);
        const data = await getLearningRoom(currentRoomId);
        if (data) {
          // Check if current user is actually a participant
          if (!data.participants.includes(currentUser.uid)) {
            toast.error("Access denied: You are not a participant in this room");
            setRoom(null);
          } else {
            setRoom(data);
          }
        } else {
          toast.error("Learning room not found");
        }
      } catch (err: any) {
        console.error(err);
        toast.error("Error loading learning room");
      } finally {
        setLoading(false);
      }
    }

    loadRoom();
  }, [roomId, user]);

  const dateFormatted = room?.createdAt?.toDate
    ? room.createdAt.toDate().toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : new Date().toLocaleDateString();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center gap-3">
        <BookOpen className="w-10 h-10 text-violet-400 animate-bounce" />
        <p className="text-xs text-slate-400 animate-pulse font-medium">Entering Learning Room...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#0F172A] flex flex-col">
          <Navbar />
          <div className="flex-grow flex flex-col items-center justify-center text-center p-6">
            <h2 className="text-2xl font-bold text-slate-100 mb-2">Access Denied or Room Not Found</h2>
            <p className="text-sm text-slate-400 max-w-sm mb-6">
              You do not have access to this room, or the swap request is not accepted yet.
            </p>
            <Link href="/dashboard/requests">
              <GradientButton variant="primary">Back to Requests</GradientButton>
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0F172A] flex flex-col">
        <Navbar />

        {/* Room Top Ribbon Info */}
        <div className="bg-slate-950/40 border-b border-white/5 py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/requests"
                className="p-2 bg-slate-900/60 border border-white/5 hover:border-slate-800 rounded-xl hover:text-slate-100 transition-all text-slate-400 cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                  Active Swap Space
                </span>
                <h1 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2 mt-1">
                  <span>Room:</span>
                  <span className="text-slate-300 font-mono text-xs select-all bg-slate-900 px-2 py-0.5 rounded border border-white/5">
                    {roomId}
                  </span>
                </h1>
              </div>
            </div>

            {/* Swap Details */}
            {room.swapRequestDetails && (
              <div className="flex items-center gap-3 bg-slate-900/65 border border-white/5 px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold max-w-md">
                <span className="text-emerald-400 truncate max-w-[120px]">
                  {room.swapRequestDetails.offeredSkill}
                </span>
                <ArrowRightLeft className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                <span className="text-pink-400 truncate max-w-[120px]">
                  {room.swapRequestDetails.requestedSkill}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Grid Panels Layout */}
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* LEFT COLUMN: Participants & Room Details */}
            <div className="lg:col-span-1 space-y-6">
              {/* Room Stats */}
              <GlassCard className="border border-white/5">
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-violet-400" />
                  <span>Room Details</span>
                </h3>
                <div className="space-y-3.5 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-slate-900/80">
                    <span className="text-slate-500 text-xs">Created On</span>
                    <span className="text-slate-300 font-semibold">{dateFormatted}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-900/80">
                    <span className="text-slate-500 text-xs">Access Level</span>
                    <span className="text-slate-300 font-semibold flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-violet-400" /> Private
                    </span>
                  </div>
                </div>
              </GlassCard>

              {/* Participants Details */}
              <GlassCard className="border border-white/5">
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>Participants</span>
                </h3>
                <div className="space-y-4">
                  {room.participants.map((uid) => {
                    const profile = room.participantProfiles?.[uid];
                    const isSelf = uid === user?.uid;
                    return (
                      <div key={uid} className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/40 border border-white/5">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-800 bg-slate-900 flex items-center justify-center shrink-0">
                          {profile?.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                          ) : (
                            <Users className="w-5 h-5 text-slate-600" />
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                            <span className="truncate">{profile?.name || "Participant"}</span>
                            {isSelf && (
                              <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-normal">
                                You
                              </span>
                            )}
                          </h4>
                          <p className="text-[10px] text-slate-400 truncate">{profile?.email}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            </div>

            {/* RIGHT COLUMN: Shared note workspace & Placeholders */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Note editor block */}
              <GlassCard className="border border-white/5">
                <div className="flex items-center justify-between border-b border-slate-900/80 pb-3 mb-4">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-violet-400" />
                    <span>Shared Learning Notes</span>
                  </h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-violet-500 animate-pulse" />
                    <span>Phase 1 Sandbox</span>
                  </div>
                </div>
                <textarea
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  className="w-full h-64 p-4 rounded-xl text-xs font-mono bg-slate-950/70 border border-white/5 text-slate-300 resize-y focus:outline-none focus:border-slate-800 leading-relaxed"
                />
                <div className="mt-3 flex justify-between items-center text-[10px] text-slate-500 italic">
                  <span>Autosave is simulation only.</span>
                  <span>Markdown formatting supported.</span>
                </div>
              </GlassCard>

              {/* Tasks Board block */}
              <GlassCard className="border border-white/5">
                <div className="flex items-center justify-between border-b border-slate-900/80 pb-3 mb-4">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-blue-400" />
                    <span>Learning Roadmap Checklist</span>
                  </h3>
                  <span className="text-[10px] bg-slate-900 text-slate-500 px-2 py-0.5 rounded-full border border-white/5">
                    Phase 1 Sandbox
                  </span>
                </div>
                <div className="space-y-2.5">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => {
                        setTasks(
                          tasks.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t))
                        );
                      }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/40 border border-white/5 cursor-pointer hover:bg-slate-900/60 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        readOnly
                        className="w-4 h-4 rounded border-slate-800 bg-slate-950/50 text-violet-500 focus:ring-violet-500/20 cursor-pointer"
                      />
                      <span className={`text-xs ${task.completed ? "line-through text-slate-500" : "text-slate-300 font-semibold"}`}>
                        {task.text}
                      </span>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Resources block */}
              <GlassCard className="border border-white/5">
                <div className="flex items-center justify-between border-b border-slate-900/80 pb-3 mb-4">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-pink-400" />
                    <span>Shared Links & Materials</span>
                  </h3>
                  <span className="text-[10px] bg-slate-900 text-slate-500 px-2 py-0.5 rounded-full border border-white/5">
                    Phase 1 Sandbox
                  </span>
                </div>
                <div className="space-y-2.5">
                  {resources.map((res, index) => (
                    <a
                      key={index}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-white/5 hover:bg-slate-900/60 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <BookOpen className="w-4 h-4 text-pink-400 shrink-0" />
                        <span className="text-xs text-slate-300 font-semibold">{res.title}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                    </a>
                  ))}
                </div>
              </GlassCard>
            </div>
            
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
