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
  AlertTriangle,
  Binary,
  Check,
  X,
  BrainCircuit,
  Hash,
  ChevronRight,
} from "lucide-react";

import { getChallengeForLesson } from "@/lib/challenges";
import { getLessonById, getNextLesson, getPreviousLesson, lessons } from "@/lib/lessons";
import { isLessonComplete, markLessonComplete } from "@/lib/progress";
import { getResourcesForLesson, getRecommendedResourceForLesson } from "@/lib/resources";
import QuizCard from "@/components/QuizCard";
import ResourceCard from "@/components/ResourceCard";
import { UserMenu } from "@/components/UserMenu";
import { AlexiaAITutor } from "@/components/character/AlexiaAITutor";

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
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [showAlexia, setShowAlexia] = useState(false);

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

  const scrollTo = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

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
            <span className="text-sm font-semibold truncate max-w-[200px] sm:max-w-xs md:max-w-md">
              {lesson.title}
            </span>
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
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition hover:border-emerald-400/30 hover:bg-emerald-400/10 hover:text-emerald-300 cursor-pointer"
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

          <UserMenu />
        </div>
      </header>

      {/* Quick Jump Sub-Header */}
      <div className="sticky top-16 z-40 border-b border-white/5 bg-[#050b10]/95 px-6 py-2.5 backdrop-blur-md overflow-x-auto scrollbar-none">
        <div className="mx-auto max-w-5xl flex items-center gap-2 text-xs">
          <button
            onClick={() => scrollTo("overview")}
            className="px-3 py-1 rounded-lg border border-white/10 hover:border-cyan-400/30 hover:text-cyan-300 text-slate-400 transition shrink-0 cursor-pointer"
          >
            Overview
          </button>
          {lesson.realWorldAnalogy && (
            <button
              onClick={() => scrollTo("analogy")}
              className="px-3 py-1 rounded-lg border border-white/10 hover:border-cyan-400/30 hover:text-cyan-300 text-slate-400 transition shrink-0 cursor-pointer"
            >
              Real-World Analogy
            </button>
          )}
          {lesson.mathematicalFoundations && (
            <button
              onClick={() => scrollTo("math")}
              className="px-3 py-1 rounded-lg border border-white/10 hover:border-cyan-400/30 hover:text-cyan-300 text-slate-400 transition shrink-0 cursor-pointer"
            >
              Mathematical Derivation
            </button>
          )}
          {lesson.commonPitfalls && (
            <button
              onClick={() => scrollTo("pitfalls")}
              className="px-3 py-1 rounded-lg border border-white/10 hover:border-cyan-400/30 hover:text-cyan-300 text-slate-400 transition shrink-0 cursor-pointer"
            >
              Myths vs Reality
            </button>
          )}
          <button
            onClick={() => scrollTo("lab-experiment")}
            className="px-3 py-1 rounded-lg border border-white/10 hover:border-cyan-400/30 hover:text-cyan-300 text-slate-400 transition shrink-0 cursor-pointer"
          >
            Lab Recipe
          </button>
          <button
            onClick={() => scrollTo("quiz")}
            className="px-3 py-1 rounded-lg border border-white/10 hover:border-cyan-400/30 hover:text-cyan-300 text-slate-400 transition shrink-0 cursor-pointer"
          >
            Knowledge Check
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10 lg:py-14 space-y-12">
        {/* Section 0: Hero & Overview */}
        <section id="overview" className="scroll-mt-32 max-w-3xl">
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

          {/* Topic Tags */}
          {lesson.tags && lesson.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {lesson.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-white/10 bg-white/[0.02] text-[11px] font-mono text-slate-400"
                >
                  <Hash size={11} className="text-cyan-400" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Section 1: Real-World Analogy */}
        {lesson.realWorldAnalogy && (
          <section
            id="analogy"
            className="scroll-mt-32 rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.06] via-[#080d16] to-[#070b12] p-7 sm:p-9 shadow-lg relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-start gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                <Lightbulb size={24} />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-400">
                  Intuitive Mental Model
                </div>
                <h2 className="mt-1 text-xl font-bold text-white">
                  {lesson.realWorldAnalogy.title}
                </h2>
                <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-200">
                  {lesson.realWorldAnalogy.story}
                </p>
                <div className="mt-5 rounded-xl border border-amber-400/20 bg-amber-950/20 p-4 text-xs sm:text-sm font-medium text-amber-200 flex items-start gap-3">
                  <Sparkles size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Key Insight:</strong> {lesson.realWorldAnalogy.takeaway}
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Section 2: Significance & Core Principle */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Why It Matters */}
          <section className="rounded-2xl border border-white/10 bg-[#070c14] p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400 mb-2">
                <Compass size={15} />
                <span>Algorithmic Context</span>
              </div>
              <h3 className="text-base font-semibold text-white">Why This Concept Matters</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                {lesson.whyItMatters}
              </p>
            </div>
          </section>

          {/* Visual Intuition */}
          <section className="rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-950/20 to-[#070c14] p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-violet-400 mb-2">
                <Sparkles size={15} />
                <span>Geometric Perspective</span>
              </div>
              <h3 className="text-base font-semibold text-white">How to Visualize It</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                {lesson.visualIntuition}
              </p>
            </div>
          </section>
        </div>

        {/* Section 3: Mathematical Foundations */}
        {lesson.mathematicalFoundations && (
          <section
            id="math"
            className="scroll-mt-32 rounded-3xl border border-cyan-500/20 bg-[#080d16] p-7 sm:p-9 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
                <Binary size={20} />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                  Rigorous Formalism
                </div>
                <h2 className="text-xl font-bold text-white">Mathematical Foundations & Dirac Notation</h2>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 mb-6">
              {/* Dirac Notation Box */}
              <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Dirac Statevector Representation
                </div>
                <div className="font-mono text-sm font-bold text-cyan-300 bg-cyan-950/30 p-3 rounded-xl border border-cyan-500/20 overflow-x-auto">
                  {lesson.mathematicalFoundations.diracNotation}
                </div>
              </div>

              {/* Master Formula */}
              <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Normalization & Constraint Rule
                </div>
                <div className="font-mono text-sm font-bold text-emerald-300 bg-emerald-950/30 p-3 rounded-xl border border-emerald-500/20 overflow-x-auto">
                  {lesson.mathematicalFoundations.formula}
                </div>
              </div>
            </div>

            {/* Matrix Form if present */}
            {lesson.mathematicalFoundations.matrixForm && (
              <div className="mb-6 rounded-2xl border border-white/10 bg-black/40 p-5">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Unitary Matrix Operator Form
                </div>
                <div className="font-mono text-xs font-semibold text-violet-300 bg-violet-950/30 p-3 rounded-xl border border-violet-500/20 overflow-x-auto">
                  {lesson.mathematicalFoundations.matrixForm}
                </div>
              </div>
            )}

            {/* Worked Algebraic Example */}
            {lesson.mathematicalFoundations.workedExample && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3">
                  <BrainCircuit size={15} />
                  <span>Worked Calculation: {lesson.mathematicalFoundations.workedExample.title}</span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-slate-500 block mb-1 uppercase text-[10px]">Initial State / Input</span>
                    <span className="text-slate-200">{lesson.mathematicalFoundations.workedExample.input}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-slate-500 block mb-1 uppercase text-[10px]">Transformation Step</span>
                    <span className="text-cyan-300 whitespace-pre-wrap">{lesson.mathematicalFoundations.workedExample.operation}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/20 bg-emerald-950/10">
                    <span className="text-emerald-500 block mb-1 uppercase text-[10px]">Calculated Output</span>
                    <span className="text-emerald-300 font-bold">{lesson.mathematicalFoundations.workedExample.output}</span>
                  </div>
                </div>

                <p className="mt-4 text-xs leading-relaxed text-slate-300">
                  {lesson.mathematicalFoundations.workedExample.explanation}
                </p>
              </div>
            )}
          </section>
        )}

        {/* Section 4: Common Pitfalls & Misconceptions */}
        {lesson.commonPitfalls && lesson.commonPitfalls.length > 0 && (
          <section id="pitfalls" className="scroll-mt-32">
            <div className="mb-6">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-rose-400 mb-1">
                <AlertTriangle size={15} />
                <span>Avoid Common Traps</span>
              </div>
              <h2 className="text-xl font-bold text-white">Myths vs Quantum Reality</h2>
              <p className="text-xs text-slate-400 mt-1">
                Critical conceptual pitfalls that frequently confuse new students and researchers.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {lesson.commonPitfalls.map((pitfall, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-white/10 bg-[#070c14] p-6 flex flex-col justify-between"
                >
                  <div>
                    {/* Misconception */}
                    <div className="flex items-start gap-3 text-rose-400 mb-3">
                      <div className="rounded-lg bg-rose-500/10 p-1.5 shrink-0 mt-0.5 border border-rose-500/20">
                        <X size={14} />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400/80">
                          Common Misconception
                        </div>
                        <div className="text-sm font-semibold text-rose-200 mt-0.5">
                          &ldquo;{pitfall.misconception}&rdquo;
                        </div>
                      </div>
                    </div>

                    <div className="h-px bg-white/5 my-4" />

                    {/* Reality */}
                    <div className="flex items-start gap-3 text-emerald-400">
                      <div className="rounded-lg bg-emerald-500/10 p-1.5 shrink-0 mt-0.5 border border-emerald-500/20">
                        <Check size={14} />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/80">
                          Physical Reality
                        </div>
                        <div className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-0.5">
                          {pitfall.reality}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 5: Key Takeaways Cheatsheet */}
        {lesson.keyTakeaways && lesson.keyTakeaways.length > 0 && (
          <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400 mb-2">
              Summary Cheatsheet
            </div>
            <h3 className="text-base font-bold text-white mb-4">Essential Key Takeaways</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
              {lesson.keyTakeaways.map((takeaway, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0 mt-2" />
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Section 6: Interactive Lab Experiment Box */}
        <section id="lab-experiment" className="scroll-mt-32 overflow-hidden rounded-3xl border border-white/10 bg-[#080d16] shadow-xl">
          <div className="border-b border-white/10 bg-[#0c1422] px-7 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
                  <FlaskConical size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Interactive Lab Recipe & Experiment
                  </h2>
                  <p className="text-xs text-slate-400">
                    Simulate this exact quantum circuit using real IBM Qiskit Aer simulation.
                  </p>
                </div>
              </div>

              <span className="hidden sm:inline-flex rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 font-mono text-xs font-semibold text-cyan-300">
                +15 XP on Run
              </span>
            </div>
          </div>

          <div className="p-7 sm:p-9 space-y-6">
            {lesson.circuitGuide && (
              <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
                <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-2">
                  Simulation Recipe
                </div>
                <p className="text-sm font-medium text-slate-200 mb-4">
                  {lesson.circuitGuide.setup}
                </p>

                <div className="space-y-2 mb-5">
                  {lesson.circuitGuide.stepByStep.map((step, sIdx) => (
                    <div key={sIdx} className="flex items-start gap-3 text-xs text-slate-300 font-mono">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                        {sIdx + 1}
                      </span>
                      <span className="mt-0.5">{step}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3.5 rounded-xl border border-cyan-500/20 bg-cyan-950/20 text-xs font-medium text-cyan-200 flex items-center gap-2">
                  <Sparkles size={14} className="text-cyan-400 shrink-0" />
                  <span><strong>Expected Outcome:</strong> {lesson.circuitGuide.expectedOutcome}</span>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={`/lab?lesson=${lesson.id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-300 px-6 py-3 text-sm font-semibold text-[#061016] shadow-[0_0_25px_rgba(6,182,212,0.3)] transition hover:opacity-90"
              >
                <Play size={16} />
                <span>Open Experiment in Quantum Lab</span>
                <ArrowRight size={15} />
              </Link>

              {challenge && (
                <Link
                  href={`/lab?challenge=${challenge.id}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-violet-400/30 bg-violet-400/10 px-5 py-3 text-xs font-semibold text-violet-300 transition hover:bg-violet-400/20"
                >
                  <Trophy size={15} />
                  <span>Attempt Challenge: {challenge.title}</span>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Section 7: Conceptual Knowledge Check (Quiz) */}
        <section id="quiz" className="scroll-mt-32">
          <div className="mb-6">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-400">
              Active Recall
            </div>
            <h2 className="text-2xl font-bold text-white">Conceptual Knowledge Check</h2>
            <p className="mt-1 text-xs text-slate-400">
              Verify your physical intuition and mathematical mastery. Graded with step-by-step explanations.
            </p>
          </div>

          <QuizCard lessonId={lesson.id} />
        </section>

        {/* Section 8: External Quantum Resources */}
        {resources.length > 0 && (
          <section className="pt-4 border-t border-white/10">
            <div className="mb-6">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                <BookOpen size={14} />
                <span>Curated Quantum Library</span>
              </div>
              <h2 className="mt-1 text-xl font-bold text-white">Recommended Further Reading</h2>
              <p className="mt-1 text-xs text-slate-400">
                Authoritative references from IBM Quantum, MIT OpenCourseWare, Caltech, and leading quantum textbooks.
              </p>
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

        {/* Footer Navigation */}
        <nav className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-8">
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
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-300 px-6 py-2.5 text-xs font-semibold text-[#061016] transition hover:opacity-90 shadow-sm"
            >
              <span>
                Next Lesson: <strong>{nextLesson.title}</strong>
              </span>
              <ArrowRight size={14} />
            </Link>
          ) : (
            <Link
              href="/challenges"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-400 to-violet-300 px-6 py-2.5 text-xs font-semibold text-[#061016] transition hover:opacity-90"
            >
              <span>Explore Assessment Hub</span>
              <Trophy size={14} />
            </Link>
          )}
        </nav>
      </div>

      {/* Floating Alexia AI Tutor Drawer / Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        {showAlexia ? (
          <div className="w-[330px] sm:w-[370px] rounded-3xl border border-cyan-400/40 bg-[#070e1a]/95 p-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.85)] backdrop-blur-xl">
            <AlexiaAITutor
              currentLessonTitle={lesson.title}
              currentLessonId={lesson.id}
              isDocked={false}
              onDockToggle={() => setShowAlexia(false)}
            />
          </div>
        ) : (
          <button
            onClick={() => setShowAlexia(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-cyan-400/40 bg-[#070d18]/90 text-xs font-semibold text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:scale-105 hover:bg-cyan-950/60 transition cursor-pointer backdrop-blur-md"
            title="Ask Alexia AI Tutor about this lesson"
          >
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Ask Alexia Tutor</span>
            <Sparkles size={14} className="text-cyan-400" />
          </button>
        )}
      </div>
    </main>
  );
}
