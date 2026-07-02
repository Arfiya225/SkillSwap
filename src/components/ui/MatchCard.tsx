"use client";

import React, { useState } from "react";
import { DbUser } from "@/types/user";
import { ProfileCard } from "./ProfileCard";
import { GradientButton } from "./GradientButton";
import { AlertCircle, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MatchCardProps {
  match: {
    user: DbUser;
    score: number;
    explanation: string[];
  };
  onRequestSwap: (targetUser: DbUser) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  onRequestSwap,
}) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const { user, score, explanation } = match;

  // Determine percentage border color
  const getScoreColor = (pct: number) => {
    if (pct >= 80) return "from-emerald-400 to-green-500 text-green-400";
    if (pct >= 50) return "from-blue-400 to-violet-500 text-violet-400";
    return "from-slate-400 to-slate-500 text-slate-400";
  };

  const actionNode = (
    <div className="flex flex-col gap-3">
      {/* Match Score & Toggle Breakdown */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-0.5 rounded-full bg-gradient-to-r ${getScoreColor(score)}`}>
            <div className="bg-slate-900/90 rounded-full px-2.5 py-1 text-xs font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-violet-400 animate-pulse" />
              <span>{score}% Match</span>
            </div>
          </div>
        </div>
        
        <button
          type="button"
          onClick={() => setShowExplanation(!showExplanation)}
          className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1 cursor-pointer font-medium"
        >
          <span>Why this match?</span>
          {showExplanation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Matching Explanations Breakdown */}
      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-1 p-3.5 bg-slate-950/45 rounded-xl border border-white/5 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 font-semibold text-violet-400 mb-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Score Breakdown</span>
              </div>
              <ul className="list-disc pl-4 space-y-1">
                {explanation.map((item, i) => (
                  <li key={i} className="leading-relaxed">{item}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA Button */}
      <GradientButton
        variant="primary"
        onClick={() => onRequestSwap(user)}
        className="w-full mt-1.5"
      >
        Send Swap Request
      </GradientButton>
    </div>
  );

  return (
    <ProfileCard
      profile={user}
      actions={actionNode}
      className="h-full border border-white/5"
    />
  );
};
