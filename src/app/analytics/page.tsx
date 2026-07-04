"use client";
import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { AnalyticsCard } from "@/components/ui/AnalyticsCard";
import { ProgressChart } from "@/components/ui/ProgressChart";
import { StreakWidget } from "@/components/ui/StreakWidget";
import { AttendanceHistory } from "@/components/ui/AttendanceHistory";
import { RatingBreakdown } from "@/components/ui/RatingBreakdown";
import { ReviewCard } from "@/components/ui/ReviewCard";
import { ReputationBadge } from "@/components/ui/ReputationBadge";

import { auth } from "@/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { Loader2, Activity, Clock, Target, Users } from "lucide-react";

import { getUserAnalytics, getChartData } from "@/services/analytics";
import { getUserAttendanceHistory } from "@/services/attendance";
import { subscribeToUserReviews } from "@/services/ratings";
import { getUserReputation } from "@/services/reputation";

import { UserAnalytics, ActivitySummary } from "@/types/analytics";
import { Attendance } from "@/types/attendance";
import { Review } from "@/types/review";
import { Reputation } from "@/types/reputation";

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reputation, setReputation] = useState<Reputation | null>(null);

  // Mock chart data for MVP
  const [chartData, setChartData] = useState<ActivitySummary[]>([]);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setUserId(user ? user.uid : null);
      if (!user) setLoading(false);
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const loadData = async () => {
      try {
        const [aData, attData, repData, cData] = await Promise.all([
          getUserAnalytics(userId),
          getUserAttendanceHistory(userId),
          getUserReputation(userId),
          getChartData(userId, 7)
        ]);
        
        setAnalytics(aData);
        setAttendance(attData);
        setReputation(repData);
        setChartData(cData);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    const unsubReviews = subscribeToUserReviews(userId, (revs) => {
      setReviews(revs);
    });

    return () => unsubReviews();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        </main>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 max-w-md w-full text-center">
            <h2 className="text-xl font-bold text-white mb-2">Sign in Required</h2>
            <p className="text-slate-400">Please sign in to view your analytics dashboard.</p>
          </div>
        </main>
      </div>
    );
  }

  const breakdown = {
    overall: reputation?.averageRating || 0,
    teaching: reviews.reduce((acc, r) => acc + r.teachingRating, 0) / (reviews.length || 1),
    communication: reviews.reduce((acc, r) => acc + r.communicationRating, 0) / (reviews.length || 1),
    reliability: reviews.reduce((acc, r) => acc + r.reliabilityRating, 0) / (reviews.length || 1),
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-12 px-4 max-w-7xl mx-auto w-full">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Learning Analytics</h1>
            <p className="text-slate-400">Track your progress, reputation, and swap history.</p>
          </div>
          
          {reputation && reputation.badges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {reputation.badges.map(b => <ReputationBadge key={b} badge={b} />)}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <AnalyticsCard 
            title="Total Learning Hours" 
            value={analytics?.totalHours.toFixed(1) || "0.0"} 
            icon={<Clock className="w-5 h-5" />} 
            trend="+2.5 this week" 
            trendUp={true} 
          />
          <AnalyticsCard 
            title="Completed Swaps" 
            value={analytics?.completedSwaps || 0} 
            icon={<Target className="w-5 h-5" />} 
          />
          <AnalyticsCard 
            title="Reputation Score" 
            value={reputation?.score || 0} 
            icon={<Activity className="w-5 h-5" />} 
            trend="Top 10%" 
            trendUp={true} 
          />
          <AnalyticsCard 
            title="Sessions Attended" 
            value={analytics?.attendedSessions || 0} 
            icon={<Users className="w-5 h-5" />} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <ProgressChart data={chartData} />
          </div>
          <div className="flex flex-col gap-6">
            <StreakWidget days={analytics?.streakDays || 0} />
            <AttendanceHistory history={attendance} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold text-white mb-4">Reputation</h2>
            <RatingBreakdown breakdown={breakdown} totalReviews={reputation?.totalReviews || 0} />
          </div>
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-white mb-4">Recent Reviews</h2>
            {reviews.length === 0 ? (
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-8 text-center text-slate-400">
                You haven&apos;t received any reviews yet. Complete a swap to earn feedback!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.map(rev => <ReviewCard key={rev.id} review={rev} />)}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
