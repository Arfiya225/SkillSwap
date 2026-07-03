"use client";
import React from "react";
import { Review } from "@/types/review";
import { Star, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

export function ReviewCard({ review }: { review: Review }) {
  const dateStr = review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString() : "Just now";
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-5"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-300">Swap Review</p>
            <p className="text-xs text-slate-500">{dateStr}</p>
          </div>
        </div>
        <div className="flex items-center bg-indigo-500/10 px-2 py-1 rounded text-indigo-400 font-bold text-sm border border-indigo-500/20">
          <Star className="w-4 h-4 mr-1 fill-indigo-400" />
          {review.overallRating.toFixed(1)}
        </div>
      </div>
      
      <p className="text-slate-300 text-sm leading-relaxed mb-4">
        &quot;{review.reviewText}&quot;
      </p>
      
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-slate-800/50 rounded py-2 border border-slate-700/30">
          <p className="text-slate-500 mb-1">Teaching</p>
          <p className="font-medium text-slate-300">{review.teachingRating}/5</p>
        </div>
        <div className="bg-slate-800/50 rounded py-2 border border-slate-700/30">
          <p className="text-slate-500 mb-1">Comm</p>
          <p className="font-medium text-slate-300">{review.communicationRating}/5</p>
        </div>
        <div className="bg-slate-800/50 rounded py-2 border border-slate-700/30">
          <p className="text-slate-500 mb-1">Reliability</p>
          <p className="font-medium text-slate-300">{review.reliabilityRating}/5</p>
        </div>
      </div>
    </motion.div>
  );
}
