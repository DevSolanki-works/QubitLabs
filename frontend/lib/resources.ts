export type ResourceType =
  | "interactive"
  | "documentation"
  | "course"
  | "book"
  | "video"
  | "lecture_notes";

export type QuantumResource = {
  id: string;
  title: string;
  provider: string;
  type: ResourceType;
  topic: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  whyRecommended: string;
  free: boolean;
  url: string;
  durationOrPages?: string;
  isPrimaryForLesson?: string; // maps to lessonId
};

export const RESOURCES: QuantumResource[] = [
  // --- LEVEL 1: FOUNDATIONS ---
  {
    id: "ibm-basics-info",
    title: "Basics of Quantum Information",
    provider: "IBM Quantum Learning",
    type: "course",
    topic: "Qubit Basics & Math Foundations",
    level: "Beginner",
    description:
      "Comprehensive, mathematically rigorous curriculum taught by Prof. John Watrous covering single systems, states, unitary transformations, and measurements.",
    whyRecommended:
      "Authoritative reference standard for statevectors, Dirac bra-ket notation, and density matrices directly from IBM Quantum educators.",
    free: true,
    url: "https://learning.quantum.ibm.com/course/basics-of-quantum-information",
    durationOrPages: "4 units · ~6 hours",
    isPrimaryForLesson: "qubit-basics",
  },
  {
    id: "nielsen-chuang-book",
    title: "Quantum Computation and Quantum Information",
    provider: "Michael A. Nielsen & Isaac L. Chuang (Cambridge University Press)",
    type: "book",
    topic: "Comprehensive Theory & Foundations",
    level: "Advanced",
    description:
      "The definitive canonical 'Bible of Quantum Computing' covering quantum mechanics, quantum circuits, information theory, and quantum error correction.",
    whyRecommended:
      "Essential for researchers and serious students seeking exact proofs, density matrix formalism, and the definitive mathematical foundation.",
    free: false,
    url: "https://www.cambridge.org/highereducation/books/quantum-computation-and-quantum-information/01E10196D0A682A6AE4529F2DC7C9724",
    durationOrPages: "676 pages",
  },
  {
    id: "mit-ocw-804",
    title: "Quantum Physics I (MIT 8.04)",
    provider: "MIT OpenCourseWare (Prof. Barton Zwiebach)",
    type: "course",
    topic: "Wavefunctions & Measurement",
    level: "Intermediate",
    description:
      "Foundational MIT undergraduate course exploring experimental origins of quantum mechanics, wavefunctions, operators, and probability collapse.",
    whyRecommended:
      "Superb conceptual lectures providing physical intuition on why measurement collapses superpositions into classical outcomes.",
    free: true,
    url: "https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/",
    durationOrPages: "24 lecture series",
    isPrimaryForLesson: "measurement",
  },
  {
    id: "pennylane-codebook-intro",
    title: "PennyLane Interactive Codebook",
    provider: "Xanadu",
    type: "interactive",
    topic: "Superposition & Quantum Circuits",
    level: "Beginner",
    description:
      "Hands-on, browser-based coding modules that let you compose gates, visualize statevectors, and verify unitary matrix transformations step-by-step.",
    whyRecommended:
      "Interactive coding feedback makes the transition from bra-ket notation to quantum gates immediate and intuitive.",
    free: true,
    url: "https://codebook.xanadu.ai/",
    durationOrPages: "Self-paced modules",
    isPrimaryForLesson: "superposition",
  },
  {
    id: "qiskit-bloch-guide",
    title: "Qiskit Visualizations & Bloch Sphere Guide",
    provider: "IBM Qiskit Documentation",
    type: "documentation",
    topic: "Bloch Sphere & Single-Qubit States",
    level: "Beginner",
    description:
      "Official technical guide to single-qubit statevector visualization, Bloch coordinates (theta, phi), and expectation values using Qiskit.",
    whyRecommended:
      "Direct technical guide to mapping continuous angles on S² to discrete complex amplitudes α and β.",
    free: true,
    url: "https://docs.quantum.ibm.com/",
    durationOrPages: "Documentation guide",
    isPrimaryForLesson: "bloch-sphere",
  },

  // --- LEVEL 2: GATES & MULTI-QUBIT ---
  {
    id: "coding-with-qiskit-1x",
    title: "Coding with Qiskit 1.x Series",
    provider: "Qiskit YouTube Channel (IBM Research)",
    type: "video",
    topic: "Quantum Gates & Circuit Construction",
    level: "Beginner",
    description:
      "Official IBM video series covering the architecture of quantum gates, building parameterized circuits, and executing jobs on real QPUs.",
    whyRecommended:
      "High-production visual demonstrations illustrating how Pauli, Hadamard, and Phase gates rotate qubits along coordinate axes.",
    free: true,
    url: "https://www.youtube.com/@qiskit",
    durationOrPages: "Video playlist · ~15 min per episode",
    isPrimaryForLesson: "quantum-gates",
  },
  {
    id: "mit-ocw-8370",
    title: "Quantum Information Science I (MIT 8.370x)",
    provider: "MIT OpenCourseWare (Prof. Peter Shor & Isaac Chuang)",
    type: "course",
    topic: "Entanglement & Bell Inequalities",
    level: "Intermediate",
    description:
      "Graduate-level MIT course covering tensor products, entangled states, nonlocality, Bell inequalities, and density operators.",
    whyRecommended:
      "Taught by quantum computing pioneer Peter Shor; offers unmatched clarity on composite Hilbert spaces and entanglement verification.",
    free: true,
    url: "https://ocw.mit.edu/courses/8-370-quantum-information-science-i-fall-2017/",
    durationOrPages: "Full academic course",
    isPrimaryForLesson: "entanglement",
  },
  {
    id: "rieffel-polak-book",
    title: "Quantum Computing: A Gentle Introduction",
    provider: "Eleanor Rieffel & Wolfgang Polak (MIT Press)",
    type: "book",
    topic: "Quantum Gates, Entanglement & Protocols",
    level: "Intermediate",
    description:
      "An accessible yet rigorous computer science perspective on qubits, quantum telecommunication, and multi-qubit systems without requiring prior physics.",
    whyRecommended:
      "Outstanding bridge for software engineers wanting mathematically precise definitions without overwhelming physics jargon.",
    free: false,
    url: "https://mitpress.mit.edu/9780262526678/quantum-computing/",
    durationOrPages: "392 pages",
  },

  // --- LEVEL 3: ALGORITHMS ---
  {
    id: "preskill-ph219-notes",
    title: "Ph219 Quantum Computation Lecture Notes",
    provider: "California Institute of Technology (Prof. John Preskill)",
    type: "lecture_notes",
    topic: "Quantum Algorithms & Phase Kickback",
    level: "Advanced",
    description:
      "Legendary, openly accessible lecture notes by John Preskill covering quantum complexity, phase kickback, quantum Fourier transform, and Shor's algorithm.",
    whyRecommended:
      "Deep theoretical insight into why quantum algorithms achieve speedups through interference rather than parallel search.",
    free: true,
    url: "http://theory.caltech.edu/~preskill/ph219/index.html",
    durationOrPages: "Online chapters",
    isPrimaryForLesson: "deutsch-jozsa",
  },
  {
    id: "ibm-teleportation-guide",
    title: "Quantum Teleportation & Superdense Coding",
    provider: "IBM Quantum Learning",
    type: "interactive",
    topic: "Quantum Teleportation Protocol",
    level: "Intermediate",
    description:
      "Interactive tutorial demonstrating the complete 3-qubit teleportation circuit, Bell measurement, classical feedforward, and state tomography.",
    whyRecommended:
      "Walks through the exact circuit mechanics of teleporting an unknown qubit state across two classical bits of communication.",
    free: true,
    url: "https://learning.quantum.ibm.com/",
    durationOrPages: "Interactive module",
    isPrimaryForLesson: "teleportation",
  },
  {
    id: "qiskit-grover-tutorial",
    title: "Grover's Algorithm & Amplitude Amplification",
    provider: "IBM Quantum Documentation & Tutorials",
    type: "interactive",
    topic: "Grover Search Algorithm",
    level: "Advanced",
    description:
      "Detailed step-by-step implementation of the oracle, reflection about the mean (diffusion operator), and geometric rotations in 2D subspace.",
    whyRecommended:
      "Provides geometric derivations alongside runnable Qiskit circuit code for solving boolean satisfiability and database search.",
    free: true,
    url: "https://docs.quantum.ibm.com/",
    durationOrPages: "Interactive tutorial",
    isPrimaryForLesson: "grovers-algorithm",
  },

  // --- LEVEL 4: NEAR-TERM & NISQ ---
  {
    id: "vqe-pennylane-tutorial",
    title: "Variational Quantum Eigensolver (VQE) Tutorial",
    provider: "Xanadu PennyLane",
    type: "interactive",
    topic: "VQE & Variational Quantum Algorithms",
    level: "Advanced",
    description:
      "Learn how to find ground state molecular energies using parameterized quantum circuits and classical gradient descent on NISQ hardware.",
    whyRecommended:
      "Clear explanation of the Rayleigh-Ritz variational principle and practical hands-on chemical Hamiltonian optimization.",
    free: true,
    url: "https://codebook.xanadu.ai/",
    durationOrPages: "Interactive coding module",
    isPrimaryForLesson: "vqe-nisq",
  },
  {
    id: "ms-azure-quantum",
    title: "Azure Quantum Learning & Q# Resource Estimation",
    provider: "Microsoft Quantum",
    type: "documentation",
    topic: "NISQ Systems & Resource Estimation",
    level: "Intermediate",
    description:
      "Explore realistic physical vs logical qubit scaling, noise models, and quantum resource estimation for fault-tolerant architectures.",
    whyRecommended:
      "Essential for understanding the transition from noisy intermediate-scale quantum devices to fault-tolerant error-corrected machines.",
    free: true,
    url: "https://learn.microsoft.com/en-us/azure/quantum/",
    durationOrPages: "Technical documentation",
  },
];

export function getRecommendedResourceForLesson(
  lessonId: string
): QuantumResource | undefined {
  return RESOURCES.find((r) => r.isPrimaryForLesson === lessonId);
}

export function getResourcesForLesson(lessonId: string): QuantumResource[] {
  const recommended = getRecommendedResourceForLesson(lessonId);
  const related = RESOURCES.filter(
    (r) => r.id !== recommended?.id
  ).slice(0, 3);

  return recommended ? [recommended, ...related] : related;
}
