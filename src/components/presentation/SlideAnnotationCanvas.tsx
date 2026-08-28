"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Type } from "lucide-react";

export type DrawToolType =
  | "pointer"
  | "pen"
  | "highlighter"
  | "laser"
  | "arrow"
  | "rect"
  | "circle"
  | "line"
  | "text"
  | "stamp"
  | "eraser";

export interface AnnotationCanvasProps {
  slideIndex: number;
  activeTool?: DrawToolType;
  color?: string;
  size?: number;
  undoRef?: React.MutableRefObject<(() => void) | null>;
  redoRef?: React.MutableRefObject<(() => void) | null>;
  clearRef?: React.MutableRefObject<(() => void) | null>;
  downloadRef?: React.MutableRefObject<(() => void) | null>;
}

interface Point {
  x: number;
  y: number;
}

interface DrawStroke {
  tool: "pen" | "highlighter" | "eraser" | "arrow" | "rect" | "circle" | "line";
  color: string;
  size: number;
  points: Point[];
}

interface TextNote {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
}

interface LaserPoint {
  x: number;
  y: number;
  time: number;
}

export function SlideAnnotationCanvas({
  slideIndex,
  activeTool = "pointer",
  color = "#2563eb",
  size = 3.5,
  undoRef,
  redoRef,
  clearRef,
  downloadRef,
}: AnnotationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const laserCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);

  // Persistent storage across slide navigation
  const strokesHistoryRef = useRef<Record<number, DrawStroke[]>>({});
  const undoStackRef = useRef<Record<number, DrawStroke[][]>>({});
  const redoStackRef = useRef<Record<number, DrawStroke[][]>>({});
  const textNotesRef = useRef<Record<number, TextNote[]>>({});

  // Laser Pointer trail
  const laserTrailRef = useRef<LaserPoint[]>([]);
  const laserAnimFrameRef = useRef<number | null>(null);
  const [, setLaserCursorPos] = useState<Point | null>(null);

  // Active floating text note state
  const [activeTextInput, setActiveTextInput] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);

  // Redraw main annotation canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const slideStrokes = strokesHistoryRef.current[slideIndex] || [];

    for (const stroke of slideStrokes) {
      if (stroke.points.length === 0) continue;

      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (stroke.tool === "highlighter") {
        ctx.strokeStyle = stroke.color;
        ctx.globalAlpha = 0.38;
        ctx.lineWidth = stroke.size * 5.5;
        ctx.globalCompositeOperation = "source-over";
      } else if (stroke.tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = stroke.size * 8;
      } else {
        ctx.strokeStyle = stroke.color;
        ctx.fillStyle = stroke.color;
        ctx.globalAlpha = 1.0;
        ctx.lineWidth = stroke.size;
        ctx.globalCompositeOperation = "source-over";
      }

      const p0 = stroke.points[0];
      const pLast = stroke.points[stroke.points.length - 1];

      if (stroke.tool === "line") {
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(pLast.x, pLast.y);
        ctx.stroke();
      } else if (stroke.tool === "arrow") {
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(pLast.x, pLast.y);
        ctx.stroke();

        const angle = Math.atan2(pLast.y - p0.y, pLast.x - p0.x);
        const headlen = 14 + stroke.size * 1.5;
        ctx.beginPath();
        ctx.moveTo(pLast.x, pLast.y);
        ctx.lineTo(
          pLast.x - headlen * Math.cos(angle - Math.PI / 6),
          pLast.y - headlen * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(pLast.x, pLast.y);
        ctx.lineTo(
          pLast.x - headlen * Math.cos(angle + Math.PI / 6),
          pLast.y - headlen * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
      } else if (stroke.tool === "rect") {
        ctx.beginPath();
        const width = pLast.x - p0.x;
        const height = pLast.y - p0.y;
        ctx.strokeRect(p0.x, p0.y, width, height);
      } else if (stroke.tool === "circle") {
        ctx.beginPath();
        const rx = Math.abs(pLast.x - p0.x) / 2;
        const ry = Math.abs(pLast.y - p0.y) / 2;
        const cx = (p0.x + pLast.x) / 2;
        const cy = (p0.y + pLast.y) / 2;
        ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
        ctx.stroke();
      } else {
        ctx.beginPath();
        if (stroke.points.length === 1) {
          ctx.arc(stroke.points[0].x, stroke.points[0].y, stroke.size / 2, 0, Math.PI * 2);
          ctx.fillStyle = stroke.color;
          ctx.fill();
        } else if (stroke.points.length === 2) {
          ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
          ctx.lineTo(stroke.points[1].x, stroke.points[1].y);
          ctx.stroke();
        } else {
          ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
          for (let i = 1; i < stroke.points.length - 1; i++) {
            const xc = (stroke.points[i].x + stroke.points[i + 1].x) / 2;
            const yc = (stroke.points[i].y + stroke.points[i + 1].y) / 2;
            ctx.quadraticCurveTo(stroke.points[i].x, stroke.points[i].y, xc, yc);
          }
          ctx.lineTo(
            stroke.points[stroke.points.length - 1].x,
            stroke.points[stroke.points.length - 1].y
          );
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    // Render Text Notes
    const notes = textNotesRef.current[slideIndex] || [];
    for (const note of notes) {
      ctx.save();
      ctx.font = `bold ${note.fontSize}px Cairo, sans-serif`;
      ctx.fillStyle = note.color;
      ctx.direction = "rtl";
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 4;
      ctx.fillText(note.text, note.x, note.y);
      ctx.restore();
    }
  }, [slideIndex]);

  // Handle Resize & HiDPI
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    const laserCanvas = laserCanvasRef.current;
    const container = containerRef.current;
    if (!canvas || !laserCanvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    laserCanvas.width = rect.width * dpr;
    laserCanvas.height = rect.height * dpr;
    laserCanvas.style.width = `${rect.width}px`;
    laserCanvas.style.height = `${rect.height}px`;

    redrawCanvas();
  }, [redrawCanvas]);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize, slideIndex]);

  // Laser Pointer Render Loop
  useEffect(() => {
    let active = true;

    const renderLaser = () => {
      if (!active) return;
      const laserCanvas = laserCanvasRef.current;
      const container = containerRef.current;
      if (laserCanvas && container) {
        const ctx = laserCanvas.getContext("2d");
        if (ctx) {
          const dpr = window.devicePixelRatio || 1;
          const rect = container.getBoundingClientRect();
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.clearRect(0, 0, rect.width, rect.height);

          const now = performance.now();
          const trail = laserTrailRef.current;
          laserTrailRef.current = trail.filter((p) => now - p.time < 500);

          for (let i = 0; i < laserTrailRef.current.length; i++) {
            const p = laserTrailRef.current[i];
            const age = now - p.time;
            const alpha = Math.max(0, 1 - age / 500);
            const radius = Math.max(2, (1 - age / 500) * 8);

            ctx.beginPath();
            ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`;
            ctx.shadowColor = "#ef4444";
            ctx.shadowBlur = 12;
            ctx.fill();
          }

          if (laserTrailRef.current.length > 0) {
            const latest = laserTrailRef.current[laserTrailRef.current.length - 1];
            ctx.beginPath();
            ctx.arc(latest.x, latest.y, 7, 0, Math.PI * 2);
            ctx.fillStyle = "#ffffff";
            ctx.shadowColor = "#ef4444";
            ctx.shadowBlur = 16;
            ctx.fill();
          }
        }
      }
      laserAnimFrameRef.current = requestAnimationFrame(renderLaser);
    };

    laserAnimFrameRef.current = requestAnimationFrame(renderLaser);

    return () => {
      active = false;
      if (laserAnimFrameRef.current) cancelAnimationFrame(laserAnimFrameRef.current);
    };
  }, []);

  // Coordinate normalizer
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const container = containerRef.current;
    if (!container) return { x: e.clientX, y: e.clientY };
    const rect = container.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activeTool === "pointer") return;

    const pt = getCanvasCoords(e);

    if (activeTool === "laser") {
      setLaserCursorPos(pt);
      laserTrailRef.current.push({ x: pt.x, y: pt.y, time: performance.now() });
      return;
    }

    if (activeTool === "text") {
      setActiveTextInput({ x: pt.x, y: pt.y, text: "" });
      return;
    }

    if (!strokesHistoryRef.current[slideIndex]) {
      strokesHistoryRef.current[slideIndex] = [];
    }
    if (!undoStackRef.current[slideIndex]) {
      undoStackRef.current[slideIndex] = [];
    }

    undoStackRef.current[slideIndex].push([...strokesHistoryRef.current[slideIndex]]);
    redoStackRef.current[slideIndex] = [];

    setIsDrawing(true);
    setStartPoint(pt);

    const strokeTool = activeTool === "stamp" ? "pen" : activeTool;

    const newStroke: DrawStroke = {
      tool: strokeTool,
      color,
      size,
      points: [pt],
    };

    strokesHistoryRef.current[slideIndex].push(newStroke);
    redrawCanvas();

    const canvas = canvasRef.current;
    if (canvas) {
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        // Ignore pointer capture errors if unsupported
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pt = getCanvasCoords(e);

    if (activeTool === "laser") {
      setLaserCursorPos(pt);
      laserTrailRef.current.push({ x: pt.x, y: pt.y, time: performance.now() });
      return;
    }

    if (!isDrawing || activeTool === "pointer" || activeTool === "text" || activeTool === "stamp") return;

    const slideStrokes = strokesHistoryRef.current[slideIndex];
    if (!slideStrokes || slideStrokes.length === 0) return;

    const currentStroke = slideStrokes[slideStrokes.length - 1];

    if (
      currentStroke.tool === "line" ||
      currentStroke.tool === "arrow" ||
      currentStroke.tool === "rect" ||
      currentStroke.tool === "circle"
    ) {
      currentStroke.points = [startPoint || currentStroke.points[0], pt];
    } else {
      currentStroke.points.push(pt);
    }

    redrawCanvas();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activeTool === "laser") {
      setIsDrawing(false);
      return;
    }

    if (isDrawing) {
      setIsDrawing(false);
      setStartPoint(null);
      redrawCanvas();
      const canvas = canvasRef.current;
      if (canvas) {
        try {
          if (canvas.hasPointerCapture(e.pointerId)) {
            canvas.releasePointerCapture(e.pointerId);
          }
        } catch {
          // Ignore
        }
      }
    }
  };

  const handlePointerLeave = () => {
    if (activeTool === "laser") {
      setLaserCursorPos(null);
    }
    if (isDrawing && activeTool !== "laser") {
      setIsDrawing(false);
      setStartPoint(null);
      redrawCanvas();
    }
  };

  const handleUndo = useCallback(() => {
    const stack = undoStackRef.current[slideIndex];
    if (stack && stack.length > 0) {
      const prevState = stack.pop() || [];
      if (!redoStackRef.current[slideIndex]) {
        redoStackRef.current[slideIndex] = [];
      }
      redoStackRef.current[slideIndex].push([...(strokesHistoryRef.current[slideIndex] || [])]);
      strokesHistoryRef.current[slideIndex] = prevState;
      redrawCanvas();
    }
  }, [slideIndex, redrawCanvas]);

  const handleRedo = useCallback(() => {
    const stack = redoStackRef.current[slideIndex];
    if (stack && stack.length > 0) {
      const nextState = stack.pop() || [];
      if (!undoStackRef.current[slideIndex]) {
        undoStackRef.current[slideIndex] = [];
      }
      undoStackRef.current[slideIndex].push([...(strokesHistoryRef.current[slideIndex] || [])]);
      strokesHistoryRef.current[slideIndex] = nextState;
      redrawCanvas();
    }
  }, [slideIndex, redrawCanvas]);

  const handleClear = useCallback(() => {
    if (!undoStackRef.current[slideIndex]) {
      undoStackRef.current[slideIndex] = [];
    }
    const current = strokesHistoryRef.current[slideIndex] || [];
    undoStackRef.current[slideIndex].push([...current]);

    strokesHistoryRef.current[slideIndex] = [];
    textNotesRef.current[slideIndex] = [];
    redrawCanvas();
  }, [slideIndex, redrawCanvas]);

  const handleDownloadSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `slide_${slideIndex + 1}_annotations.png`;
    link.href = dataUrl;
    link.click();
  }, [slideIndex]);

  // Wire external refs
  useEffect(() => {
    if (undoRef) undoRef.current = handleUndo;
    if (redoRef) redoRef.current = handleRedo;
    if (clearRef) clearRef.current = handleClear;
    if (downloadRef) downloadRef.current = handleDownloadSnapshot;
  }, [undoRef, redoRef, clearRef, downloadRef, handleUndo, handleRedo, handleClear, handleDownloadSnapshot]);

  const handleSaveTextNote = () => {
    if (activeTextInput && activeTextInput.text.trim()) {
      if (!textNotesRef.current[slideIndex]) {
        textNotesRef.current[slideIndex] = [];
      }
      textNotesRef.current[slideIndex].push({
        id: `note-${Date.now()}`,
        x: activeTextInput.x,
        y: activeTextInput.y,
        text: activeTextInput.text.trim(),
        color,
        fontSize: size * 4 + 14,
      });
      redrawCanvas();
    }
    setActiveTextInput(null);
  };

  const getCursorClass = () => {
    switch (activeTool) {
      case "pointer":
        return "pointer-events-none";
      case "laser":
        return "cursor-none pointer-events-auto";
      case "text":
        return "cursor-text pointer-events-auto";
      case "eraser":
        return "cursor-cell pointer-events-auto";
      default:
        return "cursor-crosshair pointer-events-auto";
    }
  };

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 z-30 transition-all ${
        activeTool === "pointer" ? "pointer-events-none" : "pointer-events-auto"
      }`}
    >
      {/* Vector Drawing Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        className={`absolute inset-0 w-full h-full touch-none select-none ${getCursorClass()}`}
      />

      {/* Laser Layer Canvas */}
      <canvas
        ref={laserCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none touch-none select-none z-10"
      />

      {/* Floating Text Note Input Box */}
      {activeTextInput && (
        <div
          className="absolute z-50 bg-white dark:bg-slate-900 border-2 border-blue-600 rounded-2xl p-3 shadow-2xl pointer-events-auto animate-fadeIn"
          style={{
            left: `${Math.max(10, Math.min(activeTextInput.x, (containerRef.current?.clientWidth || 500) - 260))}px`,
            top: `${Math.max(10, Math.min(activeTextInput.y, (containerRef.current?.clientHeight || 500) - 100))}px`,
            transform: "translate(-10%, -50%)",
          }}
          dir="rtl"
        >
          <div className="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-slate-100 dark:border-slate-800">
            <Type className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">إضافة ملاحظة على الشريحة</span>
          </div>
          <input
            type="text"
            autoFocus
            value={activeTextInput.text}
            onChange={(e) => setActiveTextInput({ ...activeTextInput, text: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveTextNote();
              if (e.key === "Escape") setActiveTextInput(null);
            }}
            placeholder="اكتب ملاحظة واضغط Enter..."
            className="w-full px-3 py-1.5 text-sm font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 min-w-[240px]"
          />
          <div className="flex justify-end gap-1.5 mt-2">
            <button
              onClick={() => setActiveTextInput(null)}
              className="text-[11px] px-2.5 py-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer font-bold"
            >
              إلغاء
            </button>
            <button
              onClick={handleSaveTextNote}
              className="text-[11px] px-3 py-1 bg-blue-600 text-white rounded-lg font-bold cursor-pointer hover:bg-blue-700 transition-colors shadow-sm"
            >
              حفظ الملاحظة
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
