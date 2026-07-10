"use client";

import React, { useState } from "react";
import { Resource } from "@/types/resource";
import { useAuth } from "@/context/AuthContext";
import { GlassCard } from "./GlassCard";
import {
  FileText,
  ExternalLink,
  Trash2,
  Calendar,
  Loader2,
} from "lucide-react";
import { GithubIcon } from "@/components/icons/BrandIcons";

interface ResourceCardProps {
  resource: Resource;
  participantProfiles?: Record<string, { name: string }>;
  onDelete: (id: string) => Promise<void>;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  participantProfiles = {},
  onDelete,
}) => {
  const { user } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const { id, title, type, url, uploadedBy, uploadedByName, uploadedAt, assignedTo, skill, learnerId, targetSkill } = resource;

  const isOwner = user?.uid === uploadedBy;
  const resolvedAssignedTo = assignedTo || learnerId;
  const resolvedSkill = skill || targetSkill;
  const assignedToName = resolvedAssignedTo ? participantProfiles[resolvedAssignedTo]?.name || "Unknown User" : "Legacy";

  // Format upload date
  const dateStr = uploadedAt?.toDate
    ? uploadedAt.toDate().toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : new Date().toLocaleDateString();

  // Get type icon and styling
  const getTypeStyling = () => {
    switch (type) {
      case "pdf":
        return {
          icon: FileText,
          bg: "bg-red-500/10 border-red-500/25 text-red-400",
          label: "PDF Document",
        };
      case "github":
        return {
          icon: GithubIcon,
          bg: "bg-emerald-500/10 border-emerald-500/25 text-emerald-400",
          label: "GitHub Repository",
        };
      case "document":
        return {
          icon: FileText,
          bg: "bg-blue-500/10 border-blue-500/25 text-blue-400",
          label: "Reference Doc",
        };
      default:
        return {
          icon: ExternalLink,
          bg: "bg-violet-500/10 border-violet-500/25 text-violet-400",
          label: "External Link",
        };
    }
  };

  const styling = getTypeStyling();
  const Icon = styling.icon;

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to remove the resource "${title}"?`)) return;
    setDeleting(true);
    try {
      await onDelete(id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <GlassCard className="border border-white/5 p-5 flex flex-col justify-between gap-4 h-full relative overflow-hidden group">
      {/* Top Header Row */}
      <div className="flex justify-between items-start gap-3">
        <div className="flex items-start gap-3 overflow-hidden">
          {/* Custom Type Badge Icon */}
          <div className={`p-2.5 rounded-xl border shrink-0 ${styling.bg}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 block mb-0.5">
              {styling.label}
            </span>
            <h4 className="text-sm font-bold text-slate-200 truncate leading-tight group-hover:text-violet-300 transition-colors">
              {title}
            </h4>
          </div>
        </div>

        {/* Delete Action Trigger (Uploader Only) */}
        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            title="Delete resource"
            className="text-slate-500 hover:text-red-400 hover:bg-slate-800/40 p-2 rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Explicit Metadata Section as per UX Refactor */}
      <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 text-xs text-slate-300 space-y-1.5 mt-2">
         <div className="flex justify-between">
           <span className="text-slate-500">Uploaded By:</span>
           <span className="font-medium truncate max-w-[120px]" title={uploadedByName}>{uploadedByName}</span>
         </div>
         <div className="flex justify-between">
           <span className="text-slate-500">Assigned To:</span>
           <span className="font-medium truncate max-w-[120px]" title={assignedToName}>{assignedToName}</span>
         </div>
         <div className="flex justify-between">
           <span className="text-slate-500">Skill:</span>
           <span className="font-bold text-emerald-400 truncate max-w-[120px]" title={resolvedSkill}>{resolvedSkill || "Unknown"}</span>
         </div>
      </div>

      {/* Metadata Bottom Rows */}
      <div className="flex flex-col gap-3 pt-3 border-t border-slate-900/60 mt-auto">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1 shrink-0 ml-auto">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{dateStr}</span>
          </div>
        </div>

        {/* CTA Open Link / Document URL */}
        <a
          href={url.startsWith("http") ? url : `https://${url}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800/70 border border-white/5 hover:border-slate-800 text-slate-300 hover:text-slate-100 transition-all cursor-pointer text-center"
        >
          <span>Open Resource</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </GlassCard>
  );
};
