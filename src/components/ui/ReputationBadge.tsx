"use client";
import React from "react";
import { ReputationBadge as BadgeType } from "@/types/reputation";
import { Shield, Star, Award, Zap } from "lucide-react";

export function ReputationBadge({ badge }: { badge: BadgeType }) {
  const getBadgeStyle = () => {
    switch (badge) {
      case "New Member":
        return { bg: "bg-slate-700/50", text: "text-slate-300", icon: <Shield className="w-3 h-3 mr-1" /> };
      case "Trusted Learner":
        return { bg: "bg-emerald-500/20", text: "text-emerald-400", icon: <Star className="w-3 h-3 mr-1" /> };
      case "Top Teacher":
        return { bg: "bg-blue-500/20", text: "text-blue-400", icon: <Award className="w-3 h-3 mr-1" /> };
      case "Expert Mentor":
        return { bg: "bg-purple-500/20", text: "text-purple-400", icon: <Zap className="w-3 h-3 mr-1" /> };
    }
  };

  const style = getBadgeStyle();

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text} backdrop-blur-sm border border-white/5`}>
      {style.icon}
      {badge}
    </span>
  );
}
