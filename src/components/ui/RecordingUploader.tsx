"use client";
import React, { useState } from "react";
import { UploadCloud, Loader2, Play } from "lucide-react";

export function RecordingUploader({ onUploadComplete }: { onUploadComplete: (transcript: string) => void }) {
  const [loading, setLoading] = useState(false);

  const handleSimulateUpload = () => {
    setLoading(true);
    // Simulating file read and transcription delay for MVP
    setTimeout(() => {
      setLoading(false);
      onUploadComplete("This is a simulated transcript from the learning session. The user discussed React Hooks, specifically useEffect and useState, and how to manage state in a functional component. They struggled with infinite loops in useEffect.");
    }, 2000);
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-8 text-center border-dashed">
      <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
        <UploadCloud className="w-8 h-8 text-indigo-400" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">Upload Session Recording</h3>
      <p className="text-slate-400 mb-6 text-sm max-w-sm mx-auto">
        Upload an audio/video recording or paste a transcript to generate AI-powered insights and revision notes.
      </p>
      
      <div className="flex justify-center gap-4">
        <button 
          onClick={handleSimulateUpload}
          disabled={loading}
          className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
        >
          {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
          {loading ? "Analyzing..." : "Simulate Upload (MVP)"}
        </button>
      </div>
    </div>
  );
}
