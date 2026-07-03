"use client";
import React, { useState } from "react";
import { VerificationRequest } from "@/types/verification";
import { motion } from "framer-motion";
import { Check, X, ExternalLink, Loader2 } from "lucide-react";

interface VerificationReviewCardProps {
  request: VerificationRequest;
  onApprove: (id: string, notes: string) => Promise<void>;
  onReject: (id: string, notes: string) => Promise<void>;
}

export const VerificationReviewCard: React.FC<VerificationReviewCardProps> = ({ request, onApprove, onReject }) => {
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async (action: "approve" | "reject") => {
    try {
      setIsProcessing(true);
      if (action === "approve") {
        await onApprove(request.id, notes);
      } else {
        await onReject(request.id, notes);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-5 shadow-xl"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">{request.type} Verification</h3>
          <p className="text-xs text-slate-400 mt-1">User ID: {request.userId}</p>
        </div>
        <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded border border-indigo-500/50">
          {request.status}
        </span>
      </div>

      <div className="space-y-2 mb-4 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
        {request.skillName && (
          <p className="text-sm"><span className="text-slate-400">Skill:</span> <span className="text-white font-medium">{request.skillName}</span></p>
        )}
        {request.documentUrl && (
          <p className="text-sm flex items-center">
            <span className="text-slate-400 mr-2">Link:</span> 
            <a href={request.documentUrl} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 flex items-center">
              View Document <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </p>
        )}
        {request.githubUsername && (
          <p className="text-sm"><span className="text-slate-400">GitHub:</span> <span className="text-white font-medium">{request.githubUsername}</span></p>
        )}
      </div>

      <div className="space-y-3">
        <textarea 
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Admin notes (optional for approval, required for rejection)"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white resize-none h-20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        
        <div className="flex space-x-2">
          <button 
            onClick={() => handleAction("reject")}
            disabled={isProcessing || !notes.trim()}
            className="flex-1 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/50 text-sm font-medium rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><X className="w-4 h-4 mr-2" /> Reject</>}
          </button>
          <button 
            onClick={() => handleAction("approve")}
            disabled={isProcessing}
            className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-2" /> Approve</>}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
