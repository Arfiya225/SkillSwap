"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navbar } from "@/components/Navbar";
import { PageHeader } from "@/components/ui/PageHeader";
import { MatchCard } from "@/components/ui/MatchCard";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { getAllUsersExcept } from "@/services/profile";
import { sendSwapRequest } from "@/services/swap";
import { calculateMatchScore } from "@/utils/matching";
import { DbUser } from "@/types/user";
import { Users, AlertTriangle, Send, X, Library } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface EvaluatedMatch {
  user: DbUser;
  score: number;
  explanation: string[];
}

export default function MatchesPage() {
  const { user, dbUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<EvaluatedMatch[]>([]);
  
  // Swap request modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<DbUser | null>(null);
  const [offeredSkill, setOfferedSkill] = useState("");
  const [requestedSkill, setRequestedSkill] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [sendingRequest, setSendingRequest] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [minScore, setMinScore] = useState(0);

  useEffect(() => {
    async function loadMatches() {
      if (!user || !dbUser) return;
      try {
        setLoading(true);
        const otherUsers = await getAllUsersExcept(user.uid);
        
        // Calculate match scores
        const scored = otherUsers.map((other) => {
          const { score, explanation } = calculateMatchScore(dbUser, other);
          return {
            user: other,
            score,
            explanation,
          };
        });

        // Filter and sort
        // We sort desc by score
        scored.sort((a, b) => b.score - a.score);
        setMatches(scored);
      } catch (err: any) {
        console.error(err);
        toast.error("Failed to load matches");
      } finally {
        setLoading(false);
      }
    }
    loadMatches();
  }, [user, dbUser]);

  const handleOpenSwapModal = (targetUser: DbUser) => {
    if (!dbUser || dbUser.skillsCanTeach.length === 0) {
      toast.error("Please add skills you can teach in your profile first!");
      return;
    }
    setSelectedUser(targetUser);
    setOfferedSkill(dbUser.skillsCanTeach[0]?.skillName || "");
    setRequestedSkill(targetUser.skillsCanTeach[0]?.skillName || "");
    setRequestMessage("");
    setIsModalOpen(true);
  };

  const handleSendSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedUser) return;

    if (!offeredSkill) {
      toast.error("Please select a skill to offer");
      return;
    }
    if (!requestedSkill) {
      toast.error("Please select a skill to learn");
      return;
    }

    setSendingRequest(true);
    const toastId = toast.loading("Sending swap request...");
    try {
      await sendSwapRequest(
        user.uid,
        selectedUser.uid,
        offeredSkill,
        requestedSkill,
        requestMessage
      );
      toast.success(`Swap request sent to ${selectedUser.name}!`, { id: toastId });
      setIsModalOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to send request", { id: toastId });
    } finally {
      setSendingRequest(false);
    }
  };

  // Filter criteria logic
  const filteredMatches = matches.filter((m) => {
    const matchesSearch =
      m.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.user.skillsCanTeach.some((s) => s.skillName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      m.user.skillsWantToLearn.some((s) => s.skillName.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesScore = m.score >= minScore;
    return matchesSearch && matchesScore;
  });

  const isProfileIncomplete = !dbUser || dbUser.skillsCanTeach.length === 0 || dbUser.skillsWantToLearn.length === 0;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0F172A] flex flex-col">
        <Navbar />

        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PageHeader
            title="Peer Matches"
            description="Intelligent partner pairing based on what you teach and what they want to learn."
          />

          {/* Profile Warning banner */}
          {isProfileIncomplete && !loading && (
            <GlassCard className="border border-yellow-500/20 bg-yellow-500/5 mb-6 py-4 px-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex gap-3 items-center">
                <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-slate-100">Setup your skills list</h4>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    You haven&apos;t added any skills to teach or learn yet. Update your profile to unlock custom matching suggestions.
                  </p>
                </div>
              </div>
              <Link href="/profile" className="shrink-0 w-full sm:w-auto">
                <GradientButton variant="secondary" className="w-full text-xs py-2 border-yellow-500/20 text-yellow-400">
                  Update Skills
                </GradientButton>
              </Link>
            </GlassCard>
          )}

          {/* Filters Pane */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <div className="sm:col-span-3">
              <input
                type="text"
                placeholder="Search by name or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-medium"
              />
            </div>
            <div>
              <select
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-medium bg-slate-900/50 appearance-none cursor-pointer"
              >
                <option value="0">All Match Scores</option>
                <option value="50">50%+ Match Score</option>
                <option value="75">75%+ Match Score</option>
                <option value="90">90%+ Match Score</option>
              </select>
            </div>
          </div>

          {/* Grid matches list */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <LoadingSkeleton variant="card" count={3} />
            </div>
          ) : filteredMatches.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No matches found"
              description={
                searchQuery || minScore > 0
                  ? "Adjust your filters to see more results."
                  : "We couldn't find other users right now. As soon as peers join with matching goals, they will appear here!"
              }
              actionText={searchQuery || minScore > 0 ? "Clear Filters" : undefined}
              onAction={() => {
                setSearchQuery("");
                setMinScore(0);
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMatches.map((m) => (
                <MatchCard
                  key={m.user.uid}
                  match={m}
                  onRequestSwap={handleOpenSwapModal}
                />
              ))}
            </div>
          )}
        </main>
        
        {/* Swap Request Glassmorphism Modal */}
        {isModalOpen && selectedUser && dbUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
            <GlassCard className="w-full max-w-lg border border-white/10 shadow-2xl relative p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1 hover:bg-slate-800/50 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
                  <Library className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-100">Send Swap Request</h3>
                  <p className="text-xs text-slate-400">Request a knowledge exchange with {selectedUser.name}</p>
                </div>
              </div>

              <form onSubmit={handleSendSwap} className="space-y-4">
                {/* Offer selection */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Skill You Will Teach (Your Offered Skill)
                  </label>
                  <select
                    value={offeredSkill}
                    onChange={(e) => setOfferedSkill(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-medium bg-slate-900 appearance-none cursor-pointer"
                  >
                    {dbUser.skillsCanTeach.map((s) => (
                      <option key={s.skillName} value={s.skillName}>
                        {s.skillName} ({s.experienceLevel})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Request selection */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Skill You Want to Learn (Their Skill)
                  </label>
                  <select
                    value={requestedSkill}
                    onChange={(e) => setRequestedSkill(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-medium bg-slate-900 appearance-none cursor-pointer"
                  >
                    {selectedUser.skillsCanTeach.map((s) => (
                      <option key={s.skillName} value={s.skillName}>
                        {s.skillName} ({s.experienceLevel})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Proposal Message
                  </label>
                  <textarea
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    placeholder="Describe what you want to achieve together, your availability, etc..."
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-medium resize-none leading-relaxed"
                    maxLength={150}
                  />
                  <div className="text-right text-[10px] text-slate-500">
                    {requestMessage.length}/150 characters
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-3">
                  <GradientButton
                    variant="secondary"
                    onClick={() => setIsModalOpen(false)}
                    disabled={sendingRequest}
                    className="w-28 py-2"
                  >
                    Cancel
                  </GradientButton>
                  <GradientButton
                    type="submit"
                    loading={sendingRequest}
                    className="w-40 py-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Request</span>
                  </GradientButton>
                </div>
              </form>
            </GlassCard>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
