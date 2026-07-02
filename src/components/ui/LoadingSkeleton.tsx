"use client";

import React from "react";

interface LoadingSkeletonProps {
  variant?: "card" | "profile" | "list" | "text";
  count?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = "card",
  count = 1,
  className = "",
}) => {
  const items = Array.from({ length: count });

  const renderSkeleton = (index: number) => {
    switch (variant) {
      case "profile":
        return (
          <div key={index} className="glass-panel animate-pulse flex flex-col items-center gap-4 p-8 w-full">
            <div className="w-24 h-24 rounded-full bg-slate-800/80 border border-white/5" />
            <div className="h-6 w-1/3 bg-slate-800/80 rounded" />
            <div className="h-4 w-1/2 bg-slate-800/80 rounded" />
            <div className="h-20 w-full bg-slate-800/50 rounded-xl mt-2" />
          </div>
        );
      case "list":
        return (
          <div key={index} className="glass-panel animate-pulse flex items-center justify-between p-4 w-full border border-white/5">
            <div className="flex items-center gap-3 w-2/3">
              <div className="w-10 h-10 rounded-full bg-slate-800/80" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-800/80 rounded w-1/3" />
                <div className="h-3 bg-slate-800/50 rounded w-1/2" />
              </div>
            </div>
            <div className="w-20 h-8 bg-slate-800/80 rounded-lg" />
          </div>
        );
      case "text":
        return (
          <div key={index} className="space-y-2.5 animate-pulse w-full">
            <div className="h-4 bg-slate-800/85 rounded w-full" />
            <div className="h-4 bg-slate-800/85 rounded w-[92%]" />
            <div className="h-4 bg-slate-800/85 rounded w-[85%]" />
          </div>
        );
      case "card":
      default:
        return (
          <div key={index} className="glass-panel animate-pulse p-6 space-y-4 w-full border border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-800/80" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-800/80 rounded w-1/2" />
                <div className="h-3 bg-slate-800/50 rounded w-1/3" />
              </div>
            </div>
            <hr className="border-slate-800/50" />
            <div className="space-y-2">
              <div className="h-3 bg-slate-800/60 rounded w-3/4" />
              <div className="h-3 bg-slate-800/60 rounded w-5/6" />
            </div>
            <div className="flex gap-2 pt-2">
              <div className="h-6 bg-slate-800/50 rounded-full w-16" />
              <div className="h-6 bg-slate-800/50 rounded-full w-20" />
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`grid gap-4 w-full ${className}`}>
      {items.map((_, i) => renderSkeleton(i))}
    </div>
  );
};
