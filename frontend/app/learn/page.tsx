"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Flame,
  GraduationCap,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
} from "lucide-react";

import { lessons } from "@/lib/lessons";
import {
  getCompletedLessons,
  getLessonStatus,
  getProgress,
  resetProgress,
} from "@/lib/progress";

export default function LearnPage() {
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  const loadProgress = () => {
    setCompletedLessons(getCompletedLessons());
  };

  useEffect(() => {
    setMounted(true);
    loadProgress();

    // Listen to custom event when progress is marked complete
    window.addEventListener("qubitlabs-progress-updated", loadProgress);
    return () => {
      window.removeEventListener("qubitlabs-progress-updated", loadProgress);
    };
  }, []);

  const progressStats = getProgress(lessons.length);
  const allLessonIds = lessons.map((l) => l.id);

  const handleReset = () => {
    if (confirm("Reset learning demo progress?")) {
      resetProgress();
      loadProgress();
    }
  };

  return (
    <main className="min-h-screen bg-[#050b10] text-white">
      {/* Top Navigation */}
      <header className="flex h-16 items-center justify-between border-b border-white/10 bg-[#070c13] px-6 lg:px-10">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg p-2 text-white/40 transition hover:bg-white/5 hover:text-white"
            title="Return to Quantum Lab"
          >
            <ArrowLeft size={18} />
            <span className="hidden text-xs font-medium sm:inline">
              Quantum Lab
            </span>
          </Link>

          <div className="h-5 w-px bg-white/10" />

          <div className="flex items-center gap-2 text-sm font-semibold">
            <GraduationCap size={18} className="text-cyan-400" />
            <span>Learning Curriculum</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/challenges"
            className="flex items-center gap-1.5 rounded-xl border border-violet-400/20 bg-violet-400/10 px-3.5 py-1.5 text-xs font-semibold text-violet-300 transition hover:bg-violet-400/20 hover:text-white"
          >
            <Trophy size={14} />
            <span>Assessment Mode</span>
          </Link>

          {mounted && progressStats.completed > 0 && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/40 transition hover:bg-white/10 hover:text-white"
              title="Reset progress to start over"
            >
              <RotateCcw size={12} />
              <span className="hidden sm:inline">Reset Progress</span>
            </button>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10 lg:py-14">
        {/* Hero Section */}
        <div className="mb-10">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-cyan-400">
            <Sparkles size={15} />
            Interactive Quantum Path
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white lg:text-5xl">
            Learn quantum computing by doing.
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400 lg:text-base">
            Don't just read equations. Construct real circuits, execute real Qiskit
            simulations, inspect statevectors and Bloch spheres, and receive AI
            tutoring from Quantum Copilot.
          </p>
        </div>

        {/* Intelligent Progress Card */}
        <section className="mb-10 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.03] to-white/[0.01] p-6 shadow-lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                  Your Curriculum Progress
                </span>
                {progressStats.percentage === 100 && (
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    Mastery Achieved 🏆
                  </span>
                )}
              </div>

              <div className="mt-1 text-2xl font-bold">
                {mounted ? (
                  <span>
                    {progressStats.completed} of {lessons.length} Lessons Completed
                  </span>
                ) : (
                  <span>Loading curriculum...</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="font-mono text-2xl font-bold text-cyan-400">
                  {mounted ? `${progressStats.percentage}%` : "0%"}
                </div>
                <div className="text-[10px] text-slate-400">Completion rate</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-emerald-300 transition-all duration-700"
              style={{
                width: mounted ? `${progressStats.percentage}%` : "0%",
              }}
            />
          </div>

          {/* Sequential Guidance Subtext */}
          <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-slate-400">
            <span>
              {progressStats.percentage === 100
                ? "All quantum foundational milestones achieved! Test your skills in Assessment Mode."
                : "Follow the sequential lessons or explore any topic at your own pace."}
            </span>

            <Link
              href="/challenges"
              className="mt-2 text-cyan-400 hover:underline sm:mt-0"
            >
              View Challenge Assessment Hub →
            </Link>
          </div>
        </section>

        {/* Sequential Lessons List */}
        <div className="space-y-4">
          {lessons.map((lesson, index) => {
            const status = mounted
              ? getLessonStatus(lesson.id, completedLessons, allLessonIds)
              : "available";
            const isCompleted = status === "completed";
            const isCurrent = status === "current";

            return (
              <Link
                key={lesson.id}
                href={`/learn/${lesson.id}`}
                className="group block"
              >
                <article
                  className={`relative overflow-hidden rounded-2xl border p-5 transition-all duration-200 lg:p-6 ${
                    isCompleted
                      ? "border-emerald-400/25 bg-emerald-950/[0.07] hover:border-emerald-400/40"
                      : isCurrent
                        ? "border-cyan-400/40 bg-cyan-950/[0.12] shadow-[0_0_30px_rgba(6,182,212,0.1)] hover:border-cyan-400/60"
                        : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-start gap-4 lg:gap-5">
                    {/* Lesson Number or Check icon */}
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-sm font-bold ${
                        isCompleted
                          ? "border-emerald-400/30 bg-emerald-400/15 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                          : isCurrent
                            ? "border-cyan-400/40 bg-cyan-400/15 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                            : "border-white/10 bg-white/5 text-slate-400"
                      }`}
                    >
                      {isCompleted ? (
                        <Check size={20} className="stroke-[2.5]" />
                      ) : (
                        lesson.number
                      )}
                    </div>

                    {/* Lesson Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h2 className="text-lg font-semibold text-white group-hover:text-cyan-200">
                          {lesson.title}
                        </h2>

                        {isCompleted && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                            <CheckCircle2 size={12} />
                            Completed
                          </span>
                        )}

                        {isCurrent && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/30 bg-cyan-400/15 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-300 animate-pulse">
                            <Flame size={12} />
                            Next Up
                          </span>
                        )}

                        <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-[10px] text-slate-400">
                          {lesson.difficulty}
                        </span>
                      </div>

                      <p className="mt-1 text-xs font-medium text-cyan-400/90">
                        {lesson.subtitle}
                      </p>

                      <p className="mt-2 text-xs leading-relaxed text-slate-300 lg:text-sm">
                        {lesson.description}
                      </p>

                      <div className="mt-3.5 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock3 size={13} />
                          {lesson.duration}
                        </span>

                        <span className="font-mono text-[11px] text-slate-400">
                          Task: {lesson.task}
                        </span>
                      </div>
                    </div>

                    {/* CTA Arrow */}
                    <div className="flex shrink-0 self-center">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all ${
                          isCompleted
                            ? "border-emerald-400/20 text-emerald-400/60 group-hover:border-emerald-400/40 group-hover:text-emerald-300"
                            : isCurrent
                              ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300 group-hover:scale-105 group-hover:bg-cyan-400/20"
                              : "border-white/10 text-slate-500 group-hover:border-white/25 group-hover:text-white"
                        }`}
                      >
                        <ArrowRight size={17} />
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
