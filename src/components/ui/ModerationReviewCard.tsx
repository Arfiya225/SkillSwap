"use client";
import React from "react";
import { Report } from "@/types/moderation";
import { AlertOctagon, Trash2, ShieldOff } from "lucide-react";
import { motion } from "framer-motion";

export function ModerationReviewCard({ report, onResolve, onDismiss }: { report: Report, onResolve: (id: string) => void, onDismiss: (id: string) => void }) {
  const dateStr = report.createdAt?.toDate ? report.createdAt.toDate().toLocaleDateString() : "Just now";
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-900/50 backdrop-blur-md border border-orange-500/30 rounded-xl p-5"
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <AlertOctagon className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h4 className="text-white font-medium">Flagged {report.type}</h4>
            <p className="text-xs text-slate-400">ID: {report.reportedEntityId}</p>
          </div>
        </div>
        <span className="text-xs text-slate-500">{dateStr}</span>
      </div>

      <div className="bg-slate-800/50 rounded-lg p-3 mb-4">
        <p className="text-sm text-slate-300">
          <span className="text-orange-400 font-medium">Reason: </span>
          {report.reason}
        </p>
        {report.details && (
          <p className="text-sm text-slate-400 mt-2 italic">&quot;{report.details}&quot;</p>
        )}
      </div>

      <div className="flex gap-2">
        <button 
          onClick={() => onResolve(report.id)}
          className="flex-1 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg text-sm font-medium transition-colors flex justify-center items-center"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Remove
        </button>
        <button 
          onClick={() => onDismiss(report.id)}
          className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors flex justify-center items-center"
        >
          <ShieldOff className="w-4 h-4 mr-2" />
          Dismiss
        </button>
      </div>
    </motion.div>
  );
}
