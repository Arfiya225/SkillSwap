"use client";
import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { AdminStatCard } from "@/components/ui/AdminStatCard";
import { AdminAnalyticsChart } from "@/components/ui/AdminAnalyticsChart";
import { PlatformHealthWidget } from "@/components/ui/PlatformHealthWidget";
import { getGlobalAdminAnalytics, getAdminChartData } from "@/services/adminAnalytics";
import { AdminAnalytics } from "@/types/admin";
import { Loader2, Users, Activity, Target, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [chartData, setChartData] = useState<{date: string, users: number}[]>([]);

  useEffect(() => {
    async function load() {
      const [data, cData] = await Promise.all([
        getGlobalAdminAnalytics(),
        getAdminChartData()
      ]);
      setAnalytics(data);
      setChartData(cData);
      setLoading(false);
    }
    load();
  }, []);

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

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-12 px-4 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Control Center</h1>
            <p className="text-slate-400">Global platform analytics and moderation.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/users" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors border border-slate-700">
              Users
            </Link>
            <Link href="/admin/moderation" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors border border-slate-700">
              Moderation
            </Link>
            <Link href="/admin/verification" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors border border-slate-700">
              Verifications
            </Link>
          </div>
        </div>

        <div className="mb-6">
          <PlatformHealthWidget issues={0} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <AdminStatCard 
            title="Total Users" 
            value={analytics?.totalUsers || 0} 
            icon={<Users className="w-5 h-5" />} 
            trend="+12%" 
          />
          <AdminStatCard 
            title="Active Users (30d)" 
            value={analytics?.activeUsers || 0} 
            icon={<Activity className="w-5 h-5" />} 
            trend="+5%" 
          />
          <AdminStatCard 
            title="Total Swaps" 
            value={analytics?.totalSwaps || 0} 
            icon={<Target className="w-5 h-5" />} 
          />
          <AdminStatCard 
            title="Total Reviews" 
            value={analytics?.totalReviewsSubmitted || 0} 
            icon={<MessageSquare className="w-5 h-5" />} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AdminAnalyticsChart data={chartData} />
          </div>
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-white font-medium mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/admin/users" className="block w-full text-left p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 transition-colors text-sm text-slate-300">
                Manage Suspended Users &rarr;
              </Link>
              <Link href="/admin/moderation" className="block w-full text-left p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 transition-colors text-sm text-slate-300">
                Review Reported Content &rarr;
              </Link>
              <Link href="/admin/verification" className="block w-full text-left p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 transition-colors text-sm text-slate-300">
                Approve Verifications &rarr;
              </Link>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
