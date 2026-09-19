"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  Minimize2,
  Maximize2,
  Loader2,
  GripHorizontal,
  X,
  Pin,
  PinOff,
} from "lucide-react";
import { Live2DAlexia } from "./Live2DAlexia";
import { PedestalPlatform } from "./PedestalPlatform";
import { recordCopilotInquiry } from "@/lib/gamification";

export interface AlexiaAITutorProps {
  currentLessonTitle?: string;
  currentLessonId?: string;
  circuitContext?: unknown;
  simulationResult?: unknown;
  externalPrompt?: string | null;
  onClearExternalPrompt?: () => void;
  onDockToggle?: () => void;
  isDocked?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const DEFAULT_SUGGESTIONS = [
  "What is superposition?",
  "Explain quantum entanglement",
  "Why do we use the Bloch sphere?",
  "How does Born's rule work?",
];

const QUANTUM_INSIGHTS = [
  "Superposition is not 'being in two states at once'—it is being in one definite state that is a linear combination of basis vectors!",
  "Entanglement links multiple qubits so their joint state cannot be decomposed into individual statevectors: |ψ⟩ ≠ |q₁⟩ ⊗ |q₂⟩.",
  "In the Bloch sphere representation, orthogonal states like |0⟩ and |1⟩ are antipodal (180° apart), even though in Hilbert space they are perpendicular (90°)!",
  "Born's rule connects the abstract complex probability amplitudes α and β to physical reality through |α|² and |β|².",
  "A quantum measurement is fundamentally non-unitary: it destroys superposition and projects the state into an eigenstate of the measurement operator!",
  "Phase kickback uses controlled unitary operations to rotate the phase of the control qubit based on the eigenvalue of the target state.",
  "Grover's algorithm achieves a quadratic speedup (O(√N)) by repeatedly inverting the target state's phase and reflecting about the mean amplitude!",
];

export function AlexiaAITutor({
  currentLessonTitle = "Quantum Foundations",
  currentLessonId,
  circuitContext,
  simulationResult,
  externalPrompt,
  onClearExternalPrompt,
  onDockToggle,
  isDocked = true,
  isOpen = true,
  onClose,
}: AlexiaAITutorProps) {
  const [inputQuery, setInputQuery] = useState("");
  const [speechText, setSpeechText] = useState(
    `Hello! I'm Alexia, your AI Quantum Tutor. Ask me anything about ${currentLessonTitle} or build circuits to explore quantum mechanics together!`
  );
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [expression, setExpression] = useState<string>("neutral");
  const [loading, setLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [minimized, setMinimized] = useState(false);

  // Position & Size for Movable & Resizable Window
  const [dockedState, setDockedState] = useState(isDocked);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 380,
    height: 600,
  });

  const recognitionRef = useRef<any>(null);
  const dragRef = useRef<{ startX: number; startY: number; posX: number; posY: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; startW: number; startH: number } | null>(null);

  // Sync dockedState with prop when prop changes
  useEffect(() => {
    setDockedState(isDocked);
  }, [isDocked]);

  // Set initial floating position on mount if null
  useEffect(() => {
    if (typeof window !== "undefined" && !position) {
      const defaultX = Math.max(16, window.innerWidth - size.width - 24);
      const defaultY = Math.max(70, window.innerHeight - size.height - 24);
      setPosition({ x: defaultX, y: defaultY });
    }
  }, [position, size.width, size.height]);

