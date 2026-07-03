"use client";
import React, { useState } from "react";
import { generateFlashcards } from "@/services/assistant";
import { logError } from "@/services/monitoring";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Loader2, ChevronRight, ChevronLeft } from "lucide-react";

export function FlashcardGenerator() {
  const [topic, setTopic] = useState("");
  const [cards, setCards] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError("");
    setCards(null);
    setCurrentIndex(0);
    setIsFlipped(false);
    
    try {
      const res = await generateFlashcards(topic, 5);
      const jsonStr = res.replace(/```json/g, "").replace(/```/g, "").trim();
      setCards(JSON.parse(jsonStr));
    } catch (err: any) {
      setError("Failed to generate flashcards.");
      logError("FlashcardGenerator", err);
    } finally {
      setLoading(false);
    }
  };

  const nextCard = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => Math.min(prev + 1, (cards?.length || 1) - 1));
  };
  
  const prevCard = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-md border border-fuchsia-500/20 rounded-xl p-5">
      <div className="flex items-center space-x-2 mb-4">
        <Copy className="w-5 h-5 text-fuchsia-400" />
        <h3 className="text-lg font-bold text-white">AI Flashcards</h3>
      </div>
      
      {!cards && (
        <div className="flex flex-col space-y-3">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Topic to memorize..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-fuchsia-500"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            className="w-full bg-fuchsia-500 hover:bg-fuchsia-600 disabled:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex justify-center items-center"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Flashcards"}
          </button>
        </div>
      )}

      {error && <p className="text-rose-400 text-sm mt-4">{error}</p>}

      {cards && cards.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full aspect-[3/2] bg-slate-800/80 rounded-xl border border-slate-700 cursor-pointer p-6 flex flex-col justify-center items-center text-center relative"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isFlipped ? "back" : "front"}
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex flex-col justify-center items-center p-6"
              >
                <span className="text-xs text-slate-500 uppercase tracking-widest mb-4">
                  {isFlipped ? "Answer" : "Question"}
                </span>
                <p className="text-lg font-medium text-white">
                  {isFlipped ? cards[currentIndex].back : cards[currentIndex].front}
                </p>
              </motion.div>
            </AnimatePresence>
            <div className="absolute bottom-3 right-3 text-xs text-slate-600">Click to flip</div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <button 
              onClick={prevCard} 
              disabled={currentIndex === 0}
              className="p-2 bg-slate-800 rounded-lg disabled:opacity-50 text-slate-300 hover:text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-slate-400">{currentIndex + 1} / {cards.length}</span>
            <button 
              onClick={nextCard} 
              disabled={currentIndex === cards.length - 1}
              className="p-2 bg-slate-800 rounded-lg disabled:opacity-50 text-slate-300 hover:text-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <button onClick={() => setCards(null)} className="w-full mt-4 text-sm text-fuchsia-400 hover:underline text-center">
            Generate new deck
          </button>
        </motion.div>
      )}
    </div>
  );
}
