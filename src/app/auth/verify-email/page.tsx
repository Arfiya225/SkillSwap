"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { GradientButton } from "@/components/ui/GradientButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Mail, RefreshCw, LogOut } from "lucide-react";
import toast from "react-hot-toast";

export default function VerifyEmailPage() {
  const { user, sendVerification, logout } = useAuth();
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleResend = async () => {
    setResending(true);
    try {
      await sendVerification();
      toast.success("Verification email sent!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to send verification email");
    } finally {
      setResending(false);
    }
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      // Reload Firebase Auth user state
      if (user) {
        await user.reload();
        // Force refresh of window to trigger ProtectedRoute logic
        window.location.reload();
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Error refreshing status. Please try logging in again.");
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
    } catch (err: any) {
      console.error(err);
      toast.error("Logout failed");
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0F172A]">
        {/* Glows */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl" />

        <GlassCard className="w-full max-w-md border border-white/5 shadow-2xl relative z-10 py-8 px-6 sm:px-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight mb-3">
            Verify your email
          </h2>
          
          <p className="text-slate-300 text-sm mb-2 leading-relaxed">
            We&apos;ve sent a verification link to your email:
          </p>
          <p className="text-violet-300 text-sm font-semibold mb-6 truncate select-all">
            {user?.email}
          </p>

          <div className="space-y-3 bg-slate-950/20 border border-white/5 p-5 rounded-2xl mb-6">
            <p className="text-xs text-slate-400 leading-relaxed">
              Once you have clicked the link in your email inbox, press the check status button below to access the platform.
            </p>
            
            <GradientButton
              variant="primary"
              loading={checking}
              onClick={handleCheckStatus}
              className="w-full text-sm py-2.5 mt-2"
            >
              <RefreshCw className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} />
              <span>I&apos;ve verified my email</span>
            </GradientButton>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-center justify-center text-xs">
            <button
              onClick={handleResend}
              disabled={resending}
              className="font-semibold text-violet-400 hover:text-violet-300 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {resending ? "Sending..." : "Resend Verification Email"}
            </button>
            <span className="hidden sm:inline text-slate-600">|</span>
            <button
              onClick={handleLogout}
              className="font-semibold text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </GlassCard>
      </div>
    </ProtectedRoute>
  );
}
