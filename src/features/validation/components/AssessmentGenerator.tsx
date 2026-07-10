import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { Brain, FileText, CheckSquare, Paperclip, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

interface AssessmentGeneratorProps {
  roomId: string;
  isTeacher: boolean;
  onGenerate: (selectedSources: { topics: boolean; notes: boolean; resources: boolean; tasks: boolean }) => Promise<void>;
  loading: boolean;
}

export const AssessmentGenerator: React.FC<AssessmentGeneratorProps> = ({ isTeacher, onGenerate, loading }) => {
  const [sources, setSources] = useState({ topics: true, notes: true, resources: true, tasks: true });

  const handleGenerate = async () => {
    if (!sources.topics && !sources.notes && !sources.resources && !sources.tasks) {
      toast.error("Please select at least one content source");
      return;
    }
    await onGenerate(sources);
  };

  if (!isTeacher) return null;

  return (
    <GlassCard className="p-5 border border-violet-500/30 bg-violet-500/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Brain className="w-24 h-24 text-violet-400" />
      </div>
      
      <div className="relative z-10">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Brain className="w-5 h-5 text-violet-400" /> AI Assessment Generator
        </h3>
        <p className="text-xs text-slate-400 mt-1 mb-4 max-w-md">
          Generate a weekly assessment based STRICTLY on the actual content covered in this room.
        </p>

        <div className="mb-4">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Content Sources</label>
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-white/5 cursor-pointer hover:bg-slate-800 transition-colors">
              <input type="checkbox" checked={sources.topics} onChange={e => setSources({ ...sources, topics: e.target.checked })} className="accent-violet-500" />
              Completed Topics
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-white/5 cursor-pointer hover:bg-slate-800 transition-colors">
              <input type="checkbox" checked={sources.notes} onChange={e => setSources({ ...sources, notes: e.target.checked })} className="accent-violet-500" />
              <FileText className="w-3.5 h-3.5" /> Shared Notes
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-white/5 cursor-pointer hover:bg-slate-800 transition-colors">
              <input type="checkbox" checked={sources.resources} onChange={e => setSources({ ...sources, resources: e.target.checked })} className="accent-violet-500" />
              <Paperclip className="w-3.5 h-3.5" /> Resources
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-white/5 cursor-pointer hover:bg-slate-800 transition-colors">
              <input type="checkbox" checked={sources.tasks} onChange={e => setSources({ ...sources, tasks: e.target.checked })} className="accent-violet-500" />
              <CheckSquare className="w-3.5 h-3.5" /> Completed Tasks
            </label>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
          <GradientButton onClick={handleGenerate} loading={loading} className="text-xs py-2 px-4">
            Generate Weekly Assessment
          </GradientButton>
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Creates 5 MCQs, 3 Short Answers, 1 Practical
          </span>
        </div>
      </div>
    </GlassCard>
  );
};
