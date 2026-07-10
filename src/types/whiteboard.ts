export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  id: string;
  points: number[]; // Flat array [x1, y1, x2, y2, ...]
  color: string;
  size: number;
  tool: "pen" | "eraser";
}

export interface WhiteboardData {
  id?: string;
  roomId: string;
  strokes: Stroke[];
  updatedAt: any; // Firestore Timestamp
  updatedBy: string;
}
