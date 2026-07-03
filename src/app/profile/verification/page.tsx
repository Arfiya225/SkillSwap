"use client";
import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { VerificationSubmissionForm } from "@/components/ui/VerificationSubmissionForm";
import { VerificationStatusChip } from "@/components/ui/VerificationStatusChip";
import { VerificationBadge } from "@/components/ui/VerificationBadge";
import { subscribeToUserVerifications, submitVerificationRequest } from "@/services/verification";
import { VerificationRequest, VerificationType } from "@/types/verification";
import { auth, db } from "@/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { DbUser } from "@/types/user";
import { Loader2, ShieldAlert } from "lucide-react";

export default function VerificationPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<DbUser | null>(null);
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setUserId(user ? user.uid : null);
      if (user) {
        const d = await getDoc(doc(db, "Users", user.uid));
        if (d.exists()) setUserProfile(d.data() as DbUser);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!userId) return;
    const unsub = subscribeToUserVerifications(userId, (data) => {
      setRequests(data);
      setLoading(false);
    });
    return () => unsub();
  }, [userId]);

  const handleSubmit = async (type: VerificationType, skillName: string, url: string, github: string) => {
    if (!userId) return;
    await submitVerificationRequest({
      userId,
      type,
      skillName: type !== "GitHub" ? skillName : undefined,
      documentUrl: type !== "GitHub" ? url : undefined,
      githubUsername: type === "GitHub" ? github : undefined
    });
    setShowForm(false);
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center text-slate-400">Please sign in to view this page.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-12 px-4 max-w-4xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              Trust & Verification
              {userProfile?.verificationLevel && (
                <span className="ml-3 mt-1"><VerificationBadge level={userProfile.verificationLevel} showLabel /></span>
              )}
            </h1>
            <p className="text-slate-400 mt-1">Upgrade your profile to get more exchanges and build trust.</p>
          </div>
          
          <button 
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {showForm ? "Close Form" : "Request Verification"}
          </button>
        </div>

        {showForm && (
          <div className="mb-10">
            <VerificationSubmissionForm onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />
          </div>
        )}

        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 border-b border-slate-700/50 pb-2">Your Submissions</h2>
          
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
          ) : requests.length === 0 ? (
            <div className="text-center py-10 text-slate-500 flex flex-col items-center">
              <ShieldAlert className="w-10 h-10 mb-2 opacity-50" />
              <p>You haven&apos;t submitted any verifications yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map(req => (
                <div key={req.id} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h4 className="text-white font-medium">{req.type} Verification</h4>
                    <p className="text-sm text-slate-400 mt-1">
                      {req.skillName && <span>Skill: {req.skillName}</span>}
                      {req.githubUsername && <span>User: {req.githubUsername}</span>}
                    </p>
                    {req.adminNotes && (
                      <p className="text-xs text-rose-400 mt-2 bg-rose-500/10 p-2 rounded border border-rose-500/20">
                        Admin Note: {req.adminNotes}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <VerificationStatusChip status={req.status} />
                    <span className="text-xs text-slate-500">
                      {req.createdAt ? new Date(req.createdAt.seconds * 1000).toLocaleDateString() : "Just now"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
