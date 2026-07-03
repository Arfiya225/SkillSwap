"use client";
import React from "react";
import { BookOpen } from "lucide-react";
import { motion } from "framer-motion";

export function RevisionNotesCard({ notes }: { notes: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/40 backdrop-blur-md border border-emerald-500/20 rounded-xl p-6 w-full h-full"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-emerald-500/10 rounded-lg">
          <BookOpen className="w-5 h-5 text-emerald-400" />
        </div>
        <h3 className="text-xl font-bold text-white">Revision Notes</h3>
      </div>
      
      <div className="prose prose-invert prose-sm max-w-none">
        {/* Basic rendering of plain text or markdown notes for MVP */}
        <div className="whitespace-pre-wrap text-slate-300 leading-relaxed font-mono bg-slate-950/50 p-4 rounded-lg border border-slate-800">
          {notes}
        </div>
      </div>
    </motion.div>
  );
}
