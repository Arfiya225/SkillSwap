"use client";
import React from "react";
import { motion } from "framer-motion";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

export function AnalyticsCard({ title, value, icon, trend, trendUp }: AnalyticsCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-5 flex flex-col relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
        {icon}
      </div>
      
      <div className="flex items-center space-x-2 text-slate-400 mb-2">
        <div className="w-8 h-8 rounded-lg bg-slate-800/80 flex items-center justify-center border border-slate-700/50 text-indigo-400">
          {icon}
        </div>
        <h3 className="text-sm font-medium">{title}</h3>
      </div>
      
      <div className="flex items-end justify-between mt-auto">
        <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
        
        {trend && (
          <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-md ${
            trendUp ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}>
            {trend}
          </div>
        )}
      </div>
    </motion.div>
  );
}
