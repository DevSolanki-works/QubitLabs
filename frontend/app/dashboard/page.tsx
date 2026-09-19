"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Atom,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Cpu,
  Eye,
  Flame,
  FlaskConical,
  GraduationCap,
  Play,
  RotateCcw,
  Search,
  Share2,
  Sparkles,
  Trophy,
  Zap,
  Bot,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { UserMenu } from "@/components/UserMenu";
import { lessons } from "@/lib/lessons";
import { challenges } from "@/lib/challenges";
import { getCompletedLessons, getProgress, resetProgress } from "@/lib/progress";
import {
  getGamificationState,
  getCurrentRank,
  ACHIEVEMENTS,
  Achievement,
} from "@/lib/gamification";

export default function DashboardPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#050b10] text-white">
          <div className="flex items-center gap-3 text-cyan-300">
            <Atom className="animate-spin" size={24} />
            <span className="text-sm">Loading Quantum Dashboard...</span>
          </div>
        </div>
      }
    >
      <DashboardPage />
    </Suspense>
  );
}

function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile } = useAuth();

  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [gamificationState, setGamificationState] = useState(getGamificationState());
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

  // Quizzes completed count
  const passedQuizzesCount = Object.values(gamificationState.quizzes).filter(
    (q) => q.passed
  ).length;

  // Adaptive recommendation logic
  const getAdaptiveRecommendation = () => {
    // 1. Check if there's an uncompleted quiz for a completed lesson
    for (const lesson of lessons) {
      if (completedLessons.includes(lesson.id)) {
        const quizStatus = gamificationState.quizzes[lesson.id];
        if (!quizStatus || !quizStatus.passed) {
          return {
            title: `Take Conceptual Quiz: ${lesson.title}`,
            subtitle: "Verify your understanding of statevectors and Born's rule",
            tag: "Knowledge Check",
            href: `/learn/${lesson.id}`,
            cta: "Take Quiz",
            xp: 25,
          };
        }
      }
    }

    // 2. Next uncompleted lesson
    const nextUncompleted = lessons.find((l) => !completedLessons.includes(l.id));
    if (nextUncompleted) {
      return {
        title: `Start Module: ${nextUncompleted.title}`,
        subtitle: nextUncompleted.subtitle,
        tag: "Next Curriculum Step",
        href: `/learn/${nextUncompleted.id}`,
        cta: "Begin Lesson",
        xp: nextUncompleted.xpReward,
      };
    }

    // 3. Fallback to challenges or lab
    return {
      title: "Master Algorithmic Challenges",
      subtitle: "Test your skills against the quantum simulator evaluation suite",
      tag: "Assessment Hub",
      href: "/challenges",
      cta: "View Challenges",
      xp: 120,
    };
  };

  const recommendation = getAdaptiveRecommendation();

  const handleReset = () => {
    if (confirm("Reset learning and gamification progress?")) {
      resetProgress();
      loadData();
    }
  };

  return (
    <main className="min-h-screen bg-[#050b10] text-white selection:bg-cyan-400 selection:text-[#050b10]">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-white/10 bg-[#070c13]/90 px-6 backdrop-blur-md lg:px-12">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
          >
            <Atom size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-white">QubitLabs</span>
              <span className="rounded-md border border-cyan-400/20 bg-cyan-400/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-cyan-300">
                Dashboard
              </span>
            </div>
            <span className="hidden text-[10px] text-white/40 sm:inline">
              Quantum Learning & Progress Overview
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/learn"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.025] px-3.5 py-1.5 text-xs text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            <GraduationCap size={14} className="text-cyan-400" />
            <span>Curriculum</span>
          </Link>

          <Link
            href="/challenges"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.025] px-3.5 py-1.5 text-xs text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            <Trophy size={14} className="text-violet-400" />
            <span>Challenges</span>
          </Link>

          <Link
            href="/lab"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-300 px-4 py-1.5 text-xs font-semibold text-[#061016] shadow-[0_0_15px_rgba(6,182,212,0.25)] transition hover:opacity-90"
          >
            <FlaskConical size={14} />
            <span>Quantum Lab</span>
          </Link>

          <UserMenu />

          {mounted && progressStats.completed > 0 && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/40 transition hover:bg-white/10 hover:text-white"
              title="Reset progress"
            >
              <RotateCcw size={12} />
            </button>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10 lg:py-14">
        {/* Guest mode warning if unauthenticated */}
        {!user && mounted && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan-400/20 bg-cyan-950/20 p-4 text-xs backdrop-blur-md">
            <div className="flex items-center gap-2.5 text-cyan-200">
              <Sparkles size={16} className="text-cyan-400 shrink-0" />
              <span>
                You are currently exploring as a guest. Sign in or create an account to permanently sync your progress and XP across devices.
              </span>
            </div>
            <Link
              href="/auth/login"
              className="px-3.5 py-1 rounded-lg bg-cyan-400 text-black font-semibold hover:bg-cyan-300 transition"
            >
              Sign In
            </Link>
          </div>
        )}

        {/* Top Section: Rank Banner & Streak */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Rank Card */}
          <div className="rounded-3xl border border-cyan-400/25 bg-gradient-to-br from-cyan-950/20 via-[#070c14] to-[#070c14] p-7 shadow-[0_0_30px_rgba(6,182,212,0.08)] lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/40 bg-cyan-400/10 font-mono text-xl font-extrabold text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                  {rankInfo.rank.badge}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                      Tier {rankInfo.rank.tier} Quantum Rank
                    </span>
                    {user && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        · {profile?.displayName || user.email?.split("@")[0]}
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-white lg:text-3xl">
                    {rankInfo.rank.name}
                  </h2>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-slate-400">
                  Total Experience
                </div>
                <div className="font-mono text-2xl font-extrabold text-cyan-300">
                  {gamificationState.xp.toLocaleString()} <span className="text-xs font-medium text-slate-400">XP</span>
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-slate-300">
              {rankInfo.rank.description}
            </p>

            {/* Level Progress Bar */}
            <div className="mt-6 border-t border-white/10 pt-5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  {rankInfo.nextRank
                    ? `Next: ${rankInfo.nextRank.name}`
                    : "Maximum Quantum Rank Achieved"}
                </span>
                <span className="font-mono font-semibold text-cyan-300">
                  {rankInfo.nextRank
                    ? `${rankInfo.currentLevelXP} / ${rankInfo.nextLevelXP} XP (${rankInfo.progressPercent}%)`
                    : `${gamificationState.xp} XP`}
                </span>
              </div>

              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 transition-all duration-700"
                  style={{ width: `${Math.max(rankInfo.progressPercent, 5)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Streak & Consistency Card */}
          <div className="flex flex-col justify-between rounded-3xl border border-white/10 bg-[#070c14] p-7 shadow-lg">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">
                  Learning Consistency
                </span>
                <Flame size={18} className="fill-amber-400 text-amber-400" />
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-mono text-4xl font-extrabold text-white">
                  {gamificationState.streak.currentStreak}
                </span>
                <span className="text-sm font-semibold text-amber-300">Day Streak</span>
              </div>

              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Log in daily and run quantum circuits to prevent quantum decoherence.
              </p>
            </div>

            <div className="mt-6 border-t border-white/10 pt-4 text-[11px] text-slate-400">
              <div className="flex items-center justify-between">
                <span>Longest Coherent Streak:</span>
                <span className="font-mono font-semibold text-white">
                  {gamificationState.streak.longestStreak} days
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span>Total Simulations Run:</span>
                <span className="font-mono font-semibold text-cyan-300">
                  {gamificationState.simulationCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Metric Counter Grid */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-[#070c14] p-5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs">Lessons</span>
              <GraduationCap size={16} className="text-cyan-400" />
            </div>
            <div className="mt-2 font-mono text-2xl font-bold text-white">
              {progressStats.completed} <span className="text-xs font-normal text-slate-500">/ {lessons.length}</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              {progressStats.percentage}% complete
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#070c14] p-5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs">Quizzes</span>
              <Award size={16} className="text-violet-400" />
            </div>
            <div className="mt-2 font-mono text-2xl font-bold text-white">
              {passedQuizzesCount} <span className="text-xs font-normal text-slate-500">/ {lessons.length}</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              Conceptual checks passed
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#070c14] p-5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs">Challenges</span>
              <Trophy size={16} className="text-amber-400" />
            </div>
            <div className="mt-2 font-mono text-2xl font-bold text-white">
              {completedLessons.length > 0 ? Math.min(completedLessons.length, challenges.length) : 0}{" "}
              <span className="text-xs font-normal text-slate-500">/ {challenges.length}</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              Simulator validated
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#070c14] p-5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs">Achievements</span>
              <Sparkles size={16} className="text-emerald-400" />
            </div>
            <div className="mt-2 font-mono text-2xl font-bold text-white">
              {gamificationState.unlockedAchievements.length}{" "}
              <span className="text-xs font-normal text-slate-500">/ {ACHIEVEMENTS.length}</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              Technical badges
            </div>
          </div>
        </div>

        {/* Adaptive Recommended Next Step Banner */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-cyan-400/30 bg-gradient-to-r from-cyan-950/20 via-[#070c14] to-[#070c14] p-6 shadow-lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md border border-cyan-400/25 bg-cyan-400/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-cyan-300">
                  {recommendation.tag}
                </span>
                <span className="text-xs font-semibold text-cyan-400">+{recommendation.xp} XP</span>
              </div>
              <h3 className="mt-2 text-lg font-bold text-white">
                {recommendation.title}
              </h3>
              <p className="mt-1 text-xs text-slate-300">
                {recommendation.subtitle}
              </p>
            </div>

            <Link
              href={recommendation.href}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-300 px-5 py-3 text-xs font-semibold text-[#061016] shadow-[0_0_15px_rgba(6,182,212,0.25)] transition hover:opacity-90"
            >
              <span>{recommendation.cta}</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Achievements Showcase Section */}
        <div className="mt-14">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                Verifiable Milestones
              </div>
              <h2 className="mt-1 text-xl font-bold text-white">Quantum Achievements</h2>
              <p className="mt-1 text-xs text-slate-400">
                Unlock achievements by completing lessons, scoring perfect quizzes, and simulating circuits.
              </p>
            </div>

            <span className="font-mono text-xs text-slate-400">
              {gamificationState.unlockedAchievements.length} Unlocked
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ACHIEVEMENTS.map((achievement) => {
              const isUnlocked = gamificationState.unlockedAchievements.some(
                (a) => a.id === achievement.id
              );

              return (
                <div
                  key={achievement.id}
                  className={`flex flex-col justify-between rounded-2xl border p-5 transition ${
                    isUnlocked
                      ? "border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 via-[#070c14] to-[#070c14] shadow-[0_0_20px_rgba(16,185,129,0.06)]"
                      : "border-white/5 bg-white/[0.015] opacity-60"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span
                        className={`rounded-md border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${
                          isUnlocked
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 font-semibold"
                            : "border-white/10 bg-white/5 text-slate-500"
                        }`}
                      >
                        {achievement.category}
                      </span>

                      <span className="font-mono text-xs font-bold text-cyan-300">
                        +{achievement.xpReward} XP
                      </span>
                    </div>

                    <h4 className="mt-3 text-sm font-bold text-white">
                      {achievement.title}
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">
                      {achievement.description}
                    </p>
                  </div>

                  <div className="mt-4 border-t border-white/5 pt-3 text-[10px]">
                    {isUnlocked ? (
                      <span className="flex items-center gap-1 font-semibold text-emerald-400">
                        <CheckCircle2 size={12} />
                        <span>Unlocked</span>
                      </span>
                    ) : (
                      <span className="text-slate-500">Locked</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
