"use client";

import { useEffect, useRef, useState } from "react";

export function PinchZoom({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef(1);
  const txRef = useRef(0);
  const tyRef = useRef(0);
  const pinchStartRef = useRef<{ dist: number; startScale: number } | null>(null);
  const panStartRef = useRef<{ clientX: number; clientY: number; startTx: number; startTy: number } | null>(null);

  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const isDraggingRef = useRef(false);

  const applyTransform = (scale: number, x: number, y: number) => {
    scaleRef.current = scale;
    txRef.current = x;
    tyRef.current = y;
    setTransform({ scale, x, y });
  };

  const getDist = (t1: Touch, t2: Touch) => {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        pinchStartRef.current = {
          dist: getDist(e.touches[0], e.touches[1]),
          startScale: scaleRef.current,
        };
        panStartRef.current = null;
      } else if (e.touches.length === 1) {
        if (scaleRef.current > 1) {
          e.preventDefault();
          isDraggingRef.current = true;
          panStartRef.current = {
            clientX: e.touches[0].clientX,
            clientY: e.touches[0].clientY,
            startTx: txRef.current,
            startTy: tyRef.current,
          };
        }
      }
    };

    const onMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchStartRef.current) {
        e.preventDefault();
        const newDist = getDist(e.touches[0], e.touches[1]);
        const ratio = newDist / pinchStartRef.current.dist;
        const newScale = Math.min(4, Math.max(1, pinchStartRef.current.startScale * ratio));
        applyTransform(newScale, txRef.current, tyRef.current);
      } else if (e.touches.length === 1 && panStartRef.current) {
        e.preventDefault();
        const dx = e.touches[0].clientX - panStartRef.current.clientX;
        const dy = e.touches[0].clientY - panStartRef.current.clientY;
        applyTransform(scaleRef.current, panStartRef.current.startTx + dx, panStartRef.current.startTy + dy);
      }
    };

    const onEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        pinchStartRef.current = null;
      }
      if (e.touches.length === 0) {
        isDraggingRef.current = false;
        panStartRef.current = null;
        if (scaleRef.current <= 1) {
          applyTransform(1, 0, 0);
        }
      } else if (e.touches.length === 1 && scaleRef.current > 1) {
        panStartRef.current = {
          clientX: e.touches[0].clientX,
          clientY: e.touches[0].clientY,
          startTx: txRef.current,
          startTy: tyRef.current,
        };
      }
    };

    el.addEventListener("touchstart", onStart, { passive: false });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd);

    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
    };
  }, []);

  const resetZoom = () => applyTransform(1, 0, 0);

  return (
    <div
      ref={containerRef}
      style={{
        overflow: "hidden",
        touchAction: "none",
        position: "relative",
        ...style,
      }}
    >
      <div
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: "center center",
          width: "100%",
          height: "100%",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        {children}
      </div>
      {transform.scale > 1 && (
        <button
          onClick={resetZoom}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 36,
            height: 36,
            borderRadius: 6,
            backgroundColor: "rgba(0,0,0,0.65)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" style={{ width: 18, height: 18 }}>
            <path
              d="M4 9V4h5M4 4l6 6M20 9V4h-5m5 0l-6 6M4 15v5h5m-5 0l6-6M20 15v5h-5m5 0l-6-6"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
