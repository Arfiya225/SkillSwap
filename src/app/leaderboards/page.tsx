"use client";
import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { LeaderboardCard } from "@/components/ui/LeaderboardCard";
import { getTopUsersByReputation } from "@/services/leaderboard";
import { LeaderboardEntry } from "@/types/admin";
import { Loader2, Award, TrendingUp, Users } from "lucide-react";

export default function LeaderboardsPage() {
  const [loading, setLoading] = useState(true);
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [filter, setFilter] = useState("All Time");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Mock filter behavior for MVP by shuffling/slicing or just reloading
        const data = await getTopUsersByReputation(20);
        setLeaders(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [filter]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-12 px-4 max-w-5xl mx-auto w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-amber-500/10 rounded-full mb-4">
            <Award className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Community Leaderboards</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Discover the top learners, teachers, and most active members making SkillSwap an amazing place to grow.
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="bg-slate-900/50 backdrop-blur-md p-1 rounded-lg border border-slate-700/50 inline-flex">
            {["Weekly", "Monthly", "All Time"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === f ? "bg-indigo-500 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Top Teachers Column */}
          <div className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-white">Top Reputation</h2>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-indigo-500 animate-spin" /></div>
            ) : (
              <div className="space-y-2">
                {leaders.slice(0, 10).map((l, i) => (
                  <LeaderboardCard key={l.userId + i} entry={l} />
                ))}
              </div>
            )}
          </div>

          {/* Most Active Learners Column */}
          <div className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Users className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-bold text-white">Most Active</h2>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-indigo-500 animate-spin" /></div>
            ) : (
              <div className="space-y-2">
                {leaders.slice().reverse().slice(0, 10).map((l, i) => (
                  <LeaderboardCard key={l.userId + "rev" + i} entry={{ ...l, rank: i + 1, score: l.score * 10 }} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
