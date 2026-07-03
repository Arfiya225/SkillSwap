"use client";
import React, { useState } from "react";
import { generateConceptExplanation } from "@/services/assistant";
import { logError } from "@/services/monitoring";
import { motion } from "framer-motion";
import { Brain, Loader2 } from "lucide-react";

export function ConceptExplainer() {
  const [concept, setConcept] = useState("");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleExplain = async () => {
    if (!concept.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await generateConceptExplanation(concept);
      setExplanation(res);
    } catch (err: any) {
      setError("Failed to generate explanation. Please try again.");
      logError("ConceptExplainer", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-md border border-indigo-500/20 rounded-xl p-5">
      <div className="flex items-center space-x-2 mb-4">
        <Brain className="w-5 h-5 text-indigo-400" />
        <h3 className="text-lg font-bold text-white">Concept Explainer</h3>
      </div>
      
      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          placeholder="What do you want to learn?"
          className="flex-grow bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
          onKeyDown={(e) => e.key === 'Enter' && handleExplain()}
        />
        <button
          onClick={handleExplain}
          disabled={loading || !concept.trim()}
          className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex justify-center items-center"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Explain"}
        </button>
      </div>

      {error && <p className="text-rose-400 text-sm mb-4">{error}</p>}

      {explanation && (
        <motion.div 
          initial={{ opacity: 0, y: 5 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 text-slate-300 text-sm leading-relaxed"
        >
          {explanation}
        </motion.div>
      )}
    </div>
  );
}
