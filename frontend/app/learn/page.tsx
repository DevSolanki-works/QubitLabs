"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Sparkles,
} from "lucide-react";

import { lessons } from "@/lib/lessons";
import {
  getCompletedLessons,
} from "@/lib/progress";

export default function LearnPage() {
  const [completedLessons, setCompletedLessons] =
    useState<string[]>([]);

  useEffect(() => {
    setCompletedLessons(getCompletedLessons());
  }, []);

  const completedCount = lessons.filter((lesson) =>
    completedLessons.includes(lesson.id)
  ).length;

  const progress =
    lessons.length === 0
      ? 0
      : Math.round(
          (completedCount / lessons.length) * 100
        );

  return (
    <main className="min-h-screen bg-[#050b10] text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">

        {/* Header */}

        <div className="mb-10">
          <div className="mb-3 flex items-center gap-2 text-sm text-cyan-400">
            <Sparkles size={16} />
            QubitLabs Learning Path
          </div>

          <h1 className="text-4xl font-semibold tracking-tight">
            Learn quantum computing
          </h1>

          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-400">
            Don't just read about quantum concepts.
            Learn them by building circuits, running
            real simulations, and seeing what happens.
          </p>
        </div>

        {/* Progress */}

        <section className="mb-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">
                Your progress
              </p>

              <p className="mt-1 text-xl font-medium">
                Quantum Foundations
              </p>
            </div>

            <span className="text-sm text-slate-400">
              {completedCount} / {lessons.length} completed
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-cyan-400 transition-all duration-500"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          {completedCount > 0 && (
            <p className="mt-3 text-xs text-cyan-400/70">
              {progress}% of the learning path complete
            </p>
          )}
        </section>

        {/* Lessons */}

        <div className="space-y-4">
          {lessons.map((lesson, index) => {
            const completed =
              completedLessons.includes(
                lesson.id
              );

            return (
              <Link
                key={lesson.id}
                href={`/learn/${lesson.id}`}
                className="group block"
              >
                <article
                  className={`relative overflow-hidden rounded-2xl border p-6 transition-all duration-200 ${
                    completed
                      ? "border-emerald-400/20 bg-emerald-400/[0.025]"
                      : "border-white/10 bg-white/[0.025] hover:border-cyan-400/30 hover:bg-white/[0.045]"
                  }`}
                >
                  <div className="flex gap-5">

                    {/* Number / status */}

                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-sm font-medium ${
                        completed
                          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
                          : "border-white/10 bg-white/[0.04] text-slate-300"
                      }`}
                    >
                      {completed ? (
                        <Check size={18} />
                      ) : (
                        lesson.number
                      )}
                    </div>

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl font-medium">
                          {lesson.title}
                        </h2>

                        {completed && (
                          <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-400">
                            <CheckCircle2 size={12} />
                            Completed
                          </span>
                        )}

                        <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-400">
                          {lesson.difficulty}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-cyan-400">
                        {lesson.subtitle}
                      </p>

                      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                        {lesson.description}
                      </p>

                      <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Clock3 size={14} />
                          {lesson.duration}
                        </span>

                        {index === 0 &&
                          !completed && (
                            <span className="flex items-center gap-1.5 text-emerald-400">
                              <Check size={14} />
                              Start here
                            </span>
                          )}
                      </div>
                    </div>

                    {/* Arrow */}

                    <div className="flex shrink-0 items-center">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all ${
                          completed
                            ? "border-emerald-400/20 text-emerald-400/60"
                            : "border-white/10 text-slate-500 group-hover:border-cyan-400/30 group-hover:text-cyan-400"
                        }`}
                      >
                        <ArrowRight size={18} />
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