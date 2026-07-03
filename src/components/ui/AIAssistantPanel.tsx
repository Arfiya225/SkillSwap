"use client";
import React, { useState } from "react";
import { ConceptExplainer } from "./ConceptExplainer";
import { QuizGenerator } from "./QuizGenerator";
import { FlashcardGenerator } from "./FlashcardGenerator";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Zap, Target, BookOpen } from "lucide-react";

export function AIAssistantPanel() {
  const [activeTab, setActiveTab] = useState<"explain" | "quiz" | "flashcard">("explain");

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-2xl overflow-hidden w-full max-w-md">
      <div className="bg-indigo-500/10 p-4 border-b border-indigo-500/20 flex items-center space-x-3">
        <div className="p-2 bg-indigo-500/20 rounded-lg">
          <Bot className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Learning Assistant</h2>
          <p className="text-xs text-indigo-200/70">Powered by Gemini AI</p>
        </div>
      </div>

      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab("explain")}
          className={`flex-1 py-3 text-sm font-medium flex justify-center items-center transition-colors ${activeTab === 'explain' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Zap className="w-4 h-4 mr-2" /> Explain
        </button>
        <button
          onClick={() => setActiveTab("quiz")}
          className={`flex-1 py-3 text-sm font-medium flex justify-center items-center transition-colors ${activeTab === 'quiz' ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Target className="w-4 h-4 mr-2" /> Quiz
        </button>
        <button
          onClick={() => setActiveTab("flashcard")}
          className={`flex-1 py-3 text-sm font-medium flex justify-center items-center transition-colors ${activeTab === 'flashcard' ? 'text-fuchsia-400 border-b-2 border-fuchsia-500' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <BookOpen className="w-4 h-4 mr-2" /> Cards
        </button>
      </div>

      <div className="p-4 bg-slate-950/50 min-h-[400px]">
        <AnimatePresence mode="wait">
          {activeTab === "explain" && (
            <motion.div key="explain" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
              <ConceptExplainer />
            </motion.div>
          )}
          {activeTab === "quiz" && (
            <motion.div key="quiz" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
              <QuizGenerator />
            </motion.div>
          )}
          {activeTab === "flashcard" && (
            <motion.div key="flashcard" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
              <FlashcardGenerator />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
