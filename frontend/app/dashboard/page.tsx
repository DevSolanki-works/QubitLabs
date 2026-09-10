"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Atom,
  Bot,
  Brain,
  Check,
  ChevronRight,
  Eye,
  Flame,
  FlaskConical,
  GraduationCap,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";

import { lessons } from "@/lib/lessons";
import {
  getCompletedLessons,
  getLessonStatus,
  getProgress,
  resetProgress,
} from "@/lib/progress";

export default function HomePageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#050b10] text-white">
          <div className="flex items-center gap-3 text-cyan-300">
            <Atom className="animate-spin" size={24} />
            <span className="text-sm">Loading QubitLabs...</span>
          </div>
        </div>
      }
    >
      <HomePage />
    </Suspense>
  );
}

function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Forward backwards-compatible query params to /lab
  useEffect(() => {
    const lessonParam = searchParams.get("lesson");
    const challengeParam = searchParams.get("challenge");
    if (lessonParam || challengeParam) {
      const query = new URLSearchParams(searchParams.toString()).toString();
      router.replace(`/lab?${query}`);
    }
  }, [searchParams, router]);

  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  const loadProgress = () => {
    setCompletedLessons(getCompletedLessons());
  };

  useEffect(() => {
    setMounted(true);
    loadProgress();

    window.addEventListener("qubitlabs-progress-updated", loadProgress);
    return () => {
      window.removeEventListener("qubitlabs-progress-updated", loadProgress);
    };
  }, []);

  const progressStats = getProgress(lessons.length);
  const allLessonIds = lessons.map((l) => l.id);

  // Find next recommended lesson
  const nextLesson =
    lessons.find((l) => !completedLessons.includes(l.id)) || lessons[0];

  const handleResetProgress = () => {
    if (confirm("Reset learning progress?")) {
      resetProgress();
      loadProgress();
    }
  };

  return (
    <main className="min-h-screen bg-[#050b10] text-white selection:bg-cyan-400 selection:text-[#050b10]">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-white/10 bg-[#070c13]/90 px-6 backdrop-blur-md lg:px-12">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Atom size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white">
                QubitLabs
              </span>
              <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-cyan-300">
                Aer Powered
              </span>
            </div>
          </div>
        </div>

        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-cyan-300 transition hover:bg-cyan-950/30 hover:text-cyan-200"
          >
            <Sparkles size={14} className="text-cyan-400" />
            <span className="hidden sm:inline">3D Landing</span>
          </Link>

          <Link
            href="/learn"
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            <GraduationCap size={15} className="text-cyan-400" />
            <span className="hidden sm:inline">Curriculum</span>
          </Link>

          <Link
            href="/challenges"
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            <Trophy size={14} className="text-violet-400" />
            <span className="hidden sm:inline">Challenges</span>
          </Link>

          <Link
            href="/lab"
            className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-1.5 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-400/20 hover:text-white"
          >
            <FlaskConical size={14} />
            <span>Quantum Lab</span>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/5 px-6 py-16 lg:px-12 lg:py-24">
        {/* Subtle background glow */}
        <div className="pointer-events-none absolute -left-20 top-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-1/4 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="mx-auto max-w-5xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
            <Sparkles size={13} />
            <span>AI-Powered Quantum Education Platform</span>
          </div>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:leading-[1.15]">
            Don't just learn quantum computing.{" "}
            <span className="bg-gradient-to-r from-cyan-300 via-cyan-400 to-emerald-300 bg-clip-text text-transparent">
              See it happen.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Assemble real quantum circuits, simulate them deterministically with{" "}
            <strong className="text-white">IBM Qiskit Aer</strong>, inspect complex
            statevectors and 3D Bloch spheres, and receive interactive tutoring from{" "}
            <strong className="text-white">Quantum Copilot</strong>.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/learn"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-300 px-6 py-3.5 text-sm font-bold text-[#061016] shadow-[0_0_25px_rgba(6,182,212,0.3)] transition hover:opacity-90"
            >
              <span>Start Learning</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/lab"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
            >
              <FlaskConical size={16} className="text-cyan-400" />
              <span>Open Quantum Lab</span>
            </Link>

            <Link
              href="/challenges"
              className="inline-flex items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-400/5 px-4 py-3.5 text-sm font-medium text-violet-300 transition hover:bg-violet-400/15"
            >
              <Trophy size={15} />
              <span>Challenges</span>
            </Link>
          </div>

          {/* Differentiator loop pill */}
          <div className="mt-12 flex flex-wrap items-center gap-2 text-xs text-slate-400 sm:gap-3">
            <span className="font-semibold text-cyan-300">Core Loop:</span>
            <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300">
              1. Learn Concept
            </span>
            <span className="text-slate-600">→</span>
            <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300">
              2. Build Circuit
            </span>
            <span className="text-slate-600">→</span>
            <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300">
              3. Qiskit Aer Simulation
            </span>
            <span className="text-slate-600">→</span>
            <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300">
              4. 3D Visualization
            </span>
            <span className="text-slate-600">→</span>
            <span className="rounded-md border border-violet-400/30 bg-violet-400/10 px-2.5 py-1 text-violet-300">
              5. AI Copilot Tutor
            </span>
          </div>
        </div>
      </section>

      {/* Main Dashboard Section */}
      <section className="mx-auto max-w-5xl px-6 py-12 lg:px-12">
        {/* Row 1: Progress & Continue Learning Banner */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Progress Card */}
          <div className="rounded-2xl border border-white/10 bg-[#080d16] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                Quantum Foundations
              </span>
              {mounted && progressStats.completed > 0 && (
                <button
                  onClick={handleResetProgress}
                  className="text-[10px] text-slate-500 hover:text-slate-300"
                  title="Reset demo progress"
                >
                  <RotateCcw size={11} />
                </button>
              )}
            </div>

            <div className="mt-3">
              <div className="text-2xl font-bold text-white">
                {mounted
                  ? `${progressStats.completed} / ${lessons.length} Completed`
                  : "Loading..."}
              </div>
              <div className="mt-1 text-xs text-slate-400">
                {progressStats.percentage}% of curriculum completed
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-700"
                style={{
                  width: mounted ? `${progressStats.percentage}%` : "0%",
                }}
              />
            </div>

            <Link
              href="/learn"
              className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-cyan-400 hover:underline"
            >
              <span>View full curriculum</span>
              <ChevronRight size={13} />
            </Link>
          </div>

          {/* Continue Learning CTA Card */}
          <div className="relative overflow-hidden rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-950/25 via-[#09111c] to-[#080d16] p-6 shadow-[0_0_30px_rgba(6,182,212,0.1)] md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/30 bg-cyan-400/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                <Flame size={11} />
                Recommended Next Step
              </span>
              <span className="text-xs text-slate-400">
                Lesson {nextLesson.number}
              </span>
            </div>

            <h2 className="mt-3 text-xl font-bold text-white">
              {nextLesson.title}
            </h2>

            <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
              {nextLesson.subtitle} — {nextLesson.task}
            </p>

            <div className="mt-5 flex items-center gap-3">
              <Link
                href={`/learn/${nextLesson.id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-2.5 text-xs font-bold text-[#061016] shadow-sm transition hover:bg-cyan-300"
              >
                <span>Continue Lesson</span>
                <ArrowRight size={14} />
              </Link>

              <Link
                href={`/lab?lesson=${nextLesson.id}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <Play size={12} />
                <span>Launch Experiment Directly</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Row 2: Four Clean Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Platform Modules
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/learn"
              className="group rounded-2xl border border-white/10 bg-[#080d16] p-5 transition hover:border-cyan-400/30 hover:bg-[#0a121e]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                <GraduationCap size={20} />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-white group-hover:text-cyan-200">
                Learn Quantum
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                6 structured interactive lessons from qubits to Grover search.
              </p>
            </Link>

            <Link
              href="/lab"
              className="group rounded-2xl border border-white/10 bg-[#080d16] p-5 transition hover:border-cyan-400/30 hover:bg-[#0a121e]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                <FlaskConical size={19} />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-white group-hover:text-cyan-200">
                Quantum Lab
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Interactive drag-and-drop circuit composer with real Qiskit simulation.
              </p>
            </Link>

            <Link
              href="/challenges"
              className="group rounded-2xl border border-white/10 bg-[#080d16] p-5 transition hover:border-violet-400/30 hover:bg-[#0a121e]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/10 text-violet-300">
                <Trophy size={19} />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-white group-hover:text-violet-200">
                Circuit Challenges
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Assessment challenges evaluated against real quantum state probabilities.
              </p>
            </Link>

            <Link
              href="/lab#quantum-copilot-panel"
              className="group rounded-2xl border border-white/10 bg-[#080d16] p-5 transition hover:border-violet-400/30 hover:bg-[#0a121e]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/10 text-violet-300">
                <Bot size={19} />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-white group-hover:text-violet-200">
                Quantum Copilot
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                AI tutor grounded strictly in your verified quantum simulation facts.
              </p>
            </Link>
          </div>
        </div>

        {/* Row 3: Compact Unlocked Concepts Checklist */}
        <div className="mt-10 rounded-2xl border border-white/10 bg-[#080d16] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">
                Quantum Foundations Curriculum
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Your sequential path from single qubits to search algorithms.
              </p>
            </div>

            <Link
              href="/learn"
              className="text-xs font-semibold text-cyan-400 hover:underline"
            >
              Open Full Path →
            </Link>
          </div>

          <div className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {lessons.map((lesson) => {
              const status = mounted
                ? getLessonStatus(lesson.id, completedLessons, allLessonIds)
                : "available";
              const isCompleted = status === "completed";
              const isCurrent = status === "current";

              return (
                <Link
                  key={lesson.id}
                  href={`/learn/${lesson.id}`}
                  className={`flex items-center gap-3 rounded-xl border p-3 transition ${
                    isCompleted
                      ? "border-emerald-400/25 bg-emerald-950/10 text-emerald-200 hover:border-emerald-400/40"
                      : isCurrent
                        ? "border-cyan-400/35 bg-cyan-950/20 text-cyan-200 hover:border-cyan-400/50"
                        : "border-white/5 bg-white/[0.015] text-slate-400 hover:border-white/15 hover:text-slate-200"
                  }`}
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs font-bold ${
                      isCompleted
                        ? "border-emerald-400/30 bg-emerald-400/15 text-emerald-400"
                        : isCurrent
                          ? "border-cyan-400/40 bg-cyan-400/15 text-cyan-300"
                          : "border-white/10 bg-white/5 text-slate-500"
                    }`}
                  >
                    {isCompleted ? (
                      <Check size={14} className="stroke-[2.5]" />
                    ) : (
                      lesson.number
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-semibold">
                      {lesson.title}
                    </div>
                    <div className="truncate text-[10px] text-slate-500">
                      {lesson.difficulty} · {lesson.duration}
                    </div>
                  </div>

                  {isCurrent && (
                    <span className="rounded-md bg-cyan-400/20 px-1.5 py-0.5 text-[9px] font-bold text-cyan-300">
                      NEXT
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Row 4: Product Differentiator (Build -> Run -> Visualize -> Understand) */}
        <div className="mt-10 rounded-2xl border border-white/10 bg-gradient-to-b from-[#09111c] to-[#080d16] p-6 lg:p-8">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
              Why QubitLabs Works
            </span>
            <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">
              Real Simulation. Real Quantum States. Zero Hallucinations.
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Unlike generic chatbot wrappers, QubitLabs executes every circuit through
              IBM's Qiskit Aer simulation engine before tutoring.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-white/5 bg-black/20 p-4">
              <div className="font-mono text-xs font-bold text-cyan-400">01 / BUILD</div>
              <h3 className="mt-2 text-sm font-semibold text-white">Circuit Composer</h3>
              <p className="mt-1 text-xs text-slate-400">
                Drag and drop H, X, CNOT, S, T, and measurement gates on multi-qubit lines.
              </p>
            </div>

            <div className="rounded-xl border border-white/5 bg-black/20 p-4">
              <div className="font-mono text-xs font-bold text-cyan-400">02 / RUN</div>
              <h3 className="mt-2 text-sm font-semibold text-white">Qiskit Aer Simulator</h3>
              <p className="mt-1 text-xs text-slate-400">
                Executes 1,024 shots with exact quantum statevector and density matrix mathematics.
              </p>
            </div>

            <div className="rounded-xl border border-white/5 bg-black/20 p-4">
              <div className="font-mono text-xs font-bold text-cyan-400">03 / VISUALIZE</div>
              <h3 className="mt-2 text-sm font-semibold text-white">Multi-View Inspector</h3>
              <p className="mt-1 text-xs text-slate-400">
                Observe statevector amplitudes, probability distributions, and 3D Bloch spheres.
              </p>
            </div>

            <div className="rounded-xl border border-white/5 bg-black/20 p-4">
              <div className="font-mono text-xs font-bold text-violet-400">04 / UNDERSTAND</div>
              <h3 className="mt-2 text-sm font-semibold text-white">Quantum Copilot</h3>
              <p className="mt-1 text-xs text-slate-400">
                Google Gemini analyzes the verified simulation data to explain the quantum physics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#05090f] px-6 py-8 text-center text-xs text-slate-500 lg:px-12">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row max-w-5xl mx-auto">
          <div className="flex items-center gap-2">
            <Atom size={15} className="text-cyan-400" />
            <span className="font-semibold text-slate-300">QubitLabs</span>
            <span>— "Don't just learn quantum computing. See it happen."</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/learn" className="hover:text-cyan-400">
              Curriculum
            </Link>
            <Link href="/lab" className="hover:text-cyan-400">
              Lab
            </Link>
            <Link href="/challenges" className="hover:text-cyan-400">
              Challenges
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
