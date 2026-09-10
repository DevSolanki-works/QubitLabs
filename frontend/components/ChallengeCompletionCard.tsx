"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  GraduationCap,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import type { Challenge } from "@/lib/challenges";
import type { Lesson } from "@/lib/lessons";
import type { SimulationResult } from "@/lib/quantum";
import type { ValidationMetric } from "@/lib/challengeValidator";

interface ChallengeCompletionCardProps {
  challenge: Challenge;
  lesson?: Lesson;
  nextLesson?: Lesson | null;
  result: SimulationResult;
  metrics?: ValidationMetric[];
  onAskCopilot: () => void;
  onResetCircuit?: () => void;
}

export default function ChallengeCompletionCard({
  challenge,
  nextLesson,
  result,
  metrics,
  onAskCopilot,
  onResetCircuit,
}: ChallengeCompletionCardProps) {
  // Sort states by probability descending
  const actualStates = Object.entries(result.probabilities || {})
    .filter(([, prob]) => prob > 0.001)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-400/30 bg-gradient-to-b from-[#091817] to-[#080d16] p-5 shadow-[0_0_50px_rgba(16,185,129,0.1)] lg:p-6">
      {/* Subtle background glow effect */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />

      {/* Header Badge */}
      <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-emerald-400/15 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-400/15 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">
              Challenge Complete
            </div>
            <h2 className="text-base font-semibold text-white">
              {challenge.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 font-mono text-[11px] text-emerald-300">
            Qiskit Verified ✓
          </span>
        </div>
      </div>

      {/* Educational Summary */}
      <div className="relative mt-4">
        <p className="text-xs leading-relaxed text-slate-300 lg:text-sm">
          {challenge.educationalSummary}
        </p>
      </div>

      {/* Actual Simulation Results Data */}
      <div className="relative mt-5 rounded-xl border border-white/10 bg-black/30 p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Actual Simulation Outcomes
          </span>
          <span className="font-mono text-[11px] text-cyan-300/80">
            {result.shots.toLocaleString()} shots measured
          </span>
        </div>

        {/* Probabilities grid */}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {actualStates.map(([state, prob]) => {
            const count = result.counts?.[state] ?? Math.round(prob * result.shots);
            const percentage = (prob * 100).toFixed(1);

            return (
              <div
                key={state}
                className="flex flex-col justify-between rounded-lg border border-cyan-400/15 bg-cyan-950/20 p-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-cyan-200">
                    |{state}⟩
                  </span>
                  <span className="font-mono text-xs font-bold text-white">
                    {percentage}%
                  </span>
                </div>
                {/* Progress fill */}
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-cyan-400 transition-all duration-700"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="mt-1 text-[10px] text-slate-400">
                  {count.toLocaleString()} shots
                </div>
              </div>
            );
          })}
        </div>

        {/* Validation Metrics if any */}
        {metrics && metrics.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 border-t border-white/5 pt-3">
            {metrics.map((m, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 rounded-md border border-emerald-400/20 bg-emerald-400/5 px-2 py-1 text-[10px] text-emerald-300"
              >
                <span>{m.label}:</span>
                <span className="font-mono font-semibold">{m.actual}</span>
                <span className="text-emerald-400/60">(target {m.expected})</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="relative mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
        <div className="flex items-center gap-2">
          {onResetCircuit && (
            <button
              type="button"
              onClick={onResetCircuit}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <RotateCcw size={13} />
              Try Again
            </button>
          )}

          <button
            type="button"
            onClick={onAskCopilot}
            className="inline-flex items-center gap-2 rounded-xl border border-violet-400/30 bg-violet-400/10 px-3.5 py-2 text-xs font-semibold text-violet-200 transition hover:bg-violet-400/20 hover:text-white"
          >
            <Bot size={15} className="text-violet-300" />
            <span>Ask Copilot why</span>
            <Sparkles size={12} className="text-violet-300" />
          </button>
        </div>

        {nextLesson ? (
          <Link
            href={`/learn/${nextLesson.id}`}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-2.5 text-xs font-semibold text-[#061016] shadow-[0_0_20px_rgba(16,185,129,0.3)] transition hover:opacity-90"
          >
            <span>Continue Learning: {nextLesson.title}</span>
            <ArrowRight size={14} />
          </Link>
        ) : (
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-2.5 text-xs font-semibold text-[#061016] shadow-[0_0_20px_rgba(16,185,129,0.3)] transition hover:opacity-90"
          >
            <GraduationCap size={15} />
            <span>Learning Path Complete · Return to Curriculum</span>
          </Link>
        )}
      </div>
    </div>
  );
}
