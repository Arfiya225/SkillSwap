"use client";

import React from "react";
import { SwapRequestWithProfiles } from "@/types/swap";
import { GlassCard } from "./GlassCard";
import { GradientButton } from "./GradientButton";
import { ArrowRightLeft, User, Calendar, MessageSquare } from "lucide-react";
import Link from "next/link";

interface SwapRequestCardProps {
  request: SwapRequestWithProfiles;
  direction: "incoming" | "outgoing";
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onCancel?: (id: string) => void;
  loadingId?: string | null;
  learningRoomId?: string; // Optional roomId if status is accepted
}

export const SwapRequestCard: React.FC<SwapRequestCardProps> = ({
  request,
  direction,
  onAccept,
  onReject,
  onCancel,
  loadingId,
  learningRoomId,
}) => {
  const isIncoming = direction === "incoming";
  const peerProfile = isIncoming ? request.senderProfile : request.receiverProfile;
  const peerName = peerProfile?.name || (isIncoming ? "Sender" : "Receiver");
  const peerAvatar = peerProfile?.avatar;

  const dateFormatted = request.createdAt?.toDate
    ? request.createdAt.toDate().toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : new Date().toLocaleDateString();

  // Status badge styling
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-500/10 text-green-300 border-green-500/20";
      case "rejected":
        return "bg-red-500/10 text-red-300 border-red-500/20";
      case "cancelled":
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
      case "pending":
      default:
        return "bg-blue-500/10 text-blue-300 border-blue-500/20";
    }
  };

  return (
    <GlassCard className="border border-white/5 flex flex-col gap-4">
      {/* Top Header: Peer User details + Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-700 bg-slate-800 flex items-center justify-center shrink-0">
            {peerAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={peerAvatar} alt={peerName} className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-slate-500" />
            )}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100 leading-tight">{peerName}</h4>
            <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3" />
              {dateFormatted}
            </span>
          </div>
        </div>
        
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusStyles(request.status)}`}>
          {request.status}
        </span>
      </div>

      {/* Swap details */}
      <div className="bg-slate-950/20 p-3 rounded-xl border border-white/5 flex flex-col gap-2.5 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-2 py-1 rounded-md font-semibold">
            {isIncoming ? request.requestedSkill : request.offeredSkill}
          </div>
          <ArrowRightLeft className="w-4 h-4 text-violet-400" />
          <div className="bg-pink-500/10 border border-pink-500/20 text-pink-300 px-2 py-1 rounded-md font-semibold">
            {isIncoming ? request.offeredSkill : request.requestedSkill}
          </div>
        </div>
        <p className="text-[10px] text-slate-400">
          {isIncoming
            ? `They teach you ${request.offeredSkill} in exchange for ${request.requestedSkill}`
            : `You teach them ${request.offeredSkill} in exchange for ${request.requestedSkill}`}
        </p>
      </div>

      {/* Message */}
      {request.message && (
        <div className="flex gap-2 text-xs text-slate-300 bg-slate-900/40 p-3 rounded-xl border border-white/5">
          <MessageSquare className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <p className="italic leading-relaxed">{request.message}</p>
        </div>
      )}

      {/* Actions based on state */}
      {request.status === "pending" && (
        <div className="flex items-center gap-2 pt-1">
          {isIncoming ? (
            <>
              <GradientButton
                variant="success"
                loading={loadingId === request.id}
                onClick={() => onAccept?.(request.id)}
                className="flex-1 py-2 text-xs"
              >
                Accept
              </GradientButton>
              <GradientButton
                variant="secondary"
                loading={loadingId === request.id}
                onClick={() => onReject?.(request.id)}
                className="flex-1 py-2 text-xs border-red-500/20 text-red-400 hover:bg-red-500/10"
              >
                Reject
              </GradientButton>
            </>
          ) : (
            <GradientButton
              variant="secondary"
              loading={loadingId === request.id}
              onClick={() => onCancel?.(request.id)}
              className="w-full py-2 text-xs border-slate-700/50 hover:bg-slate-800"
            >
              Cancel Request
            </GradientButton>
          )}
        </div>
      )}

      {request.status === "accepted" && learningRoomId && (
        <div className="pt-1">
          <Link href={`/rooms/${learningRoomId}`} className="block w-full">
            <GradientButton variant="primary" className="w-full py-2 text-xs">
              Enter Learning Room
            </GradientButton>
          </Link>
        </div>
      )}
    </GlassCard>
  );
};
