"use client";

import React from "react";

export function PedestalPlatform({ isSpeaking = false }: { isSpeaking?: boolean }) {
  return (
    <div className="relative w-full h-16 flex items-center justify-center pointer-events-none select-none -mt-8 mb-2">
      {/* Outer ambient floor glow */}
      <div
        className={`absolute w-72 sm:w-80 h-16 rounded-[50%] bg-cyan-500/20 blur-2xl transition-all duration-700 ${
          isSpeaking ? "bg-cyan-400/40 scale-110" : "bg-cyan-500/20"
        }`}
      />

      {/* Outermost faint energy boundary */}
      <div className="absolute w-64 sm:w-72 h-10 rounded-[50%] border border-cyan-400/25 bg-cyan-950/30 shadow-[0_0_20px_rgba(0,240,255,0.25)]" />

      {/* Rotating dashed holographic ring */}
      <div
        className={`absolute w-56 sm:w-64 h-8 rounded-[50%] border border-dashed border-cyan-400/50 animate-[spin_25s_linear_infinite] ${
          isSpeaking ? "border-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.6)]" : ""
        }`}
      />

      {/* Middle cyan energy dais ring */}
      <div className="absolute w-48 sm:w-56 h-7 rounded-[50%] border-2 border-cyan-400/80 bg-gradient-to-t from-cyan-400/25 to-transparent shadow-[0_0_25px_rgba(0,240,255,0.5)]" />

      {/* Core bright emission line */}
      <div className="absolute w-36 sm:w-44 h-4 rounded-[50%] bg-cyan-200/50 blur-[2px] shadow-[0_0_15px_#00f0ff]" />

      {/* Intense center spot beneath boots */}
      <div className="absolute w-20 sm:w-28 h-2 rounded-[50%] bg-white/80 blur-[1px] shadow-[0_0_10px_#ffffff]" />
    </div>
  );
}
