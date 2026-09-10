"use client";

import {
  Activity,
} from "lucide-react";

interface MeasurementChartProps {
  counts: Record<string, number>;
  shots: number;
}

export default function MeasurementChart({
  counts,
  shots,
}: MeasurementChartProps) {
  const entries = Object.entries(
    counts
  ).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  const max =
    Math.max(
      ...entries.map(
        ([, value]) => value
      ),
      1
    );

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02]">
      <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
        <div className="flex items-center gap-2">
          <Activity
            size={15}
            className="text-violet-300"
          />

          <span className="text-xs font-medium text-white/60">
            Measurement Results
          </span>
        </div>

        <span className="text-[10px] text-white/20">
          {shots.toLocaleString()} shots
        </span>
      </div>

      <div className="flex h-48 items-end gap-3 overflow-x-auto p-4">
        {entries.map(
          ([state, count]) => {
            const height =
              (count / max) * 100;

            return (
              <div
                key={state}
                className="flex h-full min-w-10 flex-1 flex-col items-center justify-end"
              >
                <span className="mb-2 font-mono text-[10px] text-white/30">
                  {count}
                </span>

                <div
                  className="w-full max-w-12 rounded-t-lg bg-violet-300/70 transition-all duration-700"
                  style={{
                    height: `${Math.max(
                      height,
                      2
                    )}%`,
                  }}
                />

                <span className="mt-2 font-mono text-[10px] text-white/45">
                  |{state}⟩
                </span>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}