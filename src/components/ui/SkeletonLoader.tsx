"use client";
import React from "react";
import { motion } from "framer-motion";

interface SkeletonLoaderProps {
  type: "card" | "list" | "profile" | "text";
  count?: number;
}

export function SkeletonLoader({ type, count = 1 }: SkeletonLoaderProps) {
  const renderSkeleton = () => {
    switch (type) {
      case "card":
        return (
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 animate-pulse w-full">
            <div className="w-12 h-12 bg-slate-800 rounded-full mb-4"></div>
            <div className="h-4 bg-slate-800 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-slate-800 rounded w-1/2 mb-4"></div>
            <div className="h-20 bg-slate-800 rounded w-full"></div>
          </div>
        );
      case "list":
        return (
          <div className="flex items-center space-x-4 p-4 border-b border-slate-800 animate-pulse w-full">
            <div className="w-10 h-10 bg-slate-800 rounded-full flex-shrink-0"></div>
            <div className="flex-1">
              <div className="h-4 bg-slate-800 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-slate-800 rounded w-1/4"></div>
            </div>
            <div className="w-16 h-8 bg-slate-800 rounded"></div>
          </div>
        );
      case "profile":
        return (
          <div className="flex flex-col items-center p-6 animate-pulse w-full">
            <div className="w-24 h-24 bg-slate-800 rounded-full mb-4"></div>
            <div className="h-6 bg-slate-800 rounded w-48 mb-2"></div>
            <div className="h-4 bg-slate-800 rounded w-32"></div>
          </div>
        );
      case "text":
        return (
          <div className="space-y-2 animate-pulse w-full">
            <div className="h-4 bg-slate-800 rounded w-full"></div>
            <div className="h-4 bg-slate-800 rounded w-5/6"></div>
            <div className="h-4 bg-slate-800 rounded w-4/6"></div>
          </div>
        );
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: i * 0.1 }}
          className="w-full"
        >
          {renderSkeleton()}
        </motion.div>
      ))}
    </div>
  );
}
