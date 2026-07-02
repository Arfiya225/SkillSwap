"use client";

import React from "react";
import { motion } from "framer-motion";

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "success";
  loading?: boolean;
  className?: string;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  children,
  variant = "primary",
  loading = false,
  className = "",
  disabled,
  type = "button",
  ...props
}) => {
  // Define gradient variations
  const variants = {
    primary: "bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 text-white shadow-[0_4px_20px_-2px_rgba(157,124,252,0.4)] hover:shadow-[0_4px_25px_-2px_rgba(157,124,252,0.6)]",
    secondary: "bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-white/10 backdrop-blur-md",
    danger: "bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-[0_4px_15px_-2px_rgba(239,68,68,0.4)]",
    success: "bg-gradient-to-r from-green-400 to-emerald-600 text-white shadow-[0_4px_15px_-2px_rgba(34,197,94,0.4)]",
  };

  return (
    <motion.button
      whileHover={loading || disabled ? {} : { scale: 1.02 }}
      whileTap={loading || disabled ? {} : { scale: 0.98 }}
      type={type}
      disabled={disabled || loading}
      className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...(props as any)}
    >
      {loading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : null}
      {children}
    </motion.button>
  );
};
