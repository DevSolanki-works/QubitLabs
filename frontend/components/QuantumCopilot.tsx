"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Bot,
  Bug,
  ChevronRight,
  Lightbulb,
  Loader2,
  MessageCircle,
  RotateCcw,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import { recordCopilotInquiry } from "@/lib/gamification";

type CopilotMode = "explain" | "debug" | "improve";

type CopilotMessage = {
  role: "user" | "assistant";
  content: string;
};

export type QuantumCopilotProps = {
  circuit: unknown;
  result: unknown;
  challengeContext?: {
    title: string;
    lessonId?: string;
  } | null;
  externalPrompt?: string | null;
  onClearExternalPrompt?: () => void;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const MODES: {
  id: CopilotMode;
  label: string;
  shortDescription: string;
  icon: typeof Sparkles;
}[] = [
  {
    id: "explain",
    label: "Explain",
    shortDescription: "Understand the result",
    icon: Sparkles,
  },
  {
    id: "debug",
    label: "Debug",
    shortDescription: "Find what went wrong",
    icon: Bug,
  },
  {
    id: "improve",
    label: "Explore",
    shortDescription: "Try something new",
    icon: Lightbulb,
  },
];

const STARTERS: Record<
  CopilotMode,
  { label: string; question: string }[]
> = {
  explain: [
    {
      label: "Explain my circuit",
      question: "Explain what happened in my circuit in simple terms.",
    },
    {
      label: "Explain the results",
      question: "Why did I get these measurement results?",
    },
  ],
  debug: [
    {
      label: "Check my circuit",
      question: "Is there anything wrong with my current circuit?",
    },
    {
      label: "Why this result?",
      question: "Why might my result be different from what I expected?",
    },
  ],
  improve: [
    {
      label: "What should I try?",
      question: "What is one useful experiment I should try next?",
    },
    {
      label: "Make it interesting",
      question: "How can I modify this circuit to learn something new?",
    },
  ],
};

function renderAnswer(text: string) {
  return text.split(/\n+/).map((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) return null;

    const isHeading =
      trimmed.startsWith("### ") ||
      trimmed.startsWith("## ") ||
      trimmed.startsWith("# ");

    const cleanLine = trimmed.replace(/^#{1,3}\s+/, "");

    if (isHeading) {
      return (
        <div
          key={index}
          className="mb-1 mt-2 font-semibold text-white"
        >
          {cleanLine}
        </div>
      );
    }

    const isBullet = /^[-*•]\s+/.test(cleanLine);
    const content = cleanLine.replace(/^[-*•]\s+/, "");

    return (
      <div
        key={index}
        className={isBullet ? "flex gap-2" : ""}
      >
        {isBullet && (
          <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-violet-300/70" />
        )}
        <span>{content}</span>
      </div>
    );
  });
}

export default function QuantumCopilot({
  circuit,
  result,
  challengeContext,
  externalPrompt,
  onClearExternalPrompt,
}: QuantumCopilotProps) {
  const [mode, setMode] = useState<CopilotMode>("explain");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFailedQuestion = useRef<string | null>(null);

  const askCopilot = async (preset?: string) => {
    const text = (preset ?? question).trim();

    if (!text || loading) return;

    if (!result) {
      setError(
        "Run the circuit first! Copilot needs real Qiskit simulation results to analyze your quantum state."
      );
      return;
    }

    const userMessage: CopilotMessage = {
      role: "user",
      content: text,
    };

    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setQuestion("");
    setError("");
    setLoading(true);
    lastFailedQuestion.current = null;

    try {
      // Build enriched payload with challenge context if student is in a challenge
      const payload: Record<string, unknown> = {
        question: text,
        mode,
        circuit,
        result,
        history: messages.slice(-8),
      };

      if (challengeContext) {
        payload.challenge_context = `Active Challenge: ${challengeContext.title}`;
      }

      const response = await fetch(
        `${API_URL}/api/copilot/explain`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || `Copilot request failed with status ${response.status}.`
        );
      }

      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content:
            data.answer ||
            "I couldn't generate an explanation. Try asking the question another way.",
        },
      ]);
      recordCopilotInquiry();
    } catch (err) {
      lastFailedQuestion.current = text;
      setError(
        err instanceof Error
          ? err.message
          : "Could not connect to Quantum Copilot. Check that the backend server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle external prompt trigger (e.g. from "Ask Copilot why" button)
  useEffect(() => {
    if (externalPrompt) {
      setMode("explain");
      // Scroll panel into view smoothly
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      askCopilot(externalPrompt);
      if (onClearExternalPrompt) {
        onClearExternalPrompt();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalPrompt]);

  const currentMode =
    MODES.find((item) => item.id === mode) ?? MODES[0];

  const starters = STARTERS[mode];

  return (
    <section
      id="quantum-copilot-panel"
      ref={panelRef}
      className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0f1a] shadow-[0_18px_60px_rgba(0,0,0,0.2)]"
    >
      {/* Header */}
      <div className="border-b border-white/[0.07] px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-300/10">
            <Bot
              size={18}
              className="text-violet-200"
            />
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0b0f1a] bg-emerald-300" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white">
                Quantum Copilot
              </h2>

              <span className="text-[9px] font-semibold uppercase tracking-wider text-emerald-300">
                Online
              </span>
            </div>

            <p className="text-[10px] text-white/40">
              {challengeContext
                ? `Assisting with: ${challengeContext.title}`
                : "Ask about the experiment you just ran"}
            </p>
          </div>

          <div className="ml-auto hidden items-center gap-1.5 text-[9px] text-white/30 sm:flex">
            <MessageCircle size={11} />
            Circuit & Qiskit-aware
          </div>
        </div>
      </div>

      {/* Modes */}
      <div className="grid grid-cols-3 gap-1.5 border-b border-white/[0.06] p-2.5">
        {MODES.map((item) => {
          const Icon = item.icon;
          const active = item.id === mode;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setMode(item.id)}
              className={`rounded-xl px-3 py-2.5 text-left transition ${
                active
                  ? "bg-violet-300/10 text-white"
                  : "text-white/40 hover:bg-white/[0.03] hover:text-white/65"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Icon
                  size={13}
                  className={
                    active
                      ? "text-violet-200"
                      : "text-white/25"
                  }
                />
                <span className="text-[10px] font-medium">
                  {item.label}
                </span>
              </div>

              <div className="mt-1 text-[9px] text-white/20">
                {item.shortDescription}
              </div>
            </button>
          );
        })}
      </div>

      {/* Conversation */}
      <div className="max-h-[390px] min-h-[210px] overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex min-h-[200px] flex-col justify-center">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-300/10">
                <Sparkles
                  size={15}
                  className="text-violet-200"
                />
              </div>

              <div>
                <p className="text-[11px] font-medium text-white/75">
                  What would you like to understand?
                </p>
                <p className="mt-0.5 text-[9px] text-white/30">
                  I explain using your actual circuit and verified Qiskit results.
                </p>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {starters.map((starter) => (
                <button
                  key={starter.label}
                  type="button"
                  onClick={() =>
                    askCopilot(starter.question)
                  }
                  className="group flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.015] px-3 py-3 text-left transition hover:border-violet-300/15 hover:bg-violet-300/[0.04]"
                >
                  <span className="text-[10px] text-white/50 group-hover:text-white/70">
                    {starter.label}
                  </span>

                  <ChevronRight
                    size={12}
                    className="text-white/15 transition group-hover:translate-x-0.5 group-hover:text-white/40"
                  />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex gap-2.5 ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-violet-300/10">
                    <Bot
                      size={12}
                      className="text-violet-200"
                    />
                  </div>
                )}

                <div
                  className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 text-[11px] leading-5 ${
                    message.role === "user"
                      ? "rounded-br-md bg-cyan-300/10 text-cyan-50"
                      : "rounded-bl-md border border-white/[0.06] bg-white/[0.025] text-white/75"
                  }`}
                >
                  {message.role === "assistant"
                    ? renderAnswer(message.content)
                    : message.content}
                </div>

                {message.role === "user" && (
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-cyan-300/10">
                    <User
                      size={12}
                      className="text-cyan-200"
                    />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-violet-300/10">
                  <Bot
                    size={12}
                    className="text-violet-200"
                  />
                </div>

                <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-white/[0.06] bg-white/[0.025] px-3.5 py-3">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-300/70 [animation-delay:-0.2s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-300/50 [animation-delay:-0.1s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-300/30" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mx-3 mb-3 flex items-start justify-between gap-2 rounded-xl border border-red-300/20 bg-red-400/10 p-3 text-[11px] text-red-200">
          <div className="flex items-start gap-2">
            <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-300" />
            <span>{error}</span>
          </div>
          {lastFailedQuestion.current && (
            <button
              type="button"
              onClick={() => {
                if (lastFailedQuestion.current) {
                  askCopilot(lastFailedQuestion.current);
                }
              }}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-red-300/20 bg-red-400/20 px-2 py-1 text-[10px] text-red-100 hover:bg-red-400/30"
            >
              <RotateCcw size={10} />
              Retry
            </button>
          )}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-white/[0.07] p-3">
        <div className="mb-2 text-[8px] font-medium uppercase tracking-[0.18em] text-white/30">
          {currentMode.label} mode
        </div>

        <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-1.5 transition focus-within:border-violet-300/25">
          <textarea
            value={question}
            onChange={(event) =>
              setQuestion(event.target.value)
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey
              ) {
                event.preventDefault();
                askCopilot();
              }
            }}
            placeholder={
              currentMode.id === "explain"
                ? "Ask why your result happened..."
                : currentMode.id === "debug"
                  ? "Ask what might be wrong..."
                  : "Ask what you could try next..."
            }
            disabled={loading}
            rows={2}
            className="min-h-[42px] flex-1 resize-none bg-transparent px-2 py-2 text-[11px] leading-5 text-white outline-none placeholder:text-white/20 disabled:opacity-50"
          />

          <button
            type="button"
            onClick={() => askCopilot()}
            disabled={
              loading || !question.trim()
            }
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-300 text-[#10101a] transition hover:scale-[1.03] hover:bg-violet-200 disabled:cursor-not-allowed disabled:opacity-25"
            aria-label="Ask Quantum Copilot"
          >
            {loading ? (
              <Loader2
                size={14}
                className="animate-spin"
              />
            ) : (
              <Send size={14} />
            )}
          </button>
        </div>

        <div className="mt-1.5 px-1 text-[8px] text-white/20">
          Enter to send · Shift+Enter for a new line
        </div>
      </div>
    </section>
  );
}
