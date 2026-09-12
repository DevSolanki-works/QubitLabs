"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, HelpCircle, Award, RotateCcw, ArrowRight, Sparkles } from "lucide-react";
import { getQuizForLesson, QuizQuestion } from "@/lib/quizzes";
import { recordQuizSubmission, getGamificationState } from "@/lib/gamification";

type QuizCardProps = {
  lessonId: string;
  onQuizComplete?: (passed: boolean, score: number, total: number) => void;
};

export default function QuizCard({ lessonId, onQuizComplete }: QuizCardProps) {
  const quiz = getQuizForLesson(lessonId);

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [isPerfect, setIsPerfect] = useState(false);
  const [hasPassedBefore, setHasPassedBefore] = useState(false);

  useEffect(() => {
    const state = getGamificationState();
    const existing = state.quizzes[lessonId];
    if (existing?.passed) {
      setHasPassedBefore(true);
    }
  }, [lessonId]);

  if (!quiz) {
    return null;
  }

  const handleSelect = (questionIndex: number, optionIndex: number) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const isAllAnswered = quiz.questions.every((_, idx) => selectedAnswers[idx] !== undefined);

  const handleSubmit = () => {
    if (!isAllAnswered || submitted) return;

    let correctCount = 0;
    quiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correctCount += 1;
      }
    });

    setScore(correctCount);
    setSubmitted(true);

    const result = recordQuizSubmission(lessonId, correctCount, quiz.questions.length);
    setXpEarned(result.xpEarned);
    setIsPerfect(result.isPerfect);

    if (onQuizComplete) {
      onQuizComplete(result.passed, correctCount, quiz.questions.length);
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setScore(0);
    setXpEarned(0);
    setIsPerfect(false);
  };

  const totalQuestions = quiz.questions.length;
  const passed = score / totalQuestions >= 0.66;

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#070c14] shadow-xl">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0a101b] px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-400/10 text-violet-300">
              <HelpCircle size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">Conceptual Assessment</h3>
                {hasPassedBefore && (
                  <span className="rounded-md border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                    Passed
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">{quiz.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-lg border border-white/10 bg-white/[0.025] px-2.5 py-1 text-[11px] text-slate-300">
              {totalQuestions} Questions
            </span>
            <span className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-cyan-300">
              +25 XP
            </span>
          </div>
        </div>
      </div>

      {/* Questions Body */}
      <div className="space-y-6 p-6">
        {quiz.questions.map((question, qIdx) => {
          const userChoice = selectedAnswers[qIdx];
          const isCorrectChoice = userChoice === question.correctIndex;

          return (
            <div
              key={question.id}
              className="rounded-xl border border-white/5 bg-white/[0.015] p-5 transition hover:border-white/10"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 font-mono text-xs font-semibold text-cyan-300">
                  {qIdx + 1}
                </span>
                <p className="text-sm font-medium leading-relaxed text-slate-200">
                  {question.prompt}
                </p>
              </div>

              {/* Options */}
              <div className="mt-4 space-y-2">
                {question.options.map((option, oIdx) => {
                  const isSelected = userChoice === oIdx;
                  const isRightAnswer = oIdx === question.correctIndex;

                  let optionStyle =
                    "border-white/10 bg-white/[0.02] text-slate-300 hover:border-cyan-400/30 hover:bg-cyan-400/[0.04]";

                  if (isSelected && !submitted) {
                    optionStyle = "border-cyan-400 bg-cyan-400/10 text-cyan-200";
                  }

                  if (submitted) {
                    if (isRightAnswer) {
                      optionStyle = "border-emerald-500/50 bg-emerald-500/15 text-emerald-200 font-semibold";
                    } else if (isSelected && !isRightAnswer) {
                      optionStyle = "border-red-500/50 bg-red-500/15 text-red-200";
                    } else {
                      optionStyle = "border-white/5 bg-white/[0.01] text-slate-500 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      disabled={submitted}
                      onClick={() => handleSelect(qIdx, oIdx)}
                      className={`flex w-full items-center justify-between rounded-xl border p-3 text-left text-xs transition ${optionStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-5 w-5 items-center justify-center rounded-md border border-white/10 bg-white/5 font-mono text-[10px]">
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span>{option}</span>
                      </div>

                      {submitted && (
                        <div>
                          {isRightAnswer && <CheckCircle2 size={16} className="text-emerald-400" />}
                          {isSelected && !isRightAnswer && <XCircle size={16} className="text-red-400" />}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Pedagogical Explanation when submitted */}
              {submitted && (
                <div
                  className={`mt-4 rounded-xl border p-4 text-xs leading-relaxed ${
                    isCorrectChoice
                      ? "border-emerald-500/25 bg-emerald-950/20 text-emerald-200"
                      : "border-amber-500/25 bg-amber-950/20 text-amber-200"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Sparkles size={14} className={isCorrectChoice ? "text-emerald-400" : "text-amber-400"} />
                    <span>{isCorrectChoice ? "Correct Understanding:" : "Physical Explanation:"}</span>
                  </div>
                  <p className="mt-1.5 text-slate-300">{question.explanation}</p>
                </div>
              )}
            </div>
          );
        })}

        {/* Action Controls & Result Summary */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
          {!submitted ? (
            <button
              type="button"
              disabled={!isAllAnswered}
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-300 px-6 py-2.5 text-xs font-semibold text-[#061016] shadow-[0_0_15px_rgba(6,182,212,0.25)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span>Submit Answers & Check Understanding</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-4">
              <div
                className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold ${
                  passed
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                    : "border-amber-400/30 bg-amber-400/10 text-amber-300"
                }`}
              >
                {passed ? <Award size={16} /> : <RotateCcw size={16} />}
                <span>
                  Result: {score}/{totalQuestions} Correct ({Math.round((score / totalQuestions) * 100)}%)
                </span>
                {passed && <span className="text-emerald-400">· Passed</span>}
              </div>

              {xpEarned > 0 && (
                <div className="flex items-center gap-1.5 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 font-mono text-xs font-bold text-cyan-300">
                  <Sparkles size={14} />
                  <span>+{xpEarned} XP Earned</span>
                  {isPerfect && <span className="text-amber-300">· Perfect Bonus!</span>}
                </div>
              )}

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <RotateCcw size={13} />
                <span>Retry Quiz</span>
              </button>
            </div>
          )}

          <div className="text-[11px] text-slate-400">
            {submitted
              ? passed
                ? "Concepts verified. Proceed to hands-on experiment!"
                : "Review the physical explanations and retry."
              : `${Object.keys(selectedAnswers).length} of ${totalQuestions} answered`}
          </div>
        </div>
      </div>
    </section>
  );
}
