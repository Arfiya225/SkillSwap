"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  animateHover?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = "",
  animateHover = false,
  ...props
}) => {
  const baseClasses = "glass-panel rounded-2xl p-6 relative overflow-hidden";
  const hoverClasses = animateHover ? "hover:border-slate-700/80 transition-all duration-300" : "";

  if (animateHover) {
    return (
      <motion.div
        whileHover={{ y: -4, scale: 1.01, boxShadow: "0 20px 40px rgba(15, 23, 42, 0.4)" }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`${baseClasses} ${hoverClasses} ${className}`}
        {...(props as any)}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div className={`${baseClasses} ${className}`} {...(props as any)}>
      {children}
    </motion.div>
  );
};
