"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Atom,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  GraduationCap,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
} from "lucide-react";

import { UserMenu } from "@/components/UserMenu";
import { challenges, getAllChallenges } from "@/lib/challenges";
import { getLessonById } from "@/lib/lessons";
import {
  getCompletedLessons,
  isLessonComplete,
  resetProgress,
} from "@/lib/progress";

export default function ChallengesPage() {
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

  const allChallenges = getAllChallenges();

  const completedCount = allChallenges.filter((ch) =>
    completedLessons.includes(ch.lessonId)
  ).length;

  const percentage = Math.round(
    (completedCount / (allChallenges.length || 1)) * 100
  );

  return (
    <main className="min-h-screen bg-[#050b10] text-white">
      {/* Top Header */}
      <header className="flex h-16 items-center justify-between border-b border-white/10 bg-[#070c13] px-6 lg:px-10">
        <div className="flex items-center gap-4">
          <Link
            href="/learn"
            className="flex items-center gap-2 rounded-lg p-2 text-white/40 transition hover:bg-white/5 hover:text-white"
            title="Back to Learning Curriculum"
          >
            <ArrowLeft size={18} />
            <span className="hidden text-xs font-medium sm:inline">
              Curriculum
            </span>
          </Link>

          <div className="h-5 w-px bg-white/10" />

          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-400/10 text-violet-300">
              <Trophy size={16} />
            </div>
            <span className="text-sm font-semibold">Quantum Assessment Mode</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/learn"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <GraduationCap size={14} className="text-cyan-400" />
            <span>Curriculum</span>
          </Link>

          <Link
            href="/dashboard"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <Compass size={14} className="text-slate-400" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/lab"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <Atom size={14} className="text-cyan-400" />
            <span>Quantum Lab</span>
          </Link>
          <UserMenu />
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10 lg:py-14">
        {/* Hero Section */}
        <div className="mb-10">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-violet-400">
            <Sparkles size={15} />
            Hands-on Quantum Skill Assessment
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white lg:text-5xl">
            Quantum Circuit Challenges
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400 lg:text-base">
            Put your quantum intuition to the test. Every challenge is evaluated directly
            by Qiskit Aer against real statevectors, probabilities, and measurement
            histograms.
          </p>
        </div>

        {/* Stats Banner */}
        <section className="mb-10 overflow-hidden rounded-2xl border border-violet-400/20 bg-gradient-to-r from-violet-950/20 via-black/20 to-transparent p-6 shadow-md">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-violet-300">
                Assessment Score
              </div>
              <div className="mt-1 text-2xl font-bold">
                {mounted
                  ? `${completedCount} of ${allChallenges.length} Challenges Solved`
                  : "Loading challenges..."}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="font-mono text-2xl font-bold text-violet-400">
                  {mounted ? `${percentage}%` : "0%"}
                </div>
                <div className="text-[10px] text-slate-400">Passed rate</div>
              </div>
            </div>
          </div>

          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-400 to-cyan-400 transition-all duration-700"
              style={{ width: mounted ? `${percentage}%` : "0%" }}
            />
          </div>
        </section>

        {/* Challenges Grid */}
        <div className="grid gap-5 md:grid-cols-2">
          {allChallenges.map((ch) => {
            const lesson = getLessonById(ch.lessonId);
            const isCompleted = mounted && completedLessons.includes(ch.lessonId);

            return (
              <article
                key={ch.id}
                className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border p-6 transition-all ${
                  isCompleted
                    ? "border-emerald-400/30 bg-emerald-950/[0.08]"
                    : "border-white/10 bg-white/[0.02] hover:border-violet-400/30 hover:bg-white/[0.035]"
                }`}
              >
                <div>
                  {/* Top Bar: Difficulty & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-[10px] font-medium text-slate-400">
                      {ch.difficulty}
                    </span>

                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                        <CheckCircle2 size={12} />
                        Completed
                      </span>
                    ) : (
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] text-slate-400">
                        Incomplete
                      </span>
                    )}
                  </div>

                  {/* Title & Lesson */}
                  <h2 className="mt-3 text-lg font-semibold text-white">
                    {ch.title}
                  </h2>

                  {lesson && (
                    <div className="mt-0.5 text-xs text-cyan-400/80">
                      Lesson {lesson.number}: {lesson.title}
                    </div>
                  )}

                  {/* Instruction */}
                  <p className="mt-3 text-xs leading-relaxed text-slate-300">
                    {ch.instruction}
                  </p>

                  {/* Target Condition Chips */}
                  <div className="mt-4 rounded-xl border border-white/5 bg-black/20 p-3">
                    <div className="text-[9px] uppercase tracking-wider text-slate-400">
                      Validation Target
                    </div>
                    <div className="mt-1 font-mono text-xs text-cyan-300">
                      {ch.targetProbabilities &&
                        Object.entries(ch.targetProbabilities)
                          .map(([s, p]) => `|${s}⟩ ≈ ${(p * 100).toFixed(0)}%`)
                          .join("  |  ")}
                      {ch.targetCondition && ch.targetCondition.description}
                    </div>
                  </div>
                </div>

                {/* Bottom CTA */}
                <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="text-[11px] text-slate-400">
                    Qiskit Aer Simulator
                  </span>

                  <Link
                    href={`/lab?challenge=${ch.id}`}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                      isCompleted
                        ? "border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20"
                        : "bg-cyan-400 text-[#061016] hover:bg-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                    }`}
                  >
                    <Play size={13} />
                    <span>{isCompleted ? "Retry in Lab" : "Start Challenge"}</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
