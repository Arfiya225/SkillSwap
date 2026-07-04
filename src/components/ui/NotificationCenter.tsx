"use client";

import React, { useEffect, useRef } from "react";
import { AppNotification } from "@/types/notification";
import { NotificationItem } from "./NotificationItem";
import { Bell, CheckCheck } from "lucide-react";
import { markAllAsRead, markAsRead } from "@/services/notifications";
import toast from "react-hot-toast";

interface NotificationCenterProps {
  userId: string;
  notifications: AppNotification[];
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  userId,
  notifications,
  onClose,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    // Handle outside clicks to close the dropdown
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    try {
      await markAllAsRead(userId);
      toast.success("All marked as read");
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark all as read");
    }
  };

  const handleReadSingle = async (id: string) => {
    await markAsRead(id);
  };

  return (
    <div
      ref={containerRef}
      className="absolute right-0 mt-3.5 w-80 sm:w-96 rounded-2xl border border-white/10 bg-slate-950/95 backdrop-blur-md shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-4 duration-200"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Bell className="w-4.5 h-4.5 text-violet-400" />
          <span className="text-sm font-extrabold text-slate-100">Notifications</span>
          {unreadCount > 0 && (
            <span className="text-[10px] bg-violet-500/10 border border-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full font-bold">
              {unreadCount} new
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1 text-[10px] uppercase font-bold text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Notifications list */}
      <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
        {notifications.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <Bell className="w-8 h-8 text-slate-700 mx-auto animate-pulse" />
            <p className="text-xs text-slate-400 font-semibold">No notifications yet</p>
            <p className="text-[10px] text-slate-500 max-w-[200px] mx-auto leading-normal">
              When study paths are generated, meetings scheduled, or tasks assigned, updates will show here.
            </p>
          </div>
        ) : (
          notifications.map((notif) => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onRead={handleReadSingle}
              onClose={onClose}
            />
          ))
        )}
      </div>
    </div>
  );
};
export default NotificationCenter;
