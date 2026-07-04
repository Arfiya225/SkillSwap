"use client";
import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { LeaderboardCard } from "@/components/ui/LeaderboardCard";
import { 
  getTopUsersByReputation, 
  getTopTeachers, 
  getMostActiveLearners 
} from "@/services/leaderboard";
import { LeaderboardEntry } from "@/types/admin";
import { Loader2, Award, TrendingUp, Users, BookOpen } from "lucide-react";

export default function LeaderboardsPage() {
  const [loading, setLoading] = useState(true);
  const [topReputation, setTopReputation] = useState<LeaderboardEntry[]>([]);
  const [topTeachers, setTopTeachers] = useState<LeaderboardEntry[]>([]);
  const [topLearners, setTopLearners] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [repData, teacherData, learnerData] = await Promise.all([
          getTopUsersByReputation(10),
          getTopTeachers(10),
          getMostActiveLearners(10)
        ]);
        setTopReputation(repData);
        setTopTeachers(teacherData);
        setTopLearners(learnerData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-12 px-4 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-amber-500/10 rounded-full mb-4">
            <Award className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Community Leaderboards</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Discover the top learners, teachers, and most active members making SkillSwap an amazing place to grow.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-8">
          {/* Top Reputation Column */}
          <div className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-white">Top Reputation</h2>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-indigo-500 animate-spin" /></div>
            ) : topReputation.length === 0 ? (
              <div className="text-center text-slate-500 py-8">No data available yet</div>
            ) : (
              <div className="space-y-2">
                {topReputation.map((l) => (
                  <LeaderboardCard key={`rep-${l.userId}`} entry={l} />
                ))}
              </div>
            )}
          </div>

          {/* Top Teachers Column */}
          <div className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold text-white">Top Teachers</h2>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-indigo-500 animate-spin" /></div>
            ) : topTeachers.length === 0 ? (
              <div className="text-center text-slate-500 py-8">No data available yet</div>
            ) : (
              <div className="space-y-2">
                {topTeachers.map((l) => (
                  <LeaderboardCard key={`teach-${l.userId}`} entry={l} />
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
            ) : topLearners.length === 0 ? (
              <div className="text-center text-slate-500 py-8">No data available yet</div>
            ) : (
              <div className="space-y-2">
                {topLearners.map((l) => (
                  <LeaderboardCard key={`learn-${l.userId}`} entry={l} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
