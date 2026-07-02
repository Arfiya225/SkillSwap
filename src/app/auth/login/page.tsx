"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/validations/auth";
import { useAuth } from "@/context/AuthContext";
import { GradientButton } from "@/components/ui/GradientButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Mail, Lock, Sparkles } from "lucide-react";
import { GoogleIcon } from "@/components/icons/BrandIcons";
import Link from "next/link";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { login, googleLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success("Successfully logged in!");
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        toast.error("Invalid email or password");
      } else {
        toast.error(err.message || "Failed to log in");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await googleLogin();
      toast.success("Logged in with Google!");
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
        {/* Floating Ambient Glow Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl" />

        <GlassCard className="w-full max-w-md border border-white/5 shadow-2xl relative z-10 py-8 px-6 sm:px-8">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold mb-3 animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SkillSwap AI</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Welcome back
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">
              Pick up where you left off in your learning journey
            </p>
          </div>

          {/* Email / Password Form */}
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

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-violet-400 hover:text-violet-300 hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
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

            <GradientButton
              type="submit"
              loading={loading}
              disabled={googleLoading}
              className="w-full mt-4 py-3"
            >
              Sign In
            </GradientButton>
          </form>

          {/* Divider */}
          <div className="relative my-6 flex items-center">
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

          {/* Redirect to signup */}
          <div className="mt-8 text-center text-xs text-slate-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="font-semibold text-violet-400 hover:text-violet-300 hover:underline transition-colors"
            >
              Create an account
            </Link>
          </div>
        </GlassCard>
      </div>
    </ProtectedRoute>
  );
}
