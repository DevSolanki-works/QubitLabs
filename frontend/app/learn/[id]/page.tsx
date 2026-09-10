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
} from "lucide-react";

import { getChallengeForLesson } from "@/lib/challenges";
import { getLessonById, getNextLesson, lessons } from "@/lib/lessons";
import { isLessonComplete } from "@/lib/progress";

export default function LessonPage() {
  const params = useParams();
  const id = String(params.id);

  const lesson = getLessonById(id);
  const nextLesson = lesson ? getNextLesson(lesson.id) : null;
  const challenge = lesson ? getChallengeForLesson(lesson.id) : null;

  const [isCompleted, setIsCompleted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (lesson) {
      setIsCompleted(isLessonComplete(lesson.id));
    }
  }, [lesson]);

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
    <main className="min-h-screen bg-[#050b10] text-white">
      {/* Navigation Header */}
      <header className="flex h-16 items-center justify-between border-b border-white/10 bg-[#070c13] px-6 lg:px-10">
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
          {mounted && isCompleted && (
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-400">
              <CheckCircle2 size={13} />
              <span>Completed</span>
            </div>
          )}

          <Link
            href={`/lab?lesson=${lesson.id}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-400 px-3.5 py-1.5 text-xs font-semibold text-[#061016] transition hover:bg-cyan-300"
          >
            <Play size={13} />
            <span>Open Experiment</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10 lg:py-14">
        {/* Lesson Hero */}
        <div className="max-w-3xl">
          <div className="mb-4 flex flex-wrap items-center gap-2.5">
            <span className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 font-mono text-xs font-semibold text-cyan-300">
              Lesson {lesson.number} of {lessons.length}
            </span>

            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Clock3 size={13} />
              {lesson.duration}
            </span>

            <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-400">
              {lesson.difficulty}
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

        {/* Core Concept Callout */}
        <section className="mt-8 rounded-2xl border border-cyan-400/20 bg-gradient-to-r from-cyan-950/20 to-transparent p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
              <Lightbulb size={20} />
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                Core Quantum Principle
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-200">
                {lesson.concept}
              </p>
            </div>
          </div>
        </section>

        {/* 3 Step Interactive Workflow */}
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-white">How This Experiment Works</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Step
              number="01"
              title="Concept"
              description="Learn why quantum mechanics behaves this way before placing any gates."
            />
            <Step
              number="02"
              title="Build Circuit"
              description="Assemble quantum gates onto qubits in the interactive circuit composer."
            />
            <Step
              number="03"
              title="Verify & Ask"
              description="Simulate with Qiskit Aer, inspect real probabilities, and ask Copilot why."
            />
          </div>
        </section>

        {/* Interactive Experiment Box */}
        <section className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-[#090f18] shadow-lg">
          <div className="border-b border-white/10 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
                <FlaskConical size={18} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">
                  Interactive Lab Task
                </h2>
                <p className="text-[11px] text-slate-400">
                  Evaluated automatically by real Qiskit quantum simulation.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Objective
              </div>
              <p className="mt-2 text-base font-semibold text-white">
                {lesson.task}
              </p>

              {/* Targets / Required Gates details if challenge exists */}
              {challenge && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {challenge.requiredGates.length > 0 && (
                    <Target
                      label="Required Gates"
                      value={challenge.requiredGates
                        .map((r) =>
                          r.gate === "CNOT"
                            ? `CNOT (q${r.control ?? r.qubit}→q${r.target})`
                            : `${r.gate} on q${r.qubit ?? 0}`
                        )
                        .join(", ")}
                    />
                  )}

                  {challenge.targetProbabilities && (
                    <Target
                      label="Target Distribution"
                      value={Object.entries(challenge.targetProbabilities)
                        .map(([state, prob]) => `|${state}⟩ ≈ ${(prob * 100).toFixed(0)}%`)
                        .join(" · ")}
                    />
                  )}

                  {challenge.targetCondition && (
                    <Target
                      label="Success Condition"
                      value={challenge.targetCondition.description}
                    />
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

              {nextLesson && (
                <Link
                  href={`/learn/${nextLesson.id}`}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 transition hover:text-cyan-300"
                >
                  <span>Skip to Next: {nextLesson.title}</span>
                  <ArrowRight size={13} />
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* What to Notice Section */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="flex items-center gap-2 text-cyan-400">
            <Sparkles size={16} />
            <h2 className="text-sm font-semibold">What to Notice in the Lab</h2>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">
            When you run this experiment, do not look solely at the pass badge. Compare the
            exact complex statevector amplitudes with the measurement histogram and the 3D
            Bloch sphere. Ask Quantum Copilot why your circuit produced that specific state.
          </p>
        </section>
      </div>
    </main>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="font-mono text-xs font-bold text-cyan-400">{number}</div>
      <h3 className="mt-2 text-sm font-semibold text-white">{title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-slate-400">{description}</p>
    </div>
  );
}

function Target({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
      <div className="text-[10px] uppercase tracking-wider text-slate-400">
        {label}
      </div>
      <div className="mt-1 font-mono text-xs font-semibold text-cyan-300">
        {value}
      </div>
    </div>
  );
}
