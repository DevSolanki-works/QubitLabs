export type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type LessonQuiz = {
  lessonId: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
};

export const QUIZZES: Record<string, LessonQuiz> = {
  "qubit-basics": {
    lessonId: "qubit-basics",
    title: "Qubit Foundations & Amplitudes",
    description: "Verify your understanding of statevectors, normalization, and basis states.",
    questions: [
      {
        id: "qb-q1",
        prompt:
          "A single qubit state is represented as |ψ⟩ = α|0⟩ + β|1⟩. What mathematical constraint must the probability amplitudes satisfy?",
        options: [
          "α + β = 1",
          "|α|² + |β|² = 1",
          "α² + β² = 0",
          "|α| + |β| = 1",
        ],
        correctIndex: 1,
        explanation:
          "Quantum mechanics requires normalization: the sum of the squared magnitudes of the probability amplitudes |α|² + |β|² must equal 1, guaranteeing that the total measurement probability across all computational basis states is 100%.",
      },
      {
        id: "qb-q2",
        prompt:
          "If a qubit begins in computational ground state |0⟩, what state is produced after applying a Pauli-X gate?",
        options: [
          "|0⟩ (unchanged)",
          "(|0⟩ + |1⟩)/√2",
          "|1⟩",
          "-|0⟩",
        ],
        correctIndex: 2,
        explanation:
          "The Pauli-X gate is the quantum analog of a classical NOT gate. In matrix form it exchanges computational basis states: X|0⟩ = |1⟩ and X|1⟩ = |0⟩.",
      },
      {
        id: "qb-q3",
        prompt:
          "According to Holevo's theorem, how many classical bits of information can you extract by measuring a single isolated qubit?",
        options: [
          "Infinite bits, because amplitudes are continuous complex numbers",
          "At most 1 classical bit",
          "2 classical bits",
          "0 bits, because measurement destroys the state",
        ],
        correctIndex: 1,
        explanation:
          "Holevo's bound states that despite possessing infinite continuous statevector possibilities before measurement, measuring a single qubit can yield at most 1 classical bit of accessible information.",
      },
    ],
  },
  "measurement": {
    lessonId: "measurement",
    title: "Measurement & Wavefunction Collapse",
    description: "Test your intuition on Born's rule, projection, and shot statistics.",
    questions: [
      {
        id: "ms-q1",
        prompt:
          "According to Born's rule, if a qubit is prepared in state |ψ⟩ = (1/2)|0⟩ + (√3/2)|1⟩, what is the exact probability of measuring classical bit 1?",
        options: ["25%", "50%", "75%", "100%"],
        correctIndex: 2,
        explanation:
          "The probability amplitude for |1⟩ is β = √3/2. By Born's rule, the measurement probability P(1) = |β|² = (√3/2)² = 3/4 = 75%.",
      },
      {
        id: "ms-q2",
        prompt:
          "What happens to the quantum state immediately after a projective measurement in the computational basis reveals 0?",
        options: [
          "It remains in its previous superposition",
          "It collapses irreversibly to |0⟩",
          "It flips into |1⟩ due to backaction",
          "It is erased into an undefined state",
        ],
        correctIndex: 1,
        explanation:
          "Quantum measurement is projective and non-unitary. Observing outcome 0 collapses the wavefunction entirely into basis state |0⟩; any subsequent measurement immediately afterward will yield 0 with 100% certainty.",
      },
      {
        id: "ms-q3",
        prompt:
          "Why do quantum circuit simulators like Qiskit Aer execute circuits across many 'shots' (e.g. 1024 shots)?",
        options: [
          "Because quantum gates are unreliable and take several tries to execute",
          "To statistically reconstruct statevector probabilities from discrete measurement samples",
          "To heat up the simulated processor",
          "Because Born's rule only works on large shot numbers",
        ],
        correctIndex: 1,
        explanation:
          "Physical quantum computers only produce a single classical bitstring per circuit run. Running multiple shots generates empirical frequencies that converge to the underlying statevector probabilities according to the law of large numbers.",
      },
    ],
  },
  "superposition": {
    lessonId: "superposition",
    title: "Superposition & The Hadamard Transformation",
    description: "Verify your grasp of constructive interference and equal superposition.",
    questions: [
      {
        id: "sp-q1",
        prompt:
          "What quantum state is created when a Hadamard (H) gate is applied to basis state |0⟩?",
        options: [
          "|1⟩",
          "(|0⟩ + |1⟩)/√2 (denoted |+⟩)",
          "(|0⟩ - |1⟩)/√2 (denoted |−⟩)",
          "i|1⟩",
        ],
        correctIndex: 1,
        explanation:
          "The Hadamard gate creates an equal superposition: H|0⟩ = (|0⟩ + |1⟩)/√2. This state is conventionally designated as |+⟩ and points along the positive X-axis on the Bloch sphere.",
      },
      {
        id: "sp-q2",
        prompt:
          "If you apply two consecutive Hadamard gates (H · H) to state |0⟩ in an ideal simulator, what is the final state?",
        options: [
          "|0⟩",
          "|1⟩",
          "|+⟩",
          "|−⟩",
        ],
        correctIndex: 0,
        explanation:
          "The Hadamard matrix is both Hermitian (H† = H) and unitary (H†H = I). Therefore H · H = I (the identity operator), which cleanly returns the qubit to its original state |0⟩.",
      },
      {
        id: "sp-q3",
        prompt:
          "What is the key difference between quantum superposition and a classical parallel processor evaluating all inputs?",
        options: [
          "Classical parallel processors are faster",
          "Quantum superposition allows destructive interference to cancel wrong answers",
          "Quantum superposition only works on numbers up to 10",
          "Classical parallel computers cannot run algorithms",
        ],
        correctIndex: 1,
        explanation:
          "Parallel evaluation is useless if you can only read out 1 random answer at the end. Quantum algorithms use relative phases in superposition so that undesirable paths destructively cancel while the desired answer constructively reinforces.",
      },
    ],
  },
  "bloch-sphere": {
    lessonId: "bloch-sphere",
    title: "Bloch Sphere & Geometric Rotations",
    description: "Assess your visualization of 3D statevectors and spherical coordinates.",
    questions: [
      {
        id: "bs-q1",
        prompt:
          "On the standard Bloch sphere representation, which quantum states correspond to the North and South poles?",
        options: [
          "|+⟩ and |−⟩",
          "|0⟩ (North pole) and |1⟩ (South pole)",
          "|+i⟩ and |−i⟩",
          "|00⟩ and |11⟩",
        ],
        correctIndex: 1,
        explanation:
          "In the standard Bloch sphere parameterization |ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩, θ=0 corresponds to the North pole (|0⟩) and θ=π corresponds to the South pole (|1⟩).",
      },
      {
        id: "bs-q2",
        prompt:
          "What is the radius length r of the Bloch vector for an entangled subsystem or mixed state compared to a pure state?",
        options: [
          "Always strictly equal to 1",
          "Strictly greater than 1",
          "Strictly less than 1 (r < 1), reaching 0 at the origin",
          "Complex valued",
        ],
        correctIndex: 2,
        explanation:
          "Pure single-qubit states reside on the surface of the sphere with radius r = 1. Subsystems of entangled pairs (like either qubit in a Bell state) are completely mixed states with r = 0 at the exact center of the Bloch sphere.",
      },
      {
        id: "bs-q3",
        prompt:
          "Why does the parameterization of the Bloch sphere use θ/2 instead of θ?",
        options: [
          "To divide the power requirements in half",
          "Because qubits are spin-1/2 quantum particles, requiring a 720° (4π) rotation to return to their initial state with positive sign",
          "Because classical computers can only count in half-steps",
          "It is an arbitrary aesthetic convention",
        ],
        correctIndex: 1,
        explanation:
          "Qubits are quantum spin-1/2 systems (spinors). Under a 360° rotation (θ = 2π), the statevector acquires a geometric sign flip (-1). A full 720° rotation is required to return to the identical quantum statevector.",
      },
    ],
  },
  "quantum-gates": {
    lessonId: "quantum-gates",
    title: "Pauli & Phase Transformations",
    description: "Test your understanding of unitary gates and relative phase shifts.",
    questions: [
      {
        id: "qg-q1",
        prompt:
          "Which single-qubit gate applies a relative phase shift of π/2 radians, multiplying the |1⟩ amplitude by imaginary unit i?",
        options: [
          "Pauli-X Gate",
          "Pauli-Z Gate",
          "Phase (S) Gate",
          "T Gate (π/8)",
        ],
        correctIndex: 2,
        explanation:
          "The S gate (Phase gate) has matrix representation diag(1, i). It leaves |0⟩ unchanged while shifting the relative phase of |1⟩ by e^(iπ/2) = i.",
      },
      {
        id: "qg-q2",
        prompt:
          "Why must all quantum logic gates (excluding measurement) be represented by unitary matrices (U†U = I)?",
        options: [
          "To allow faster classical compilation",
          "To preserve total probability conservation (norm = 1) and ensure reversibility",
          "Because superconducting qubits only support square matrices",
          "To prevent quantum entanglement from forming",
        ],
        correctIndex: 1,
        explanation:
          "Unitary operators preserve the Euclidean inner product. This mathematically ensures that probability amplitudes always remain normalized (sum of squared magnitudes equals 1) and that quantum evolution is strictly reversible without information loss.",
      },
      {
        id: "qg-q3",
        prompt:
          "According to the Solovay-Kitaev theorem, which gate set is capable of approximating any arbitrary single-qubit rotation to arbitrary precision?",
        options: [
          "Only Pauli-X and Pauli-Y",
          "Hadamard (H), Phase (S), and T gates",
          "Measurement gates alone",
          "Only classical NOT and AND gates",
        ],
        correctIndex: 1,
        explanation:
          "The Clifford+T gate set (specifically H, S, and T) forms a universal single-qubit gate set. Any arbitrary unitary rotation can be approximated with exponential precision using polylogarithmic sequences of these discrete gates.",
      },
    ],
  },
  "entanglement": {
    lessonId: "entanglement",
    title: "Quantum Entanglement & Bell States",
    description: "Verify your understanding of non-separable multi-qubit systems and correlations.",
    questions: [
      {
        id: "et-q1",
        prompt:
          "In the canonical Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2, if Alice measures her qubit and observes outcome 1, what will Bob observe when he measures his qubit?",
        options: [
          "0 with 100% certainty",
          "1 with 100% certainty",
          "50% chance of 0 and 50% chance of 1",
          "Bob cannot measure his qubit",
        ],
        correctIndex: 1,
        explanation:
          "The Bell state |Φ⁺⟩ contains nonzero amplitudes only for basis states |00⟩ and |11⟩. When Alice observes 1, the composite wavefunction instantaneously collapses into |11⟩, meaning Bob's measurement will deterministically yield 1.",
      },
      {
        id: "et-q2",
        prompt:
          "Can an entangled Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 be expressed as a tensor product of two independent single-qubit states |ψ_A⟩ ⊗ |ψ_B⟩?",
        options: [
          "Yes, if written in the Hadamard basis",
          "Yes, provided both qubits have zero phase",
          "No, this non-separability is the formal mathematical definition of entanglement",
          "Only when simulated on classical computers",
        ],
        correctIndex: 2,
        explanation:
          "Quantum entanglement is formally defined by non-separability: an entangled state cannot be decomposed into a tensor product of individual statevectors (|ψ_A⟩ ⊗ |ψ_B⟩). The quantum state describes the joint system as an indivisible whole.",
      },
      {
        id: "et-q3",
        prompt:
          "Why does quantum entanglement NOT allow faster-than-light communication between distant observers (No-Communication Theorem)?",
        options: [
          "Because quantum signals slow down when passing through fiber optic cables",
          "Because Alice's individual measurement result is completely random, leaving Bob's local density matrix unchanged without classical coordination",
          "Because entangled pairs collapse after 1 nanosecond",
          "Because Einstein's equations forbid entanglement",
        ],
        correctIndex: 1,
        explanation:
          "The No-Communication Theorem proves that because local measurement outcomes are genuinely probabilistic, an observer cannot force a specific outcome to transmit a message. Bob's local reduced density matrix remains identical regardless of whether Alice measures her qubit.",
      },
    ],
  },
  "deutsch-jozsa": {
    lessonId: "deutsch-jozsa",
    title: "Phase Kickback & The Deutsch-Jozsa Algorithm",
    description: "Assess your knowledge of quantum parallelism and destructive interference.",
    questions: [
      {
        id: "dj-q1",
        prompt:
          "What is 'phase kickback' in quantum computing algorithms like Deutsch-Jozsa?",
        options: [
          "Hardware noise bouncing back into the control electronics",
          "An eigenvalue / phase factor of the target ancilla qubit being transferred into the relative phase of the control qubit",
          "A classical feedback loop that re-runs the circuit",
          "A measurement error caused by thermal dissipation",
        ],
        correctIndex: 1,
        explanation:
          "Phase kickback occurs when an oracle operator acts on an ancilla qubit prepared in an eigenstate (such as |−⟩ = (|0⟩ - |1⟩)/√2 with eigenvalue -1). The resulting phase factor (-1)^f(x) kicks back directly onto the query register, enabling interference.",
      },
      {
        id: "dj-q2",
        prompt:
          "If the black-box oracle function f(x) evaluated by Deutsch's algorithm is balanced, what is the probability of measuring state |0⟩ on the query qubit after the final Hadamard gate?",
        options: [
          "100%",
          "50%",
          "0% (measures |1⟩ with 100% certainty)",
          "25%",
        ],
        correctIndex: 2,
        explanation:
          "For a balanced function, destructive interference completely cancels the amplitude of |0⟩, yielding 0% probability. Constructive interference concentrates 100% of the measurement probability on |1⟩, proving the function is balanced in a single quantum query.",
      },
      {
        id: "dj-q3",
        prompt:
          "How many oracle function evaluations are required by the Deutsch-Jozsa algorithm to determine if an n-qubit function is constant or balanced with 100% certainty?",
        options: [
          "2ⁿ evaluations",
          "2^(n-1) + 1 evaluations",
          "Exactly 1 quantum query",
          "O(n²) queries",
        ],
        correctIndex: 2,
        explanation:
          "While a classical deterministic computer requires 2^(n-1) + 1 queries in the worst case, Deutsch-Jozsa solves the problem deterministically using exactly 1 quantum query, proving exponential speedup.",
      },
    ],
  },
  "teleportation": {
    lessonId: "teleportation",
    title: "Quantum Teleportation Protocol",
    description: "Verify your understanding of state reconstruction and classical communication bounds.",
    questions: [
      {
        id: "tp-q1",
        prompt:
          "What physical resources are required to teleport an unknown arbitrary single-qubit quantum state |ψ⟩ from Alice to Bob?",
        options: [
          "A faster-than-light channel and 1 classical bit",
          "One shared entangled Bell pair and 2 classical bits sent over a conventional channel",
          "A quantum cloning device",
          "Direct physical transmission of the original qubit",
        ],
        correctIndex: 1,
        explanation:
          "Quantum teleportation requires one pre-shared entangled pair (EPR pair) between Alice and Bob, plus 2 classical bits transmitted over a standard classical channel so Bob knows which Pauli correction (I, X, Z, or XZ) to apply.",
      },
      {
        id: "tp-q2",
        prompt:
          "Why does quantum teleportation NOT violate the No-Cloning Theorem or Einstein's speed-of-light limit?",
        options: [
          "It only works for pure classical bits",
          "Alice's original state is destroyed during her Bell measurement, and Bob cannot recover |ψ⟩ until classical bits arrive at ≤ c",
          "The protocol only works inside a superconducting dilution refrigerator",
          "It does violate both, proving quantum nonlocality can transmit data instantly",
        ],
        correctIndex: 1,
        explanation:
          "The No-Cloning Theorem is preserved because Alice's Bell-basis measurement collapses and destroys the original quantum state. Special relativity is preserved because Bob's qubit remains in a maximally mixed state until he receives Alice's classical bits at or below the speed of light.",
      },
      {
        id: "tp-q3",
        prompt:
          "If Alice's Bell measurement produces classical outcome '01', which unitary correction must Bob apply to his qubit to recover state |ψ⟩?",
        options: [
          "Identity (I) — do nothing",
          "Pauli-X (bit flip)",
          "Pauli-Z (phase flip)",
          "Hadamard gate",
        ],
        correctIndex: 1,
        explanation:
          "When Alice measures '01', Bob's qubit collapses to X|ψ⟩. Bob applies a Pauli-X gate (since X · X = I) to restore the exact state |ψ⟩.",
      },
    ],
  },
  "grovers-algorithm": {
    lessonId: "grovers-algorithm",
    title: "Grover's Search & Amplitude Amplification",
    description: "Test your comprehension of quadratic speedups and geometric reflections.",
    questions: [
      {
        id: "gr-q1",
        prompt:
          "What is the algorithmic query complexity of Grover's search algorithm for finding 1 marked item in an unsorted database of N items?",
        options: [
          "O(1)",
          "O(log N)",
          "O(√N)",
          "O(N)",
        ],
        correctIndex: 2,
        explanation:
          "Grover's algorithm provides a provable quadratic speedup over classical unstructured search: while any classical algorithm requires O(N) queries on average, Grover's algorithm requires only O(√N) oracle evaluations.",
      },
      {
        id: "gr-q2",
        prompt:
          "What geometric operation does the Grover diffusion operator execute on the statevector?",
        options: [
          "A random permutation across all computational basis states",
          "A reflection of all probability amplitudes about their mean (average)",
          "A projective measurement that resets unmarked states to zero",
          "A classical sort of state amplitudes",
        ],
        correctIndex: 1,
        explanation:
          "The Grover diffusion operator D = 2|s⟩⟨s| - I reflects the statevector about the uniform superposition |s⟩. Because the marked item's amplitude was inverted by the oracle to negative, reflecting about the mean amplifies its amplitude while reducing the unmarked states.",
      },
      {
        id: "gr-q3",
        prompt:
          "What happens if you run significantly more iterations than the optimal count R ≈ (π/4)√N in Grover's algorithm?",
        options: [
          "The probability increases toward 100% asymptotically",
          "The statevector over-rotates past the target state in the 2D subspace, decreasing the success probability",
          "The quantum computer halts automatically",
          "The database items are erased",
        ],
        correctIndex: 1,
        explanation:
          "Grover search is a geometric rotation in a 2D plane spanned by the target state and unmarked states. Over-rotating past the target state decreases the amplitude on the target state, demonstrating that quantum amplitude amplification must be terminated at the precise optimal rotation angle.",
      },
    ],
  },
  "vqe-nisq": {
    lessonId: "vqe-nisq",
    title: "Variational Quantum Algorithms & NISQ Hardware",
    description: "Test your grasp of hybrid quantum-classical optimization and near-term noise.",
    questions: [
      {
        id: "vq-q1",
        prompt:
          "Why is the Variational Quantum Eigensolver (VQE) particularly well-suited for near-term NISQ (Noisy Intermediate-Scale Quantum) devices?",
        options: [
          "It does not require any quantum gates",
          "It uses shallow parameterized ansatz circuits and offloads parameter optimization to classical computers, minimizing decoherence",
          "It operates entirely on classical GPUs without quantum hardware",
          "It requires zero noise error correction",
        ],
        correctIndex: 1,
        explanation:
          "NISQ hardware suffers from gate errors and limited qubit coherence times. VQE uses low-depth parameterized circuits (ansätze) to measure energy expectation values, offloading continuous parameter optimization to robust classical algorithms.",
      },
      {
        id: "vq-q2",
        prompt:
          "What fundamental theorem guarantees that the expectation value ⟨ψ(θ)|H|ψ(θ)⟩ measured in VQE is always an upper bound to the true ground state energy E₀?",
        options: [
          "Born's Rule",
          "The Rayleigh-Ritz Variational Principle",
          "The Heisenberg Uncertainty Principle",
          "The Church-Turing Thesis",
        ],
        correctIndex: 1,
        explanation:
          "The Rayleigh-Ritz Variational Principle states that for any normalized trial state |ψ(θ)⟩ and Hamiltonian H, the expectation value ⟨ψ(θ)|H|ψ(θ)⟩ is strictly greater than or equal to the lowest eigenvalue (ground state energy E₀).",
      },
      {
        id: "vq-q3",
        prompt:
          "In the hybrid VQE workflow, which part is executed by the classical computer?",
        options: [
          "Preparing the high-dimensional entangled quantum statevector",
          "Measuring quantum expectation values",
          "Running classical optimization algorithms (e.g. COBYLA, Adam, SPSA) to update rotation parameters θ",
          "Simulating the physical quantum processor",
        ],
        correctIndex: 2,
        explanation:
          "The quantum processor evaluates the expectation values of the quantum state, while the classical CPU evaluates gradients and updates the parameter vector θ using classical numerical optimization algorithms.",
      },
    ],
  },
};

export function getQuizForLesson(lessonId: string): LessonQuiz | undefined {
  return QUIZZES[lessonId];
}
