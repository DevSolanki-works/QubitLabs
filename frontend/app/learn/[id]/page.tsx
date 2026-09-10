"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Atom,
  CheckCircle2,
  Clock3,
  FlaskConical,
  Lightbulb,
  Play,
} from "lucide-react";

import { lessons } from "@/lib/lessons";

export default function LessonPage() {
  const params = useParams();
  const id = String(params.id);

  const lesson = lessons.find((item) => item.id === id);

  if (!lesson) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050b10] text-white">
        <div className="text-center">
          <Atom className="mx-auto text-cyan-400" size={32} />
          <h1 className="mt-4 text-xl font-semibold">Lesson not found</h1>

          <Link
            href="/learn"
            className="mt-5 inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300"
          >
            <ArrowLeft size={15} />
            Back to learning
          </Link>
        </div>
      </main>
    );
  }

  const isSuperposition = lesson.id === "superposition";

  return (
    <main className="min-h-screen bg-[#050b10] text-white">
      {/* Header */}
      <header className="flex h-16 items-center border-b border-white/10 bg-[#070c13] px-5 lg:px-8">
        <Link
          href="/learn"
          className="flex items-center gap-2 text-sm text-white/40 transition hover:text-white"
        >
          <ArrowLeft size={17} />
          Learning Path
        </Link>

        <div className="mx-4 h-5 w-px bg-white/10" />

        <div className="text-sm font-medium">{lesson.title}</div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10 lg:py-14">
        {/* Hero */}
        <div className="max-w-3xl">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1 text-xs text-cyan-300">
              Lesson {lesson.number}
            </span>

            <span className="flex items-center gap-1.5 text-xs text-white/30">
              <Clock3 size={13} />
              {lesson.duration}
            </span>

            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/35">
              {lesson.difficulty}
            </span>
          </div>

          <h1 className="text-4xl font-semibold tracking-tight lg:text-5xl">
            {lesson.title}
          </h1>

          <p className="mt-3 text-lg text-cyan-400">
            {lesson.subtitle}
          </p>

          <p className="mt-6 text-base leading-8 text-slate-400">
            {lesson.description}
          </p>
        </div>

        {/* Concept */}
        <section className="mt-10 rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.025] p-6">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10">
              <Lightbulb size={18} className="text-cyan-300" />
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300/70">
                Core idea
              </div>

              <p className="mt-2 text-sm leading-7 text-slate-300">
                {lesson.concept}
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold">What you'll do</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Step
              number="01"
              title="Learn"
              description="Understand the quantum concept before touching the circuit."
            />

            <Step
              number="02"
              title="Build"
              description="Use the QubitLabs circuit composer to construct the experiment."
            />

            <Step
              number="03"
              title="Observe"
              description="Run the circuit and see the actual quantum result."
            />
          </div>
        </section>

        {/* Experiment */}
        <section className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-[#0a1019]">
          <div className="border-b border-white/10 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                <FlaskConical size={18} className="text-cyan-300" />
              </div>

              <div>
                <h2 className="font-semibold">Interactive experiment</h2>
                <p className="mt-1 text-xs text-white/30">
                  Your result will be evaluated by the simulator.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
              <div className="text-xs uppercase tracking-[0.15em] text-white/30">
                Your task
              </div>

              <p className="mt-3 text-lg font-medium">
                {lesson.task}
              </p>

              {isSuperposition && (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Target
                    label="Required gate"
                    value="H"
                  />

                  <Target
                    label="Target distribution"
                    value="~50% |0⟩ / ~50% |1⟩"
                  />
                </div>
              )}
            </div>

            <Link
              href={
                isSuperposition
                  ? "/?lesson=superposition"
                  : "/"
              }
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-[#061016] transition hover:bg-cyan-300"
            >
              <Play size={15} />
              Open Experiment
              <ArrowRight size={15} />
            </Link>
          </div>
        </section>

        {/* What to notice */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={17} className="text-emerald-400" />
            <h2 className="text-sm font-semibold">What to notice</h2>
          </div>

          <p className="mt-3 text-sm leading-7 text-slate-400">
            Don't just look at whether the circuit ran. Compare the circuit
            you built with the statevector, probabilities, measurement
            results, and Bloch sphere. These visualizations show different
            views of the same quantum experiment.
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
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
      <div className="text-xs font-mono text-cyan-400/70">{number}</div>

      <h3 className="mt-3 font-medium">{title}</h3>

      <p className="mt-2 text-xs leading-6 text-white/35">
        {description}
      </p>
    </div>
  );
}

function Target({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/10 p-4">
      <div className="text-[10px] uppercase tracking-[0.14em] text-white/25">
        {label}
      </div>

      <div className="mt-2 font-mono text-sm text-cyan-300">
        {value}
      </div>
    </div>
  );
}