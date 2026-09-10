"use client";

import Link from "next/link";
import { CheckCircle2, Circle, Play, Lock, Sparkles, Clock3, ArrowRight } from "lucide-react";
import { Lesson, LessonLevel, getLessonsByLevel } from "@/lib/lessons";
import { LessonProgressStatus } from "@/lib/progress";

type LearningPathTreeProps = {
  completedLessons: string[];
  activeLessonId?: string;
};

export default function LearningPathTree({
  completedLessons,
  activeLessonId,
}: LearningPathTreeProps) {
  const levels = getLessonsByLevel();
  const levelKeys = Object.keys(levels) as LessonLevel[];

  const getStatus = (lesson: Lesson): LessonProgressStatus => {
    if (completedLessons.includes(lesson.id)) {
      return "completed";
    }
    if (activeLessonId === lesson.id) {
      return "current";
    }
    return "available";
  };

  return (
    <div className="space-y-12">
      {levelKeys.map((levelName, levelIdx) => {
        const levelLessons = levels[levelName];
        const completedInLevel = levelLessons.filter((l) =>
          completedLessons.includes(l.id)
        ).length;
        const totalInLevel = levelLessons.length;
        const isLevelComplete = completedInLevel === totalInLevel;

        return (
          <div key={levelName} className="relative">
            {/* Level Group Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-400/10 font-mono text-xs font-bold text-cyan-300">
                  {levelIdx + 1}
                </span>
                <div>
                  <h3 className="text-base font-bold tracking-tight text-white">
                    {levelName}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {completedInLevel} of {totalInLevel} lessons completed
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isLevelComplete ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold text-emerald-400">
                    <CheckCircle2 size={13} />
                    <span>Level Mastered</span>
                  </span>
                ) : (
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px] text-slate-400">
                    {Math.round((completedInLevel / totalInLevel) * 100)}% Coherent
                  </span>
                )}
              </div>
            </div>

            {/* Level Grid of Lesson Nodes */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
              {levelLessons.map((lesson) => {
                const status = getStatus(lesson);
                const isCompleted = status === "completed";
                const isCurrent = status === "current";

                let cardStyle =
                  "border-white/10 bg-[#070c14] hover:border-cyan-400/30 hover:bg-white/[0.02]";
                if (isCompleted) {
                  cardStyle =
                    "border-emerald-500/30 bg-gradient-to-br from-emerald-950/15 via-[#070c14] to-[#070c14]";
                } else if (isCurrent) {
                  cardStyle =
                    "border-cyan-400/60 bg-gradient-to-br from-cyan-950/20 via-[#070c14] to-[#070c14] shadow-[0_0_20px_rgba(6,182,212,0.15)]";
                }

                return (
                  <Link
                    key={lesson.id}
                    href={`/learn/${lesson.id}`}
                    className={`group relative flex flex-col justify-between rounded-2xl border p-5 transition ${cardStyle}`}
                  >
                    <div>
                      {/* Top Status Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-slate-400">
                            #{String(lesson.number).padStart(2, "0")}
                          </span>

                          <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-400">
                            {lesson.difficulty}
                          </span>
                        </div>

                        {/* Completion Icon */}
                        <div>
                          {isCompleted && (
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-400">
                              <CheckCircle2 size={16} />
                            </span>
                          )}
                          {isCurrent && (
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400/15 text-cyan-300 animate-pulse">
                              <Play size={12} className="fill-cyan-300" />
                            </span>
                          )}
                          {!isCompleted && !isCurrent && (
                            <span className="flex h-6 w-6 items-center justify-center rounded-full text-slate-600 group-hover:text-slate-400">
                              <Circle size={14} />
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title & Subtitle */}
                      <h4 className="mt-3 text-base font-bold text-white transition group-hover:text-cyan-200">
                        {lesson.title}
                      </h4>
                      <p className="mt-1 text-xs leading-relaxed text-slate-400">
                        {lesson.subtitle}
                      </p>
                    </div>

                    {/* Bottom Metadata */}
                    <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-3 text-[11px]">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock3 size={12} />
                        {lesson.duration}
                      </span>

                      <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-cyan-300">
                        <Sparkles size={12} />
                        <span>+{lesson.xpReward} XP</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
