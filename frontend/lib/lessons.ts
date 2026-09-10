export type LessonDifficulty = "Beginner" | "Intermediate" | "Advanced";

export type LessonLevel =
  | "Level 1: Quantum Foundations"
  | "Level 2: Gates & Multi-Qubit Systems"
  | "Level 3: Quantum Algorithms"
  | "Level 4: Frontier & NISQ";

export type Lesson = {
  id: string;
  number: number;
  level: LessonLevel;
  levelNumber: number;
  title: string;
  subtitle: string;
  description: string;
  difficulty: LessonDifficulty;
  duration: string;
  concept: string;
  whyItMatters: string;
  visualIntuition: string;
  task: string;
  color: string;
  challengeId?: string;
  xpReward: number;
};

export const lessons: Lesson[] = [
  // --- LEVEL 1: QUANTUM FOUNDATIONS ---
  {
    id: "qubit-basics",
    number: 1,
    level: "Level 1: Quantum Foundations",
    levelNumber: 1,
    title: "Qubit Basics",
    subtitle: "Meet the fundamental building block of quantum computing",
    description:
      "Understand what a qubit is, how |0⟩ and |1⟩ represent quantum states, and why qubits differ fundamentally from classical bits through complex probability amplitudes.",
    difficulty: "Beginner",
    duration: "6 min",
    concept:
      "A qubit is a two-level quantum system represented as |ψ⟩ = α|0⟩ + β|1⟩, where α and β are complex probability amplitudes satisfying the normalization constraint |α|² + |β|² = 1.",
    whyItMatters:
      "Unlike classical bits which are strictly 0 or 1 at any moment, a qubit's continuous state space allows quantum algorithms to process complex superpositions simultaneously.",
    visualIntuition:
      "Imagine the computational basis |0⟩ as pointing straight up to the North Pole of a 3D globe, and |1⟩ as pointing straight down to the South Pole. An untouched qubit begins in |0⟩.",
    task: "Explore the |0⟩ state on qubit 0 and use the Pauli-X gate to perform a quantum NOT flip into |1⟩.",
    color: "cyan",
    challengeId: "qubit-basics-01",
    xpReward: 50,
  },
  {
    id: "measurement",
    number: 2,
    level: "Level 1: Quantum Foundations",
    levelNumber: 1,
    title: "Measurement & Wavefunction Collapse",
    subtitle: "See how quantum superpositions collapse into classical reality",
    description:
      "Discover Born's rule: observing a quantum system projects its continuous statevector into a single classical outcome (0 or 1) with probabilities determined by amplitude squared magnitudes.",
    difficulty: "Beginner",
    duration: "8 min",
    concept:
      "Quantum measurement is destructive and non-unitary. Upon measuring |ψ⟩ = α|0⟩ + β|1⟩ in the standard basis, the probability of obtaining outcome '0' is P(0) = |α|² and '1' is P(1) = |β|².",
    whyItMatters:
      "Quantum computers must eventually output classical answers. Understanding Born's rule is essential because quantum algorithms are engineered so that wrong answers destructively cancel out while correct answers constructively amplify before measurement.",
    visualIntuition:
      "Before measurement, the statevector is an intact vector in Hilbert space. The instant a detector interacts with it, the state snaps along the measurement axis into either the North Pole (|0⟩) or South Pole (|1⟩).",
    task: "Simulate 1,024 measurement shots on AerSimulator to observe how finite statistical counts converge to exact analytical statevector probabilities.",
    color: "blue",
    challengeId: "measurement-01",
    xpReward: 50,
  },
  {
    id: "superposition",
    number: 3,
    level: "Level 1: Quantum Foundations",
    levelNumber: 1,
    title: "Superposition",
    subtitle: "Put a qubit into two states at once using the Hadamard gate",
    description:
      "Discover how the Hadamard (H) gate creates an equal superposition of |0⟩ and |1⟩, turning a deterministic state into a true quantum coin flip with equal probability.",
    difficulty: "Beginner",
    duration: "8 min",
    concept:
      "The Hadamard gate acts as H|0⟩ = (|0⟩ + |1⟩)/√2 (designated |+⟩) and H|1⟩ = (|0⟩ - |1⟩)/√2 (designated |−⟩), creating equal measurement probabilities P(0) = 50% and P(1) = 50%.",
    whyItMatters:
      "Superposition is the launchpad for quantum advantage. By putting n qubits into an equal superposition of all 2ⁿ states, a quantum circuit can evaluate mathematical operations across an exponential state space simultaneously.",
    visualIntuition:
      "Applying an H gate to |0⟩ rotates the vector from the North Pole down by 90° onto the equator along the positive X-axis (+X). It is now equidistant from both poles.",
    task: "Add a Hadamard (H) gate to q0 and run the circuit to create an equal superposition.",
    color: "violet",
    challengeId: "superposition-01",
    xpReward: 50,
  },
  {
    id: "bloch-sphere",
    number: 4,
    level: "Level 1: Quantum Foundations",
    levelNumber: 1,
    title: "The Bloch Sphere",
    subtitle: "Visualize single-qubit states as geometric coordinates in 3D space",
    description:
      "Explore the standard Bloch sphere representation, connecting spherical angles θ (polar) and φ (azimuthal) to physical quantum states and rotations.",
    difficulty: "Beginner",
    duration: "7 min",
    concept:
      "Any pure single-qubit state can be written as |ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩, corresponding to a point (x, y, z) on a unit sphere S² where x = sinθ cosφ, y = sinθ sinφ, and z = cosθ.",
    whyItMatters:
      "The Bloch sphere provides direct geometric intuition for how quantum gates operate: every single-qubit unitary gate is simply a rigid 3D rotation of the sphere around a specific axis.",
    visualIntuition:
      "Think of the Bloch sphere like the Earth: |0⟩ is the North Pole, |1⟩ is the South Pole, |+⟩ is at 0° longitude on the Equator, and |+i⟩ is at 90° longitude on the Equator.",
    task: "Examine the 3D Bloch card in Quantum Lab and observe how different gates move the statevector between poles and equator.",
    color: "cyan",
    xpReward: 50,
  },

  // --- LEVEL 2: GATES & MULTI-QUBIT SYSTEMS ---
  {
    id: "quantum-gates",
    number: 5,
    level: "Level 2: Gates & Multi-Qubit Systems",
    levelNumber: 2,
    title: "Quantum Gates & Phase",
    subtitle: "Master the Pauli matrices, Phase (S) gate, and T gate",
    description:
      "Explore reversible unitary operations: Pauli-X (bit flip), Pauli-Z (phase flip), Pauli-Y, and the fractional phase gates S and T that enable universal quantum computation.",
    difficulty: "Intermediate",
    duration: "10 min",
    concept:
      "Single-qubit gates are 2×2 unitary matrices (U†U = I). Pauli-Z flips relative phase (Z|1⟩ = -|1⟩), the S gate shifts phase by π/2 (S|1⟩ = i|1⟩), and the T gate applies π/4.",
    whyItMatters:
      "Any arbitrary single-qubit rotation can be synthesized to high precision using a universal gate set composed solely of H, S, and T gates (the Solovay-Kitaev theorem).",
    visualIntuition:
      "Pauli-X is a 180° rotation around the X-axis. Pauli-Z is a 180° rotation around the Z-axis. The S and T gates rotate the vector around the Z-axis by 90° and 45° respectively.",
    task: "Build a circuit applying H followed by Z, S, and T gates, and observe how the Bloch vector rotates in the horizontal equator plane.",
    color: "emerald",
    xpReward: 60,
  },
  {
    id: "entanglement",
    number: 6,
    level: "Level 2: Gates & Multi-Qubit Systems",
    levelNumber: 2,
    title: "Quantum Entanglement",
    subtitle: "Create Einstein's 'spooky action at a distance' with Bell states",
    description:
      "Build a maximally entangled Bell pair where two qubits become intrinsically correlated: measuring one qubit instantaneously determines the state of the other.",
    difficulty: "Intermediate",
    duration: "10 min",
    concept:
      "Entangled states like |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 cannot be factored into the tensor product of two independent single-qubit states (|ψ_A⟩ ⊗ |ψ_B⟩). The system exists only as an indivisible composite state.",
    whyItMatters:
      "Entanglement is the non-classical resource powering quantum cryptography (E91), quantum teleportation, superdense coding, and exponential algorithm speedups.",
    visualIntuition:
      "If you inspect the individual Bloch sphere of either qubit in a Bell pair, the vector vanishes to (0, 0, 0) at the origin. Information does not reside in either qubit alone, but entirely in their shared correlations.",
    task: "Construct the Bell state |Φ⁺⟩ using an H gate on q0 followed by a CNOT from q0 to q1.",
    color: "purple",
    challengeId: "entanglement-01",
    xpReward: 75,
  },

  // --- LEVEL 3: QUANTUM ALGORITHMS ---
  {
    id: "deutsch-jozsa",
    number: 7,
    level: "Level 3: Quantum Algorithms",
    levelNumber: 3,
    title: "Deutsch-Jozsa Algorithm",
    subtitle: "The definitive proof of deterministic quantum speedup",
    description:
      "Determine whether an unknown black-box oracle function is constant or balanced in a single quantum query, whereas classical algorithms require exponential evaluations in the worst case.",
    difficulty: "Intermediate",
    duration: "12 min",
    concept:
      "Phase kickback transfers the oracle function value into the relative phase of the input register: |x⟩|−⟩ → (-1)^f(x)|x⟩|−⟩. Constructive or destructive interference on final Hadamard gates reveals global symmetry.",
    whyItMatters:
      "Deutsch-Jozsa historically provided the very first mathematical proof that a quantum computer could solve a problem strictly faster than any deterministic classical Turing machine.",
    visualIntuition:
      "Think of the circuit as an interferometer: if the oracle is constant, paths constructively reinforce state |0...0⟩; if balanced, phase inversions cause total destructive cancellation at |0...0⟩.",
    task: "Set up the ancilla qubit in |−⟩, input in |+⟩, apply the CNOT oracle, and measure interference on q0.",
    color: "amber",
    challengeId: "deutsch-01",
    xpReward: 80,
  },
  {
    id: "teleportation",
    number: 8,
    level: "Level 3: Quantum Algorithms",
    levelNumber: 3,
    title: "Quantum Teleportation",
    subtitle: "Transmit an unknown quantum state using entanglement and classical bits",
    description:
      "Disassemble an arbitrary quantum state |ψ⟩ using a Bell-basis measurement and faithfully reconstruct it on a distant receiver using only 2 classical bits of communication.",
    difficulty: "Advanced",
    duration: "12 min",
    concept:
      "Alice performs a Bell measurement on her unknown state |ψ⟩ and her half of a shared Bell pair. The measurement collapses the system, transmitting 2 classical bits to Bob who applies Pauli corrections (I, X, Z, or XZ).",
    whyItMatters:
      "Quantum teleportation is the bedrock protocol for quantum repeaters, distributed quantum computing, and the future Quantum Internet.",
    visualIntuition:
      "No physical matter or faster-than-light signal travels: quantum correlations pre-exist in the entangled channel, and the state only resolves after classical bits arrive.",
    task: "Trace the 3-qubit teleportation circuit and verify that Bob's final statevector matches Alice's initial state.",
    color: "blue",
    xpReward: 80,
  },
  {
    id: "grovers-algorithm",
    number: 9,
    level: "Level 3: Quantum Algorithms",
    levelNumber: 3,
    title: "Grover's Search Algorithm",
    subtitle: "Quadratic speedup for searching unstructured databases",
    description:
      "Search through N unsorted database records in O(√N) queries instead of classical O(N) by alternating oracle phase inversion and the Grover diffusion operator.",
    difficulty: "Advanced",
    duration: "15 min",
    concept:
      "Amplitude amplification rotates the statevector in a 2D subspace toward the target state by alternating reflections: an oracle phase flip followed by an inversion about the average amplitude (diffusion operator).",
    whyItMatters:
      "Grover search proves quadratic speedups across a vast array of NP-complete problems, constraint satisfaction, and collision search in cryptography.",
    visualIntuition:
      "Picture a bar graph of amplitudes: the oracle flips the target bar upside down; the diffusion operator flips all bars across the mean line, propelling the marked state far above the noise.",
    task: "Construct a 2-qubit Grover search circuit targeting state |11⟩ and observe probability amplification toward 100%.",
    color: "emerald",
    challengeId: "grover-01",
    xpReward: 90,
  },

  // --- LEVEL 4: FRONTIER & NISQ ---
  {
    id: "vqe-nisq",
    number: 10,
    level: "Level 4: Frontier & NISQ",
    levelNumber: 4,
    title: "VQE & Near-Term NISQ Systems",
    subtitle: "Hybrid quantum-classical algorithms for chemistry and optimization",
    description:
      "Explore how Noisy Intermediate-Scale Quantum (NISQ) devices calculate ground state molecular energies using shallow parameterized ansatz circuits and classical optimizers.",
    difficulty: "Advanced",
    duration: "14 min",
    concept:
      "The Variational Quantum Eigensolver (VQE) relies on the Rayleigh-Ritz variational principle: ⟨ψ(θ)|H|ψ(θ)⟩ ≥ E₀. A quantum processor computes expectation values while a classical optimizer updates θ to find minimum energy.",
    whyItMatters:
      "VQE is the flagship algorithm of the current NISQ era, providing the most promising route to practical quantum advantage in materials science and computational chemistry before fault-tolerant hardware arrives.",
    visualIntuition:
      "The quantum processor acts as a specialized coprocessor in a feedback loop: it evaluates high-dimensional quantum states that classical computers cannot represent, guiding classical gradient descent downhill toward the true ground state.",
    task: "Inspect parameterized rotations and understand how quantum expectation values drive classical energy minimization.",
    color: "amber",
    xpReward: 100,
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

export function getLessonsByLevel(): Record<LessonLevel, Lesson[]> {
  const grouped: Record<LessonLevel, Lesson[]> = {
    "Level 1: Quantum Foundations": [],
    "Level 2: Gates & Multi-Qubit Systems": [],
    "Level 3: Quantum Algorithms": [],
    "Level 4: Frontier & NISQ": [],
  };

  for (const lesson of lessons) {
    grouped[lesson.level].push(lesson);
  }

  return grouped;
}
