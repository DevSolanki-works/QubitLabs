"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Atom,
  CheckCircle2,
  Clock3,
  Flame,
  GraduationCap,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  GitBranch,
  LayoutGrid,
} from "lucide-react";

import { lessons } from "@/lib/lessons";
import {
  getCompletedLessons,
  getProgress,
  resetProgress,
} from "@/lib/progress";
import { getGamificationState, getCurrentRank } from "@/lib/gamification";
import LearningPathTree from "@/components/LearningPathTree";

export default function LearnPage() {
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [gamificationState, setGamificationState] = useState(getGamificationState());
  const [viewMode, setViewMode] = useState<"tree" | "grid">("tree");
  const [mounted, setMounted] = useState(false);

  const loadData = () => {
    setCompletedLessons(getCompletedLessons());
    setGamificationState(getGamificationState());
  };

  useEffect(() => {
    setMounted(true);
    loadData();

    window.addEventListener("qubitlabs-progress-updated", loadData);
    window.addEventListener("qubitlabs-gamification-updated", loadData);
    return () => {
      window.removeEventListener("qubitlabs-progress-updated", loadData);
      window.removeEventListener("qubitlabs-gamification-updated", loadData);
    };
  }, []);

  const progressStats = getProgress(lessons.length);
  const rankInfo = getCurrentRank(gamificationState.xp);

  // Determine current active lesson
  const activeLesson =
    lessons.find((l) => !completedLessons.includes(l.id)) || lessons[0];

  const handleReset = () => {
    if (confirm("Reset learning progress and clear local progress state?")) {
      resetProgress();
      loadData();
    }
  };

  return (
    <main className="min-h-screen bg-[#050b10] text-white selection:bg-cyan-400 selection:text-[#050b10]">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-white/10 bg-[#070c13]/90 px-6 backdrop-blur-md lg:px-12">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg p-2 text-white/40 transition hover:bg-white/5 hover:text-white"
            title="Return to Landing"
          >
            <ArrowLeft size={18} />
            <span className="hidden text-xs font-medium sm:inline">Home</span>
          </Link>

          <div className="h-5 w-px bg-white/10" />

          <div className="flex items-center gap-2 text-sm font-semibold">
            <GraduationCap size={18} className="text-cyan-400" />
            <span>Learning Curriculum</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Live Rank & XP Pill */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs transition hover:border-cyan-400/40"
            title="View full rank & achievements on Dashboard"
          >
            <Sparkles size={13} className="text-cyan-300" />
            <span className="font-semibold text-white">{rankInfo.rank.name}</span>
            <span className="font-mono text-[11px] text-cyan-300">
              {gamificationState.xp} XP
            </span>
          </Link>

          {/* Streak Badge */}
          {gamificationState.streak.currentStreak > 0 && (
            <div
              className="flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 font-mono text-xs font-bold text-amber-300"
              title={`${gamificationState.streak.currentStreak} day learning streak`}
            >
              <Flame size={14} className="fill-amber-400 text-amber-400" />
              <span>{gamificationState.streak.currentStreak}d</span>
            </div>
          )}

          <Link
            href="/challenges"
            className="hidden sm:flex items-center gap-1.5 rounded-xl border border-violet-400/20 bg-violet-400/10 px-3.5 py-1.5 text-xs font-semibold text-violet-300 transition hover:bg-violet-400/20 hover:text-white"
          >
            <Trophy size={14} />
            <span>Challenges Hub</span>
          </Link>

          {mounted && progressStats.completed > 0 && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/40 transition hover:bg-white/10 hover:text-white"
              title="Reset progress to start over"
            >
              <RotateCcw size={12} />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10 lg:py-14">
        {/* Hero Section */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
              <Sparkles size={14} />
              <span>Comprehensive 4-Level Curriculum</span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white lg:text-4xl">
              Quantum Computing Learning Path
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400 leading-relaxed">
              Step through physical principles, explore 3D statevectors in Quantum Lab, test conceptual understanding with deterministic quizzes, and master quantum algorithms.
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1.5 self-start rounded-xl border border-white/10 bg-[#070c14] p-1">
            <button
              type="button"
              onClick={() => setViewMode("tree")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                viewMode === "tree"
                  ? "bg-cyan-400/15 text-cyan-300 border border-cyan-400/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <GitBranch size={13} />
              <span>Progression Tree</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                viewMode === "grid"
                  ? "bg-cyan-400/15 text-cyan-300 border border-cyan-400/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <LayoutGrid size={13} />
              <span>All Lessons</span>
            </button>
          </div>
        </div>

        {/* Global Progress Overview Banner */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-gradient-to-r from-cyan-950/20 via-[#070c14] to-[#070c14] p-6 shadow-lg">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Curriculum Coherence</span>
                <span className="rounded-md border border-cyan-400/25 bg-cyan-400/10 px-2 py-0.5 font-mono text-[10px] font-bold text-cyan-300">
                  {progressStats.percentage}% Complete
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                {progressStats.completed} of {progressStats.total} modules mastered across 4 levels.
              </p>
            </div>

            {activeLesson && (
              <Link
                href={`/learn/${activeLesson.id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-300 px-4 py-2.5 text-xs font-semibold text-[#061016] shadow-[0_0_15px_rgba(6,182,212,0.25)] transition hover:opacity-90"
              >
                <span>Continue: {activeLesson.title}</span>
                <ArrowRight size={13} />
              </Link>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 transition-all duration-700"
              style={{ width: `${Math.max(progressStats.percentage, 4)}%` }}
            />
          </div>
        </div>

        {/* Learning Path Presentation */}
        <div className="mt-12">
          {viewMode === "tree" ? (
            <LearningPathTree
              completedLessons={completedLessons}
              activeLessonId={activeLesson?.id}
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {lessons.map((lesson) => {
                const isCompleted = completedLessons.includes(lesson.id);
                const isCurrent = activeLesson?.id === lesson.id;

                return (
                  <Link
                    key={lesson.id}
                    href={`/learn/${lesson.id}`}
                    className={`group relative flex flex-col justify-between rounded-2xl border p-5 transition ${
                      isCompleted
                        ? "border-emerald-500/30 bg-gradient-to-br from-emerald-950/15 via-[#070c14] to-[#070c14]"
                        : isCurrent
                        ? "border-cyan-400/60 bg-gradient-to-br from-cyan-950/20 via-[#070c14] to-[#070c14] shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                        : "border-white/10 bg-[#070c14] hover:border-cyan-400/30"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-semibold text-slate-400">
                          #{String(lesson.number).padStart(2, "0")} · {lesson.level.split(":")[0]}
                        </span>
                        {isCompleted && <CheckCircle2 size={16} className="text-emerald-400" />}
                        {isCurrent && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-400/15 text-cyan-300 animate-pulse">
                            <Play size={10} className="fill-cyan-300" />
                          </span>
                        )}
                      </div>

                      <h3 className="mt-3 text-base font-bold text-white group-hover:text-cyan-200 transition">
                        {lesson.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                        {lesson.subtitle}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock3 size={12} />
                        {lesson.duration}
                      </span>
                      <span className="font-mono font-semibold text-cyan-300">
                        +{lesson.xpReward} XP
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
