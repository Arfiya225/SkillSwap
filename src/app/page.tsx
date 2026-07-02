"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { GradientButton } from "@/components/ui/GradientButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { Sparkles, HeartHandshake, ShieldAlert, Library, MessageSquareCode, ArrowRight, ArrowRightLeft } from "lucide-react";

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#0F172A] relative overflow-hidden flex flex-col justify-between">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-500/5 rounded-full blur-3xl" />

      {/* Top Header */}
      <header className="sticky top-0 z-30 w-full bg-slate-950/40 backdrop-blur-md border-b border-white/5 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 via-violet-500 to-pink-500 flex items-center justify-center text-white font-bold">
              <HeartHandshake className="w-4.5 h-4.5" />
            </div>
            <span className="font-extrabold text-base bg-gradient-to-r from-blue-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
              SkillSwap AI
            </span>
          </div>

          <Link href={user ? "/matches" : "/auth/login"}>
            <GradientButton variant="secondary" className="text-xs py-2">
              {user ? "Enter Dashboard" : "Sign In"}
            </GradientButton>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-20 flex flex-col items-center justify-center text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold mb-6 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Peer Learning Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-100 leading-none max-w-3xl">
          Learn from peers,{" "}
          <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
            teach what you know.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed">
          Skip expensive courses. Connect with college peers to swap knowledge. Teach Python, learn Design, collaborate in private study rooms.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-md">
          <Link href={user ? "/matches" : "/auth/register"} className="w-full sm:w-auto">
            <GradientButton variant="primary" className="w-full sm:w-48 py-3.5 font-bold flex items-center justify-center gap-2">
              <span>Start Swapping</span>
              <ArrowRight className="w-4 h-4" />
            </GradientButton>
          </Link>
          <Link href="/matches" className="w-full sm:w-auto">
            <GradientButton variant="secondary" className="w-full sm:w-48 py-3.5 font-semibold">
              Browse Matches
            </GradientButton>
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 sm:mt-24 w-full">
          <GlassCard className="border border-white/5 flex flex-col items-center p-6 text-center">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
              <Library className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-100 mb-2">Smart Match Discovery</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Find partners based on skill overlap, experience levels, and profile completeness score.
            </p>
          </GlassCard>

          <GlassCard className="border border-white/5 flex flex-col items-center p-6 text-center">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mb-4">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-100 mb-2">Interactive Swaps</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Send, cancel, or accept real-time requests. Receive notification alerts instantly.
            </p>
          </GlassCard>

          <GlassCard className="border border-white/5 flex flex-col items-center p-6 text-center">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center mb-4">
              <MessageSquareCode className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-100 mb-2">Learning Sandbox</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upon approval, gain instant access to your private room containing shared note boards and checklists.
            </p>
          </GlassCard>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900/60 py-6 px-4 text-center text-xs text-slate-500">
        <p>© 2026 SkillSwap AI. Built for developers, designers, and self-learners.</p>
      </footer>
    </div>
  );
}
