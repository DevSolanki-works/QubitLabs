export type Lesson = {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  difficulty: "Beginner" | "Intermediate";
  duration: string;
  concept: string;
  task: string;
  color: string;
};

export const lessons: Lesson[] = [
  {
    id: "qubit-basics",
    number: 1,
    title: "Qubit Basics",
    subtitle: "Meet the building block of quantum computing",
    description:
      "Understand what a qubit is, how |0⟩ and |1⟩ represent quantum states, and why qubits are different from classical bits.",
    difficulty: "Beginner",
    duration: "5 min",
    concept: "A qubit is the basic unit of quantum information.",
    task: "Explore the |0⟩ state and see what happens when you measure it.",
    color: "cyan",
  },
  {
    id: "measurement",
    number: 2,
    title: "Measurement",
    subtitle: "See how quantum states become classical results",
    description:
      "Learn what measurement does to a qubit and how repeated measurements produce probability distributions.",
    difficulty: "Beginner",
    duration: "7 min",
    concept: "Measurement converts a quantum state into a classical outcome.",
    task: "Run a simple circuit and inspect its measurement results.",
    color: "blue",
  },
  {
    id: "superposition",
    number: 3,
    title: "Superposition",
    subtitle: "Put a qubit in two states at once",
    description:
      "Discover how the Hadamard gate creates an equal superposition and why measurements become approximately 50/50.",
    difficulty: "Beginner",
    duration: "8 min",
    concept: "The H gate can create an equal superposition of |0⟩ and |1⟩.",
    task: "Create an equal superposition using an H gate.",
    color: "violet",
  },
  {
    id: "entanglement",
    number: 4,
    title: "Entanglement",
    subtitle: "Create a pair of correlated qubits",
    description:
      "Build a Bell state and observe how two qubits can become correlated through entanglement.",
    difficulty: "Intermediate",
    duration: "10 min",
    concept: "Entangled qubits can show correlations that cannot be explained by treating them independently.",
    task: "Build a Bell state using H and CNOT.",
    color: "purple",
  },
  {
    id: "quantum-algorithms",
    number: 5,
    title: "Quantum Algorithms",
    subtitle: "Turn quantum concepts into algorithms",
    description:
      "Start connecting quantum gates to useful algorithms and discover how circuits can solve specific computational problems.",
    difficulty: "Intermediate",
    duration: "12 min",
    concept: "Quantum algorithms combine gates into circuits designed to solve computational tasks.",
    task: "Explore your first quantum algorithm circuit.",
    color: "emerald",
  },
];