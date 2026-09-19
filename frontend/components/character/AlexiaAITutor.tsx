"use client";

import React, { useState, useRef, useEffect } from "react";
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
  HelpCircle,
} from "lucide-react";
import { Live2DAlexia } from "./Live2DAlexia";
import { PedestalPlatform } from "./PedestalPlatform";
import { recordCopilotInquiry } from "@/lib/gamification";

interface AlexiaAITutorProps {
  currentLessonTitle?: string;
  currentLessonId?: string;
  circuitContext?: unknown;
  onDockToggle?: () => void;
  isDocked?: boolean;
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
];

export function AlexiaAITutor({
  currentLessonTitle = "Quantum Foundations",
  currentLessonId,
  circuitContext,
  onDockToggle,
  isDocked = true,
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

  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition if supported
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

  // Text-to-Speech speaking synthesis
  const speakVoice = (text: string) => {
    if (!voiceEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) {
      // Simulate mouth movement duration even if audio is muted
      setIsSpeaking(true);
      const duration = Math.min(Math.max(text.length * 40, 2000), 7000);
      setTimeout(() => setIsSpeaking(false), duration);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.15; // Pleasant AI tutor voice

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

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

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/quantum/copilot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          circuit: circuitContext || { numQubits: 2, gates: [] },
          prompt: q,
          mode: "explain",
          challenge_context: {
            title: currentLessonTitle,
            lessonId: currentLessonId,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const responseText = data.response || data.message || "Here is what you need to know about this quantum principle.";
        setSpeechText(responseText);
        setExpression("happy");
        speakVoice(responseText);
        recordCopilotInquiry();
      } else {
        throw new Error("Backend response error");
      }
    } catch {
      // Fallback answers for offline resilience
      let fallback = "A qubit exists as a linear superposition |ψ⟩ = α|0⟩ + β|1⟩ until Born's rule projects it into a classical bit with probability |α|² and |β|².";
      if (q.toLowerCase().includes("entangle")) {
        fallback = "Entanglement links multiple qubits so their shared state cannot be factored into independent states. In a Bell pair (|00⟩+|11⟩)/√2, measuring one immediately determines the other!";
      } else if (q.toLowerCase().includes("superposition")) {
        fallback = "Superposition allows a qubit to explore complex amplitude states simultaneously using gates like Hadamard (H), creating constructive and destructive wave interference.";
      } else if (q.toLowerCase().includes("bloch")) {
        fallback = "The Bloch sphere maps pure single-qubit states to 3D coordinates (x,y,z) on a unit sphere. Every single-qubit gate is a rigid 3D rotation around an axis!";
      } else if (q.toLowerCase().includes("born")) {
        fallback = "Born's rule states that the probability of obtaining measurement outcome |i⟩ is given by the squared magnitude of its complex probability amplitude: P(i) = |⟨i|ψ⟩|².";
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

  const handleAlexiaClick = () => {
    setExpression("happy");
    const greetings = [
      "I'm right here to guide your quantum learning journey!",
      "Ask me anything about gates, statevectors, or algorithms!",
      "Try placing an H gate followed by a CNOT to see entanglement in action!",
      "Curious about the Bloch sphere? Ask me how rotations work!",
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

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Top Controls: Dock Badge & Voice & Minimize */}
      <div className="w-full flex items-center justify-between px-2 mb-2">
        <div className="flex items-center gap-2">
          {onDockToggle && (
            <button
              onClick={onDockToggle}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-cyan-400/30 bg-cyan-950/40 text-[11px] font-mono text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/60 transition cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.15)]"
              title="Toggle docked layout"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>{isDocked ? "● Docked" : "● Dock ↗"}</span>
            </button>
          )}

          <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
            AI Quantum Tutor
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Voice Output Toggle */}
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-1.5 rounded-lg border transition cursor-pointer ${
              voiceEnabled
                ? "border-cyan-400/50 bg-cyan-400/15 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                : "border-white/10 bg-white/[0.02] text-slate-500 hover:text-slate-300"
            }`}
            title={voiceEnabled ? "Voice Speech Enabled" : "Voice Speech Muted (Click to enable audio)"}
          >
            {voiceEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
          </button>

          {/* Minimize / Maximize */}
          <button
            onClick={() => setMinimized(!minimized)}
            className="p-1.5 rounded-lg border border-white/10 bg-white/[0.02] text-slate-400 hover:text-white transition cursor-pointer"
            title={minimized ? "Expand Alexia" : "Minimize Alexia"}
          >
            {minimized ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Speech Bubble / Response Card */}
          <div className="w-full mb-3 rounded-2xl border border-cyan-400/30 bg-gradient-to-b from-[#0a1422]/95 to-[#070c14]/95 p-3.5 shadow-[0_4px_25px_rgba(0,240,255,0.15)] backdrop-blur-xl transition-all relative">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300">
                  Alexia · AI Tutor
                </span>
              </div>
              {loading && <Loader2 size={12} className="animate-spin text-cyan-400" />}
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-sans max-h-36 overflow-y-auto pr-1">
              {speechText}
            </p>
          </div>

          {/* 2.5D Live2D Model & Holographic Pedestal Platform */}
          <div className="relative w-full flex flex-col items-center justify-center">
            {/* Sparkle Insight Button (Floating at top right of character, matching reference image) */}
            <button
              onClick={handleSparkleClick}
              className="absolute top-4 right-4 z-20 p-2.5 rounded-full border border-cyan-400/40 bg-[#070c14]/90 text-cyan-300 shadow-[0_0_18px_rgba(0,240,255,0.35)] hover:bg-cyan-400/20 hover:scale-110 hover:border-cyan-300 transition cursor-pointer"
              title="Click for a quantum insight from Alexia!"
            >
              <Sparkles size={15} />
            </button>

            {/* Live2D Character Canvas */}
            <Live2DAlexia
              isSpeaking={isSpeaking}
              expression={expression}
              onClick={handleAlexiaClick}
            />

            {/* Glowing Sci-Fi Pedestal Platform beneath feet */}
            <PedestalPlatform isSpeaking={isSpeaking} />
          </div>

          {/* Interactive Chat Input Bar matching screenshot */}
          <div className="w-full mt-3 space-y-2.5">
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
                placeholder="Ask Alexia about this circuit..."
                className="w-full pl-4 pr-20 py-2.5 rounded-full border border-cyan-500/25 bg-[#070d18]/90 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/70 focus:ring-1 focus:ring-cyan-400/50 shadow-inner backdrop-blur-md transition"
              />

              <div className="absolute right-1.5 flex items-center gap-1">
                {/* Voice Input Mic Button */}
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
                  {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                </button>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!inputQuery.trim() || loading}
                  className="p-1.5 rounded-full bg-cyan-400 text-[#070c14] hover:bg-cyan-300 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.5)]"
                  title="Send message to Alexia"
                >
                  <Send size={13} />
                </button>
              </div>
            </form>

            {/* Quick Prompt Pill Chips matching reference image */}
            <div className="flex flex-wrap items-center gap-1.5">
              {DEFAULT_SUGGESTIONS.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAsk(suggestion)}
                  className="text-[10px] font-mono px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.03] text-slate-400 hover:text-cyan-300 hover:border-cyan-400/40 hover:bg-cyan-500/10 transition cursor-pointer truncate max-w-full"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