  // Speech Recognition setup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputQuery(transcript);
          setIsListening(false);
          handleAsk(transcript);
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Text-to-Speech synthesis
  const speakVoice = useCallback((text: string) => {
    if (!voiceEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsSpeaking(true);
      const duration = Math.min(Math.max(text.length * 40, 2000), 7000);
      setTimeout(() => setIsSpeaking(false), duration);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.15;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [voiceEnabled]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in this browser. Please use text input.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      try {
        recognitionRef.current.start();
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleAsk = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q) return;

    setInputQuery("");
    setLoading(true);
    setExpression("thinking");
    setIsSpeaking(true);
    setMinimized(false);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/quantum/copilot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          circuit: circuitContext || { numQubits: 2, gates: [] },
          result: simulationResult || {},
          prompt: q,
          question: q,
          mode: "explain",
          challenge_context: {
            title: currentLessonTitle,
            lessonId: currentLessonId,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const responseText =
          data.response || data.answer || data.message || "Here is the quantum principle at work.";
        setSpeechText(responseText);
        setExpression("happy");
        speakVoice(responseText);
        recordCopilotInquiry();
      } else {
        throw new Error("Backend response error");
      }
    } catch {
      // High-quality local quantum physics explanation fallback
      let fallback = "A qubit exists in a normalized linear superposition |ψ⟩ = α|0⟩ + β|1⟩ where |α|² + |β|² = 1 until Born's rule projects it into a definite basis state upon measurement.";
      const qLower = q.toLowerCase();

      if (qLower.includes("entangle") || qLower.includes("bell")) {
        fallback = "Entanglement couples multiple qubits into a composite state |ψ⟩ that cannot be factored into individual single-qubit states. In a Bell pair (|00⟩+|11⟩)/√2, measuring the first qubit instantaneously dictates the state of the second qubit!";
      } else if (qLower.includes("superposition")) {
        fallback = "Superposition enables a qubit to exist in a linear combination of |0⟩ and |1⟩ states. When you apply a Hadamard (H) gate to |0⟩, it rotates the state into (|0⟩+|1⟩)/√2, creating quantum wave interference.";
      } else if (qLower.includes("bloch")) {
        fallback = "The Bloch sphere provides a 3D unit sphere representation of a pure two-level quantum state: |ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩. Every single-qubit unitary operation corresponds to a 3D rotation on this sphere.";
      } else if (qLower.includes("born")) {
        fallback = "Born's rule is the fundamental postulate connecting quantum statevectors to physical observations: the probability of measuring eigenstate |i⟩ is the absolute square of its complex amplitude, P(i) = |⟨i|ψ⟩|².";
      } else if (qLower.includes("grover")) {
        fallback = "Grover's algorithm searches an unsorted database of N items in O(√N) evaluations using amplitude amplification: first an oracle inverts the phase of the solution state, then a diffusion operator reflects all amplitudes about the mean.";
      } else if (qLower.includes("deutsch")) {
        fallback = "The Deutsch-Jozsa algorithm determines whether a boolean function f(x) is constant or balanced in a single quantum evaluation, exploiting quantum parallelism and destructive interference across unwanted states.";
      } else if (qLower.includes("why") || qLower.includes("explain")) {
        fallback = `In this experiment, your circuit configuration manipulates quantum amplitudes across the computational basis. Applying unitary gates transforms the probability distribution according to verified Qiskit simulation dynamics!`;
      }

      setSpeechText(fallback);
      setExpression("happy");
      speakVoice(fallback);
      recordCopilotInquiry();
    } finally {
      setLoading(false);
      setTimeout(() => setExpression("neutral"), 6000);
    }
  };

  // React to external prompt (e.g. from Challenge completion card)
  useEffect(() => {
    if (externalPrompt) {
      setMinimized(false);
      handleAsk(externalPrompt);
      onClearExternalPrompt?.();
    }
  }, [externalPrompt]);

  const handleAlexiaClick = () => {
    setExpression("happy");
    const greetings = [
      "I'm right here to guide your quantum learning journey!",
      "Ask me anything about gates, statevectors, or algorithms!",
      "Try placing an H gate followed by a CNOT to see entanglement in action!",
      "Curious about the Bloch sphere? Ask me how rotations work!",
      "You can drag my window anywhere or resize me using the bottom corner!",
    ];
    const picked = greetings[Math.floor(Math.random() * greetings.length)];
    setSpeechText(picked);
    speakVoice(picked);
    setTimeout(() => setExpression("neutral"), 4000);
  };

  const handleSparkleClick = () => {
    setExpression("happy");
    const picked = QUANTUM_INSIGHTS[Math.floor(Math.random() * QUANTUM_INSIGHTS.length)];
    setSpeechText(picked);
    speakVoice(picked);
    setTimeout(() => setExpression("neutral"), 5000);
  };

  // Dragging logic for movable window
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (dockedState) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const currentX = position?.x ?? 20;
    const currentY = position?.y ?? 80;

    dragRef.current = {
      startX: clientX,
      startY: clientY,
      posX: currentX,
      posY: currentY,
    };

    const handleDragMove = (moveEvent: MouseEvent | TouchEvent) => {
      if (!dragRef.current) return;
      const curX = "touches" in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const curY = "touches" in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;

      const deltaX = curX - dragRef.current.startX;
      const deltaY = curY - dragRef.current.startY;

      const newX = Math.max(10, Math.min(window.innerWidth - size.width - 10, dragRef.current.posX + deltaX));
      const newY = Math.max(10, Math.min(window.innerHeight - 80, dragRef.current.posY + deltaY));

      setPosition({ x: newX, y: newY });
    };

    const handleDragEnd = () => {
      dragRef.current = null;
      window.removeEventListener("mousemove", handleDragMove);
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("touchmove", handleDragMove);
      window.removeEventListener("touchend", handleDragEnd);
    };

    window.addEventListener("mousemove", handleDragMove);
    window.addEventListener("mouseup", handleDragEnd);
    window.addEventListener("touchmove", handleDragMove, { passive: false });
    window.addEventListener("touchend", handleDragEnd);
  };

