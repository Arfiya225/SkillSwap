"use client";
import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ 
  title = "Something went wrong", 
  message = "An unexpected error occurred. Please try again later.", 
  onRetry 
}: ErrorStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-8 bg-rose-500/10 border border-rose-500/20 rounded-2xl w-full text-center"
    >
      <AlertTriangle className="w-12 h-12 text-rose-400 mb-4" />
      <h3 className="text-lg font-bold text-rose-100 mb-2">{title}</h3>
      <p className="text-rose-200/70 text-sm max-w-sm mb-6">{message}</p>
      
      {onRetry && (
        <button 
          onClick={onRetry}
          className="flex items-center px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg font-medium transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </button>
      )}
    </motion.div>
  );
}
