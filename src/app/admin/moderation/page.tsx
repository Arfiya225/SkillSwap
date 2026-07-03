"use client";
import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { MarketplaceModerationCard } from "@/components/ui/MarketplaceModerationCard";
import { ModerationReviewCard } from "@/components/ui/ModerationReviewCard";
import { getAllPendingReports, updateReportStatus } from "@/services/moderation";
import { Report } from "@/types/moderation";
import { Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function AdminModerationPage() {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    async function fetchReports() {
      try {
        const fetched = await getAllPendingReports();
        setReports(fetched);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  const handleResolve = async (id: string) => {
    setReports(prev => prev.filter(r => r.id !== id));
    await updateReportStatus(id, "Resolved", "Content removed by admin.");
  };

  const handleDismiss = async (id: string) => {
    setReports(prev => prev.filter(r => r.id !== id));
    await updateReportStatus(id, "Dismissed", "Report dismissed by admin.");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-12 px-4 max-w-6xl mx-auto w-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Link href="/admin" className="text-sm text-indigo-400 hover:text-indigo-300">&larr; Back to Dashboard</Link>
            </div>
            <h1 className="text-3xl font-bold text-white">Content Moderation</h1>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-12 text-center flex flex-col items-center">
            <ShieldCheck className="w-16 h-16 text-emerald-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">All Caught Up!</h3>
            <p className="text-slate-400">There are no pending reports to moderate.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map(report => (
              report.type === "Review" ? (
                <ModerationReviewCard 
                  key={report.id} 
                  report={report} 
                  onResolve={handleResolve} 
                  onDismiss={handleDismiss} 
                />
              ) : (
                <MarketplaceModerationCard 
                  key={report.id} 
                  report={report} 
                  onResolve={handleResolve} 
                  onDismiss={handleDismiss} 
                />
              )
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