  // Resizing logic
  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    resizeRef.current = {
      startX: clientX,
      startY: clientY,
      startW: size.width,
      startH: size.height,
    };

    const handleResizeMove = (moveEvent: MouseEvent | TouchEvent) => {
      if (!resizeRef.current) return;
      const curX = "touches" in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const curY = "touches" in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;

      const deltaW = curX - resizeRef.current.startX;
      const deltaH = curY - resizeRef.current.startY;

      const maxW = Math.min(680, window.innerWidth - 20);
      const maxH = Math.min(900, window.innerHeight - 20);

      const newW = Math.max(310, Math.min(maxW, resizeRef.current.startW + deltaW));
      const newH = Math.max(450, Math.min(maxH, resizeRef.current.startH + deltaH));

      setSize({ width: newW, height: newH });
    };

    const handleResizeEnd = () => {
      resizeRef.current = null;
      window.removeEventListener("mousemove", handleResizeMove);
      window.removeEventListener("mouseup", handleResizeEnd);
      window.removeEventListener("touchmove", handleResizeMove);
      window.removeEventListener("touchend", handleResizeEnd);
    };

    window.addEventListener("mousemove", handleResizeMove);
    window.addEventListener("mouseup", handleResizeEnd);
    window.addEventListener("touchmove", handleResizeMove, { passive: false });
    window.addEventListener("touchend", handleResizeEnd);
  };

  const setPresetSize = (preset: "compact" | "normal" | "expanded") => {
    if (preset === "compact") {
      setSize({ width: 330, height: 500 });
    } else if (preset === "normal") {
      setSize({ width: 380, height: 600 });
    } else {
      setSize({ width: 460, height: 720 });
    }
  };

  if (!isOpen) return null;

  // Minimized Pill Floating Badge
  if (minimized) {
    return (
      <div
        style={{
          position: dockedState ? "relative" : "fixed",
          left: dockedState ? undefined : `${position?.x ?? 24}px`,
          top: dockedState ? undefined : `${position?.y ?? 80}px`,
          zIndex: 9999,
        }}
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-cyan-400/50 bg-[#070d18]/95 backdrop-blur-xl shadow-[0_0_25px_rgba(0,240,255,0.35)] cursor-pointer hover:border-cyan-300 hover:scale-105 transition-all group select-none animate-in fade-in zoom-in-95"
        onClick={() => setMinimized(false)}
        title="Click to expand Alexia AI Tutor"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
        </span>
        <Sparkles size={14} className="text-cyan-400 animate-pulse" />
        <span className="text-xs font-semibold text-cyan-200 tracking-wide">
          Alexia AI Tutor
        </span>
        <Maximize2 size={13} className="text-slate-400 group-hover:text-cyan-300 ml-1 transition" />
      </div>
    );
  }

  // Window Container Style (Docked vs Movable Floating)
  const containerStyle: React.CSSProperties = dockedState
    ? { width: "100%", height: "100%" }
    : {
        position: "fixed",
        left: `${position?.x ?? 24}px`,
        top: `${position?.y ?? 80}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex: 9999,
      };

  return (
    <div
      style={containerStyle}
      className={`flex flex-col select-none ${
        dockedState
          ? "w-full"
          : "rounded-3xl border border-cyan-400/40 bg-[#070d18]/95 shadow-[0_10px_40px_rgba(0,0,0,0.85),0_0_35px_rgba(0,240,255,0.25)] backdrop-blur-2xl transition-[width,height] duration-150 overflow-hidden"
      }`}
    >
      {/* Movable Drag Bar & Header */}
      <div
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 border-b border-white/[0.08] bg-gradient-to-r from-cyan-950/40 via-[#070d18] to-cyan-950/30 ${
          dockedState ? "cursor-default" : "cursor-grab active:cursor-grabbing"
        }`}
        title={dockedState ? undefined : "Click and drag to move Alexia anywhere"}
      >
        <div className="flex items-center gap-2">
          {!dockedState && (
            <GripHorizontal size={14} className="text-cyan-400/60 shrink-0" />
          )}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
          </span>
          <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-cyan-300">
            Alexia · AI Tutor
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Size presets in floating mode */}
          {!dockedState && (
            <div className="flex items-center rounded-lg border border-white/10 bg-white/[0.03] p-0.5 mr-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPresetSize("compact");
                }}
                className={`px-1.5 py-0.5 text-[9px] font-mono rounded transition cursor-pointer ${
                  size.width <= 340
                    ? "bg-cyan-400/20 text-cyan-300 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Compact size (330x500)"
              >
                S
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPresetSize("normal");
                }}
                className={`px-1.5 py-0.5 text-[9px] font-mono rounded transition cursor-pointer ${
                  size.width > 340 && size.width <= 420
                    ? "bg-cyan-400/20 text-cyan-300 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Standard size (380x600)"
              >
                M
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPresetSize("expanded");
                }}
                className={`px-1.5 py-0.5 text-[9px] font-mono rounded transition cursor-pointer ${
                  size.width > 420
                    ? "bg-cyan-400/20 text-cyan-300 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Expanded size (460x720)"
              >
                L
              </button>
            </div>
          )}

          {/* Dock / Float Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDockedState(!dockedState);
              onDockToggle?.();
            }}
            className="p-1.5 rounded-lg border border-white/10 bg-white/[0.02] text-slate-400 hover:text-cyan-300 hover:border-cyan-400/40 transition cursor-pointer"
            title={dockedState ? "Float Alexia (Drag anywhere)" : "Dock Alexia into layout"}
          >
            {dockedState ? <Pin size={12} /> : <PinOff size={12} />}
          </button>

          {/* Voice Speech Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setVoiceEnabled(!voiceEnabled);
            }}
            className={`p-1.5 rounded-lg border transition cursor-pointer ${
              voiceEnabled
                ? "border-cyan-400/50 bg-cyan-400/15 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                : "border-white/10 bg-white/[0.02] text-slate-500 hover:text-slate-300"
            }`}
            title={voiceEnabled ? "Voice Enabled" : "Voice Muted (Click to enable audio)"}
          >
            {voiceEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
          </button>

          {/* Minimize Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMinimized(true);
            }}
            className="p-1.5 rounded-lg border border-white/10 bg-white/[0.02] text-slate-400 hover:text-white transition cursor-pointer"
            title="Minimize to floating badge"
          >
            <Minimize2 size={12} />
          </button>

          {/* Close Button if onClose provided */}
          {onClose && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-1.5 rounded-lg border border-white/10 bg-white/[0.02] text-slate-400 hover:text-rose-400 transition cursor-pointer"
              title="Close Alexia"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-3 overflow-y-auto space-y-2 relative">
        {/* Speech Bubble / Response Card */}
        <div className="w-full rounded-2xl border border-cyan-400/30 bg-gradient-to-b from-[#0a1422]/95 to-[#070c14]/95 p-3 shadow-[0_4px_25px_rgba(0,240,255,0.12)] backdrop-blur-xl transition-all relative shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-cyan-300">
                Live Insight
              </span>
            </div>
            {loading && <Loader2 size={11} className="animate-spin text-cyan-400" />}
          </div>

          <p className="text-xs text-slate-200 leading-relaxed font-sans max-h-32 overflow-y-auto pr-1">
            {speechText}
          </p>
        </div>

        {/* 2.5D Live2D Model & Platform Area */}
        <div className="relative w-full flex-1 min-h-[220px] flex flex-col items-center justify-center overflow-hidden">
          {/* Sparkle Insight Button */}
          <button
            type="button"
            onClick={handleSparkleClick}
            className="absolute top-2 right-2 z-20 p-2 rounded-full border border-cyan-400/40 bg-[#070c14]/90 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.35)] hover:bg-cyan-400/20 hover:scale-110 hover:border-cyan-300 transition cursor-pointer"
            title="Click for a quantum insight from Alexia!"
          >
            <Sparkles size={14} />
          </button>

          {/* Live2D Character Canvas */}
          <div className="w-full h-full flex items-center justify-center">
            <Live2DAlexia
              isSpeaking={isSpeaking}
              expression={expression}
              onClick={handleAlexiaClick}
            />
          </div>

          {/* Glowing Pedestal Platform beneath feet */}
          <div className="w-full -mt-14 mb-1 pointer-events-none">
            <PedestalPlatform isSpeaking={isSpeaking} />
          </div>
        </div>

        {/* Interactive Chat Input & Suggestions */}
        <div className="w-full space-y-2 shrink-0 pt-1 border-t border-white/[0.06]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="relative flex items-center"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask Alexia about this quantum state..."
              className="w-full pl-3.5 pr-20 py-2 rounded-full border border-cyan-500/25 bg-[#070d18]/90 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/70 focus:ring-1 focus:ring-cyan-400/50 shadow-inner backdrop-blur-md transition"
            />

            <div className="absolute right-1.5 flex items-center gap-1">
              {/* Mic voice input */}
              <button
                type="button"
                onClick={toggleListening}
                className={`p-1.5 rounded-full transition cursor-pointer ${
                  isListening
                    ? "bg-rose-500/20 text-rose-400 animate-pulse border border-rose-500/40"
                    : "text-slate-400 hover:text-cyan-300"
                }`}
                title={isListening ? "Listening..." : "Click to speak"}
              >
                {isListening ? <MicOff size={13} /> : <Mic size={13} />}
              </button>

              {/* Send query */}
              <button
                type="submit"
                disabled={!inputQuery.trim() || loading}
                className="p-1.5 rounded-full bg-cyan-400 text-[#070c14] hover:bg-cyan-300 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.5)]"
                title="Send message to Alexia"
              >
                <Send size={12} />
              </button>
            </div>
          </form>

          {/* Quick Prompt Suggestions */}
          <div className="flex flex-wrap items-center gap-1 max-h-16 overflow-y-auto">
            {DEFAULT_SUGGESTIONS.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAsk(suggestion)}
                className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/10 bg-white/[0.03] text-slate-400 hover:text-cyan-300 hover:border-cyan-400/40 hover:bg-cyan-500/10 transition cursor-pointer truncate max-w-full"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resize Handle on bottom-right corner (when floating) */}
      {!dockedState && (
        <div
          onMouseDown={handleResizeStart}
          onTouchStart={handleResizeStart}
          className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize flex items-end justify-end p-1 group z-30"
          title="Drag to resize window"
        >
          <div className="w-2.5 h-2.5 border-r-2 border-b-2 border-cyan-400/40 group-hover:border-cyan-300 transition" />
        </div>
      )}
    </div>
  );
}
