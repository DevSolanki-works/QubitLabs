export type LessonDifficulty = "Beginner" | "Intermediate" | "Advanced";

export type LessonLevel =
  | "Level 1: Quantum Foundations"
  | "Level 2: Gates & Multi-Qubit Systems"
  | "Level 3: Quantum Algorithms"
  | "Level 4: Frontier & NISQ";

export type RealWorldAnalogy = {
  title: string;
  story: string;
  takeaway: string;
};

export type MathematicalFoundations = {
  diracNotation: string;
  formula: string;
  matrixForm?: string;
  workedExample: {
    title: string;
    input: string;
    operation: string;
    output: string;
    explanation: string;
  };
};

export type CommonPitfall = {
  misconception: string;
  reality: string;
};

export type CircuitGuide = {
  setup: string;
  stepByStep: string[];
  expectedOutcome: string;
};

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
  tags?: string[];
  realWorldAnalogy?: RealWorldAnalogy;
  mathematicalFoundations?: MathematicalFoundations;
  commonPitfalls?: CommonPitfall[];
  keyTakeaways?: string[];
  circuitGuide?: CircuitGuide;
};

export const lessons: Lesson[] = [
  // --- LEVEL 1: QUANTUM FOUNDATIONS ---
  {
    id: "qubit-basics",
    number: 1,
    level: "Level 1: Quantum Foundations",
    levelNumber: 1,
    title: "Qubit Basics & Statevectors",
    subtitle: "Meet the fundamental building block of quantum computing",
    description:
      "Understand what a qubit is, how |0⟩ and |1⟩ represent quantum states, and why qubits differ fundamentally from classical bits through complex probability amplitudes.",
    difficulty: "Beginner",
    duration: "8 min",
    concept:
      "A qubit is a two-level quantum mechanical system represented as a statevector |ψ⟩ = α|0⟩ + β|1⟩, where α and β are complex probability amplitudes satisfying the normalization constraint |α|² + |β|² = 1.",
    whyItMatters:
      "Unlike classical bits which are strictly 0 or 1 at any moment, a qubit's continuous state space allows quantum algorithms to process complex superpositions simultaneously.",
    visualIntuition:
      "Imagine the computational basis |0⟩ as pointing straight up to the North Pole of a 3D globe, and |1⟩ as pointing straight down to the South Pole. An untouched qubit begins in |0⟩.",
    task: "Explore the |0⟩ state on qubit 0 and use the Pauli-X gate to perform a quantum NOT flip into |1⟩.",
    color: "cyan",
    challengeId: "qubit-basics-01",
    xpReward: 50,
    tags: ["Statevector", "Dirac Notation", "Pauli-X", "Amplitudes"],
    realWorldAnalogy: {
      title: "The Spinning Coin on a Table",
      story:
        "Consider a classical coin resting on a desk: it is deterministically either Heads (0) or Tails (1). Now imagine flicking that coin so it spins rapidly on its edge across the wood. While spinning, it isn't simply heads or tails—it exists in a continuous dynamic state with definite probabilities of landing on either side. Slapping your hand down onto the spinning coin forces it into a single flat state. That slap is the quantum measurement.",
      takeaway:
        "A qubit before measurement holds continuous amplitude possibilities, but measurement irreversibly forces a discrete classical answer.",
    },
    mathematicalFoundations: {
      diracNotation:
        "|ψ⟩ = α|0⟩ + β|1⟩ = α [1, 0]ᵀ + β [0, 1]ᵀ = [α, β]ᵀ",
      formula: "|α|² + |β|² = 1 (where α, β ∈ ℂ)",
      matrixForm: "Pauli-X = [ [0, 1], [1, 0] ]",
      workedExample: {
        title: "Applying Pauli-X to Ground State |0⟩",
        input: "|0⟩ = [1, 0]ᵀ (α = 1, β = 0)",
        operation: "X |0⟩ = [ [0, 1], [1, 0] ] · [1, 0]ᵀ",
        output: "[0, 1]ᵀ = 0|0⟩ + 1|1⟩ = |1⟩",
        explanation:
          "The matrix multiplication swaps the amplitudes, converting a 100% probability of measuring 0 into a 100% probability of measuring 1.",
      },
    },
    commonPitfalls: [
      {
        misconception: "A qubit holds infinite classical data that you can read out.",
        reality:
          "Holevo's Theorem proves that despite possessing infinite continuous amplitudes during computation, measuring a single qubit can yield at most 1 classical bit of information.",
      },
      {
        misconception: "Amplitudes and probabilities are identical quantities.",
        reality:
          "Amplitudes are complex numbers (with phase and magnitude). Probabilities are real numbers computed as the squared magnitude of amplitudes: P = |α|².",
      },
    ],
    keyTakeaways: [
      "Qubits live in a 2-dimensional complex Hilbert space ℂ².",
      "The computational basis states |0⟩ and |1⟩ are orthonormal vectors.",
      "Normalization |α|² + |β|² = 1 ensures the total measurement probability always equals 100%.",
    ],
    circuitGuide: {
      setup: "Initialize a 1-qubit circuit in Quantum Lab.",
      stepByStep: [
        "Inspect the initial state: verify statevector is [1+0j, 0+0j] representing |0⟩.",
        "Drag a Pauli-X gate from the palette onto qubit q0.",
        "Observe the statevector transition to [0+0j, 1+0j] representing |1⟩.",
        "Add a second Pauli-X gate to witness reversibility: X · X = I (identity).",
      ],
      expectedOutcome: "Statevector [0, 1] with 100% measurement probability of classical bit 1.",
    },
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
      "Quantum measurement is destructive and non-unitary. Upon measuring |ψ⟩ = α|0⟩ + β|1⟩ in the standard computational basis, the probability of obtaining outcome '0' is P(0) = |α|² and '1' is P(1) = |β|².",
    whyItMatters:
      "Quantum computers must eventually output classical answers. Understanding Born's rule is essential because quantum algorithms are engineered so that wrong answers destructively cancel out while correct answers constructively amplify before measurement.",
    visualIntuition:
      "Before measurement, the statevector is an intact vector in Hilbert space. The instant a detector interacts with it, the state snaps along the measurement axis into either the North Pole (|0⟩) or South Pole (|1⟩).",
    task: "Simulate 1,024 measurement shots on AerSimulator to observe how finite statistical counts converge to exact analytical statevector probabilities.",
    color: "blue",
    challengeId: "measurement-01",
    xpReward: 50,
    tags: ["Born's Rule", "Projection", "AerSimulator", "Shot Statistics"],
    realWorldAnalogy: {
      title: "The Polarized Sunglasses Test",
      story:
        "Consider a photon vibrating diagonally at a 45° angle approaching a vertically polarized sunglass lens. The photon cannot 'split in half' or exit with 50% dimmer diagonal light. Instead, upon reaching the lens, nature forces a probabilistic decision: with 50% probability the photon passes through completely polarized vertically, and with 50% probability it is absorbed. The detector never sees half a photon.",
      takeaway:
        "Quantum projection forces an indivisible physical system to choose one discrete basis state with probability equal to the projection's squared magnitude.",
    },
    mathematicalFoundations: {
      diracNotation:
        "P(i) = |⟨i|ψ⟩|² where ⟨i| is the dual bra vector",
      formula: "P(0) = |α|², P(1) = |β|², where |ψ'⟩ = |0⟩ or |1⟩ post-measurement",
      matrixForm: "Projectors: Π₀ = |0⟩⟨0| = [ [1, 0], [0, 0] ], Π₁ = |1⟩⟨1| = [ [0, 0], [0, 1] ]",
      workedExample: {
        title: "Calculating Measurement Probabilities with Born's Rule",
        input: "|ψ⟩ = (1/2)|0⟩ + (√3/2)|1⟩",
        operation: "P(0) = |1/2|² = 1/4 = 25%; P(1) = |√3/2|² = 3/4 = 75%",
        output: "75% probability of measuring '1', 25% probability of measuring '0'",
        explanation:
          "Notice that the amplitudes 1/2 and √3/2 sum to ~1.366, but their squared magnitudes sum to exactly 0.25 + 0.75 = 1.0 (100%).",
      },
    },
    commonPitfalls: [
      {
        misconception: "Measurement simply reveals a hidden value that was already chosen.",
        reality:
          "Bell's theorem and experimental tests rule out local hidden variable theories. The measurement process fundamentally creates the classical outcome.",
      },
      {
        misconception: "A single measurement shot tells you the quantum state.",
        reality:
          "A single shot only yields 0 or 1. You must run many shots (e.g. 1024) to reconstruct the probability distribution through quantum state tomography.",
      },
    ],
    keyTakeaways: [
      "Measurement is projective: the post-measurement state collapses into the observed eigenstate.",
      "Repeating measurements immediately after collapse yields the identical outcome with 100% certainty.",
      "The AerSimulator models physical sampling noise using pseudo-random shot distributions.",
    ],
    circuitGuide: {
      setup: "Create a state with unequal amplitudes.",
      stepByStep: [
        "Place an RY(π/3) rotation gate on q0 to set α = cos(π/6) ≈ 0.866 and β = sin(π/6) = 0.5.",
        "Add a measurement gate M to route outcome to classical register c0.",
        "Run 1024 shots in Quantum Lab to see ~750 counts for |0⟩ and ~274 counts for |1⟩.",
      ],
      expectedOutcome: "Empirical shot frequencies matching analytical probabilities within standard error.",
    },
  },
  {
    id: "superposition",
    number: 3,
    level: "Level 1: Quantum Foundations",
    levelNumber: 1,
    title: "Superposition & The Hadamard Gate",
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
    tags: ["Hadamard Gate", "|+⟩ State", "Interference", "Exponential State Space"],
    realWorldAnalogy: {
      title: "Acoustic Wave Interference & Chords",
      story:
        "When two musical tuning forks sound together, the sound waves overlap in the air. Where wave crest meets crest, the volume doubles (constructive interference). Where crest meets trough, silence occurs (destructive interference). A quantum superposition is not 'either note A or note B randomly playing'—it is the simultaneous chord of both waves interacting continuously in phase.",
      takeaway:
        "Superposition is wave interference. Quantum speedup relies on designing circuits where wrong answers destructively cancel like noise-cancelling headphones.",
    },
    mathematicalFoundations: {
      diracNotation:
        "|+⟩ = (1/√2)|0⟩ + (1/√2)|1⟩; |−⟩ = (1/√2)|0⟩ - (1/√2)|1⟩",
      formula: "H = (1/√2) [ [1, 1], [1, -1] ]; H² = I (Hadamard is its own inverse)",
      matrixForm: "H = 1/√2 · [ [1, 1], [1, -1] ]",
      workedExample: {
        title: "Interference by Applying Hadamard Twice (H · H = I)",
        input: "|0⟩ = [1, 0]ᵀ",
        operation: "H|0⟩ = |+⟩; then H|+⟩ = (1/√2)[ ( (|0⟩+|1⟩)/√2 ) + ( (|0⟩-|1⟩)/√2 ) ]",
        output: "(1/2)(|0⟩ + |1⟩ + |0⟩ - |1⟩) = (2/2)|0⟩ + (0/2)|1⟩ = |0⟩",
        explanation:
          "Notice how the |1⟩ amplitudes cancel out (+1/2 and -1/2 = 0) while |0⟩ amplitudes constructively reinforce. This proves superposition is not random noise.",
      },
    },
    commonPitfalls: [
      {
        misconception: "Superposition means running multiple classical computers in parallel.",
        reality:
          "Classical parallel computers cannot achieve destructive interference. Quantum speedup comes from phase cancellation, which classical probability distributions cannot exhibit.",
      },
      {
        misconception: "|+⟩ and |−⟩ are the exact same physical state because both have 50/50 probabilities.",
        reality:
          "While measuring either in the computational basis yields 50% zeros and 50% ones, they possess different relative phases (0 vs π). Passing them into an H gate yields |0⟩ for |+⟩ and |1⟩ for |−⟩.",
      },
    ],
    keyTakeaways: [
      "Hadamard gate maps Z-basis (|0⟩, |1⟩) into X-basis (|+⟩, |−⟩).",
      "Because H is unitary and Hermitian, applying H twice returns the qubit to its original state (H² = I).",
      "Applying Hadamard to n qubits creates a uniform superposition over all 2ⁿ computational states.",
    ],
    circuitGuide: {
      setup: "1-qubit circuit on Qiskit Aer.",
      stepByStep: [
        "Place a single H gate on q0.",
        "Verify statevector becomes [0.7071+0j, 0.7071+0j] = 1/√2 (|0⟩ + |1⟩).",
        "Place a second H gate on q0.",
        "Observe the statevector cleanly return to [1+0j, 0+0j] with 100% |0⟩ probability.",
      ],
      expectedOutcome: "Equal 50/50 probability with 1 H gate; deterministic |0⟩ return with 2 H gates.",
    },
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
    tags: ["Bloch Sphere", "Polar Angle θ", "Azimuthal Phase φ", "Unitary Rotations"],
    realWorldAnalogy: {
      title: "GPS Coordinates & Navigating the Earth",
      story:
        "Every location on Earth can be mapped by latitude (how far north or south of the equator you are) and longitude (how far east or west along the equator you are). On the Bloch sphere, the angle θ acts like latitude: 0° is the North Pole (|0⟩), 180° is the South Pole (|1⟩), and 90° is the equator. The angle φ acts like longitude, tracking the quantum relative phase.",
      takeaway:
        "Any single-qubit quantum state is simply a latitude-longitude coordinate on the unit sphere, and quantum gates are turns and rotations around Earth's axes.",
    },
    mathematicalFoundations: {
      diracNotation:
        "|ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩ with θ ∈ [0, π], φ ∈ [0, 2π)",
      formula: "Cartesian: x = sin(θ)cos(φ), y = sin(θ)sin(φ), z = cos(θ)",
      matrixForm: "Bloch vector: r⃗ = ⟨X⟩ x̂ + ⟨Y⟩ ŷ + ⟨Z⟩ ẑ with |r⃗| = 1 for pure states",
      workedExample: {
        title: "Computing the Bloch Coordinates for the |+⟩ State",
        input: "|+⟩ = (1/√2)|0⟩ + (1/√2)|1⟩",
        operation: "cos(θ/2) = 1/√2 ⟹ θ/2 = π/4 ⟹ θ = π/2; e^(iφ) = 1 ⟹ φ = 0",
        output: "x = sin(π/2)cos(0) = 1, y = sin(π/2)sin(0) = 0, z = cos(π/2) = 0 ⟹ (1, 0, 0)",
        explanation:
          "The Bloch vector for |+⟩ points directly along the positive X-axis with length 1.0, resting on the equator.",
      },
    },
    commonPitfalls: [
      {
        misconception: "Global phase changes where the statevector points on the Bloch sphere.",
        reality:
          "Global phase e^(iγ)|ψ⟩ is physically unmeasurable and cancels out in all density matrices. The Bloch sphere automatically ignores global phase and shows only relative phase.",
      },
      {
        misconception: "Two entangled qubits can each be drawn on their own individual Bloch sphere.",
        reality:
          "Entanglement destroys pure single-qubit states. For an entangled qubit, its reduced density matrix is mixed and its Bloch vector shrinks into the interior of the sphere (|r⃗| < 1).",
      },
    ],
    keyTakeaways: [
      "North Pole = |0⟩; South Pole = |1⟩; Equator = equal superpositions with varying phase.",
      "Unitary gates correspond to rigid rotations SO(3) of the Bloch vector.",
      "The factor of θ/2 accounts for the geometric spinor property: a 360° physical rotation introduces a sign flip (-1).",
    ],
    circuitGuide: {
      setup: "Interactive 3D Bloch Sphere in Quantum Lab.",
      stepByStep: [
        "Select qubit 0: vector points straight up along +Z.",
        "Add an H gate: watch the vector swing down 90° to point along +X on the equator.",
        "Add an S gate: watch the vector rotate 90° azimuthally across the equator to +Y.",
        "Add a Z gate: watch the vector rotate 180° around the Z-axis.",
      ],
      expectedOutcome: "Smooth visual trajectory tracing the spherical surface from (0,0,1) to (1,0,0) to (0,1,0).",
    },
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
    tags: ["Pauli Matrices", "Phase Gate (S)", "T Gate", "Universal Gate Set"],
    realWorldAnalogy: {
      title: "The Optical Wave Retarder & Prism",
      story:
        "Imagine shining a polarized laser beam through a specialized crystal prism. The crystal does not diminish the brightness of the light; instead, it delays the vertical vibration slightly relative to the horizontal vibration. That time delay is a phase shift. The Pauli-Z gate is a half-wave plate (180° shift), while the S gate is a quarter-wave plate (90° shift).",
      takeaway:
        "Phase gates do not alter the magnitude of states; they rotate the complex phase clock of basis components.",
    },
    mathematicalFoundations: {
      diracNotation:
        "Z|0⟩ = |0⟩, Z|1⟩ = -|1⟩; S|0⟩ = |0⟩, S|1⟩ = i|1⟩; T|0⟩ = |0⟩, T|1⟩ = e^(iπ/4)|1⟩",
      formula: "T⁴ = S² = Z; Z² = I",
      matrixForm:
        "Z = [ [1, 0], [0, -1] ]; S = [ [1, 0], [0, i] ]; T = [ [1, 0], [0, e^(iπ/4)] ]",
      workedExample: {
        title: "Applying Phase (S) Gate to Equal Superposition |+⟩",
        input: "|+⟩ = (1/√2)|0⟩ + (1/√2)|1⟩",
        operation: "S|+⟩ = (1/√2) S|0⟩ + (1/√2) S|1⟩ = (1/√2)|0⟩ + (i/√2)|1⟩",
        output: "|+i⟩ = (1/√2)(|0⟩ + i|1⟩)",
        explanation:
          "The state is rotated 90° counter-clockwise around the Z-axis, pointing directly along the +Y coordinate on the Bloch sphere.",
      },
    },
    commonPitfalls: [
      {
        misconception: "Applying a Z gate to a classical |0⟩ or |1⟩ changes measurement statistics.",
        reality:
          "Because Z|0⟩ = |0⟩ and Z|1⟩ = -|1⟩, measurement probabilities |-1|² = 1 remain unchanged in the computational basis. The phase only becomes observable when interference occurs through an H gate.",
      },
      {
        misconception: "Quantum gates can be non-reversible like classical NAND gates.",
        reality:
          "Quantum mechanics requires unitary operations U†U = I. Information is strictly conserved, meaning all quantum logic gates are 100% reversible.",
      },
    ],
    keyTakeaways: [
      "Pauli matrices (X, Y, Z) form an orthogonal basis for all 2×2 Hermitian operators.",
      "The T gate (π/8 gate) is essential for universality: Cliffords (H, S, CNOT) alone can be simulated efficiently classically (Gottesman-Knill theorem).",
      "All quantum operations preserve vector length: ⟨ψ|U†U|ψ⟩ = ⟨ψ|ψ⟩ = 1.",
    ],
    circuitGuide: {
      setup: "1-qubit circuit in Quantum Lab.",
      stepByStep: [
        "Place an H gate to initialize |+⟩ on the equator.",
        "Add a T gate to rotate by 45°: statevector becomes [0.7071, 0.5 + 0.5j].",
        "Add another T gate to reach 90° (equivalent to S gate): statevector becomes [0.7071, 0.7071j].",
        "Add a Z gate to reflect across the origin.",
      ],
      expectedOutcome: "Equatorial phase progression from 0° → 45° → 90° → 270°.",
    },
  },
  {
    id: "entanglement",
    number: 6,
    level: "Level 2: Gates & Multi-Qubit Systems",
    levelNumber: 2,
    title: "Quantum Entanglement & Bell States",
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
    tags: ["Entanglement", "Bell States", "CNOT Gate", "Tensor Product"],
    realWorldAnalogy: {
      title: "The Pair of Enclosed Gloves",
      story:
        "Suppose a manufacturer places a left glove and a right glove into two identical sealed boxes without labeling them. One box is shipped to Tokyo and the other to London. Opening the box in London and discovering a left glove immediately informs you that the Tokyo box holds the right glove. Unlike classical gloves, however, quantum entanglement proves the gloves had no predetermined 'leftness' or 'rightness' until the box was opened!",
      takeaway:
        "Entangled qubits possess shared, nonlocal correlations that cannot be explained by pre-existing local hidden values.",
    },
    mathematicalFoundations: {
      diracNotation:
        "|Φ⁺⟩ = (1/√2)(|00⟩ + |11⟩); |Φ⁻⟩ = (1/√2)(|00⟩ - |11⟩); |Ψ⁺⟩ = (1/√2)(|01⟩ + |10⟩); |Ψ⁻⟩ = (1/√2)(|01⟩ - |10⟩)",
      formula: "CNOT |c, t⟩ = |c, c ⊕ t⟩; CNOT matrix size is 4×4",
      matrixForm:
        "CNOT = [ [1,0,0,0], [0,1,0,0], [0,0,0,1], [0,0,1,0] ]",
      workedExample: {
        title: "Step-by-Step Construction of the Bell State |Φ⁺⟩",
        input: "|00⟩ = |0⟩ ⊗ |0⟩ = [1, 0, 0, 0]ᵀ",
        operation:
          "Step 1: H on q0 ⟹ (1/√2)(|0⟩+|1⟩) ⊗ |0⟩ = (1/√2)(|00⟩ + |10⟩)\nStep 2: CNOT(0→1) ⟹ q0=0 leaves q1=0 (|00⟩); q0=1 flips q1 to 1 (|11⟩)",
        output: "|Φ⁺⟩ = (1/√2)(|00⟩ + |11⟩) = [0.7071, 0, 0, 0.7071]ᵀ",
        explanation:
          "Notice states |01⟩ and |10⟩ have amplitude 0. Measuring qubit 0 as 0 guarantees qubit 1 is 0; measuring qubit 0 as 1 guarantees qubit 1 is 1.",
      },
    },
    commonPitfalls: [
      {
        misconception: "Entanglement allows instantaneous faster-than-light communication (FTL).",
        reality:
          "The No-Communication Theorem proves that because Alice's measurement result is completely random (50% 0, 50% 1), Bob's local density matrix remains completely unchanged until Alice sends her result over a classical channel.",
      },
      {
        misconception: "You can clone an unknown entangled state to create a backup.",
        reality:
          "The No-Cloning Theorem dictates that it is impossible to create an identical copy of an arbitrary unknown quantum state.",
      },
    ],
    keyTakeaways: [
      "A 2-qubit Hilbert space has 4 basis states: |00⟩, |01⟩, |10⟩, |11⟩.",
      "Non-separability means |ψ⟩ cannot be written as |A⟩ ⊗ |B⟩.",
      "The 4 Bell states form a complete orthonormal basis for 2-qubit Hilbert space.",
    ],
    circuitGuide: {
      setup: "2-qubit circuit with q0, q1 initialized to |00⟩.",
      stepByStep: [
        "Place an H gate on control qubit q0.",
        "Add a CNOT gate with control on q0 and target on q1.",
        "Run statevector simulation: verify amplitudes on |00⟩ and |11⟩ are each 0.7071 (probability 50%).",
        "Add measurements to both qubits and run 1024 shots: verify zero counts for '01' and '10'.",
      ],
      expectedOutcome: "Strict correlation: 100% of measurements yield either '00' (~512) or '11' (~512).",
    },
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
    tags: ["Phase Kickback", "Quantum Oracle", "Constant vs Balanced", "Interferometry"],
    realWorldAnalogy: {
      title: "The Counterfeit Currency Sorter",
      story:
        "Imagine a machine that tests 100-dollar bills. A batch of bills is either all genuine (constant function) or exactly half genuine and half fake (balanced function). A classical bank clerk must inspect 2^(N-1) + 1 bills one-by-one in the worst case to be 100% certain. A quantum sorter sends a wave through the entire stack at once: constructive interference outputs a green light if constant, and total destructive cancellation outputs a red light if balanced—with just 1 query!",
      takeaway:
        "Quantum algorithms evaluate global properties of mathematical functions without needing to compute individual outputs one by one.",
    },
    mathematicalFoundations: {
      diracNotation:
        "Oracle: U_f|x⟩|y⟩ = |x⟩|y ⊕ f(x)⟩; Phase kickback: U_f|x⟩|−⟩ = (-1)^(f(x))|x⟩|−⟩",
      formula:
        "Final state before measurement: |ψ_final⟩ = (1/2ⁿ) ∑_x ∑_z (-1)^(f(x) + x·z) |z⟩",
      matrixForm: "Oracle acts as a unitary reflection operator",
      workedExample: {
        title: "Phase Kickback with 1 Input Qubit and Balanced Function f(x) = x",
        input: "Input q0 in |+⟩ = (|0⟩+|1⟩)/√2; Ancilla q1 in |−⟩ = (|0⟩-|1⟩)/√2",
        operation:
          "Apply CNOT(q0→q1). When q0=0, q1 is unchanged: |0⟩|−⟩.\nWhen q0=1, q1 is flipped by X: X|−⟩ = -|−⟩. The state becomes -|1⟩|−⟩.\nComposite state: (|0⟩ - |1⟩)/√2 ⊗ |−⟩ = |−⟩|−⟩.",
        output: "Apply H to q0: H|−⟩ = |1⟩. Measurement of q0 deterministically outputs '1'.",
        explanation:
          "The minus sign kicked back into q0 converted |+⟩ into |−⟩. Measuring '1' definitively proves the function is balanced in 1 query!",
      },
    },
    commonPitfalls: [
      {
        misconception: "Deutsch-Jozsa reveals the exact output values f(0) and f(1).",
        reality:
          "The algorithm only tells you whether f is constant or balanced. Individual output values are destroyed by the final interference step.",
      },
      {
        misconception: "The ancilla qubit needs to be measured.",
        reality:
          "The ancilla qubit |−⟩ exists solely as an auxiliary catalyst for phase kickback. It remains unchanged in |−⟩ and is discarded without measurement.",
      },
    ],
    keyTakeaways: [
      "Phase kickback is the core mechanism enabling quantum algorithms to imprint information into phase.",
      "Determining global properties exponentially outperforms classical pointwise evaluations.",
      "Measurement outcome |0⟩ = constant; any non-zero state = balanced.",
    ],
    circuitGuide: {
      setup: "2-qubit circuit: q0 (data register), q1 (ancilla).",
      stepByStep: [
        "Initialize ancilla q1 into |−⟩: place X followed by H on q1.",
        "Initialize data q0 into |+⟩: place H on q0.",
        "Insert the oracle: CNOT from q0 to q1 (balanced oracle).",
        "Apply final H on q0 to interfere the kicked-back phases.",
        "Measure q0: observe 100% deterministic outcome '1'.",
      ],
      expectedOutcome: "Deterministic measurement of 1 on q0, confirming balanced oracle in 1 query.",
    },
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
    tags: ["Teleportation", "Bell Measurement", "Pauli Corrections", "Quantum Internet"],
    realWorldAnalogy: {
      title: "The Quantum Fax Machine & Shredder",
      story:
        "Imagine you have a unique, fragile origami masterpiece that cannot be photographed or copied (No-Cloning Theorem). Alice and Bob share an entangled pair of blank sheets. Alice feeds her origami into a special scanner alongside her blank sheet. The scanner destroys the original paper and prints two numbers (00, 01, 10, or 11). Alice calls Bob on a telephone and gives him the numbers. Bob uses those numbers to perform folding rotations on his sheet, recreating the exact origami.",
      takeaway:
        "Teleportation disassembles quantum information in one location and reconstructs it elsewhere using entanglement and classical bits.",
    },
    mathematicalFoundations: {
      diracNotation:
        "Total state: |ψ⟩_C ⊗ |Φ⁺⟩_AB = (α|0⟩ + β|1⟩)(1/√2)(|00⟩ + |11⟩)",
      formula:
        "Expanded: (1/2) [ |Φ⁺⟩(α|0⟩+β|1⟩) + |Φ⁻⟩(α|0⟩-β|1⟩) + |Ψ⁺⟩(β|0⟩+α|1⟩) + |Ψ⁻⟩(-β|0⟩+α|1⟩) ]",
      matrixForm: "Bob applies corrections: 00 → I; 01 → X; 10 → Z; 11 → ZX",
      workedExample: {
        title: "Alice Measures Outcome '01' on Her Two Qubits",
        input: "Alice measures qubit C and A in Bell basis, observing classical bits c1=0, c0=1",
        operation:
          "From the expanded state, Alice's outcome 01 leaves Bob's qubit B in the collapsed state: α|1⟩ + β|0⟩ = X|ψ⟩",
        output: "Bob receives bits (0, 1) and applies Pauli-X gate: X(α|1⟩ + β|0⟩) = α|0⟩ + β|1⟩ = |ψ⟩",
        explanation:
          "Bob's qubit is restored into the exact original state |ψ⟩ with 100% fidelity, regardless of the unknown α and β values.",
      },
    },
    commonPitfalls: [
      {
        misconception: "Teleportation transports physical atoms across space.",
        reality:
          "Only the quantum information (amplitudes α and β) is transported. Bob's physical qubit was already sitting on Bob's table before the protocol began.",
      },
      {
        misconception: "Alice still retains her copy of |ψ⟩ after teleportation.",
        reality:
          "Alice's Bell-basis measurement completely destroys her original state. The No-Cloning Theorem remains unbroken.",
      },
    ],
    keyTakeaways: [
      "Teleporting 1 qubit requires: 1 shared Bell pair (entanglement) + 2 classical bits.",
      "The protocol is strictly bounded by the speed of light due to the classical message requirement.",
      "Neither Alice nor Bob ever learns the values of α or β during the process.",
    ],
    circuitGuide: {
      setup: "3 qubits: q0 (unknown state |ψ⟩), q1 (Alice's entangled half), q2 (Bob's entangled half).",
      stepByStep: [
        "Create shared Bell pair on q1 and q2 using H(q1) and CNOT(q1→q2).",
        "Prepare unknown state on q0 (e.g. RY rotation).",
        "Alice performs Bell measurement: CNOT(q0→q1) followed by H(q0).",
        "Measure q0 and q1 into classical bits c0 and c1.",
        "Bob applies conditional X if c1=1, and conditional Z if c0=1.",
      ],
      expectedOutcome: "Bob's qubit q2 holds the exact original statevector of q0 with 100% fidelity.",
    },
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
    tags: ["Amplitude Amplification", "Oracle Reflection", "Diffusion Operator", "O(√N) Speedup"],
    realWorldAnalogy: {
      title: "The Sonar Wave Echo Amplifier",
      story:
        "Imagine an unsorted phonebook of 1,000,000 entries. Classically, you must check an average of 500,000 entries one by one. In Grover search, you broadcast a sound wave across all 1,000,000 names simultaneously. The target entry reflects the wave upside down. You then pass the reflected sound through an acoustic chamber that inverts all sound waves around their average loudness. The target name booms out at full volume after only ~785 reflections (~π/4 √1,000,000)!",
      takeaway:
        "Grover search uses geometric reflections in Hilbert space to amplify the probability amplitude of target solutions.",
    },
    mathematicalFoundations: {
      diracNotation:
        "Oracle: R_ω = I - 2|ω⟩⟨ω|; Diffusion Operator: D = 2|s⟩⟨s| - I where |s⟩ = (1/√N)∑|x⟩",
      formula:
        "Optimal iterations: R ≈ (π/4)√N; Rotation angle per step: sin(θ) = 2√(N-1)/N ≈ 2/√N",
      matrixForm: "Diffusion matrix: D_ij = 2/N - δ_ij (inversion about the mean)",
      workedExample: {
        title: "2-Qubit Grover Search for Target State |11⟩ (N = 4)",
        input: "Uniform superposition |s⟩ = (1/2)(|00⟩ + |01⟩ + |10⟩ + |11⟩); amplitudes = [+0.5, +0.5, +0.5, +0.5]",
        operation:
          "Step 1 (Oracle CZ): flips sign of |11⟩ ⟹ [+0.5, +0.5, +0.5, -0.5]. Mean amplitude μ = (0.5+0.5+0.5-0.5)/4 = 0.25.\nStep 2 (Diffusion 2μ - A): |00⟩ ⟹ 2(0.25)-0.5 = 0; |01⟩ ⟹ 0; |10⟩ ⟹ 0; |11⟩ ⟹ 2(0.25)-(-0.5) = +1.0!",
        output: "Statevector = [0, 0, 0, 1]ᵀ = |11⟩ with 100% measurement probability in exactly 1 query!",
        explanation:
          "Classical search requires up to 3 evaluations for 4 items; Grover achieves 100% certainty in a single query.",
      },
    },
    commonPitfalls: [
      {
        misconception: "Grover's algorithm searches classical databases like SQL tables faster.",
        reality:
          "Grover requires an oracle that can evaluate function values in quantum superposition. If loading data from classical RAM takes O(N), the quantum speedup is lost.",
      },
      {
        misconception: "Running more iterations always increases success probability.",
        reality:
          "Amplitude amplification is an exact geometric rotation. If you continue iterating past the optimal count (π/4 √N), the state vector rotates past the target and probability decreases.",
      },
    ],
    keyTakeaways: [
      "Provides provable quadratic speedup: O(√N) vs classical O(N).",
      "Applicable to any problem where verifying a solution is easy (NP problems).",
      "Combines oracle phase inversion with the Grover diffusion operator.",
    ],
    circuitGuide: {
      setup: "2-qubit circuit with q0, q1.",
      stepByStep: [
        "Initialize equal superposition: H gates on q0 and q1.",
        "Oracle for |11⟩: apply a Controlled-Z (CZ) gate between q0 and q1.",
        "Diffusion operator: apply H on both qubits, then X on both qubits, then CZ, then X on both, then H on both.",
        "Measure both qubits: observe 100% deterministic counts on |11⟩.",
      ],
      expectedOutcome: "P(11) = 100% after 1 Grover iteration.",
    },
  },
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
    tags: ["VQE", "NISQ", "Variational Principle", "Hybrid Quantum-Classical", "Quantum Chemistry"],
    realWorldAnalogy: {
      title: "The Mountain Valley Scout Drone",
      story:
        "Imagine searching for the lowest elevation in a dense, fog-covered mountain range with thousands of peaks and valleys. A heavy classical bulldozer cannot navigate the rugged terrain. Instead, you launch a nimble scout drone (the quantum processor) programmed with rotation angles θ. The drone measures the altitude (energy expectation value) at its location and radios the height back to base camp. A classical supercomputer runs gradient descent to update θ, commanding the drone closer to the lowest valley floor.",
      takeaway:
        "VQE leverages quantum processors for what they do best (evaluating entangled states) while leaving optimization to classical processors.",
    },
    mathematicalFoundations: {
      diracNotation:
        "Ground state energy: E₀ ≤ ⟨ψ(θ⃗)|H|ψ(θ⃗)⟩ = ∑_i c_i ⟨ψ(θ⃗)|P_i|ψ(θ⃗)⟩",
      formula:
        "Hamiltonian decomposition into Pauli strings: H = ∑_i h_i (σ₁ ⊗ σ₂ ⊗ ... ⊗ σ_n)",
      matrixForm: "Ansatz circuit: |ψ(θ⃗)⟩ = U(θ⃗)|0⟩ where U(θ⃗) is a parameterized unitary",
      workedExample: {
        title: "Single-Qubit VQE for Hamiltonian H = Z (True Ground State E₀ = -1)",
        input: "Parameterized ansatz: |ψ(θ)⟩ = RY(θ)|0⟩ = cos(θ/2)|0⟩ + sin(θ/2)|1⟩",
        operation:
          "Energy expectation: E(θ) = ⟨ψ(θ)|Z|ψ(θ)⟩ = cos²(θ/2) - sin²(θ/2) = cos(θ).\nClassical optimizer evaluates gradient dE/dθ = -sin(θ) and updates θ.",
        output: "At optimal parameter θ* = π: |ψ(π)⟩ = |1⟩, E(π) = cos(π) = -1.0 (exact ground energy)!",
        explanation:
          "The hybrid loop successfully converges to the true ground state without ever requiring deep fault-tolerant circuits.",
      },
    },
    commonPitfalls: [
      {
        misconception: "VQE requires thousands of error-corrected logical qubits.",
        reality:
          "VQE was specifically engineered for the NISQ era to run on noisy, uncorrected physical qubits using shallow circuits that finish before decoherence destroys the computation.",
      },
      {
        misconception: "The quantum computer performs the optimization and updates the parameters.",
        reality:
          "The quantum processor only samples the expectation value ⟨H⟩. Parameter optimization (COBYLA, SPSA, Adam) is executed entirely on a classical CPU.",
      },
    ],
    keyTakeaways: [
      "The Rayleigh-Ritz variational theorem guarantees that energy expectation values are always bounded below by the true ground state energy E₀.",
      "NISQ circuits are kept shallow to minimize gate errors and decoherence.",
      "Key applications include molecular electronic structure (H₂, LiH, caffeine) and combinatorial portfolio optimization.",
    ],
    circuitGuide: {
      setup: "Parameterized circuit on Quantum Lab.",
      stepByStep: [
        "Place a parameterized RY(θ) rotation gate on q0.",
        "Simulate statevector across values of θ from 0 to π.",
        "Observe how probability of |1⟩ scales as sin²(θ/2), driving expectation value ⟨Z⟩ from +1 down to -1.",
      ],
      expectedOutcome: "Smooth energy minimization curve reaching minimum expectation value at θ = π.",
    },
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
