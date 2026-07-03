"use client";
import React from "react";
import { LucideIcon, FolderOpen } from "lucide-react";
import { GradientButton } from "./GradientButton";
import Link from "next/link";
import { motion } from "framer-motion";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
  // new props added in Phase 4
  actionLabel?: string; 
  actionHref?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FolderOpen,
  title,
  description,
  actionText,
  onAction,
  className = "",
  actionLabel,
  actionHref,
}) => {
  // Use actionText if actionLabel not provided (for backwards compatibility)
  const displayLabel = actionLabel || actionText;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass-panel flex flex-col items-center justify-center text-center p-10 py-16 rounded-2xl w-full border border-white/5 border-dashed bg-slate-900/40 ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700/50 flex items-center justify-center border border-white/10 mb-5 text-indigo-400 p-4">
        <Icon className="w-8 h-8 text-slate-500" />
      </div>
      <h3 className="text-xl font-bold text-slate-100 mb-2">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      
      {/* Old backwards compatible button style */}
      {actionText && onAction && !actionHref && (
        <GradientButton variant="primary" onClick={onAction}>
          {actionText}
        </GradientButton>
      )}

      {/* New style links */}
      {actionLabel && actionHref && (
        <Link href={actionHref} className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors">
          {displayLabel}
        </Link>
      )}
      
      {/* New style action button without actionText */}
      {actionLabel && onAction && !actionHref && !actionText && (
        <button onClick={onAction} className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors">
          {displayLabel}
        </button>
      )}
    </motion.div>
  );
};
