"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    const isAuthRoute = pathname.startsWith("/auth");
    const isVerifyEmailRoute = pathname === "/auth/verify-email";

    if (!user) {
      // Not logged in: Redirect to login unless already on an auth route
      if (!isAuthRoute) {
        router.push("/auth/login");
      }
    } else {
      // Logged in:
      if (!user.emailVerified && !isVerifyEmailRoute && !isAuthRoute) {
        // Force email verification if not verified (except when already on verify-email or login/register)
        router.push("/auth/verify-email");
      } else if (user.emailVerified && isVerifyEmailRoute) {
        // Verified: Don't let them sit on verify-email
        router.push("/matches");
      } else if (isAuthRoute && !isVerifyEmailRoute) {
        // Don't let logged in users access login/register/forgot-password
        router.push("/matches");
      }
    }
  }, [user, loading, pathname, router]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-violet-400 animate-spin" />
        <p className="text-xs text-slate-400 animate-pulse font-medium">Securing connection...</p>
      </div>
    );
  }

  // Determine if content should be rendered to prevent visual flash before redirect
  const isAuthRoute = pathname.startsWith("/auth");
  const isVerifyEmailRoute = pathname === "/auth/verify-email";

  if (!user && !isAuthRoute) return null;
  if (user && !user.emailVerified && !isVerifyEmailRoute && !isAuthRoute) return null;
  if (user && user.emailVerified && isVerifyEmailRoute) return null;
  if (user && isAuthRoute && !isVerifyEmailRoute) return null;

  return <>{children}</>;
};
export default ProtectedRoute;
