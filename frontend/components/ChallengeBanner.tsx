"use client";

import Link from "next/link";
import {
  CheckCircle2,
  ChevronRight,
  FlaskConical,
  HelpCircle,
  X,
} from "lucide-react";
import type { Challenge } from "@/lib/challenges";
import type { Lesson } from "@/lib/lessons";

interface ChallengeBannerProps {
  challenge: Challenge;
  lesson?: Lesson;
  isCompleted: boolean;
  onShowHint?: () => void;
}

export default function ChallengeBanner({
  challenge,
  lesson,
  isCompleted,
}: ChallengeBannerProps) {
  return (
    <div className="relative mb-5 overflow-hidden rounded-2xl border border-cyan-400/25 bg-gradient-to-r from-cyan-950/20 via-[#0a1420] to-[#080d16] p-4 lg:p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Left: Context & Title */}
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
            <FlaskConical size={18} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                Challenge Mode
              </span>

              {lesson && (
                <span className="text-[10px] text-slate-400">
                  Lesson {lesson.number}: {lesson.title}
                </span>
              )}

              <span className="rounded-full border border-white/10 px-2 py-0.5 text-[9px] text-slate-400">
                {challenge.difficulty}
              </span>
            </div>

            <h2 className="mt-1 text-base font-semibold text-white">
              {challenge.title}
            </h2>

            <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-300">
              {challenge.instruction}
            </p>

            {/* Required gates chips */}
            {challenge.requiredGates.length > 0 && (
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wider text-slate-400">
                  Required:
                </span>
                {challenge.requiredGates.map((req, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-md border border-cyan-400/20 bg-cyan-400/5 px-2 py-0.5 font-mono text-[10px] text-cyan-200"
                  >
                    {req.gate === "CNOT"
                      ? `CNOT (q${req.control ?? req.qubit} → q${req.target})`
                      : `${req.gate} on q${req.qubit ?? 0}`}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions and Status */}
        <div className="flex shrink-0 items-center gap-2 self-end md:self-center">
          {isCompleted && (
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-400">
              <CheckCircle2 size={14} />
              <span>Passed</span>
            </div>
          )}

          {lesson && (
            <Link
              href={`/learn/${lesson.id}`}
              className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <span>Lesson Guide</span>
              <ChevronRight size={13} />
            </Link>
          )}

          <Link
            href="/"
            className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1.5 text-xs text-slate-400 transition hover:bg-white/10 hover:text-white"
            title="Exit Challenge Mode to Free Lab"
          >
            <X size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
