"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Atom,
  ChevronDown,
  Code2,
  GraduationCap,
  Sparkles,
  Wand2,
} from "lucide-react";

import GatePalette from "@/components/GatePalette";
import CircuitGrid from "@/components/CircuitGrid";
import CircuitToolbar from "@/components/CircuitToolbar";
import BlochCard from "@/components/BlochCard";
import ProbabilityChart from "@/components/ProbabilityChart";
import MeasurementChart from "@/components/MeasurementChart";
import QuantumCopilot from "@/components/QuantumCopilot";
import ChallengeBanner from "@/components/ChallengeBanner";
import ChallengeCompletionCard from "@/components/ChallengeCompletionCard";

import { getChallengeById, getChallengeForLesson } from "@/lib/challenges";
import { getLessonById, getNextLesson } from "@/lib/lessons";
import { markLessonComplete } from "@/lib/progress";
import { recordSimulation, awardXP } from "@/lib/gamification";
import { validateChallenge, ValidationResult } from "@/lib/challengeValidator";

import {
  addColumn,
  addQubit,
  createDeutschCircuit,
  createEmptyCircuit,
  createGroverCircuit,
  removeColumn,
  removeQubit,
  serializeCircuit,
} from "@/lib/circuit";

import { QuantumCircuit, SimulationResult } from "@/lib/quantum";

export default function LabPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#080b14] text-white">
          <div className="flex items-center gap-3 text-cyan-300">
            <Atom className="animate-spin" size={24} />
            <span className="text-sm">Loading Quantum Lab...</span>
          </div>
        </div>
      }
    >
      <LabPage />
    </Suspense>
  );
}

