"use client";
import React, { useState, useRef } from "react";
import { UploadCloud, Loader2, Play } from "lucide-react";
import { uploadRecording } from "@/services/storage";
import toast from "react-hot-toast";

export function RecordingUploader({ roomId, onUploadComplete }: { roomId: string; onUploadComplete: () => void }) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("audio/") && !file.type.startsWith("video/")) {
      toast.error("Please upload an audio or video file.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Uploading media file...");

    try {
      const downloadURL = await uploadRecording(roomId, file);

      toast.loading("Analyzing recording with Gemini AI... This may take a moment.", { id: toastId });

      const res = await fetch("/api/recording-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          roomId,
          fileUrl: downloadURL,
          mimeType: file.type
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze recording");
      }

      toast.success("Recording analyzed successfully!", { id: toastId });
      onUploadComplete();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "An error occurred during analysis.", { id: toastId });
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-8 text-center border-dashed">
      <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
        <UploadCloud className="w-8 h-8 text-indigo-400" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">Upload Session Recording</h3>
      <p className="text-slate-400 mb-6 text-sm max-w-sm mx-auto">
        Upload an audio or video recording to generate AI-powered transcripts, insights, revision notes, and quizzes.
      </p>
      
      <div className="flex justify-center gap-4">
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="audio/*,video/*" 
          className="hidden" 
          onChange={handleUpload} 
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
        >
          {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
          {loading ? "Analyzing..." : "Select File & Analyze"}
        </button>
      </div>
    </div>
  );
}
