"use client";

import { useMemo } from "react";
import CircuitCell from "./CircuitCell";
import GateVisual from "./GateVisual";
import {
  addCNOT,
  addSingleQubitGate,
  removeOperation,
} from "@/lib/circuit";
import {
  CircuitOperation,
  QuantumCircuit,
} from "@/lib/quantum";
import { soundManager } from "@/lib/sound";

interface CircuitGridProps {
  circuit: QuantumCircuit;
  setCircuit: React.Dispatch<
    React.SetStateAction<QuantumCircuit>
  >;
  selectedGate: string | null;
}

export default function CircuitGrid({
  circuit,
  setCircuit,
  selectedGate,
}: CircuitGridProps) {
  const operationMap = useMemo(() => {
    const map = new Map<string, CircuitOperation>();

    circuit.operations.forEach(
      (operation) => {
        if (operation.type === "CNOT") {
          map.set(
            `${operation.control}-${operation.column}`,
            operation
          );

          map.set(
            `${operation.target}-${operation.column}`,
            operation
          );
        } else {
          map.set(
            `${operation.qubit}-${operation.column}`,
            operation
          );
        }
      }
    );

    return map;
  }, [circuit.operations]);

  const placeGate = (
    gate: string,
    row: number,
    column: number
  ) => {
    soundManager.playGate(gate);

    if (
      gate === "CNOT"
    ) {
      const target =
        row === 0 ? 1 : 0;

      setCircuit((current) =>
        addCNOT(
          current,
          row,
          target,
          column
        )
      );

      return;
    }

    if (
      ["H", "X", "Y", "Z", "S", "T", "M"].includes(
        gate
      )
    ) {
      setCircuit((current) =>
        addSingleQubitGate(
          current,
          gate as
            | "H"
            | "X"
            | "Y"
            | "Z"
            | "S"
            | "T"
            | "M",
          row,
          column
        )
      );
    }
  };

  const deleteGate = (id: string) => {
    soundManager.playClick();
    setCircuit((current) =>
      removeOperation(current, id)
    );
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0b101c]">
      <div
        className="min-w-[720px]"
        style={{
          minWidth:
            96 +
            circuit.numColumns * 80,
        }}
      >
        {/* Column numbers */}

        <div className="flex h-9 border-b border-white/[0.07]">
          <div className="w-16 shrink-0" />

          {Array.from({
            length: circuit.numColumns,
          }).map((_, column) => (
            <div
              key={column}
              className="flex min-w-20 flex-1 items-center justify-center font-mono text-[10px] text-white/20"
            >
              {column}
            </div>
          ))}
        </div>

        {/* Qubit rows */}

        {Array.from({
          length: circuit.numQubits,
        }).map((_, row) => (
          <div
            key={row}
            className="flex border-b border-white/[0.07] last:border-b-0"
          >
            <div className="flex w-16 shrink-0 items-center justify-center border-r border-white/[0.07]">
              <span className="font-mono text-sm text-cyan-300/70">
                q{row}
              </span>
            </div>

            {Array.from({
              length: circuit.numColumns,
            }).map((_, column) => {
              const operation =
                operationMap.get(
                  `${row}-${column}`
                );

              const isCNOT =
                operation?.type === "CNOT";

              const isControl =
                isCNOT &&
                operation.control === row;

              const isTarget =
                isCNOT &&
                operation.target === row;

              return (
                <CircuitCell
                  key={`${row}-${column}`}
                  row={row}
                  column={column}
                  onDrop={placeGate}
                  onClick={() => {
                    if (selectedGate) {
                      placeGate(
                        selectedGate,
                        row,
                        column
                      );
                    }
                  }}
                >
                  {operation && (
                    <>
                      {isCNOT && (
                        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-violet-300/30" />
                      )}

                      {isControl &&
                            operation.type === "CNOT" && (
                                <GateVisual
                                operation={operation}
                                role="control"
                                onDelete={deleteGate}
                                />
                            )}

                            {isTarget &&
                            operation.type === "CNOT" && (
                                <GateVisual
                                operation={operation}
                                role="target"
                                onDelete={deleteGate}
                                />
                            )}
                      {!isCNOT && (
                        <GateVisual
                          operation={operation}
                          onDelete={deleteGate}
                        />
                      )}
                    </>
                  )}
                </CircuitCell>
              );
            })}
          </div>
        ))}

        {/* Measurement / state line */}

        <div className="flex h-10">
          <div className="w-16 shrink-0" />

          {Array.from({
            length: circuit.numColumns,
          }).map((_, column) => (
            <div
              key={column}
              className="flex min-w-20 flex-1 items-center justify-center"
            >
              <span className="text-[9px] text-white/15">
                ─
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}