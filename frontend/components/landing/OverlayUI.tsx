"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  FlaskConical,
  GraduationCap,
  Sparkles,
  Trophy,
  Compass,
  Zap,
} from "lucide-react";
import { soundManager } from "@/lib/sound";

function SlideFooter({ hintText = "SCROLL", mobileHintText }: { hintText?: string; mobileHintText?: string }) {
  return (
    <div className="flex justify-end items-center text-[10px] sm:text-xs font-mono text-[#5c6470] border-t border-white/10 pt-3 sm:pt-5 pointer-events-auto select-none">
      <div className="flex items-center gap-2 text-white/50">
        <span className="tracking-widest uppercase hidden sm:inline">{hintText}</span>
        <span className="tracking-widest uppercase sm:hidden">{mobileHintText || hintText}</span>
        <span className="w-4 sm:w-6 h-[1px] bg-white/30" />
      </div>
    </div>
  );
}

interface OverlayUIProps {
  onApplyGate?: (gate: string) => void;
  onOpenLab?: () => void;
}

export function OverlayUI({ onApplyGate = () => {}, onOpenLab }: OverlayUIProps) {
  const router = useRouter();
  const [activeGate, setActiveGate] = useState("NONE");
  const [prob0, setProb0] = useState(50);
  const [prob1, setProb1] = useState(50);
  const [stateStr, setStateStr] = useState("0.707|0⟩ + 0.707|1⟩");
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleGateClick = (gate: string) => {
    setActiveGate(gate);
    onApplyGate(gate);

    // Provide topic-specific quantum audio feedback
    soundManager.unlockAudioContext();
    if (gate === "RESET") {
      soundManager.playQuantumTopic("ground_state");
    } else if (gate === "H") {
      soundManager.playQuantumTopic("gate_h");
    } else if (gate === "X") {
      soundManager.playQuantumTopic("gate_x");
    } else if (gate === "Z") {
      soundManager.playQuantumTopic("phase_flip");
    }

    if (gate === "H") {
      setProb0(50);
      setProb1(50);
      setStateStr("0.707|0⟩ + 0.707|1⟩");
    } else if (gate === "X") {
      setProb0(0);
      setProb1(100);
      setStateStr("0.000|0⟩ + 1.000|1⟩");
    } else if (gate === "Z") {
      setProb0(50);
      setProb1(50);
      setStateStr("0.707|0⟩ - 0.707|1⟩");
    } else if (gate === "RESET") {
      setProb0(100);
      setProb1(0);
      setStateStr("1.000|0⟩ + 0.000|1⟩");
    }
  };

  const handleLabNavigation = () => {
    if (onOpenLab) {
      onOpenLab();
    } else {
      router.push("/lab");
    }
  };

  return (
    <div className="relative z-10 w-full text-[#eef1f6] pointer-events-none select-none">
      {/* Interactive Cursor Quantum Field Aura */}
      <div
        className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-300 hidden md:block"
        style={{
          background: `radial-gradient(550px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 240, 255, 0.045), rgba(224, 36, 195, 0.02) 40%, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      {/* ----------------- SECTION 1: HERO ----------------- */}
      <section
        id="slide-0"
        className="h-screen min-h-[100dvh] snap-start snap-always flex flex-col justify-between px-5 sm:px-14 lg:px-20 py-6 sm:py-10 overflow-hidden relative"
      >
        <div className="pt-20 sm:pt-24 max-w-2xl pointer-events-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-[11px] sm:text-xs font-mono text-[#00f0ff] uppercase tracking-widest mb-4 sm:mb-6 backdrop-blur-sm shadow-[0_0_15px_rgba(0,240,255,0.15)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse" />
            AI-Powered Interactive Quantum Learning Platform
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extralight tracking-tight mb-4 sm:mb-6 leading-[1.08]">
            Don&apos;t just learn quantum.<br />
            <span className="font-normal text-white bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-white to-emerald-300">
              See it happen.
            </span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-[#9aa3b2] max-w-xl mb-6 sm:mb-8 leading-relaxed font-light">
            Assemble quantum circuits with real-time feedback, simulate them deterministically with{" "}
            <strong className="text-white font-medium">IBM Qiskit Aer</strong>, inspect 3D Bloch spheres,
            and explore interactive algorithms.
          </p>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6">
            <Link
              href="/learn"
              onClick={() => soundManager.playClick()}
              className="px-6 py-3 sm:px-7 sm:py-3.5 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-300 text-[#07080c] font-bold text-xs sm:text-sm hover:opacity-95 transition-all hover:shadow-[0_0_24px_rgba(0,240,255,0.4)] pointer-events-auto cursor-pointer flex items-center gap-2"
            >
              <span>Start Learning</span>
              <ArrowRight size={15} />
            </Link>

            <Link
              href="/lab"
              onClick={() => soundManager.playClick()}
              className="px-6 py-3 sm:px-7 sm:py-3.5 rounded-full border border-cyan-400/40 text-cyan-300 font-medium text-xs sm:text-sm hover:bg-cyan-500/10 hover:border-cyan-400/70 transition-all backdrop-blur-sm pointer-events-auto cursor-pointer flex items-center gap-2"
            >
              <FlaskConical size={15} />
              <span>Explore Quantum Lab</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            </Link>

            <Link
              href="/challenges"
              onClick={() => soundManager.playClick()}
              className="hidden sm:inline-flex px-5 py-3 sm:py-3.5 rounded-full border border-violet-400/30 text-violet-300 font-medium text-xs sm:text-sm hover:bg-violet-500/10 transition-all backdrop-blur-sm pointer-events-auto cursor-pointer items-center gap-1.5"
            >
              <Trophy size={14} />
              <span>Challenges</span>
            </Link>

            <Link
              href="/dashboard"
              onClick={() => soundManager.playClick()}
              className="hidden sm:inline-flex px-5 py-3 sm:py-3.5 rounded-full border border-white/10 text-slate-300 font-medium text-xs sm:text-sm hover:bg-white/5 transition-all backdrop-blur-sm pointer-events-auto cursor-pointer items-center gap-1.5"
            >
              <Compass size={14} />
              <span>Dashboard</span>
            </Link>
          </div>

          {/* Differentiator loop pill */}
          <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-slate-400 pt-1">
            <span className="text-cyan-400 font-semibold uppercase tracking-wider">Engine:</span>
            <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/10 text-white/80">
              Qiskit Aer 2.5
            </span>
            <span className="text-slate-600">·</span>
            <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/10 text-white/80">
              6 Curated Lessons
            </span>
            <span className="text-slate-600">·</span>
            <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/10 text-white/80">
              Gemini AI Tutor
            </span>
          </div>
        </div>

        <SlideFooter hintText="CLICK 3D CORE FOR QUANTUM AUDIO · SCROLL TO EXPLORE" mobileHintText="TAP 3D CORE FOR AUDIO" />
      </section>

      {/* ----------------- SECTION 2: SUPERPOSITION ----------------- */}
      <section
        id="slide-1"
        className="h-screen min-h-[100dvh] snap-start snap-always flex flex-col justify-between px-5 sm:px-14 lg:px-20 py-6 sm:py-10 overflow-hidden relative"
      >
        <div className="pt-20 sm:pt-28 max-w-xl pointer-events-auto">
          <div className="text-[11px] sm:text-xs font-mono text-[#00f0ff] uppercase tracking-widest mb-3 sm:mb-4">
            01 / State Representation
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extralight tracking-tight mb-4 sm:mb-6 leading-[1.1]">
            A single qubit…<br />
            can exist in<br />
            <span className="text-white font-normal bg-clip-text text-transparent bg-gradient-to-r from-[#00f0ff] to-[#6f8cff]">
              superposition.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-[#9aa3b2] max-w-lg mb-4 sm:mb-6 leading-relaxed font-light">
            Unlike classical bits which are deterministically either 0 or 1, a quantum bit exists as
            a coherent linear combination of both states simultaneously until measured.
          </p>

          <div className="p-3 sm:p-4 rounded-xl bg-white/[0.03] border border-white/10 font-mono text-xs sm:text-sm space-y-1.5 sm:space-y-2 backdrop-blur-md inline-block shadow-lg">
            <div className="text-white/80">|ψ⟩ = α|0⟩ + β|1⟩</div>
            <div className="text-[11px] sm:text-xs text-[#00f0ff]/80">|α|² + |β|² = 1 (Conservation of Probability)</div>
          </div>
        </div>

        <SlideFooter hintText="CLICK 3D QUBIT SPHERES FOR AUDIO" mobileHintText="TAP SPHERES FOR AUDIO" />
      </section>

      {/* ----------------- SECTION 3: ENTANGLEMENT ----------------- */}
      <section
        id="slide-2"
        className="h-screen min-h-[100dvh] snap-start snap-always flex flex-col justify-between px-5 sm:px-14 lg:px-20 py-6 sm:py-10 overflow-hidden relative"
      >
        <div className="pt-20 sm:pt-28 max-w-xl pointer-events-auto">
          <div className="text-[11px] sm:text-xs font-mono text-[#e024c3] uppercase tracking-widest mb-3 sm:mb-4">
            02 / Non-Local Correlation
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extralight tracking-tight mb-4 sm:mb-6 leading-[1.1]">
            Two qubits become<br />
            interconnected…<br />
            <span className="text-white font-normal bg-clip-text text-transparent bg-gradient-to-r from-[#e024c3] to-[#ff66cc]">
              Entanglement.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-[#9aa3b2] max-w-lg mb-4 sm:mb-6 leading-relaxed font-light">
            Entangled pairs share a singular non-separable wave function. Measuring one particle collapses
            the entangled counterpart instantaneously, forming the bedrock of quantum algorithms.
          </p>

          <div className="p-3 sm:p-4 rounded-xl bg-white/[0.03] border border-white/10 font-mono text-xs sm:text-sm space-y-1.5 sm:space-y-2 backdrop-blur-md inline-block shadow-lg">
            <div className="text-white/80">|Φ⁺⟩ = (|00⟩ + |11⟩) / √2</div>
            <div className="text-[11px] sm:text-xs text-[#e024c3]/90">Bell State: Maximal Quantum Correlation</div>
          </div>
        </div>

        <SlideFooter hintText="CLICK QUANTUM BRIDGE FOR AUDIO" mobileHintText="TAP BRIDGE FOR AUDIO" />
      </section>

      {/* ----------------- SECTION 4: CIRCUIT DESIGN ----------------- */}
      <section
        id="slide-3"
        className="h-screen min-h-[100dvh] snap-start snap-always flex flex-col justify-between px-5 sm:px-14 lg:px-20 py-6 sm:py-10 overflow-hidden relative"
      >
        <div className="pt-20 sm:pt-28 max-w-xl pointer-events-auto">
          <div className="text-[11px] sm:text-xs font-mono text-[#00f0ff] uppercase tracking-widest mb-3 sm:mb-4">
            03 / Logic & Hardware
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extralight tracking-tight mb-4 sm:mb-6 leading-[1.1]">
            Transition to physical<br />
            components…<br />
            <span className="text-white font-normal bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-[#00f0ff]">
              Circuit design.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-[#9aa3b2] max-w-lg mb-4 sm:mb-6 leading-relaxed font-light">
            Assemble quantum gates—Hadamard, Pauli-X, and Controlled-NOT—onto superconducting transmission
            rails. Route microwave pulses straight into physical cryogenic micro-architectures.
          </p>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 font-mono text-[10px] sm:text-xs">
            <div className="p-2.5 sm:p-3 rounded-lg bg-white/[0.03] border border-white/10">
              <span className="text-[#00f0ff] font-semibold">Gate [H]</span>
              <p className="text-white/60 text-[10px] sm:text-[11px] mt-1">Superposition</p>
            </div>
            <div className="p-2.5 sm:p-3 rounded-lg bg-white/[0.03] border border-white/10">
              <span className="text-[#e024c3] font-semibold">Gate [CNOT]</span>
              <p className="text-white/60 text-[10px] sm:text-[11px] mt-1">Entanglement</p>
            </div>
            <div className="p-2.5 sm:p-3 rounded-lg bg-white/[0.03] border border-white/10">
              <span className="text-[#6f8cff] font-semibold">Gate [X]</span>
              <p className="text-white/60 text-[10px] sm:text-[11px] mt-1">Bit-flip π-rot</p>
            </div>
          </div>
        </div>

        <SlideFooter hintText="CLICK GATES & CHIP FOR AUDIO" mobileHintText="TAP GATES FOR AUDIO" />
      </section>

      {/* ----------------- SECTION 5: DATA / COMPUTATION ----------------- */}
      <section
        id="slide-4"
        className="h-screen min-h-[100dvh] snap-start snap-always flex flex-col justify-between px-5 sm:px-14 lg:px-20 py-6 sm:py-10 overflow-hidden relative"
      >
        <div className="pt-20 sm:pt-28 max-w-xl pointer-events-auto">
          <div className="text-[11px] sm:text-xs font-mono text-[#00f0ff] uppercase tracking-widest mb-3 sm:mb-4">
            04 / Quantum Interference
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extralight tracking-tight mb-4 sm:mb-6 leading-[1.1]">
            Circuit simulation results<br />
            dissolve into data…<br />
            <span className="text-white font-normal bg-clip-text text-transparent bg-gradient-to-r from-[#00f0ff] via-purple-300 to-[#e024c3]">
              Computation world.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-[#9aa3b2] max-w-lg mb-4 sm:mb-6 leading-relaxed font-light">
            Constructive interference amplifies amplitude along target eigenstates while destructive
            interference cancels erroneous paths across 2^N-dimensional Hilbert space.
          </p>

          <div className="p-3 sm:p-4 rounded-xl bg-white/[0.03] border border-white/10 font-mono text-[11px] sm:text-xs text-white/70 space-y-1 backdrop-blur-md inline-block shadow-lg">
            <div className="text-[#00f0ff] font-semibold">P(x) = |⟨x|U|0⟩|²</div>
            <div>Probability density manifold with resonance interference peaks</div>
          </div>
        </div>

        <SlideFooter hintText="CLICK PROBABILITY WAVE FOR AUDIO" mobileHintText="TAP WAVE FOR AUDIO" />
      </section>

      {/* ----------------- SECTION 6: THE APPLICATION (INTERACTIVE) ----------------- */}
      <section
        id="slide-5"
        className="h-screen min-h-[100dvh] snap-start snap-always flex flex-col justify-between px-5 sm:px-14 lg:px-20 py-6 sm:py-10 overflow-hidden relative"
      >
        <div className="pt-20 sm:pt-28 max-w-xl pointer-events-auto">
          <div className="text-[11px] sm:text-xs font-mono text-[#00f0ff] uppercase tracking-widest mb-3 sm:mb-4">
            05 / Interactive Laboratory
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extralight tracking-tight mb-3 sm:mb-6 leading-[1.1]">
            A full computational<br />
            simulation environment…<br />
            <span className="text-white font-normal bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-white to-pink-300">
              The application.
            </span>
          </h2>

          <p className="text-xs sm:text-base text-[#9aa3b2] max-w-lg mb-4 sm:mb-6 leading-relaxed font-light">
            Manipulate unitary operators in real time. Inspect state vectors on the 3D Bloch sphere,
            read exact density matrices, and execute multi-qubit algorithms directly in the Quantum Lab.
          </p>

          {/* Mobile-friendly interactive gate controls */}
          <div className="lg:hidden p-3.5 rounded-xl bg-[#0a0d14]/90 border border-white/10 backdrop-blur-md mb-4 max-w-md pointer-events-auto shadow-lg">
            <div className="flex justify-between items-center text-[11px] font-mono mb-2.5 pb-2 border-b border-white/10">
              <span className="text-white/60">State: <span className="text-[#00f0ff]">{stateStr}</span></span>
              <span className="text-white/40">{activeGate === "NONE" ? "Default" : `Gate ${activeGate}`}</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleGateClick("H")}
                className="py-1.5 rounded-lg bg-white/[0.08] hover:bg-[#00f0ff]/20 text-[#00f0ff] border border-white/15 font-mono text-xs font-semibold cursor-pointer"
              >
                H
              </button>
              <button
                type="button"
                onClick={() => handleGateClick("X")}
                className="py-1.5 rounded-lg bg-white/[0.08] hover:bg-[#e024c3]/20 text-[#e024c3] border border-white/15 font-mono text-xs font-semibold cursor-pointer"
              >
                X
              </button>
              <button
                type="button"
                onClick={() => handleGateClick("Z")}
                className="py-1.5 rounded-lg bg-white/[0.08] hover:bg-[#6f8cff]/20 text-[#6f8cff] border border-white/15 font-mono text-xs font-semibold cursor-pointer"
              >
                Z
              </button>
              <button
                type="button"
                onClick={() => handleGateClick("RESET")}
                className="py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/20 text-white/80 border border-white/15 font-mono text-xs cursor-pointer"
              >
                Reset
              </button>
            </div>
            <div className="mt-3 flex gap-2">
              <Link
                href="/lab"
                className="flex-1 py-2 rounded-lg bg-cyan-400 text-[#07080c] font-semibold text-xs text-center"
              >
                Open Lab
              </Link>
              <Link
                href="/learn"
                className="flex-1 py-2 rounded-lg border border-white/20 text-white font-medium text-xs text-center"
              >
                Curriculum
              </Link>
            </div>
          </div>

          <div className="hidden lg:flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => handleGateClick("H")}
              className="px-6 py-3.5 rounded-full bg-[#00f0ff] text-black font-semibold text-sm hover:opacity-90 transition-all shadow-[0_0_24px_rgba(0,240,255,0.45)] hover:scale-105 pointer-events-auto cursor-pointer"
            >
              Test Hadamard
            </button>
            <button
              type="button"
              onClick={() => handleGateClick("RESET")}
              className="px-6 py-3.5 rounded-full border border-white/20 text-white font-medium text-sm hover:bg-white/10 hover:border-white/40 transition-all pointer-events-auto cursor-pointer"
            >
              Reset Vector |0⟩
            </button>
            <Link
              href="/lab"
              className="px-6 py-3.5 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold text-sm hover:opacity-95 transition-all shadow-[0_0_24px_rgba(168,85,247,0.4)] hover:scale-105 pointer-events-auto cursor-pointer flex items-center gap-2"
            >
              <FlaskConical size={16} />
              <span>Launch Quantum Lab</span>
              <span className="text-xs">↗</span>
            </Link>
            <Link
              href="/learn"
              className="px-6 py-3.5 rounded-full border border-cyan-400/40 text-cyan-300 font-medium text-sm hover:bg-cyan-500/10 transition-all pointer-events-auto cursor-pointer flex items-center gap-2"
            >
              <GraduationCap size={16} />
              <span>View Curriculum</span>
            </Link>
          </div>
        </div>

        {/* Real-time Interactive HUD Panel for Desktop */}
        <div className="hidden lg:block absolute right-16 top-1/4 w-84 p-5 rounded-2xl bg-[#0a0d14]/85 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] pointer-events-auto transition-all hover:border-white/25">
          <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-ping" />
              <span className="text-xs font-mono text-[#00f0ff] font-medium uppercase tracking-wider">
                Quantum State Monitor
              </span>
            </div>
            <span className="text-[10px] font-mono text-white/40">Active Qubit #0</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center py-1 border-b border-white/5">
              <span className="text-white/60">State Vector |ψ⟩</span>
              <span className="text-white font-medium">{stateStr}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-white/5">
              <span className="text-white/60">Last Gate Applied</span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-[#00f0ff] font-semibold">
                {activeGate === "NONE" ? "None" : `Gate ${activeGate}`}
              </span>
            </div>

            {/* Probability Bars */}
            <div className="pt-2 space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-white/70">|0⟩ Probability</span>
                <span className="text-[#00f0ff] font-bold">{prob0}%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#00f0ff] to-[#6f8cff] transition-all duration-500 rounded-full"
                  style={{ width: `${prob0}%` }}
                />
              </div>
            </div>

            <div className="pt-1 space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-white/70">|1⟩ Probability</span>
                <span className="text-[#e024c3] font-bold">{prob1}%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#e024c3] to-[#ff66cc] transition-all duration-500 rounded-full"
                  style={{ width: `${prob1}%` }}
                />
              </div>
            </div>
          </div>

          {/* Interactive Gate Buttons */}
          <div className="grid grid-cols-4 gap-2 mt-5 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => handleGateClick("H")}
              className="py-2 rounded-lg bg-white/[0.07] hover:bg-[#00f0ff]/20 hover:text-[#00f0ff] hover:border-[#00f0ff]/40 border border-white/10 font-mono text-xs font-medium transition-all cursor-pointer text-center"
            >
              H
            </button>
            <button
              type="button"
              onClick={() => handleGateClick("X")}
              className="py-2 rounded-lg bg-white/[0.07] hover:bg-[#e024c3]/20 hover:text-[#e024c3] hover:border-[#e024c3]/40 border border-white/10 font-mono text-xs font-medium transition-all cursor-pointer text-center"
            >
              X
            </button>
            <button
              type="button"
              onClick={() => handleGateClick("Z")}
              className="py-2 rounded-lg bg-white/[0.07] hover:bg-[#6f8cff]/20 hover:text-[#6f8cff] hover:border-[#6f8cff]/40 border border-white/10 font-mono text-xs font-medium transition-all cursor-pointer text-center"
            >
              Z
            </button>
            <button
              type="button"
              onClick={() => handleGateClick("RESET")}
              className="py-2 rounded-lg bg-white/[0.07] hover:bg-white/20 text-white/70 hover:text-white border border-white/10 font-mono text-xs font-medium transition-all cursor-pointer text-center"
            >
              Reset
            </button>
          </div>
        </div>

        <SlideFooter hintText="END OF DEMO · CLICK TO ENTER LAB" />
      </section>
    </div>
  );
}
