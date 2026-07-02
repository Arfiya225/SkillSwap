"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, ForgotPasswordInput } from "@/validations/auth";
import { useAuth } from "@/context/AuthContext";
import { GradientButton } from "@/components/ui/GradientButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Mail, ArrowLeft, KeyRound } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setLoading(true);
    try {
      await resetPassword(data.email);
      setSubmitted(true);
      toast.success("Password reset link sent to your email!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0F172A]">
        {/* Glows */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl" />

        <GlassCard className="w-full max-w-md border border-white/5 shadow-2xl relative z-10 py-8 px-6 sm:px-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Reset Password
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">
              Enter your email and we&apos;ll send you a password reset link
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    placeholder="name@college.edu"
                    {...register("email")}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm glass-input font-medium ${
                      errors.email ? "border-red-500/50" : ""
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              <GradientButton type="submit" loading={loading} className="w-full mt-4 py-3">
                Send Reset Link
              </GradientButton>
            </form>
          ) : (
            <div className="text-center bg-slate-950/20 border border-white/5 p-5 rounded-2xl">
              <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                Check your email. We&apos;ve sent instructions on how to reset your password.
              </p>
              <GradientButton
                variant="secondary"
                onClick={() => setSubmitted(false)}
                className="w-full text-xs py-2"
              >
                Resend email
              </GradientButton>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </GlassCard>
      </div>
    </ProtectedRoute>
  );
}
