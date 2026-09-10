"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Atom,
  Brain,
  ChevronDown,
  Code2,
  Sparkles,
} from "lucide-react";

import GatePalette from "@/components/GatePalette";
import CircuitGrid from "@/components/CircuitGrid";
import CircuitToolbar from "@/components/CircuitToolbar";

import {
  addColumn,
  addQubit,
  clearCircuit,
  createEmptyCircuit,
  removeColumn,
  removeQubit,
  serializeCircuit,
} from "@/lib/circuit";

import {
  QuantumCircuit,
  SimulationResult,
} from "@/lib/quantum";

export default function LabPage() {
  const [circuit, setCircuit] =
    useState<QuantumCircuit>(
      createEmptyCircuit(2, 6)
    );

  const [selectedGate, setSelectedGate] =
    useState<string | null>(null);

  const [running, setRunning] =
    useState(false);

  const [result, setResult] =
    useState<SimulationResult | null>(
      null
    );

  const runCircuit = async () => {
    setRunning(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/quantum/simulate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            num_qubits:
              circuit.numQubits,
            gates:
              serializeCircuit(circuit),
            shots: 1024,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Simulation failed: ${response.status}`
        );
      }

      const data =
        (await response.json()) as SimulationResult;

      setResult(data);
    } catch (error) {
      console.error(error);

      alert(
        "Could not connect to the quantum simulator."
      );
    } finally {
      setRunning(false);
    }
  };

  const resetCircuit = () => {
    setCircuit(
      createEmptyCircuit(
        circuit.numQubits,
        circuit.numColumns
      )
    );

    setResult(null);
  };

  return (
    <main className="min-h-screen bg-[#080b14] text-white">
      {/* HEADER */}

      <header className="flex h-16 items-center justify-between border-b border-white/10 bg-[#090d17] px-5 lg:px-8">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="rounded-lg p-2 text-white/40 transition hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft size={18} />
          </Link>

          <div className="h-5 w-px bg-white/10" />

          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-300/10">
              <Atom
                size={17}
                className="text-cyan-300"
              />
            </div>

            <div>
              <div className="text-sm font-semibold">
                Quantum Lab
              </div>

              <div className="hidden text-[10px] text-white/30 sm:block">
                Interactive circuit environment
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/[0.025] px-3 py-2 text-xs sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />

            <span className="text-white/35">
              Backend
            </span>

            <span className="text-cyan-300">
              Qiskit Aer
            </span>

            <ChevronDown
              size={12}
              className="text-white/20"
            />
          </div>

          <button className="rounded-lg border border-white/10 p-2 text-white/40 hover:bg-white/5 hover:text-white">
            <Brain size={17} />
          </button>
        </div>
      </header>

      {/* MAIN */}

      <div className="flex min-h-[calc(100vh-4rem)] flex-col lg:flex-row">
        {/* GATE PALETTE */}

        <GatePalette
          onGateSelect={(gate) =>
            setSelectedGate(gate)
          }
        />

        {/* WORKSPACE */}

        <section className="min-w-0 flex-1 p-4 lg:p-6">
          <div className="mx-auto max-w-[1400px]">
            {/* TOOLBAR */}

            <div className="mb-5">
              <CircuitToolbar
                numQubits={
                  circuit.numQubits
                }
                numColumns={
                  circuit.numColumns
                }
                running={running}
                onAddQubit={() =>
                  setCircuit(
                    addQubit(circuit)
                  )
                }
                onRemoveQubit={() =>
                  setCircuit(
                    removeQubit(circuit)
                  )
                }
                onAddColumn={() =>
                  setCircuit(
                    addColumn(circuit)
                  )
                }
                onRemoveColumn={() =>
                  setCircuit(
                    removeColumn(circuit)
                  )
                }
                onRun={runCircuit}
                onReset={resetCircuit}
              />
            </div>

            {/* SELECTED GATE */}

            {selectedGate && (
              <div className="mb-4 flex items-center justify-between rounded-xl border border-cyan-300/10 bg-cyan-300/[0.025] px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 font-mono text-xs text-cyan-200">
                    {selectedGate}
                  </div>

                  <div>
                    <div className="text-xs font-medium">
                      Gate selected
                    </div>

                    <div className="text-[11px] text-white/30">
                      Click any circuit cell to place it
                    </div>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setSelectedGate(null)
                  }
                  className="text-xs text-white/30 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* CIRCUIT */}

            <div className="mb-5">
              <div className="mb-3 flex items-end justify-between">
                <div>
                  <h1 className="text-lg font-semibold">
                    Circuit Composer
                  </h1>

                  <p className="mt-1 text-xs text-white/30">
                    Drag a gate onto a qubit or select a
                    gate and click a cell.
                  </p>
                </div>

                <div className="hidden text-xs text-white/20 sm:block">
                  {circuit.operations.length} operations
                </div>
              </div>

              <CircuitGrid
                circuit={circuit}
                setCircuit={setCircuit}
                selectedGate={selectedGate}
              />
            </div>

            {/* CODE PREVIEW */}

            <div className="rounded-2xl border border-white/10 bg-[#0b101c]">
              <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <Code2
                    size={14}
                    className="text-cyan-300"
                  />
                  Circuit Representation
                </div>

                <span className="rounded-md bg-white/5 px-2 py-1 text-[9px] uppercase tracking-widest text-white/25">
                  JSON
                </span>
              </div>

              <pre className="max-h-48 overflow-auto p-4 text-xs leading-6 text-white/35">
                {JSON.stringify(
                  serializeCircuit(circuit),
                  null,
                  2
                )}
              </pre>
            </div>

            {/* AI HINT */}

            <div className="mt-5 flex gap-3 rounded-2xl border border-violet-300/10 bg-violet-300/[0.025] p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-300/10">
                <Sparkles
                  size={16}
                  className="text-violet-300"
                />
              </div>

              <div>
                <div className="text-xs font-medium text-violet-200">
                  Quantum Copilot
                </div>

                <p className="mt-1 text-xs leading-5 text-white/35">
                  Build your circuit and run it to
                  receive an explanation of the quantum
                  state. AI assistance will use your actual
                  circuit and simulation results.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* RESULTS */}

        <aside className="w-full border-t border-white/10 bg-[#090d17] p-5 lg:w-[350px] lg:border-l lg:border-t-0">
          <ResultsPanel result={result} />
        </aside>
      </div>
    </main>
  );
}

function ResultsPanel({
  result,
}: {
  result: SimulationResult | null;
}) {
  if (!result) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.025]">
          <Atom
            size={24}
            className="text-white/20"
          />
        </div>

        <h2 className="mt-5 text-sm font-medium">
          No simulation yet
        </h2>

        <p className="mt-2 max-w-[230px] text-xs leading-5 text-white/25">
          Build a quantum circuit and press Run Circuit
          to see the statevector and measurement results.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/30">
          Simulation Results
        </div>

        <div className="mt-1 text-xs text-white/20">
          {result.shots.toLocaleString()} shots
        </div>
      </div>

      {/* STATEVECTOR */}

      <ResultCard title="Statevector">
        <div className="space-y-2 font-mono text-xs">
          {result.statevector.map(
            (amplitude, index) => {
              if (
                amplitude.magnitude <
                0.000001
              ) {
                return null;
              }

              const basis = index
                .toString(2)
                .padStart(
                  result.num_qubits,
                  "0"
                );

              return (
                <div
                  key={index}
                  className="flex items-center justify-between"
                >
                  <span className="text-white/50">
                    |{basis}⟩
                  </span>

                  <span className="text-cyan-200">
                    {amplitude.real.toFixed(3)}
                    {amplitude.imaginary >= 0
                      ? "+"
                      : ""}
                    {amplitude.imaginary.toFixed(3)}
                    i
                  </span>
                </div>
              );
            }
          )}
        </div>
      </ResultCard>

      {/* PROBABILITIES */}

      <ResultCard title="Probabilities">
        <div className="space-y-4">
          {Object.entries(
            result.probabilities
          ).map(([state, probability]) => (
            <div key={state}>
              <div className="mb-1.5 flex justify-between font-mono text-[11px]">
                <span className="text-white/50">
                  |{state}⟩
                </span>

                <span className="text-white/35">
                  {(
                    probability * 100
                  ).toFixed(1)}
                  %
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-cyan-300 transition-all duration-700"
                  style={{
                    width: `${probability * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </ResultCard>

      {/* COUNTS */}

      <ResultCard title="Measurements">
        <div className="space-y-2">
          {Object.entries(
            result.counts
          ).map(([state, count]) => (
            <div
              key={state}
              className="flex items-center justify-between rounded-lg bg-white/[0.025] px-3 py-2"
            >
              <span className="font-mono text-xs text-white/50">
                |{state}⟩
              </span>

              <span className="font-mono text-xs text-white/70">
                {count}
              </span>
            </div>
          ))}
        </div>
      </ResultCard>
    </div>
  );
}

function ResultCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="mb-4 text-xs font-medium text-white/40">
        {title}
      </div>

      {children}
    </div>
  );
}