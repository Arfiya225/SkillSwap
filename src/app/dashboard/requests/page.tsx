"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navbar } from "@/components/Navbar";
import { PageHeader } from "@/components/ui/PageHeader";
import { SwapRequestCard } from "@/components/ui/SwapRequestCard";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  updateSwapRequestStatus,
  subscribeToIncomingRequests,
  subscribeToOutgoingRequests,
} from "@/services/swap";
import { SwapRequestWithProfiles } from "@/types/swap";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Inbox, Send, ArrowRightLeft } from "lucide-react";
import toast from "react-hot-toast";

type MainTab = "incoming" | "outgoing";
type StatusFilter = "all" | "pending" | "accepted" | "archived";

export default function RequestsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<MainTab>("incoming");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [loading, setLoading] = useState(true);

  // Requests states
  const [incoming, setIncoming] = useState<SwapRequestWithProfiles[]>([]);
  const [outgoing, setOutgoing] = useState<SwapRequestWithProfiles[]>([]);
  
  // Maps swapRequestId to roomId
  const [roomMap, setRoomMap] = useState<Record<string, string>>({});
  
  // Tracks request operations
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    setLoading(true);

    // 1. Subscribe to incoming requests
    const unsubIncoming = subscribeToIncomingRequests(user.uid, (data) => {
      setIncoming(data);
      setLoading(false);
    });

    // 2. Subscribe to outgoing requests
    const unsubOutgoing = subscribeToOutgoingRequests(user.uid, (data) => {
      setOutgoing(data);
    });

    // 3. Subscribe to learning rooms to map accepted requests to their respective rooms
    const qRooms = query(
      collection(db, "learningRooms"),
      where("participants", "array-contains", user.uid)
    );
    const unsubRooms = onSnapshot(qRooms, (snapshot) => {
      const mapping: Record<string, string> = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.swapRequestId && data.roomId) {
          mapping[data.swapRequestId] = data.roomId;
        }
      });
      setRoomMap(mapping);
    });

    return () => {
      unsubIncoming();
      unsubOutgoing();
      unsubRooms();
    };
  }, [user]);

  const handleAccept = async (id: string) => {
    setActionLoadingId(id);
    try {
      await updateSwapRequestStatus(id, "accepted");
      toast.success("Request accepted! Learning room created.");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to accept request");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoadingId(id);
    try {
      await updateSwapRequestStatus(id, "rejected");
      toast.success("Request rejected");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to reject request");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (id: string) => {
    setActionLoadingId(id);
    try {
      await updateSwapRequestStatus(id, "cancelled");
      toast.success("Request cancelled");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to cancel request");
    } finally {
      setActionLoadingId(null);
    }
  };

  const getFilteredRequests = () => {
    const list = activeTab === "incoming" ? incoming : outgoing;
    
    return list.filter((req) => {
      if (statusFilter === "all") return true;
      if (statusFilter === "pending") return req.status === "pending";
      if (statusFilter === "accepted") return req.status === "accepted";
      if (statusFilter === "archived") return req.status === "rejected" || req.status === "cancelled";
      return true;
    });
  };

  const filteredList = getFilteredRequests();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0F172A] flex flex-col">
        <Navbar />

        <main className="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
          <PageHeader
            title="Swap Requests"
            description="Manage your learning proposals, accept invitations, and jump into collaborative workspaces."
          />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start mt-6">
            {/* Sidebar navigation */}
            <div className="flex flex-col gap-4 lg:col-span-1">
              <GlassCard className="p-4 border border-white/5 flex flex-row lg:flex-col gap-2 shrink-0">
                <button
                  onClick={() => setActiveTab("incoming")}
                  className={`flex-1 flex items-center justify-center lg:justify-start gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    activeTab === "incoming"
                      ? "bg-blue-500/10 text-blue-300 border border-blue-500/20 shadow-[0_0_15px_-3px_rgba(59,130,246,0.15)]"
                      : "text-slate-400 hover:text-slate-200 border border-transparent"
                  }`}
                >
                  <Inbox className="w-4 h-4 shrink-0" />
                  <span>Received</span>
                </button>
                <button
                  onClick={() => setActiveTab("outgoing")}
                  className={`flex-1 flex items-center justify-center lg:justify-start gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    activeTab === "outgoing"
                      ? "bg-pink-500/10 text-pink-300 border border-pink-500/20 shadow-[0_0_15px_-3px_rgba(244,114,182,0.15)]"
                      : "text-slate-400 hover:text-slate-200 border border-transparent"
                  }`}
                >
                  <Send className="w-4 h-4 shrink-0" />
                  <span>Sent</span>
                </button>
              </GlassCard>

              {/* Status Segment Filters */}
              <GlassCard className="p-3 border border-white/5 flex flex-row lg:flex-col gap-1.5 shrink-0">
                {(["pending", "accepted", "archived", "all"] as StatusFilter[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`flex-1 text-center lg:text-left px-3 py-2 rounded-lg text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      statusFilter === status
                        ? "bg-slate-800 text-slate-100 border border-white/10"
                        : "text-slate-500 hover:text-slate-300 border border-transparent"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </GlassCard>
            </div>

            {/* List cards content */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <LoadingSkeleton variant="list" count={3} />
                </div>
              ) : filteredList.length === 0 ? (
                <EmptyState
                  icon={ArrowRightLeft}
                  title="No swap requests found"
                  description={
                    statusFilter === "pending"
                      ? `You don't have any pending ${activeTab === "incoming" ? "received" : "sent"} requests at the moment.`
                      : `No requests match the "${statusFilter}" status filter.`
                  }
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredList.map((req) => (
                    <SwapRequestCard
                      key={req.id}
                      request={req}
                      direction={activeTab}
                      onAccept={handleAccept}
                      onReject={handleReject}
                      onCancel={handleCancel}
                      loadingId={actionLoadingId}
                      learningRoomId={roomMap[req.id]}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
