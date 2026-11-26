import React, { useEffect, useRef } from "react";

export const Backdrop: React.FC = () => {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canHover =
      window.matchMedia && window.matchMedia("(hover: hover)").matches;

    if (prefersReduced || !canHover) return;

    let rafId: number | null = null;
    let targetX = 0;
    let targetY = 0;

    const handleMove = (e: PointerEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 18;
      targetY = (e.clientY / window.innerHeight - 0.5) * 14;
      if (rafId === null) {
        rafId = window.requestAnimationFrame(() => {
          if (layerRef.current) {
            layerRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
          }
          rafId = null;
        });
      }
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handleMove);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <div className="bg-canvas" aria-hidden="true">
        <div ref={layerRef} className="blob-layer">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />
          <div className="blob blob-4" />
        </div>

        <svg
          className="highway-svg"
          viewBox="0 0 1200 180"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M-20 176 L560 30 L640 30 L1220 176"
            fill="none"
            stroke="rgba(139,92,246,0.45)"
            strokeWidth="2.5"
          />
          <path
            d="M-20 179 L575 34 L625 34 L1220 179"
            fill="none"
            stroke="rgba(56,189,248,0.28)"
            strokeWidth="1.5"
          />
          <path
            className="hwy-dash"
            d="M600 178 L600 32"
            fill="none"
            stroke="rgba(255,176,32,0.72)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="600" cy="30" r="24" fill="rgba(255,176,32,0.14)" />
          <circle cx="600" cy="30" r="8" fill="rgba(255,193,77,0.48)" />
        </svg>
      </div>
      <div className="grain-overlay" aria-hidden="true" />
    </>
  );
};
