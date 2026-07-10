import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Line } from "react-konva";
import { Stroke } from "@/types/whiteboard";
import { v4 as uuidv4 } from "uuid";

interface WhiteboardCanvasProps {
  strokes: Stroke[];
  onStrokesChange: (strokes: Stroke[]) => void;
  currentColor: string;
  currentBrushSize: number;
  currentTool: "pen" | "eraser";
  stageRef: React.RefObject<any>;
}

export const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({
  strokes,
  onStrokesChange,
  currentColor,
  currentBrushSize,
  currentTool,
  stageRef,
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMouseDown = (e: any) => {
    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();
    const newStroke: Stroke = {
      id: uuidv4(),
      points: [pos.x, pos.y],
      color: currentTool === "eraser" ? "#0F172A" : currentColor, // Matches background color or selected color
      size: currentBrushSize,
      tool: currentTool,
    };
    onStrokesChange([...strokes, newStroke]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing) {
      return;
    }
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    
    // Copy the last stroke and add the new point
    const lastStroke = { ...strokes[strokes.length - 1] };
    lastStroke.points = lastStroke.points.concat([point.x, point.y]);

    // Replace the last stroke
    const newStrokes = [...strokes];
    newStrokes.splice(newStrokes.length - 1, 1, lastStroke);
    onStrokesChange(newStrokes);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  // Add touch support
  const handleTouchStart = (e: any) => {
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    if (!pos) return;

    setIsDrawing(true);
    const newStroke: Stroke = {
      id: uuidv4(),
      points: [pos.x, pos.y],
      color: currentTool === "eraser" ? "#0F172A" : currentColor,
      size: currentBrushSize,
      tool: currentTool,
    };
    onStrokesChange([...strokes, newStroke]);
    e.evt.preventDefault();
  };

  const handleTouchMove = (e: any) => {
    if (!isDrawing) return;
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    if (!pos) return;

    const lastStroke = { ...strokes[strokes.length - 1] };
    lastStroke.points = lastStroke.points.concat([pos.x, pos.y]);

    const newStrokes = [...strokes];
    newStrokes.splice(newStrokes.length - 1, 1, lastStroke);
    onStrokesChange(newStrokes);
    e.evt.preventDefault();
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-[#0F172A] rounded-2xl overflow-hidden cursor-crosshair">
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        ref={stageRef}
      >
        <Layer>
          {/* Background to make erase tool match canvas visually on PNG export */}
          {/* We don't render a background rect here so we can have transparent PNGs, 
              but since we use '#0F172A' for eraser, we should render a background rect */}
          <Line
             points={[0,0, dimensions.width,0, dimensions.width,dimensions.height, 0,dimensions.height]}
             fill="#0F172A"
             closed
          />
          {strokes.map((stroke, i) => (
            <Line
              key={stroke.id || i}
              points={stroke.points}
              stroke={stroke.color}
              strokeWidth={stroke.size}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={
                stroke.tool === "eraser" ? "destination-out" : "source-over"
              }
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};
