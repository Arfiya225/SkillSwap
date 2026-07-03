"use client";
import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { VerificationReviewCard } from "@/components/ui/VerificationReviewCard";
import { subscribeToPendingVerifications, approveVerification, rejectVerification } from "@/services/admin";
import { VerificationRequest } from "@/types/verification";
import { auth } from "@/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { Loader2 } from "lucide-react";

export default function AdminVerificationDashboard() {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false); // In a real app, verify custom claims.

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      // Simplification: for MVP, if you're logged in, you can see the dashboard.
      setIsAdmin(!!user);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    const unsub = subscribeToPendingVerifications((data) => {
      setRequests(data);
      setLoading(false);
    });
    return () => unsub();
  }, [isAdmin]);

  const handleApprove = async (id: string, notes: string) => {
    const req = requests.find(r => r.id === id);
    if (!req) return;
    await approveVerification(id, req.userId, notes);
  };

  const handleReject = async (id: string, notes: string) => {
    const req = requests.find(r => r.id === id);
    if (!req) return;
    await rejectVerification(id, req.userId, notes);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center text-slate-400">Restricted Access.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-12 px-4 max-w-6xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-slate-400">Review and approve user verification requests.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20 text-slate-400 bg-slate-900/50 rounded-xl border border-slate-700/50">
            No pending verification requests.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map(req => (
              <VerificationReviewCard 
                key={req.id} 
                request={req} 
                onApprove={handleApprove} 
                onReject={handleReject} 
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
