"use client";

import {
  Minus,
  Plus,
  Play,
  RotateCcw,
} from "lucide-react";

interface CircuitToolbarProps {
  numQubits: number;
  numColumns: number;
  running: boolean;
  onAddQubit: () => void;
  onRemoveQubit: () => void;
  onAddColumn: () => void;
  onRemoveColumn: () => void;
  onRun: () => void;
  onReset: () => void;
}

export default function CircuitToolbar({
  numQubits,
  numColumns,
  running,
  onAddQubit,
  onRemoveQubit,
  onAddColumn,
  onRemoveColumn,
  onRun,
  onReset,
}: CircuitToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.025] p-1">
          <button
            onClick={onRemoveQubit}
            disabled={numQubits <= 1}
            className="rounded-lg p-2 text-white/40 hover:bg-white/5 hover:text-white disabled:opacity-20"
          >
            <Minus size={14} />
          </button>

          <span className="px-2 text-xs text-white/40">
            {numQubits} qubits
          </span>

          <button
            onClick={onAddQubit}
            disabled={numQubits >= 12}
            className="rounded-lg p-2 text-white/40 hover:bg-white/5 hover:text-white disabled:opacity-20"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.025] p-1">
          <button
            onClick={onRemoveColumn}
            disabled={numColumns <= 1}
            className="rounded-lg p-2 text-white/40 hover:bg-white/5 hover:text-white disabled:opacity-20"
          >
            <Minus size={14} />
          </button>

          <span className="px-2 text-xs text-white/40">
            {numColumns} columns
          </span>

          <button
            onClick={onAddColumn}
            disabled={numColumns >= 20}
            className="rounded-lg p-2 text-white/40 hover:bg-white/5 hover:text-white disabled:opacity-20"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onReset}
          className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/50 transition hover:bg-white/5 hover:text-white"
        >
          <RotateCcw size={15} />
          Clear
        </button>

        <button
          onClick={onRun}
          disabled={running}
          className="flex items-center gap-2 rounded-xl bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-[#061018] transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Play size={15} />

          {running
            ? "Simulating..."
            : "Run Circuit"}
        </button>
      </div>
    </div>
  );
}