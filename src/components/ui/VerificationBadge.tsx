"use client";
import React from "react";
import { CheckCircle, ShieldCheck, Award } from "lucide-react";

interface VerificationBadgeProps {
  level: "Basic" | "Verified" | "Expert";
  showLabel?: boolean;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({ level, showLabel = false }) => {
  let icon = <CheckCircle className="w-4 h-4 text-slate-400" />;
  let colorClass = "text-slate-400 bg-slate-400/10 border-slate-400/20";
  
  if (level === "Verified") {
    icon = <ShieldCheck className="w-4 h-4 text-blue-400" />;
    colorClass = "text-blue-400 bg-blue-400/10 border-blue-400/20";
  } else if (level === "Expert") {
    icon = <Award className="w-4 h-4 text-amber-400" />;
    colorClass = "text-amber-400 bg-amber-400/10 border-amber-400/20";
  }

  if (!showLabel) {
    return <div title={`${level} Verification`} className="inline-flex">{icon}</div>;
  }

  return (
    <div className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
      {icon}
      <span>{level}</span>
    </div>
  );
};
