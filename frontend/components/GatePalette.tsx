"use client";

import {
  CircleDot,
  GitBranch,
  Grid2X2,
  Minus,
  Plus,
  Square,
  Triangle,
} from "lucide-react";
import { soundManager } from "@/lib/sound";

interface GatePaletteProps {
  onGateSelect: (gate: string) => void;
}

const gates = [
  {
    type: "H",
    label: "Hadamard",
  },
  {
    type: "X",
    label: "Pauli-X",
  },
  {
    type: "Y",
    label: "Pauli-Y",
  },
  {
    type: "Z",
    label: "Pauli-Z",
  },
  {
    type: "S",
    label: "Phase-S",
  },
  {
    type: "T",
    label: "Phase-T",
  },
  {
    type: "CNOT",
    label: "Controlled-X",
  },
  {
    type: "M",
    label: "Measurement",
  },
];

export default function GatePalette({
  onGateSelect,
}: GatePaletteProps) {
  return (
    <aside className="w-full border-b border-white/10 bg-[#0b0f1a] p-4 lg:w-56 lg:border-b-0 lg:border-r">
      <div className="mb-4">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/30">
          Quantum Gates
        </div>

        <div className="mt-1 text-xs text-white/25">
          Drag or click to add
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 lg:grid-cols-2">
        {gates.map((gate) => (
          <button
            key={gate.type}
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData(
                "application/qubit-gate",
                gate.type
              );
            }}
            onClick={() => {
              soundManager.playGate(gate.type);
              onGateSelect(gate.type);
            }}
            title={gate.label}
            className="group relative flex h-14 flex-col items-center justify-center rounded-xl border border-white/10 bg-white/[0.025] transition hover:border-cyan-300/30 hover:bg-cyan-300/[0.06] active:scale-95"
          >
            <span className="font-mono text-sm font-semibold text-white/80 group-hover:text-cyan-200">
              {gate.type}
            </span>

            <span className="mt-1 hidden text-[9px] text-white/25 lg:block">
              {gate.label}
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}