export type LessonDifficulty = "Beginner" | "Intermediate" | "Advanced";

export type Lesson = {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  difficulty: LessonDifficulty;
  duration: string;
  concept: string;
  task: string;
  color: string;
  challengeId?: string;
};

export const lessons: Lesson[] = [
  {
    id: "qubit-basics",
    number: 1,
    title: "Qubit Basics",
    subtitle: "Meet the fundamental building block of quantum computing",
    description:
      "Understand what a qubit is, how |0⟩ and |1⟩ represent quantum states, and why qubits differ fundamentally from classical bits through statevectors and the Bloch sphere.",
    difficulty: "Beginner",
    duration: "5 min",
    concept:
      "A qubit is a two-state quantum system represented as |ψ⟩ = α|0⟩ + β|1⟩, where α and β are complex amplitudes such that |α|² + |β|² = 1.",
    task: "Explore the |0⟩ state and use the Pauli-X gate to flip qubit 0 to |1⟩.",
    color: "cyan",
    challengeId: "qubit-basics-01",
  },
  {
    id: "measurement",
    number: 2,
    title: "Measurement & Collapse",
    subtitle: "See how quantum states collapse into classical outcomes",
    description:
      "Discover Born's rule: measuring a qubit projects its quantum superposition into a definite classical outcome (0 or 1) with probabilities determined by amplitude squares.",
    difficulty: "Beginner",
    duration: "7 min",
    concept:
      "Quantum measurement is destructive and non-unitary: it forces the state vector to collapse to one of the computational basis states.",
    task: "Run the simulator with 1,024 shots to observe how statistical measurement counts reflect exact quantum statevector probabilities.",
    color: "blue",
    challengeId: "measurement-01",
  },
  {
    id: "superposition",
    number: 3,
    title: "Superposition",
    subtitle: "Put a qubit into two states at once",
    description:
      "Discover how the Hadamard (H) gate creates an equal superposition of |0⟩ and |1⟩, turning a deterministic qubit into a true 50/50 quantum coin flip.",
    difficulty: "Beginner",
    duration: "8 min",
    concept:
      "The Hadamard gate maps |0⟩ to (|0⟩ + |1⟩)/√2 and |1⟩ to (|0⟩ - |1⟩)/√2, pointing the Bloch vector along the +X axis.",
    task: "Add an H gate to q0 and run the circuit to create an equal superposition.",
    color: "violet",
    challengeId: "superposition-01",
  },
  {
    id: "entanglement",
    number: 4,
    title: "Quantum Entanglement",
    subtitle: "Create Einstein's 'spooky action at a distance'",
    description:
      "Build a maximally entangled Bell state where two qubits become intrinsically correlated. Measuring one qubit instantaneously determines the outcome of the other.",
    difficulty: "Intermediate",
    duration: "10 min",
    concept:
      "Entangled states like |Φ+⟩ = (|00⟩ + |11⟩)/√2 cannot be written as the tensor product of two independent single-qubit states.",
    task: "Construct a Bell state using an H gate on q0 followed by a CNOT from q0 to q1.",
    color: "purple",
    challengeId: "entanglement-01",
  },
  {
    id: "deutsch-jozsa",
    number: 5,
    title: "Deutsch-Jozsa Algorithm",
    subtitle: "The first proof of exponential quantum advantage",
    description:
      "Determine whether a black-box oracle function is constant (returns same output for all inputs) or balanced (returns 0 for half, 1 for half) with a single quantum evaluation.",
    difficulty: "Intermediate",
    duration: "12 min",
    concept:
      "Phase kickback transfers the oracle's output into the relative phase of the input qubit, allowing constructive/destructive interference to reveal global properties in one shot.",
    task: "Set up the ancilla qubit in |−⟩, input in |+⟩, apply the CNOT oracle, and measure interference on q0.",
    color: "amber",
    challengeId: "deutsch-01",
  },
  {
    id: "grovers-algorithm",
    number: 6,
    title: "Grover's Search Algorithm",
    subtitle: "Quadratic speedup for unstructured search",
    description:
      "Search through N unsorted items in O(√N) iterations instead of classical O(N) by repeatedly applying an oracle phase inversion followed by the Grover diffusion operator.",
    difficulty: "Advanced",
    duration: "15 min",
    concept:
      "Amplitude amplification rotates the state vector in a 2D subspace toward the target state by reflecting successively about the orthogonal state and the superposition mean.",
    task: "Construct a 2-qubit Grover search circuit targeting state |11⟩ and observe probability amplification.",
    color: "emerald",
    challengeId: "grover-01",
  },
];

export function getLessonById(id: string): Lesson | undefined {
  return lessons.find((lesson) => lesson.id === id);
}

export function getNextLesson(currentLessonId: string): Lesson | null {
  const currentIndex = lessons.findIndex((l) => l.id === currentLessonId);
  if (currentIndex === -1 || currentIndex === lessons.length - 1) {
    return null;
  }
  return lessons[currentIndex + 1];
}

export function getPreviousLesson(currentLessonId: string): Lesson | null {
  const currentIndex = lessons.findIndex((l) => l.id === currentLessonId);
  if (currentIndex <= 0) {
    return null;
  }
  return lessons[currentIndex - 1];
}
