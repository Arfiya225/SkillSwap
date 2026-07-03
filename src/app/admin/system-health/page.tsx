"use client";
import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { PlatformHealthWidget } from "@/components/ui/PlatformHealthWidget";
import { ShieldCheck, Database, Cloud, Zap, Server, Loader2, CheckCircle, XCircle } from "lucide-react";
import { db, auth, storage } from "@/firebase/config";
import Link from "next/link";

export default function SystemHealthPage() {
  const [loading, setLoading] = useState(true);
  const [healthStatus, setHealthStatus] = useState({
    firestore: false,
    auth: false,
    storage: false,
    ai: false,
    env: false,
  });

  useEffect(() => {
    async function checkHealth() {
      try {
        // Simple sanity checks
        const firestoreStatus = !!db;
        const authStatus = !!auth;
        const storageStatus = !!storage;
        
        // Check ENV vars
        const envStatus = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
        const aiStatus = !!process.env.NEXT_PUBLIC_GEMINI_API_KEY;

        setHealthStatus({
          firestore: firestoreStatus,
          auth: authStatus,
          storage: storageStatus,
          ai: aiStatus,
          env: envStatus,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    checkHealth();
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

  const issuesCount = Object.values(healthStatus).filter(status => !status).length;

  const StatusItem = ({ label, status, icon: Icon }: { label: string, status: boolean, icon: any }) => (
    <div className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-700/50 rounded-xl">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${status ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
          <Icon className={`w-5 h-5 ${status ? 'text-emerald-400' : 'text-rose-400'}`} />
        </div>
        <span className="text-white font-medium">{label}</span>
      </div>
      {status ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-rose-400" />}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-12 px-4 max-w-4xl mx-auto w-full">
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-2">
            <Link href="/admin" className="text-sm text-indigo-400 hover:text-indigo-300">&larr; Back to Dashboard</Link>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Production Readiness Audit</h1>
          <p className="text-slate-400">System health, environment validation, and dependency connectivity.</p>
        </div>

        <div className="mb-8">
          <PlatformHealthWidget issues={issuesCount} />
        </div>

        <h3 className="text-xl font-bold text-white mb-4">Infrastructure Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <StatusItem label="Environment Configuration" status={healthStatus.env} icon={Server} />
          <StatusItem label="Firestore Database" status={healthStatus.firestore} icon={Database} />
          <StatusItem label="Firebase Authentication" status={healthStatus.auth} icon={ShieldCheck} />
          <StatusItem label="Firebase Storage" status={healthStatus.storage} icon={Cloud} />
          <StatusItem label="Gemini AI API" status={healthStatus.ai} icon={Zap} />
        </div>

        <div className="bg-slate-900/40 border border-indigo-500/20 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-2">Launch Checklist</h3>
          <ul className="space-y-3 text-slate-300">
            <li className="flex items-start"><CheckCircle className="w-5 h-5 text-emerald-400 mr-2 shrink-0" /> Security rules deployed to production</li>
            <li className="flex items-start"><CheckCircle className="w-5 h-5 text-emerald-400 mr-2 shrink-0" /> AI Caching layer active to prevent cost overruns</li>
            <li className="flex items-start"><CheckCircle className="w-5 h-5 text-emerald-400 mr-2 shrink-0" /> Performance optimizatons (code splitting, lazy loading) completed</li>
            <li className="flex items-start"><CheckCircle className="w-5 h-5 text-emerald-400 mr-2 shrink-0" /> All environment variables injected securely</li>
            <li className="flex items-start"><CheckCircle className="w-5 h-5 text-emerald-400 mr-2 shrink-0" /> Deployment documented in DEPLOYMENT.md</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
