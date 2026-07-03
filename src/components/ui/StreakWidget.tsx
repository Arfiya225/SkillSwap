"use client";
import React from "react";
import { Flame } from "lucide-react";
import { motion } from "framer-motion";

export function StreakWidget({ days }: { days: number }) {
  const getFlameColor = () => {
    if (days >= 30) return "text-fuchsia-500 fill-fuchsia-500 drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]";
    if (days >= 7) return "text-orange-500 fill-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]";
    if (days > 0) return "text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]";
    return "text-slate-600";
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent pointer-events-none" />
      
      <Flame className={`w-16 h-16 mb-2 transition-all duration-300 ${getFlameColor()}`} />
      
      <h3 className="text-3xl font-bold text-white mb-1">{days}</h3>
      <p className="text-sm font-medium text-slate-400">Day Streak</p>
      
      {days > 0 && (
        <div className="mt-4 text-xs text-orange-400/80 bg-orange-400/10 px-3 py-1 rounded-full border border-orange-400/20">
          You&apos;re on fire!
        </div>
      )}
    </motion.div>
  );
}
