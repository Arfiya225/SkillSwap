"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navbar } from "@/components/Navbar";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { LearningRoomWithDetails } from "@/types/room";
import { collection, query, where, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Users, Calendar, ArrowRightLeft, Activity, GraduationCap } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

type TabType = "active" | "completed" | "archived";

export default function MyRoomsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("active");
  const [loading, setLoading] = useState(true);
  
  const [rooms, setRooms] = useState<LearningRoomWithDetails[]>([]);

  useEffect(() => {
    if (!user) return;

    setLoading(true);

    const q = query(
      collection(db, "learningRooms"),
      where("participants", "array-contains", user.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const fetchedRooms: LearningRoomWithDetails[] = [];
        
        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();
          if (data.status === "deleted") continue; // Hide soft-deleted rooms

          // Fetch profiles for the participants
          const participantProfiles: Record<string, any> = {};
          if (data.participants) {
            const usersRef = collection(db, "users");
            const userQ = query(usersRef, where("uid", "in", data.participants));
            const usersSnap = await getDocs(userQ);
            usersSnap.forEach((u) => {
              participantProfiles[u.id] = u.data();
            });
          }

          fetchedRooms.push({
            ...(data as LearningRoomWithDetails),
            roomId: docSnap.id,
            participantProfiles,
          });
        }
        
        // Sort by created date descending
        fetchedRooms.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB.getTime() - dateA.getTime();
        });

        setRooms(fetchedRooms);
      } catch (err) {
        console.error("Error processing rooms:", err);
        toast.error("Failed to load learning rooms.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const getFilteredRooms = (status: TabType) => {
    return rooms.filter((r) => {
      const roomStatus = r.status || "active"; // Backward compatibility fallback
      return roomStatus === status;
    });
  };

  const activeRooms = getFilteredRooms("active");
  const completedRooms = getFilteredRooms("completed");
  const archivedRooms = getFilteredRooms("archived");

  const currentList = 
    activeTab === "active" ? activeRooms : 
    activeTab === "completed" ? completedRooms : 
    archivedRooms;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0F172A] flex flex-col">
        <Navbar />

        <main className="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
          <PageHeader
            title="My Learning Rooms"
            description="Manage your active workspaces, review completed courses, and access archived resources."
          />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start mt-6">
            {/* Sidebar navigation */}
            <div className="flex flex-col gap-4 lg:col-span-1">
              <GlassCard className="p-4 border border-white/5 flex flex-row lg:flex-col gap-2 shrink-0">
                <button
                  onClick={() => setActiveTab("active")}
                  className={`flex-1 flex items-center justify-between px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    activeTab === "active"
                      ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shadow-[0_0_15px_-3px_rgba(16,185,129,0.15)]"
                      : "text-slate-400 hover:text-slate-200 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 shrink-0" />
                    <span>Active</span>
                  </div>
                  <span className="bg-emerald-500/20 px-2 py-0.5 rounded-md text-xs">{activeRooms.length}</span>
                </button>
                <button
                  onClick={() => setActiveTab("completed")}
                  className={`flex-1 flex items-center justify-between px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    activeTab === "completed"
                      ? "bg-amber-500/10 text-amber-300 border border-amber-500/20 shadow-[0_0_15px_-3px_rgba(245,158,11,0.15)]"
                      : "text-slate-400 hover:text-slate-200 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 shrink-0" />
                    <span>Completed</span>
                  </div>
                  <span className="bg-amber-500/20 px-2 py-0.5 rounded-md text-xs">{completedRooms.length}</span>
                </button>
                <button
                  onClick={() => setActiveTab("archived")}
                  className={`flex-1 flex items-center justify-between px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    activeTab === "archived"
                      ? "bg-slate-500/10 text-slate-300 border border-slate-500/20"
                      : "text-slate-400 hover:text-slate-200 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span>Archived</span>
                  </div>
                  <span className="bg-slate-500/20 px-2 py-0.5 rounded-md text-xs">{archivedRooms.length}</span>
                </button>
              </GlassCard>
            </div>

            {/* List cards content */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <LoadingSkeleton variant="list" count={4} />
                </div>
              ) : currentList.length === 0 ? (
                <EmptyState
                  icon={ArrowRightLeft}
                  title="No rooms found"
                  description={`You don't have any ${activeTab} rooms right now.`}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentList.map((room) => {
                    const dateFormatted = room.createdAt?.toDate
                      ? room.createdAt.toDate().toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Unknown";
                      
                    const peerId = room.participants.find(p => p !== user?.uid);
                    const peerName = room.participantProfiles?.[peerId || ""]?.name || "Participant";
                    const peerAvatar = room.participantProfiles?.[peerId || ""]?.avatar;
                    
                    const mySkills = room.exchangeSkills?.[user?.uid || ""];

                    return (
                      <GlassCard key={room.roomId} className="border border-white/5 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-700 bg-slate-800 flex items-center justify-center shrink-0">
                              {peerAvatar ? (
                                <img src={peerAvatar} alt={peerName} className="w-full h-full object-cover" />
                              ) : (
                                <Users className="w-5 h-5 text-slate-500" />
                              )}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-100 leading-tight">{peerName}</h4>
                              <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <Calendar className="w-3 h-3" />
                                {dateFormatted}
                              </span>
                            </div>
                          </div>
                          
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wider ${
                            room.status === "completed" ? "bg-amber-500/10 text-amber-300 border-amber-500/20" :
                            room.status === "archived" ? "bg-slate-500/10 text-slate-300 border-slate-500/20" :
                            "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                          }`}>
                            {room.status || "active"}
                          </span>
                        </div>

                        {mySkills ? (
                          <div className="bg-slate-950/20 p-3 rounded-xl border border-white/5 flex flex-col gap-2.5 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Learning</span>
                              <span className="font-bold text-emerald-400">{mySkills.learnsSkill}</span>
                            </div>
                            <div className="w-full bg-slate-900 rounded-full h-1.5 mt-1 overflow-hidden">
                              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${mySkills.progress || 0}%` }} />
                            </div>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                              <span className="text-slate-400">Teaching</span>
                              <span className="font-bold text-violet-400">{mySkills.teachesSkill}</span>
                            </div>
                          </div>
                        ) : room.swapRequestDetails ? (
                          <div className="bg-slate-950/20 p-3 rounded-xl border border-white/5 flex flex-col gap-2.5 text-xs">
                             <div className="flex items-center justify-between">
                              <span className="text-emerald-400 truncate max-w-[120px]">{room.swapRequestDetails.requestedSkill}</span>
                              <ArrowRightLeft className="w-3.5 h-3.5 text-slate-500" />
                              <span className="text-violet-400 truncate max-w-[120px]">{room.swapRequestDetails.offeredSkill}</span>
                            </div>
                          </div>
                        ) : null}
                        
                        <div className="grid grid-cols-2 gap-2 mt-1">
                           <div className="bg-slate-900/40 p-2 border border-white/5 rounded-lg flex flex-col items-center">
                              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Topics</span>
                              <span className="text-slate-200 text-sm font-bold">{room.stats?.topicsCompleted || 0}</span>
                           </div>
                           <div className="bg-slate-900/40 p-2 border border-white/5 rounded-lg flex flex-col items-center">
                              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Certs</span>
                              <span className="text-slate-200 text-sm font-bold">{room.stats?.certificatesIssued || 0}</span>
                           </div>
                        </div>

                        <div className="pt-2">
                          <Link href={`/rooms/${room.roomId}`} className="block w-full">
                            <GradientButton variant="primary" className="w-full py-2 text-xs">
                              {room.status === "archived" ? "View Archive" : "Enter Room"}
                            </GradientButton>
                          </Link>
                        </div>
                      </GlassCard>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
