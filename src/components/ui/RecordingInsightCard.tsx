"use client";
import React from "react";
import { Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

export function RecordingInsightCard({ summary, keyLearnings }: { summary: string, keyLearnings: string[] }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/40 backdrop-blur-md border border-amber-500/20 rounded-xl p-6 w-full"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-amber-500/10 rounded-lg">
          <Lightbulb className="w-5 h-5 text-amber-400" />
        </div>
        <h3 className="text-xl font-bold text-white">Session Insights</h3>
      </div>
      
      <div className="mb-6">
        <h4 className="text-sm font-medium text-slate-400 mb-2 uppercase tracking-wider">Summary</h4>
        <p className="text-slate-300 leading-relaxed text-sm bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
          {summary}
        </p>
      </div>

      <div>
        <h4 className="text-sm font-medium text-slate-400 mb-2 uppercase tracking-wider">Key Learnings</h4>
        <ul className="space-y-2">
          {keyLearnings.map((learning, idx) => (
            <li key={idx} className="flex items-start">
              <span className="text-amber-500 mr-2">•</span>
              <span className="text-slate-300 text-sm">{learning}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
