"use client";

import {
  BarChart3,
} from "lucide-react";

interface ProbabilityChartProps {
  probabilities: Record<
    string,
    number
  >;
}

export default function ProbabilityChart({
  probabilities,
}: ProbabilityChartProps) {
  const entries = Object.entries(
    probabilities
  ).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02]">
      <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
        <div className="flex items-center gap-2">
          <BarChart3
            size={15}
            className="text-cyan-300"
          />

          <span className="text-xs font-medium text-white/60">
            Measurement Probability
          </span>
        </div>

        <span className="text-[10px] text-white/20">
          Quantum state
        </span>
      </div>

      <div className="space-y-4 p-4">
        {entries.map(
          ([state, probability]) => {
            const percentage =
              probability * 100;

            return (
              <div key={state}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="font-mono text-xs text-white/55">
                    |{state}⟩
                  </span>

                  <span className="font-mono text-[11px] text-white/30">
                    {percentage.toFixed(1)}%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-cyan-300 transition-all duration-700 ease-out"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}