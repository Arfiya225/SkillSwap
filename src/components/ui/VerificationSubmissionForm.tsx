"use client";
import React, { useState } from "react";
import { VerificationType } from "@/types/verification";
import { motion } from "framer-motion";
import { Upload, Link as LinkIcon, Code, Send, Loader2 } from "lucide-react";

interface VerificationSubmissionFormProps {
  onSubmit: (type: VerificationType, skillName: string, url: string, github: string) => Promise<void>;
  onCancel: () => void;
}

export const VerificationSubmissionForm: React.FC<VerificationSubmissionFormProps> = ({ onSubmit, onCancel }) => {
  const [type, setType] = useState<VerificationType>("Certificate");
  const [skillName, setSkillName] = useState("");
  const [url, setUrl] = useState("");
  const [github, setGithub] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onSubmit(type, skillName, url, github);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl max-w-md w-full mx-auto"
    >
      <h3 className="text-xl font-bold text-white mb-6">Submit Verification</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Verification Type</label>
          <div className="grid grid-cols-3 gap-2">
            {(["Certificate", "Project", "GitHub"] as VerificationType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                  type === t 
                    ? "bg-indigo-500/20 border-indigo-500 text-indigo-300" 
                    : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {(type === "Certificate" || type === "Project") && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Skill Name</label>
            <input 
              required
              type="text"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              placeholder="e.g. React.js"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}

        {type === "Certificate" && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Certificate URL / Link</label>
            <div className="relative">
              <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                required
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://link-to-certificate.com/view"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">Paste a public link to your credential.</p>
          </div>
        )}

        {type === "Project" && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Project URL</label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                required
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-project-domain.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}

        {type === "GitHub" && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">GitHub Username</label>
            <div className="relative">
              <Code className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                required
                type="text"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="octocat"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}

        <div className="flex space-x-3 pt-4 border-t border-slate-700/50">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> Submit</>}
          </button>
        </div>
      </form>
    </motion.div>
  );
};
