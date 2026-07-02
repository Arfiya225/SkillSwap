"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "@/validations/auth";
import { useAuth } from "@/context/AuthContext";
import { GradientButton } from "@/components/ui/GradientButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Mail, Lock, User, Sparkles } from "lucide-react";
import { GoogleIcon } from "@/components/icons/BrandIcons";
import Link from "next/link";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const { signup, googleLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    try {
      await signup(data.email, data.password, data.name);
      toast.success("Account created! A verification email has been sent.");
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        toast.error("An account with this email already exists");
      } else {
        toast.error(err.message || "Failed to create account");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await googleLogin();
      toast.success("Account connected via Google!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Google Sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0F172A]">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl" />

        <GlassCard className="w-full max-w-md border border-white/5 shadow-2xl relative z-10 py-6 px-6 sm:px-8">
          {/* Logo Section */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SkillSwap AI</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Create an account
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">
              Start swapping skills and learn from peers
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="John Doe"
                  {...register("name")}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm glass-input font-medium ${
                    errors.name ? "border-red-500/50" : ""
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

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

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm glass-input font-medium ${
                    errors.password ? "border-red-500/50" : ""
                  }`}
                />
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm glass-input font-medium ${
                    errors.confirmPassword ? "border-red-500/50" : ""
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <GradientButton
              type="submit"
              loading={loading}
              disabled={googleLoading}
              className="w-full mt-4 py-3"
            >
              Sign Up
            </GradientButton>
          </form>

          {/* Divider */}
          <div className="relative my-5 flex items-center">
            <div className="flex-grow border-t border-slate-800" />
            <span className="mx-4 text-xs font-medium text-slate-500 uppercase">or</span>
            <div className="flex-grow border-t border-slate-800" />
          </div>

          {/* Google Login */}
          <GradientButton
            variant="secondary"
            loading={googleLoading}
            disabled={loading}
            onClick={handleGoogleLogin}
            className="w-full py-2.5 border-slate-800 hover:border-slate-700/80 bg-slate-900/60 text-slate-200 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2"
          >
            <GoogleIcon className="w-4 h-4 shrink-0" />
            <span>Continue with Google</span>
          </GradientButton>

          {/* Redirect to login */}
          <div className="mt-6 text-center text-xs text-slate-400">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-violet-400 hover:text-violet-300 hover:underline transition-colors"
            >
              Sign In
            </Link>
          </div>
        </GlassCard>
      </div>
    </ProtectedRoute>
  );
}
