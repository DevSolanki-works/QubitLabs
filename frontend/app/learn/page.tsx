"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  GitBranch,
  LayoutGrid,
  Bot,
} from "lucide-react";

import { UserMenu } from "@/components/UserMenu";
import { lessons } from "@/lib/lessons";
import {
  getCompletedLessons,
  getProgress,
  resetProgress,
} from "@/lib/progress";
import { getGamificationState, getCurrentRank } from "@/lib/gamification";
import LearningPathTree from "@/components/LearningPathTree";
import { AlexiaAITutor } from "@/components/character/AlexiaAITutor";

export default function LearnPage() {
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [gamificationState, setGamificationState] = useState(getGamificationState());
  const [viewMode, setViewMode] = useState<"cards" | "tree">("cards");
  const [isDocked, setIsDocked] = useState(true);
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
      {/* Top Header Navigation matching reference image */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-white/10 bg-[#070c13]/90 px-6 backdrop-blur-md lg:px-12">
        <div className="flex items-center gap-4">
          <Link
            href="/lab"
            className="flex items-center gap-2 rounded-lg p-2 text-white/50 transition hover:bg-white/5 hover:text-white text-xs font-medium"
            title="Go to Quantum Lab"
          >
            <ArrowLeft size={16} />
            <span>Quantum Lab</span>
          </Link>

          <div className="h-5 w-px bg-white/10" />

          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <GraduationCap size={18} className="text-cyan-400" />
            <span>Learning Curriculum</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Assessment Mode Button */}
          <Link
            href="/challenges"
            className="flex items-center gap-1.5 rounded-xl border border-violet-400/30 bg-violet-400/10 px-3.5 py-1.5 text-xs font-semibold text-violet-300 transition hover:bg-violet-400/20 hover:text-white"
          >
            <Trophy size={14} />
            <span>Assessment Mode</span>
          </Link>

          {/* Reset Progress Button */}
          {mounted && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/40 transition hover:bg-white/10 hover:text-white cursor-pointer"
              title="Reset progress to start over"
            >
              <RotateCcw size={12} />
              <span className="hidden sm:inline">Reset Progress</span>
            </button>
          )}

          <UserMenu />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 lg:py-12 space-y-8">
        {/* Hero Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
            <Sparkles size={14} />
            <span>INTERACTIVE QUANTUM PATH</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Learn quantum computing by doing.
          </h1>
          <p className="max-w-3xl text-sm text-slate-400 leading-relaxed">
            Don&apos;t just read equations. Construct real circuits, execute real Qiskit simulations, inspect statevectors and Bloch spheres, and receive AI tutoring from Quantum Copilot.
          </p>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Alexia AI Tutor (Docked) */}
          {isDocked && (
            <div className="lg:col-span-4 xl:col-span-4 sticky top-24">
              <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-b from-[#070e1a]/90 via-[#070c14]/90 to-[#050910]/95 p-4 shadow-[0_4px_30px_rgba(0,0,0,0.5)] backdrop-blur-md">
                <AlexiaAITutor
                  currentLessonTitle={activeLesson?.title || "Quantum Foundations"}
                  currentLessonId={activeLesson?.id}
                  isDocked={isDocked}
                  onDockToggle={() => setIsDocked(false)}
                />
              </div>
            </div>
          )}

          {/* Right Column: Curriculum Progress & Lessons */}
          <div className={`${isDocked ? "lg:col-span-8 xl:col-span-8" : "lg:col-span-12"} space-y-6`}>
            {/* Curriculum Progress Overview Card */}
            <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-[#071322]/80 via-[#070d17]/90 to-[#070c14]/90 p-6 shadow-[0_4px_25px_rgba(0,240,255,0.06)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-[0.15em] text-cyan-400 uppercase">
                    YOUR CURRICULUM PROGRESS
                  </span>
                  <h2 className="mt-1 text-2xl font-extrabold text-white">
                    {progressStats.completed} of {progressStats.total} Lessons Completed
                  </h2>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-2xl font-black font-mono text-cyan-300">
                    {progressStats.percentage}%
                  </span>
                  <p className="text-[11px] text-slate-400 uppercase font-mono tracking-wider">
                    Completion rate
                  </p>
                </div>
              </div>

              {/* Glowing Progress Bar */}
              <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-white/5 border border-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 shadow-[0_0_12px_rgba(0,240,255,0.5)] transition-all duration-700"
                  style={{ width: `${Math.max(progressStats.percentage, 4)}%` }}
                />
              </div>

              <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400 border-t border-white/5 pt-3">
                <span>Follow the sequential lessons or explore any topic at your own pace.</span>
                <Link
                  href="/challenges"
                  className="inline-flex items-center gap-1.5 font-semibold text-cyan-400 hover:text-cyan-300 transition"
                >
                  <span>View Challenge Assessment Hub</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* View Mode Controls & Re-dock button if undocked */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {!isDocked && (
                  <button
                    onClick={() => setIsDocked(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyan-400/40 bg-cyan-950/40 text-xs font-mono text-cyan-300 hover:bg-cyan-500/20 transition cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.2)]"
                  >
                    <Bot size={13} />
                    <span>● Dock Alexia</span>
                  </button>
                )}
              </div>

              {/* View Switcher: Cards vs Progression Tree */}
              <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#070c14] p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("cards")}
                  className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                    viewMode === "cards"
                      ? "bg-cyan-400/15 text-cyan-300 border border-cyan-400/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <LayoutGrid size={13} />
                  <span>Curriculum Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("tree")}
                  className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                    viewMode === "tree"
                      ? "bg-cyan-400/15 text-cyan-300 border border-cyan-400/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <GitBranch size={13} />
                  <span>Progression Tree</span>
                </button>
              </div>
            </div>

            {/* Lesson Presentation */}
            {viewMode === "tree" ? (
              <LearningPathTree
                completedLessons={completedLessons}
                activeLessonId={activeLesson?.id}
              />
            ) : (
              <div className="space-y-4">
                {lessons.map((lesson) => {
                  const isCompleted = completedLessons.includes(lesson.id);
                  const isCurrent = activeLesson?.id === lesson.id;

                  return (
                    <div
                      key={lesson.id}
                      className={`rounded-2xl border transition-all p-5 sm:p-6 shadow-md relative group ${
                        isCompleted
                          ? "border-emerald-500/30 bg-gradient-to-br from-emerald-950/15 via-[#070d17] to-[#070c14]"
                          : isCurrent
                          ? "border-cyan-400/50 bg-gradient-to-br from-cyan-950/25 via-[#070d17] to-[#070c14] shadow-[0_0_20px_rgba(0,240,255,0.08)]"
                          : "border-cyan-900/20 bg-[#070d18]/80 hover:border-cyan-400/40 hover:bg-[#091120]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          {/* Left Status Indicator Circle */}
                          <div
                            className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition ${
                              isCompleted
                                ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-300"
                                : isCurrent
                                ? "border-cyan-400/60 bg-cyan-400/20 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.4)] animate-pulse"
                                : "border-white/10 bg-white/5 text-slate-400"
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 size={18} className="text-emerald-400" />
                            ) : isCurrent ? (
                              <Play size={13} className="fill-cyan-300 text-cyan-300" />
                            ) : (
                              <span className="font-mono text-xs text-slate-400">
                                {lesson.number}
                              </span>
                            )}
                          </div>

                          {/* Content */}
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-bold text-white group-hover:text-cyan-200 transition">
                                {lesson.title}
                              </h3>

                              {isCompleted && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                                  Completed
                                </span>
                              )}

                              {isCurrent && !isCompleted && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/40 bg-cyan-400/15 px-2.5 py-0.5 text-[10px] font-semibold text-cyan-300 animate-pulse">
                                  Next Up
                                </span>
                              )}

                              <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[10px] text-slate-400">
                                {lesson.difficulty}
                              </span>
                            </div>

                            <p className="text-xs font-semibold text-cyan-400/95">
                              {lesson.subtitle}
                            </p>

                            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                              {lesson.description}
                            </p>

                            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2 border-t border-white/5">
                              <span className="flex items-center gap-1 font-mono text-[11px]">
                                <Clock3 size={13} className="text-slate-500" />
                                {lesson.duration}
                              </span>
                              {lesson.task && (
                                <span className="text-[11px] text-slate-400 line-clamp-1">
                                  <span className="text-slate-500 font-semibold">Task: </span>
                                  {lesson.task}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right Circular Arrow Button */}
                        <Link
                          href={`/learn/${lesson.id}`}
                          className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-950/30 text-cyan-300 group-hover:bg-cyan-400 group-hover:text-[#070c14] group-hover:border-cyan-300 transition-all shadow-[0_0_12px_rgba(0,240,255,0.15)]"
                          title={`Start ${lesson.title}`}
                        >
                          <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Undocked Alexia Widget (When Undocked) */}
      {!isDocked && (
        <div className="fixed bottom-6 left-6 z-50 w-80 rounded-3xl border border-cyan-400/40 bg-[#070e1a]/95 p-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.7)] backdrop-blur-xl">
          <AlexiaAITutor
            currentLessonTitle={activeLesson?.title || "Quantum Foundations"}
            currentLessonId={activeLesson?.id}
            isDocked={false}
            onDockToggle={() => setIsDocked(true)}
          />
        </div>
      )}
    </main>
  );
}
