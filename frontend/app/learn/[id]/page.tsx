"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Atom,
  CheckCircle2,
  Clock3,
  FlaskConical,
  GraduationCap,
  Lightbulb,
  Play,
  Sparkles,
  Trophy,
  BookOpen,
  Compass,
  HelpCircle,
} from "lucide-react";

import { getChallengeForLesson } from "@/lib/challenges";
import { getLessonById, getNextLesson, getPreviousLesson, lessons } from "@/lib/lessons";
import { isLessonComplete, markLessonComplete } from "@/lib/progress";
import { getResourcesForLesson, getRecommendedResourceForLesson } from "@/lib/resources";
import QuizCard from "@/components/QuizCard";
import ResourceCard from "@/components/ResourceCard";

export default function LessonPage() {
  const params = useParams();
  const id = String(params.id);

  const lesson = getLessonById(id);
  const nextLesson = lesson ? getNextLesson(lesson.id) : null;
  const previousLesson = lesson ? getPreviousLesson(lesson.id) : null;
  const challenge = lesson ? getChallengeForLesson(lesson.id) : null;
  const resources = lesson ? getResourcesForLesson(lesson.id) : [];
  const recommendedResource = lesson ? getRecommendedResourceForLesson(lesson.id) : null;

  const [isCompleted, setIsCompleted] = useState(false);
  const [mounted, setMounted] = useState(false);

  const checkStatus = () => {
    if (lesson) {
      setIsCompleted(isLessonComplete(lesson.id));
    }
  };

  useEffect(() => {
    setMounted(true);
    checkStatus();

    window.addEventListener("qubitlabs-progress-updated", checkStatus);
    window.addEventListener("qubitlabs-gamification-updated", checkStatus);
    return () => {
      window.removeEventListener("qubitlabs-progress-updated", checkStatus);
      window.removeEventListener("qubitlabs-gamification-updated", checkStatus);
    };
  }, [lesson]);

  const handleManualMarkComplete = () => {
    if (lesson) {
      markLessonComplete(lesson.id);
      setIsCompleted(true);
    }
  };

  if (!lesson) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050b10] text-white">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center max-w-md">
          <Atom className="mx-auto text-cyan-400 animate-spin" size={36} />
          <h1 className="mt-4 text-xl font-bold">Lesson Not Found</h1>
          <p className="mt-2 text-xs text-slate-400">
            The requested lesson could not be located in the curriculum.
          </p>
          <Link
            href="/learn"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-xs font-semibold text-[#061016] transition hover:bg-cyan-300"
          >
            <ArrowLeft size={14} />
            Back to Curriculum
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050b10] text-white selection:bg-cyan-400 selection:text-[#050b10]">
      {/* Top Sticky Navigation */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-white/10 bg-[#070c13]/90 px-6 backdrop-blur-md lg:px-10">
        <div className="flex items-center gap-4">
          <Link
            href="/learn"
            className="flex items-center gap-2 text-sm text-white/40 transition hover:text-white"
          >
            <ArrowLeft size={17} />
            <span className="hidden sm:inline">Curriculum</span>
          </Link>

          <div className="h-5 w-px bg-white/10" />

          <div className="flex items-center gap-2">
            <span className="rounded-md border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 font-mono text-[10px] text-cyan-300">
              Lesson {lesson.number}
            </span>
            <span className="text-sm font-semibold">{lesson.title}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {mounted && isCompleted ? (
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-400">
              <CheckCircle2 size={13} />
              <span>Completed</span>
            </div>
          ) : (
            <button
              onClick={handleManualMarkComplete}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition hover:border-emerald-400/30 hover:bg-emerald-400/10 hover:text-emerald-300"
              title="Mark lesson as complete and claim XP"
            >
              <CheckCircle2 size={13} />
              <span>Mark Complete (+{lesson.xpReward} XP)</span>
            </button>
          )}

          <Link
            href={`/lab?lesson=${lesson.id}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-300 px-3.5 py-1.5 text-xs font-semibold text-[#061016] shadow-[0_0_15px_rgba(6,182,212,0.25)] transition hover:opacity-90"
          >
            <Play size={13} />
            <span>Open in Lab</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10 lg:py-14">
        {/* Lesson Hero */}
        <div className="max-w-3xl">
          <div className="mb-4 flex flex-wrap items-center gap-2.5">
            <span className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 font-mono text-xs font-semibold text-cyan-300">
              {lesson.level}
            </span>

            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Clock3 size={13} />
              {lesson.duration}
            </span>

            <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-400">
              {lesson.difficulty}
            </span>

            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/5 px-2.5 py-1 font-mono text-xs font-semibold text-cyan-300">
              +{lesson.xpReward} XP
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white lg:text-5xl">
            {lesson.title}
          </h1>

          <p className="mt-3 text-base font-medium text-cyan-400 lg:text-lg">
            {lesson.subtitle}
          </p>

          <p className="mt-5 text-sm leading-relaxed text-slate-300 lg:text-base">
            {lesson.description}
          </p>
        </div>

        {/* Section 1: Why It Matters */}
        <section className="mt-10 rounded-2xl border border-white/10 bg-[#070c14] p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
              <Compass size={20} />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                Significance & Algorithmic Context
              </div>
              <h2 className="mt-1 text-base font-semibold text-white">Why This Concept Matters</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                {lesson.whyItMatters}
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Core Quantum Principle */}
        <section className="mt-6 rounded-2xl border border-cyan-400/20 bg-gradient-to-r from-cyan-950/20 to-transparent p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
              <Lightbulb size={20} />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                Core Quantum Principle & Formula
              </div>
              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-200">
                {lesson.concept}
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Visual & Geometric Intuition */}
        <section className="mt-6 rounded-2xl border border-white/10 bg-[#070c14] p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-400/10 text-violet-300">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-400">
                Geometric & Visual Intuition
              </div>
              <h2 className="mt-1 text-base font-semibold text-white">How to Visualize It</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                {lesson.visualIntuition}
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Interactive Lab Experiment Box */}
        <section className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-[#090f18] shadow-lg">
          <div className="border-b border-white/10 bg-[#0c1422] px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
                  <FlaskConical size={18} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">
                    Interactive Lab Experiment
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Simulate this exact quantum circuit using real IBM Qiskit Aer simulation.
                  </p>
                </div>
              </div>

              <span className="hidden sm:inline-flex rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 font-mono text-xs font-semibold text-cyan-300">
                +15 XP on Run
              </span>
            </div>
          </div>

          <div className="p-6">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Lab Objective
              </div>
              <p className="mt-2 text-base font-semibold text-white">
                {lesson.task}
              </p>

              {/* Targets / Required Gates details if challenge exists */}
              {challenge && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {challenge.requiredGates.length > 0 && (
                    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400">
                        Required Gates
                      </div>
                      <div className="mt-1 font-mono text-xs font-semibold text-cyan-300">
                        {challenge.requiredGates
                          .map((r) =>
                            r.gate === "CNOT"
                              ? `CNOT (q${r.control ?? r.qubit}→q${r.target})`
                              : `${r.gate} on q${r.qubit ?? 0}`
                          )
                          .join(", ")}
                      </div>
                    </div>
                  )}

                  {challenge.targetProbabilities && (
                    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400">
                        Target Statevector Distribution
                      </div>
                      <div className="mt-1 font-mono text-xs font-semibold text-cyan-300">
                        {Object.entries(challenge.targetProbabilities)
                          .map(([state, prob]) => `|${state}⟩ ≈ ${(prob * 100).toFixed(0)}%`)
                          .join(" · ")}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link
                href={`/lab?lesson=${lesson.id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-300 px-5 py-3 text-sm font-semibold text-[#061016] shadow-[0_0_20px_rgba(6,182,212,0.25)] transition hover:opacity-90"
              >
                <Play size={16} />
                <span>Open Experiment in Quantum Lab</span>
                <ArrowRight size={15} />
              </Link>

              {challenge && (
                <Link
                  href={`/lab?challenge=${challenge.id}`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-violet-400/30 bg-violet-400/10 px-4 py-3 text-xs font-semibold text-violet-300 transition hover:bg-violet-400/20"
                >
                  <Trophy size={14} />
                  <span>Attempt Challenge: {challenge.title}</span>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Section 5: Conceptual Quiz */}
        <div className="mt-12">
          <div className="mb-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-400">
              Check Your Understanding
            </div>
            <h2 className="text-xl font-bold text-white">Conceptual Knowledge Check</h2>
            <p className="mt-1 text-xs text-slate-400">
              Verify your physical intuition. Deterministically graded with complete mathematical explanations.
            </p>
          </div>

          <QuizCard lessonId={lesson.id} />
        </div>

        {/* Section 6: Authoritative External Resources */}
        {resources.length > 0 && (
          <section className="mt-14">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                  <BookOpen size={14} />
                  <span>Curated Quantum Library</span>
                </div>
                <h2 className="mt-1 text-xl font-bold text-white">Recommended Further Reading</h2>
                <p className="mt-1 text-xs text-slate-400">
                  Authoritative references from IBM Quantum, MIT OpenCourseWare, Caltech, and leading textbooks.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {resources.map((res) => (
                <ResourceCard
                  key={res.id}
                  resource={res}
                  isRecommended={recommendedResource?.id === res.id}
                />
              ))}
            </div>
          </section>
        )}

        {/* Footer Navigation: Previous / Next */}
        <nav className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
          {previousLesson ? (
            <Link
              href={`/learn/${previousLesson.id}`}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft size={14} />
              <span>
                Previous: <strong className="text-white">{previousLesson.title}</strong>
              </span>
            </Link>
          ) : (
            <div />
          )}

          {nextLesson ? (
            <Link
              href={`/learn/${nextLesson.id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-300 px-5 py-2.5 text-xs font-semibold text-[#061016] transition hover:opacity-90"
            >
              <span>
                Next Lesson: <strong>{nextLesson.title}</strong>
              </span>
              <ArrowRight size={14} />
            </Link>
          ) : (
            <Link
              href="/challenges"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-400 to-violet-300 px-5 py-2.5 text-xs font-semibold text-[#061016] transition hover:opacity-90"
            >
              <span>Explore Assessment Hub</span>
              <Trophy size={14} />
            </Link>
          )}
        </nav>
      </div>
    </main>
  );
}
