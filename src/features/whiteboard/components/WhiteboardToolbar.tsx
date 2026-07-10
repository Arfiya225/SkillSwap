import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Pen, Eraser, Download, Trash2 } from "lucide-react";

interface WhiteboardToolbarProps {
  currentTool: "pen" | "eraser";
  setCurrentTool: (tool: "pen" | "eraser") => void;
  currentColor: string;
  setCurrentColor: (color: string) => void;
  currentBrushSize: number;
  setCurrentBrushSize: (size: number) => void;
  onClear: () => void;
  onExport: () => void;
}

const COLORS = [
  "#FFFFFF", // White
  "#F87171", // Red
  "#FBBF24", // Yellow
  "#34D399", // Green
  "#60A5FA", // Blue
  "#A78BFA", // Purple
  "#F472B6", // Pink
];

const BRUSH_SIZES = [2, 5, 10, 20];

export const WhiteboardToolbar: React.FC<WhiteboardToolbarProps> = ({
  currentTool,
  setCurrentTool,
  currentColor,
  setCurrentColor,
  currentBrushSize,
  setCurrentBrushSize,
  onClear,
  onExport,
}) => {
  return (
    <GlassCard className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-white/10">
      <div className="flex items-center gap-6">
        {/* Tools */}
        <div className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-xl border border-white/5">
          <button
            onClick={() => setCurrentTool("pen")}
            className={`p-2 rounded-lg transition-all ${
              currentTool === "pen"
                ? "bg-violet-500/20 text-violet-400"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
            title="Pen"
          >
            <Pen className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentTool("eraser")}
            className={`p-2 rounded-lg transition-all ${
              currentTool === "eraser"
                ? "bg-violet-500/20 text-violet-400"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
            title="Eraser"
          >
            <Eraser className="w-5 h-5" />
          </button>
        </div>

        {/* Colors */}
        <div className="flex items-center gap-2">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => {
                setCurrentColor(color);
                setCurrentTool("pen");
              }}
              className={`w-6 h-6 rounded-full border-2 transition-all ${
                currentColor === color && currentTool === "pen"
                  ? "border-violet-400 scale-110"
                  : "border-transparent scale-100 hover:scale-110"
              }`}
              style={{ backgroundColor: color }}
              title="Select color"
            />
          ))}
        </div>

        {/* Brush Sizes */}
        <div className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-xl border border-white/5">
          {BRUSH_SIZES.map((size) => (
            <button
              key={size}
              onClick={() => setCurrentBrushSize(size)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
                currentBrushSize === size
                  ? "bg-slate-800 text-slate-100"
                  : "text-slate-400 hover:bg-slate-800/50"
              }`}
              title={`Brush size ${size}`}
            >
              <div
                className="bg-current rounded-full"
                style={{ width: size, height: size }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onClear}
          className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Clear Board</span>
        </button>
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export PNG</span>
        </button>
      </div>
    </GlassCard>
  );
};
