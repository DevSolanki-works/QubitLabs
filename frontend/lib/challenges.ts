export type ChallengeGateRequirement = {
  gate: string;
  qubit?: number;
  control?: number;
  target?: number;
};

export type ChallengeOrderRequirement = {
  beforeGate: string;
  beforeQubit?: number;
  afterGate: string;
  afterQubit?: number;
};

export type Challenge = {
  id: string;
  lessonId: string;
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  instruction: string;
  hint?: string;
  educationalSummary: string;
  copilotStarter: string;
  requiredGates: ChallengeGateRequirement[];
  gateOrder?: ChallengeOrderRequirement[];
  targetProbabilities?: Record<string, number>;
  targetCondition?: {
    type: "qubit_probability";
    qubit: number;
    expectedValue: 0 | 1;
    minProbability: number;
    description: string;
  };
};

export const challenges: Challenge[] = [
  {
    id: "qubit-basics-01",
    lessonId: "qubit-basics",
    title: "Quantum NOT (Bit Flip)",
    difficulty: "Beginner",
    instruction:
      "Add a Pauli-X gate to q0 and run the circuit. Flip qubit 0 from |0⟩ into |1⟩.",
    hint: "Select the X gate from the palette and place it on qubit 0.",
    educationalSummary:
      "You successfully performed a bit flip! The Pauli-X gate acts like a classical NOT gate, rotating the state vector from |0⟩ (North pole) to |1⟩ (South pole) on the Bloch sphere.",
    copilotStarter:
      "I just completed the Quantum NOT challenge using an X gate on q0. Why does the X gate rotate the Bloch vector by π radians?",
    requiredGates: [
      {
        gate: "X",
        qubit: 0,
      },
    ],
    targetProbabilities: {
      "01": 1.0,
    },
  },
  {
    id: "measurement-01",
    lessonId: "measurement",
    title: "Deterministic Basis Measurement",
    difficulty: "Beginner",
    instruction:
      "Run the default circuit or place an X gate, then click Run Circuit to observe deterministic measurement collapse.",
    hint: "Click the Run Circuit button in the toolbar to simulate 1,024 shots.",
    educationalSummary:
      "You observed quantum measurement! When a quantum state aligns with a basis state, measuring it yields the same deterministic outcome across all shots with 0% variance.",
    copilotStarter:
      "How does quantum measurement collapse the state vector according to Born's rule?",
    requiredGates: [],
  },
  {
    id: "superposition-01",
    lessonId: "superposition",
    title: "Create Equal Superposition",
    difficulty: "Beginner",
    instruction:
      "Add an H (Hadamard) gate to q0 and run the circuit. Create an equal superposition on q0 while q1 remains in |0⟩.",
    hint: "Place an H gate on the first qubit (q0) and press Run Circuit.",
    educationalSummary:
      "You created an equal superposition! The H gate transformed |0⟩ into (|0⟩ + |1⟩)/√2. Because q1 remained |0⟩, the joint state is (|00⟩ + |01⟩)/√2, yielding ~50% |00⟩ and ~50% |01⟩ measurements.",
    copilotStarter:
      "I just created an equal superposition on q0 using the H gate. Why does the simulator show approximately 50% for |00> and 50% for |01>?",
    requiredGates: [
      {
        gate: "H",
        qubit: 0,
      },
    ],
    targetProbabilities: {
      "00": 0.5,
      "01": 0.5,
    },
  },
  {
    id: "entanglement-01",
    lessonId: "entanglement",
    title: "Generate a Bell State (|Φ⁺⟩)",
    difficulty: "Intermediate",
    instruction:
      "Create an entangled Bell pair: place an H gate on q0, then add a CNOT gate with control q0 and target q1.",
    hint: "The H gate must be in an earlier column than the CNOT gate.",
    educationalSummary:
      "You generated the maximally entangled Bell state (|00⟩ + |11⟩)/√2! The two qubits are now fundamentally correlated: outcomes |01⟩ and |10⟩ never occur, proving the qubits are not independent.",
    copilotStarter:
      "I just created a Bell state with H on q0 and CNOT(0->1). Why are the measurement outcomes always matching (|00> or |11>) and never mismatched?",
    requiredGates: [
      {
        gate: "H",
        qubit: 0,
      },
      {
        gate: "CNOT",
        control: 0,
        target: 1,
      },
    ],
    gateOrder: [
      {
        beforeGate: "H",
        beforeQubit: 0,
        afterGate: "CNOT",
      },
    ],
    targetProbabilities: {
      "00": 0.5,
      "11": 0.5,
    },
  },
  {
    id: "deutsch-01",
    lessonId: "deutsch-jozsa",
    title: "Deutsch Algorithm & Phase Kickback",
    difficulty: "Intermediate",
    instruction:
      "Implement Deutsch's algorithm for a balanced oracle: put q1 in |−⟩ (X then H), put q0 in |+⟩ (H), apply CNOT(control q0 -> target q1), and measure interference with H on q0.",
    hint: "q1 needs X then H. q0 needs H before CNOT, and another H after CNOT.",
    educationalSummary:
      "You demonstrated quantum phase kickback! The negative eigenvalue of the |−⟩ ancilla qubit kicked back into the phase of q0 when q0=1. The final H gate caused constructive interference at |1⟩, confirming a balanced oracle in a single query.",
    copilotStarter:
      "How does phase kickback in Deutsch's algorithm cause destructive interference at |0> and constructive interference at |1> on qubit 0?",
    requiredGates: [
      { gate: "X", qubit: 1 },
      { gate: "H", qubit: 1 },
      { gate: "H", qubit: 0 },
      { gate: "CNOT", control: 0, target: 1 },
    ],
    targetCondition: {
      type: "qubit_probability",
      qubit: 0,
      expectedValue: 1,
      minProbability: 0.9,
      description: "Qubit 0 must measure to |1⟩ with ≥ 90% probability (proving balanced oracle)",
    },
  },
  {
    id: "grover-01",
    lessonId: "grovers-algorithm",
    title: "Grover Oracle & Superposition",
    difficulty: "Advanced",
    instruction:
      "Mark target state |11⟩: place H on both q0 and q1 (equal superposition), then implement the oracle phase inversion (H on q1, CNOT 0->1, H on q1).",
    hint: "Both qubits need H gates to enter superposition. Then apply a Controlled-Z (H on q1, CNOT 0->1, H on q1) to mark |11⟩ with a negative phase.",
    educationalSummary:
      "You implemented the Grover Oracle! All 4 states now exist in equal probability, but target state |11⟩ has its phase inverted to -1. The subsequent Grover diffuser reflects all amplitudes about the mean to amplify |11⟩ toward 100%.",
    copilotStarter:
      "In Grover's algorithm, why does flipping the phase of target state |11> enable the diffusion operator to amplify its probability?",
    requiredGates: [
      { gate: "H", qubit: 0 },
      { gate: "H", qubit: 1 },
      { gate: "CNOT", control: 0, target: 1 },
    ],
    targetProbabilities: {
      "11": 1.0,
    },
  },
];

export function getAllChallenges(): Challenge[] {
  return challenges;
}

export function getChallengeById(id: string): Challenge | undefined {
  return challenges.find((challenge) => challenge.id === id);
}

export function getChallengeForLesson(lessonId: string): Challenge | undefined {
  return challenges.find((challenge) => challenge.lessonId === lessonId);
}
