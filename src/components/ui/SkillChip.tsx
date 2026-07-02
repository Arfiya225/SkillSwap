"use client";

import React from "react";
import { X } from "lucide-react";

interface SkillChipProps {
  name: string;
  level?: "beginner" | "intermediate" | "expert";
  type?: "teach" | "learn";
  onDelete?: () => void;
  className?: string;
}

export const SkillChip: React.FC<SkillChipProps> = ({
  name,
  level,
  type = "teach",
  onDelete,
  className = "",
}) => {
  // Determine color scheme based on teach/learn type and skill level
  const getColors = () => {
    if (type === "teach") {
      switch (level) {
        case "expert":
          return "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";
        case "intermediate":
          return "bg-green-500/10 text-green-300 border-green-500/30";
        case "beginner":
        default:
          return "bg-teal-500/10 text-teal-300 border-teal-500/20";
      }
    } else {
      // learn type
      switch (level) {
        case "expert":
          return "bg-pink-500/10 text-pink-300 border-pink-500/30";
        case "intermediate":
          return "bg-violet-500/10 text-violet-300 border-violet-500/30";
        case "beginner":
        default:
          return "bg-blue-500/10 text-blue-300 border-blue-500/20";
      }
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${getColors()} ${className}`}
    >
      <span>{name}</span>
      {level && <span className="opacity-60 text-[10px] font-normal uppercase">({level})</span>}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="hover:bg-white/10 rounded-full p-0.5 transition-colors cursor-pointer"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};
