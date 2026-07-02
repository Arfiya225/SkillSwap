"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { GradientButton } from "./GradientButton";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  className = "",
}) => {
  return (
    <div className={`glass-panel flex flex-col items-center justify-center text-center p-10 py-16 rounded-2xl w-full border border-white/5 ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700/50 flex items-center justify-center border border-white/10 mb-5 text-violet-400">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-slate-100 mb-2">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <GradientButton variant="primary" onClick={onAction}>
          {actionText}
        </GradientButton>
      )}
    </div>
  );
};
