"use client";
import React, { useState } from "react";
import { Star, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (teaching: number, comm: number, reliability: number, text: string) => void;
  peerName: string;
}

export function RatingModal({ isOpen, onClose, onSubmit, peerName }: RatingModalProps) {
  const [teaching, setTeaching] = useState(0);
  const [comm, setComm] = useState(0);
  const [reliability, setReliability] = useState(0);
  const [text, setText] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (teaching === 0 || comm === 0 || reliability === 0) return;
    onSubmit(teaching, comm, reliability, text);
  };

  const StarSelector = ({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) => (
    <div className="flex justify-between items-center mb-3">
      <span className="text-sm text-slate-300">{label}</span>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map(i => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star className={`w-5 h-5 ${i <= value ? 'fill-indigo-400 text-indigo-400' : 'text-slate-600'}`} />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden"
        >
          <div className="flex justify-between items-center p-4 border-b border-slate-800">
            <h3 className="text-lg font-bold text-white">Rate {peerName}</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-5">
            <div className="mb-6 bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
              <StarSelector label="Teaching Quality" value={teaching} onChange={setTeaching} />
              <StarSelector label="Communication" value={comm} onChange={setComm} />
              <StarSelector label="Reliability" value={reliability} onChange={setReliability} />
            </div>

            <div className="mb-6">
              <label className="block text-sm text-slate-400 mb-2">Written Review (Optional)</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white text-sm h-24 resize-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                placeholder="Share your experience learning with them..."
              />
            </div>

            <button
              type="submit"
              disabled={teaching === 0 || comm === 0 || reliability === 0}
              className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-medium transition-colors"
            >
              Submit Review
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
