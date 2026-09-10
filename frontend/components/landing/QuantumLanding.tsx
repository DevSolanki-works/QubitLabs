"use client";

import { useRef, useState } from "react";
import { LandingNavbar } from "./LandingNavbar";
import { QuantumScene } from "./QuantumScene";
import { OverlayUI } from "./OverlayUI";
import { LandingFooter } from "./LandingFooter";

export default function QuantumLanding() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [blochGate, setBlochGate] = useState<string>("NONE");

  return (
    <div className="bg-[#07080c] min-h-screen relative text-slate-100 selection:bg-cyan-500/30 selection:text-white">
      {/* Background Film Grain Overlay */}
      <div className="grain-overlay pointer-events-none" aria-hidden="true" />

      {/* Navigation Bar */}
      <LandingNavbar />

      {/* Fixed Fullscreen 3D Scene */}
      <QuantumScene scrollContainerRef={containerRef} blochGate={blochGate} />

      {/* Scrollable Storyboard Sections */}
      <div ref={containerRef} className="relative z-10 w-full pointer-events-none">
        <OverlayUI onApplyGate={(gate: string) => setBlochGate(gate)} />
      </div>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
