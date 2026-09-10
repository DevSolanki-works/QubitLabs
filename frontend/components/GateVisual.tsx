"use client";

import { X } from "lucide-react";
import { CircuitOperation } from "@/lib/quantum";

interface GateVisualProps {
  operation: CircuitOperation;
  onDelete: (id: string) => void;
  role?: "control" | "target";
}

export default function GateVisual({
  operation,
  onDelete,
  role,
}: GateVisualProps) {
  const label =
    operation.type === "CNOT"
      ? role === "control"
        ? "●"
        : "⊕"
      : operation.type;

  const isControl =
    operation.type === "CNOT";

  return (
    <div
      onClick={(event) => {
        event.stopPropagation();
        onDelete(operation.id);
      }}
      title="Click to remove"
      className={`group relative z-20 flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border font-mono text-sm font-semibold shadow-lg transition hover:scale-105 ${
        isControl
          ? "border-violet-300/30 bg-violet-300/10 text-violet-200"
          : "border-cyan-300/30 bg-cyan-300/10 text-cyan-200"
      }`}
    >
      {label}

      <span className="pointer-events-none absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-white/10 text-white/50 group-hover:flex">
        <X size={9} />
      </span>
    </div>
  );
}