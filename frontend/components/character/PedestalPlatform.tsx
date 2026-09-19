"use client";

import React from "react";

export function PedestalPlatform({ isSpeaking = false }: { isSpeaking?: boolean }) {
  return (
    <div className="relative w-full h-14 flex items-center justify-center pointer-events-none select-none">
      {/* Outer ambient floor glow */}
      <div
        className={`absolute w-64 sm:w-72 h-14 rounded-[50%] bg-cyan-500/20 blur-xl transition-all duration-700 ${
          isSpeaking ? "bg-cyan-400/40 scale-110" : "bg-cyan-500/20"
        }`}
      />

      {/* Outermost faint energy boundary */}
      <div className="absolute w-56 sm:w-64 h-8 rounded-[50%] border border-cyan-400/25 bg-cyan-950/30 shadow-[0_0_15px_rgba(0,240,255,0.2)]" />

      {/* Rotating dashed holographic ring */}
      <div
        className={`absolute w-48 sm:w-56 h-6 rounded-[50%] border border-dashed border-cyan-400/50 animate-[spin_25s_linear_infinite] ${
          isSpeaking ? "border-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.5)]" : ""
        }`}
      />

      {/* Middle cyan energy dais ring */}
      <div className="absolute w-40 sm:w-48 h-5 rounded-[50%] border-2 border-cyan-400/80 bg-gradient-to-t from-cyan-400/25 to-transparent shadow-[0_0_20px_rgba(0,240,255,0.5)]" />

      {/* Core bright emission line */}
      <div className="absolute w-28 sm:w-36 h-3 rounded-[50%] bg-cyan-200/50 blur-[2px] shadow-[0_0_12px_#00f0ff]" />

      {/* Intense center spot beneath boots */}
      <div className="absolute w-16 sm:w-20 h-1.5 rounded-[50%] bg-white/80 blur-[1px] shadow-[0_0_8px_#ffffff]" />
    </div>
  );
}
