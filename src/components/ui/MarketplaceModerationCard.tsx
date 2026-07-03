"use client";
import React from "react";
import { Report } from "@/types/moderation";
import { AlertTriangle, Trash2, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export function MarketplaceModerationCard({ report, onResolve, onDismiss }: { report: Report, onResolve: (id: string) => void, onDismiss: (id: string) => void }) {
  const dateStr = report.createdAt?.toDate ? report.createdAt.toDate().toLocaleDateString() : "Just now";
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/40 backdrop-blur-md border border-rose-500/30 rounded-xl p-5"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/30">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-300">Flagged {report.type}</p>
            <p className="text-xs text-slate-500">Reported on {dateStr}</p>
          </div>
        </div>
        <div className="flex items-center bg-slate-800 px-2 py-1 rounded text-slate-400 text-xs border border-slate-700">
          ID: {report.reportedEntityId.substring(0, 8)}...
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-rose-400 text-sm font-medium mb-1">Reason: {report.reason}</p>
        {report.details && (
          <p className="text-slate-300 text-sm bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
            &quot;{report.details}&quot;
          </p>
        )}
      </div>
      
      <div className="flex gap-3">
        <button 
          onClick={() => onResolve(report.id)}
          className="flex-1 flex items-center justify-center px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-lg text-sm font-medium border border-rose-500/30 transition-colors"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Remove Content
        </button>
        <button 
          onClick={() => onDismiss(report.id)}
          className="flex-1 flex items-center justify-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium border border-slate-700 transition-colors"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Dismiss
        </button>
      </div>
    </motion.div>
  );
}