function LabPage() {
  const searchParams = useSearchParams();

  const lessonParam = searchParams.get("lesson");
  const challengeParam = searchParams.get("challenge");

  // Determine active challenge and lesson from URL parameters
  const challenge = useMemo(() => {
    if (challengeParam) {
      return getChallengeById(challengeParam);
    }
    if (lessonParam) {
      return getChallengeForLesson(lessonParam);
    }
    return undefined;
  }, [challengeParam, lessonParam]);

  const lesson = useMemo(() => {
    if (lessonParam) {
      return getLessonById(lessonParam);
    }
    if (challenge?.lessonId) {
      return getLessonById(challenge.lessonId);
    }
    return undefined;
  }, [lessonParam, challenge]);

  const nextLesson = useMemo(() => {
    if (!lesson) return null;
    return getNextLesson(lesson.id);
  }, [lesson]);

  const isGrover =
    lessonParam === "grovers-algorithm" || challengeParam === "grover-01";
  const isDeutsch =
    lessonParam === "deutsch-jozsa" || challengeParam === "deutsch-01";

  const [circuit, setCircuit] = useState<QuantumCircuit>(() => {
    if (isGrover) return createGroverCircuit();
    if (isDeutsch) return createDeutschCircuit();
    return createEmptyCircuit(2, 6);
  });

  const [selectedGate, setSelectedGate] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Challenge states
  const [challengeComplete, setChallengeComplete] = useState(false);
  const [challengeValidation, setChallengeValidation] =
    useState<ValidationResult | null>(null);

  // Copilot trigger
  const [copilotExternalPrompt, setCopilotExternalPrompt] = useState<
    string | null
  >(null);

  // --------------------------------------------------
  // Run circuit simulation
  // --------------------------------------------------
  const runCircuit = async () => {
    setRunning(true);
    setErrorMessage(null);

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const response = await fetch(`${apiUrl}/api/quantum/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          num_qubits: circuit.numQubits,
          gates: serializeCircuit(circuit),
          shots: 1024,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Quantum simulation failed with status ${response.status}.`
        );
      }

      const data = (await response.json()) as SimulationResult;
      setResult(data);

      // Record simulation in gamification
      recordSimulation();

      // Evaluate active challenge with actual simulation results
      if (challenge) {
        const validation = validateChallenge(
          challenge,
          serializeCircuit(circuit),
          data
        );

        setChallengeValidation(validation);
        setChallengeComplete(validation.passed);

        if (validation.passed && (lesson?.id || challenge.lessonId)) {
          markLessonComplete(lesson?.id ?? challenge.lessonId);
          awardXP(75, `Completed Challenge: ${challenge.title}`);
        }
      }
    } catch (error) {
      console.error("Simulation error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not connect to the quantum simulator. Please ensure the backend is running on port 8000."
      );
    } finally {
      setRunning(false);
    }
  };

  // --------------------------------------------------
  // Reset circuit
  // --------------------------------------------------
  const resetCircuit = () => {
    setCircuit(createEmptyCircuit(circuit.numQubits, circuit.numColumns));
    setResult(null);
    setChallengeComplete(false);
    setChallengeValidation(null);
    setErrorMessage(null);
  };

  // --------------------------------------------------
  // Load algorithm templates
  // --------------------------------------------------
  const loadGroverTemplate = () => {
    setCircuit(createGroverCircuit());
    setResult(null);
    setChallengeComplete(false);
    setChallengeValidation(null);
  };

  const loadDeutschTemplate = () => {
    setCircuit(createDeutschCircuit());
    setResult(null);
    setChallengeComplete(false);
    setChallengeValidation(null);
  };

  // --------------------------------------------------
  // Handle Copilot question triggered from completion card
  // --------------------------------------------------
  const handleAskCopilotWhy = () => {
    if (challenge) {
      setCopilotExternalPrompt(challenge.copilotStarter);
    }
  };

  return (
    <main className="min-h-screen bg-[#080b14] text-white">
      {/* Navigation Header */}
      <header className="flex h-16 items-center justify-between border-b border-white/10 bg-[#090d17] px-5 lg:px-8">
        <div className="flex items-center gap-4">
          <Link
            href={lesson ? `/learn/${lesson.id}` : "/"}
            className="rounded-lg p-2 text-white/40 transition hover:bg-white/5 hover:text-white"
            title="Back to Home / Curriculum"
          >
            <ArrowLeft size={18} />
          </Link>

          <div className="h-5 w-px bg-white/10" />

          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-300/10">
              <Atom size={17} className="text-cyan-300" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Quantum Lab</span>
                {challenge && (
                  <span className="hidden rounded-md border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-cyan-300 sm:inline-block">
                    Challenge Mode
                  </span>
                )}
              </div>
              <div className="hidden text-[10px] text-white/30 sm:block">
                Interactive circuit environment
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.025] px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/5 hover:text-white sm:flex"
          >
            <span>Home</span>
          </Link>

          <Link
            href="/learn"
            className="hidden items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.025] px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/5 hover:text-white sm:flex"
          >
            <GraduationCap size={14} className="text-cyan-400" />
            <span>Learning Path</span>
          </Link>

          <Link
            href="/challenges"
            className="hidden items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.025] px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/5 hover:text-white sm:flex"
          >
            <Sparkles size={13} className="text-violet-300" />
            <span>Challenges</span>
          </Link>

          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.025] px-3 py-1.5 text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/35">Engine:</span>
            <span className="font-mono text-cyan-300">Qiskit Aer</span>
            <ChevronDown size={12} className="text-white/20" />
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex min-h-[calc(100vh-4rem)] flex-col lg:flex-row">
        {/* Left: Gate Palette */}
        <GatePalette onGateSelect={(gate) => setSelectedGate(gate)} />

        {/* Center: Circuit Composer and Challenge Feedback */}
        <section className="min-w-0 flex-1 p-4 lg:p-6">
          <div className="mx-auto max-w-[1400px]">
            {/* Challenge Mode Banner */}
            {challenge && (
              <ChallengeBanner
                challenge={challenge}
                lesson={lesson}
                isCompleted={challengeComplete}
              />
            )}

            {/* Template Loaders for Algorithm Demonstrations */}
            {(isGrover || isDeutsch) && (
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-cyan-400/20 bg-cyan-950/20 p-3 text-xs">
                <div className="flex items-center gap-2 text-cyan-200">
                  <Wand2 size={15} className="text-cyan-400" />
                  <span>
                    {isGrover
                      ? "Algorithm Demonstration: 2-Qubit Grover Search (|11⟩)"
                      : "Algorithm Demonstration: Deutsch's Balanced Oracle"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isGrover && (
                    <button
                      type="button"
                      onClick={loadGroverTemplate}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-400/20"
                    >
                      <span>Load Grover Circuit (12 Cols)</span>
                    </button>
                  )}
                  {isDeutsch && (
                    <button
                      type="button"
                      onClick={loadDeutschTemplate}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-400/20"
                    >
                      <span>Load Deutsch Circuit</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Error Message if any */}
            {errorMessage && (
              <div className="mb-5 flex items-center justify-between rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-xs text-red-200">
                <div className="flex items-center gap-2.5">
                  <AlertCircle size={16} className="text-red-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="text-xs text-red-300 underline hover:text-white"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Challenge Completion Card (Shown when passed with actual results) */}
            {challenge && challengeComplete && result && (
              <div className="mb-6">
                <ChallengeCompletionCard
                  challenge={challenge}
                  lesson={lesson}
                  nextLesson={nextLesson}
                  result={result}
                  metrics={challengeValidation?.metrics}
                  onAskCopilot={handleAskCopilotWhy}
                  onResetCircuit={resetCircuit}
                />
              </div>
            )}

            {/* Challenge In-Progress Feedback (Shown when simulation ran but challenge not yet passed) */}
            {challenge &&
              !challengeComplete &&
              challengeValidation &&
              !running && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-400/25 bg-amber-400/5 p-4 text-xs leading-relaxed text-amber-200">
                  <span className="font-bold text-amber-400">→ Hint:</span>
                  <div className="flex-1">{challengeValidation.reason}</div>
                </div>
              )}

            {/* Circuit Toolbar */}
            <div className="mb-5">
              <CircuitToolbar
                numQubits={circuit.numQubits}
                numColumns={circuit.numColumns}
                running={running}
                onAddQubit={() => setCircuit(addQubit(circuit))}
                onRemoveQubit={() => setCircuit(removeQubit(circuit))}
                onAddColumn={() => setCircuit(addColumn(circuit))}
                onRemoveColumn={() => setCircuit(removeColumn(circuit))}
                onRun={runCircuit}
                onReset={resetCircuit}
              />
            </div>

            {/* Selected Gate Banner */}
            {selectedGate && (
              <div className="mb-4 flex items-center justify-between rounded-xl border border-cyan-300/20 bg-cyan-300/[0.04] px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 font-mono text-xs font-bold text-cyan-200">
                    {selectedGate}
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-cyan-100">
                      Gate selected
                    </div>
                    <div className="text-[11px] text-white/40">
                      Click any grid cell to place it onto a qubit line
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedGate(null)}
                  className="rounded-md border border-white/10 px-2.5 py-1 text-xs text-white/40 hover:bg-white/5 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Circuit Grid */}
            <div className="mb-6">
              <div className="mb-3 flex items-end justify-between">
                <div>
                  <h1 className="text-lg font-semibold">Circuit Composer</h1>
                  <p className="mt-1 text-xs text-white/40">
                    Drag a gate onto a qubit line or click a cell with a selected gate.
                  </p>
                </div>

                <div className="font-mono text-xs text-white/30">
                  {circuit.operations.length} gate operations
                </div>
              </div>

              <CircuitGrid
                circuit={circuit}
                setCircuit={setCircuit}
                selectedGate={selectedGate}
              />
            </div>

            {/* Circuit Representation (JSON) */}
            <div className="rounded-2xl border border-white/10 bg-[#0b101c]">
              <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                  <Code2 size={14} className="text-cyan-300" />
                  Circuit Representation
                </div>

                <span className="rounded-md bg-white/5 px-2 py-1 text-[9px] font-mono uppercase tracking-widest text-white/30">
                  JSON
                </span>
              </div>

              <pre className="max-h-40 overflow-auto p-4 font-mono text-xs leading-5 text-white/40">
                {JSON.stringify(serializeCircuit(circuit), null, 2)}
              </pre>
            </div>

            {/* Quantum Copilot */}
            <div className="mt-6">
              <QuantumCopilot
                circuit={{
                  num_qubits: circuit.numQubits,
                  gates: serializeCircuit(circuit),
                }}
                result={result}
                challengeContext={
                  challenge
                    ? {
                        title: challenge.title,
                        lessonId: challenge.lessonId,
                      }
                    : null
                }
                externalPrompt={copilotExternalPrompt}
                onClearExternalPrompt={() => setCopilotExternalPrompt(null)}
              />
            </div>
          </div>
        </section>

        {/* Right Sidebar: Results Panel */}
        <aside className="w-full border-t border-white/10 bg-[#090d17] p-5 lg:w-[360px] lg:border-l lg:border-t-0">
          <ResultsPanel result={result} running={running} />
        </aside>
      </div>
    </main>
  );
}

function ResultsPanel({
  result,
  running,
}: {
  result: SimulationResult | null;
  running: boolean;
}) {
  if (running) {
    return (
      <div className="flex h-full min-h-[500px] flex-col items-center justify-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/5">
          <Atom size={26} className="animate-spin text-cyan-300" />
        </div>

        <h2 className="mt-5 text-sm font-medium text-white">
          Executing Qiskit Simulation...
        </h2>

        <p className="mt-2 max-w-[240px] text-xs leading-5 text-white/40">
          Calculating deterministic statevector amplitudes and simulating 1,024
          measurement shots on AerSimulator.
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex h-full min-h-[500px] flex-col items-center justify-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.025]">
          <Atom size={24} className="text-white/20" />
        </div>

        <h2 className="mt-5 text-sm font-medium">No simulation yet</h2>

        <p className="mt-2 max-w-[230px] text-xs leading-5 text-white/30">
          Build a circuit and press Run Circuit to explore its quantum state,
          probabilities, and Bloch sphere.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400/70">
          Simulation Results
        </div>
        <div className="mt-1 font-mono text-xs text-white/30">
          {result.shots.toLocaleString()} shots simulated
        </div>
      </div>

      {/* Statevector */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <div className="mb-3 text-xs font-medium text-white/50">
          Statevector Amplitudes
        </div>

        <div className="space-y-2 font-mono text-xs">
          {result.statevector.map((amplitude, index) => {
            if (amplitude.magnitude < 0.000001) return null;

            const basis = index.toString(2).padStart(result.num_qubits, "0");

            return (
              <div key={index} className="flex items-center justify-between">
                <span className="text-white/50">|{basis}⟩</span>
                <span className="text-cyan-200">
                  {amplitude.real.toFixed(3)}
                  {amplitude.imaginary >= 0 ? "+" : ""}
                  {amplitude.imaginary.toFixed(3)}i
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <ProbabilityChart probabilities={result.probabilities} />

      <MeasurementChart counts={result.counts} shots={result.shots} />

      {result.bloch_vectors.map((vector) => (
        <BlochCard key={vector.qubit} vector={vector} />
      ))}
    </div>
  );
}
