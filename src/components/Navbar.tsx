"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { User, Menu, X, LogOut, HeartHandshake, Bell } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { NotificationCenter } from "./ui/NotificationCenter";
import { subscribeToNotifications, requestNotificationPermission } from "@/services/notifications";
import { AppNotification } from "@/types/notification";

export const Navbar: React.FC = () => {
  const { user, dbUser, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }
    const unsubscribe = subscribeToNotifications(user.uid, (data) => {
      setNotifications(data);
    });

    // Request browser push permission if supported
    if ("Notification" in window && Notification.permission !== "denied") {
      requestNotificationPermission(user.uid).catch(console.error);
    }

    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Successfully logged out");
      router.push("/auth/login");
    } catch (err: any) {
      console.error(err);
      toast.error("Logout failed");
    }
  };

  const navLinks = [
    { name: "Matches", href: "/matches" },
    { name: "Swap Requests", href: "/dashboard/requests" },
    { name: "My Rooms", href: "/dashboard/rooms" },
    { name: "My Profile", href: "/profile" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="sticky top-0 z-40 w-full bg-slate-950/65 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 lg:px-8 py-3.5 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/matches" className="flex items-center gap-2 cursor-pointer group" aria-label="Go to Matches">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 via-violet-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-violet-500/20 group-hover:scale-105 transition-transform duration-200">
            <HeartHandshake className="w-5 h-5" aria-hidden="true" />
          </div>
          <span className="font-extrabold text-lg bg-gradient-to-r from-blue-400 via-violet-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
            SkillSwap AI
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                isActive(link.href)
                  ? "bg-violet-500/10 text-violet-300 border border-violet-500/20 shadow-[0_0_15px_-3px_rgba(157,124,252,0.15)]"
                  : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop User Info / Actions */}
        <div className="hidden md:flex items-center gap-4 relative">
          {user && (
            <>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="Toggle notifications"
                aria-expanded={showNotifications}
                className="relative p-2 text-slate-400 hover:text-violet-400 rounded-xl hover:bg-slate-900/50 border border-transparent hover:border-white/5 transition-all duration-200 cursor-pointer"
              >
                <Bell className="w-5 h-5" aria-hidden="true" />
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)] animate-pulse" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute top-full right-16 z-50">
                  <NotificationCenter
                    userId={user.uid}
                    notifications={notifications}
                    onClose={() => setShowNotifications(false)}
                  />
                </div>
              )}

              <div className="w-px h-6 bg-slate-800" />
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-semibold text-slate-300 truncate max-w-[120px]">
                  {dbUser?.name || user.displayName || "Learner"}
                </span>
                <Link
                  href="/profile"
                  aria-label="Go to My Profile"
                  className="w-8 h-8 rounded-full overflow-hidden border border-slate-700 bg-slate-800 flex items-center justify-center cursor-pointer shrink-0"
                >
                  {dbUser?.avatar || user.photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={dbUser?.avatar || user.photoURL || ""}
                      alt={`${dbUser?.name || user.displayName || "User"}'s Avatar`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-slate-500" aria-hidden="true" />
                  )}
                </Link>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-400 rounded-xl hover:bg-slate-900/50 border border-transparent hover:border-white/5 transition-all duration-200 cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
          aria-expanded={mobileMenuOpen}
          className="md:hidden p-2 rounded-xl border border-white/5 bg-slate-900/60 text-slate-400 hover:text-slate-200 transition-colors"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 p-4 rounded-2xl glass-panel-light flex flex-col gap-3 border border-white/5 animate-in fade-in slide-in-from-top-4 duration-200">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                isActive(link.href)
                  ? "bg-violet-500/10 text-violet-300 border border-violet-500/20"
                  : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <hr className="border-slate-800 my-1" />
          
          {user && (
            <div className="flex items-center justify-between px-2 pt-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-700 bg-slate-800 flex items-center justify-center shrink-0">
                  {dbUser?.avatar || user.photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={dbUser?.avatar || user.photoURL || ""}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <span className="text-sm font-bold text-slate-200">
                  {dbUser?.name || user.displayName || "Learner"}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
export default Navbar;
