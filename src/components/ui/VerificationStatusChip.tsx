"use client";
import React from "react";
import { Clock, CheckCircle2, XCircle, MinusCircle } from "lucide-react";

interface VerificationStatusChipProps {
  status: "Pending" | "Approved" | "Rejected" | "None";
}

export const VerificationStatusChip: React.FC<VerificationStatusChipProps> = ({ status }) => {
  if (status === "None") return <div className="inline-flex items-center text-slate-500 text-xs"><MinusCircle className="w-3 h-3 mr-1" /> Unverified</div>;
  if (status === "Pending") return <div className="inline-flex items-center text-amber-500 text-xs px-2 py-1 bg-amber-500/10 rounded-full"><Clock className="w-3 h-3 mr-1" /> Pending</div>;
  if (status === "Approved") return <div className="inline-flex items-center text-emerald-500 text-xs px-2 py-1 bg-emerald-500/10 rounded-full"><CheckCircle2 className="w-3 h-3 mr-1" /> Approved</div>;
  if (status === "Rejected") return <div className="inline-flex items-center text-rose-500 text-xs px-2 py-1 bg-rose-500/10 rounded-full"><XCircle className="w-3 h-3 mr-1" /> Rejected</div>;
  return null;
};
