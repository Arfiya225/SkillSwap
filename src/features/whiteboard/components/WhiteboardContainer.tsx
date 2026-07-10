"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Stroke } from "@/types/whiteboard";
import {
  subscribeToWhiteboard,
  saveWhiteboardStrokes,
} from "@/services/whiteboardService";
import { WhiteboardCanvas } from "./WhiteboardCanvas";
import { WhiteboardToolbar } from "./WhiteboardToolbar";
import { GlassCard } from "@/components/ui/GlassCard";
import { PenTool } from "lucide-react";
import toast from "react-hot-toast";

interface WhiteboardContainerProps {
  roomId: string;
}

export const WhiteboardContainer: React.FC<WhiteboardContainerProps> = ({
  roomId,
}) => {
  const { user } = useAuth();
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentTool, setCurrentTool] = useState<"pen" | "eraser">("pen");
  const [currentColor, setCurrentColor] = useState<string>("#FFFFFF");
  const [currentBrushSize, setCurrentBrushSize] = useState<number>(5);
  const [loading, setLoading] = useState(true);

  const stageRef = useRef<any>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLocalUpdateRef = useRef(false);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!roomId) return;

    setLoading(true);
    const unsubscribe = subscribeToWhiteboard(roomId, (data) => {
      if (data) {
        // Only update local state if the update didn't originate from this client's recent action,
        // or if it's the initial load.
        // For simplicity in a collaborative environment, we just update the strokes.
        // To avoid cursor jumping, we can check if we are drawing (in Canvas) but for now:
        if (!isLocalUpdateRef.current) {
           setStrokes(data.strokes || []);
        }
      }
      setLoading(false);
      isLocalUpdateRef.current = false; // Reset the flag after receiving update
    });

    return () => unsubscribe();
  }, [roomId]);

  // Debounced save
  const handleStrokesChange = useCallback(
    (newStrokes: Stroke[]) => {
      setStrokes(newStrokes);
      isLocalUpdateRef.current = true;

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        if (user && roomId) {
          saveWhiteboardStrokes(roomId, newStrokes, user.uid).catch((err) => {
            console.error("Failed to save whiteboard strokes:", err);
          });
        }
      }, 500); // 500ms debounce
    },
    [roomId, user]
  );

  const handleClear = () => {
    if (confirm("Are you sure you want to clear the whiteboard for everyone?")) {
      handleStrokesChange([]);
    }
  };

  const handleExport = () => {
    if (!stageRef.current) return;
    
    try {
      const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `whiteboard-${roomId}-${new Date().getTime()}.png`;
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Whiteboard exported successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export whiteboard");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] border border-white/5 bg-slate-950/20 rounded-2xl">
        <PenTool className="w-10 h-10 text-violet-400 animate-pulse mb-4" />
        <p className="text-sm text-slate-400 font-medium animate-pulse">Loading collaborative board...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <PenTool className="w-5 h-5 text-violet-400" />
          Collaborative Whiteboard
        </h3>
        <p className="text-xs text-slate-400">
          Draw, brainstorm, and share ideas in real-time with your partner.
        </p>
      </div>

      <WhiteboardToolbar
        currentTool={currentTool}
        setCurrentTool={setCurrentTool}
        currentColor={currentColor}
        setCurrentColor={setCurrentColor}
        currentBrushSize={currentBrushSize}
        setCurrentBrushSize={setCurrentBrushSize}
        onClear={handleClear}
        onExport={handleExport}
      />

      <GlassCard className="p-0 border-white/10 overflow-hidden relative" style={{ height: "600px" }}>
        {/* We lazy load react-konva to avoid SSR issues if necessary, but we are using "use client" */}
        <WhiteboardCanvas
          strokes={strokes}
          onStrokesChange={handleStrokesChange}
          currentColor={currentColor}
          currentBrushSize={currentBrushSize}
          currentTool={currentTool}
          stageRef={stageRef}
        />
      </GlassCard>
    </div>
  );
};
