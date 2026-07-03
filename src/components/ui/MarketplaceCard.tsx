"use client";
import React, { useState } from "react";
import { MarketplacePost } from "@/types/marketplace";
import { VerificationBadge } from "./VerificationBadge";
import { motion } from "framer-motion";
import { Clock, Send, Loader2 } from "lucide-react";

interface MarketplaceCardProps {
  post: MarketplacePost;
  currentUserId: string;
  onApply: (postId: string, message: string) => Promise<void>;
}

export const MarketplaceCard: React.FC<MarketplaceCardProps> = ({ post, currentUserId, onApply }) => {
  const [isApplying, setIsApplying] = useState(false);
  const [message, setMessage] = useState("");
  const [showApply, setShowApply] = useState(false);

  const handleApply = async () => {
    if (!message.trim()) return;
    try {
      setIsApplying(true);
      await onApply(post.id, message);
      setShowApply(false);
      setMessage("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsApplying(false);
    }
  };

  const isOwner = currentUserId === post.createdBy;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-5 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-bold text-white">{post.title}</h3>
        <VerificationBadge level={post.verificationBadge} showLabel />
      </div>
      
      <p className="text-sm text-slate-400 mb-4 line-clamp-2 flex-grow">{post.description}</p>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
          <span className="text-xs text-slate-500 block mb-1">Offering</span>
          <span className="text-sm text-emerald-400 font-medium truncate block" title={post.skillOffered}>{post.skillOffered}</span>
        </div>
        <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
          <span className="text-xs text-slate-500 block mb-1">Looking For</span>
          <span className="text-sm text-blue-400 font-medium truncate block" title={post.skillRequested}>{post.skillRequested}</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
        <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {post.availability}</span>
        <span className="capitalize">{post.experienceLevel}</span>
      </div>

      {!isOwner && post.status === "open" && (
        <div className="pt-3 border-t border-slate-700/50 mt-auto">
          {!showApply ? (
            <button 
              onClick={() => setShowApply(true)}
              className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Apply to Exchange
            </button>
          ) : (
            <div className="space-y-3">
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hi, I'm interested in this exchange..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white resize-none h-20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex space-x-2">
                <button 
                  onClick={() => setShowApply(false)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleApply}
                  disabled={isApplying || !message.trim()}
                  className="flex-1 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center"
                >
                  {isApplying ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> Send</>}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};
