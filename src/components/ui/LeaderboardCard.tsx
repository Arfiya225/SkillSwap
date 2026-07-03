"use client";
import React from "react";
import { LeaderboardEntry } from "@/types/admin";
import { motion } from "framer-motion";
import { Trophy, Medal, Award } from "lucide-react";

export function LeaderboardCard({ entry }: { entry: LeaderboardEntry }) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 2: return <Medal className="w-5 h-5 text-slate-300" />;
      case 3: return <Award className="w-5 h-5 text-amber-600" />;
      default: return <span className="font-bold text-slate-500 w-5 text-center">{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1: return "bg-yellow-400/10 border-yellow-400/30";
      case 2: return "bg-slate-300/10 border-slate-300/30";
      case 3: return "bg-amber-600/10 border-amber-600/30";
      default: return "bg-slate-800/30 border-slate-700/30";
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center p-4 rounded-xl border backdrop-blur-md mb-3 ${getRankBg(entry.rank)}`}
    >
      <div className="flex-shrink-0 w-8 flex justify-center mr-3">
        {getRankIcon(entry.rank)}
      </div>
      
      <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden flex-shrink-0 mr-4 border border-slate-600 flex items-center justify-center text-sm font-bold text-white">
        {entry.displayName.charAt(0)}
      </div>
      
      <div className="flex-grow">
        <h4 className="text-white font-medium">{entry.displayName}</h4>
        <p className="text-xs text-slate-400">Reputation Score</p>
      </div>
      
      <div className="text-right">
        <p className="text-xl font-bold text-indigo-400">{entry.score}</p>
      </div>
    </motion.div>
  );
}
