"use client";

import {
  Activity,
  Rotate3D,
} from "lucide-react";

import BlochSphere from "./BlochSphere";

import { BlochVector } from "@/lib/quantum";

interface BlochCardProps {
  vector: BlochVector;
}

export default function BlochCard({
  vector,
}: BlochCardProps) {
  const magnitude = Math.sqrt(
    vector.x ** 2 +
      vector.y ** 2 +
      vector.z ** 2
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
      <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
        <div className="flex items-center gap-2">
          <Rotate3D
            size={15}
            className="text-cyan-300"
          />

          <span className="text-xs font-medium text-white/60">
            Bloch Sphere
          </span>
        </div>

        <span className="text-[10px] text-white/20">
          q{vector.qubit}
        </span>
      </div>

      <div className="flex flex-col items-center p-3">
        <BlochSphere
          vector={vector}
          size={260}
        />

        <div className="grid w-full grid-cols-4 gap-2">
          <Coordinate
            label="X"
            value={vector.x}
          />

          <Coordinate
            label="Y"
            value={vector.y}
          />

          <Coordinate
            label="Z"
            value={vector.z}
          />

          <Coordinate
            label="r"
            value={magnitude}
          />
        </div>
      </div>
    </div>
  );
}

function Coordinate({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-white/[0.025] p-2 text-center">
      <div className="text-[9px] uppercase tracking-widest text-white/20">
        {label}
      </div>

      <div className="mt-1 font-mono text-xs text-cyan-200">
        {value.toFixed(2)}
      </div>
    </div>
  );
}