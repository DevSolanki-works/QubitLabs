export const SINGLE_QUBIT_GATES = [
  "H",
  "X",
  "Y",
  "Z",
  "S",
  "T",
] as const;

export type SingleQubitGate =
  (typeof SINGLE_QUBIT_GATES)[number];

export type GateType =
  | SingleQubitGate
  | "CNOT"
  | "M";

export interface SingleQubitOperation {
  id: string;
  type: SingleQubitGate | "M";
  qubit: number;
  column: number;
}

export interface CNOTOperation {
  id: string;
  type: "CNOT";
  control: number;
  target: number;
  column: number;
}

export type CircuitOperation =
  | SingleQubitOperation
  | CNOTOperation;

export interface QuantumCircuit {
  numQubits: number;
  numColumns: number;
  operations: CircuitOperation[];
}

export interface SimulationResult {
  num_qubits: number;

  circuit: Record<string, unknown>[];

  statevector: {
    real: number;
    imaginary: number;
    magnitude: number;
    phase: number;
  }[];

  probabilities: Record<string, number>;

  counts: Record<string, number>;

  bloch_vectors: BlochVector[];

  shots: number;
}

export interface BlochVector {
  qubit: number;
  x: number;
  y: number;
  z: number;
}