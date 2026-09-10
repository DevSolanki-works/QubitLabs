export type Rank = {
  tier: number;
  name: string;
  minXP: number;
  nextXP: number | null;
  badge: string;
  description: string;
};

export const RANKS: Rank[] = [
  {
    tier: 1,
    name: "Qubit Novice",
    minXP: 0,
    nextXP: 100,
    badge: "01",
    description: "Taking your first steps into statevectors and quantum states.",
  },
  {
    tier: 2,
    name: "Quantum Explorer",
    minXP: 100,
    nextXP: 250,
    badge: "02",
    description: "Manipulating single-qubit transformations and measurement statistics.",
  },
  {
    tier: 3,
    name: "Superposition Specialist",
    minXP: 250,
    nextXP: 500,
    badge: "03",
    description: "Mastering Hadamard gates, phase rotations, and the Bloch sphere.",
  },
  {
    tier: 4,
    name: "Entanglement Engineer",
    minXP: 500,
    nextXP: 850,
    badge: "04",
    description: "Constructing multi-qubit tensor states and maximally entangled Bell pairs.",
  },
  {
    tier: 5,
    name: "Circuit Architect",
    minXP: 850,
    nextXP: 1300,
    badge: "05",
    description: "Designing multi-stage reversible circuits and multi-qubit interference.",
  },
  {
    tier: 6,
    name: "Algorithm Pioneer",
    minXP: 1300,
    nextXP: 1900,
    badge: "06",
    description: "Implementing quantum oracles, phase kickback, and Grover search.",
  },
  {
    tier: 7,
    name: "Quantum Researcher",
    minXP: 1900,
    nextXP: 2600,
    badge: "07",
    description: "Exploring variational quantum algorithms and NISQ quantum computing.",
  },
  {
    tier: 8,
    name: "Quantum Master",
    minXP: 2600,
    nextXP: null,
    badge: "08",
    description: "Demonstrated theoretical depth and hands-on quantum circuit mastery.",
  },
];

export type Achievement = {
  id: string;
  title: string;
  description: string;
  category: "Foundations" | "Circuits" | "Algorithms" | "Scholar";
  iconName: string;
  xpReward: number;
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-qubit",
    title: "First Qubit",
    description: "Completed your first quantum computing lesson.",
    category: "Foundations",
    iconName: "Atom",
    xpReward: 30,
  },
  {
    id: "quantum-measure",
    title: "State Collapse",
    description: "Observed Born's rule and wavefunction collapse on AerSimulator.",
    category: "Foundations",
    iconName: "Eye",
    xpReward: 30,
  },
  {
    id: "pure-superposition",
    title: "Pure Superposition",
    description: "Transformed |0⟩ into equal superposition |+⟩ using Hadamard.",
    category: "Foundations",
    iconName: "Zap",
    xpReward: 40,
  },
  {
    id: "spooky-correlation",
    title: "Spooky Correlation",
    description: "Generated a maximally entangled Bell pair (|00⟩ + |11⟩)/√2.",
    category: "Circuits",
    iconName: "Share2",
    xpReward: 50,
  },
  {
    id: "phase-kickback",
    title: "Phase Kickback",
    description: "Harnessed phase interference in the Deutsch-Jozsa algorithm.",
    category: "Algorithms",
    iconName: "Sparkles",
    xpReward: 60,
  },
  {
    id: "database-inverter",
    title: "Quantum Inversion",
    description: "Implemented Grover amplitude amplification on 2 qubits.",
    category: "Algorithms",
    iconName: "Search",
    xpReward: 75,
  },
  {
    id: "theory-ace",
    title: "Theory Ace",
    description: "Scored 100% on any quantum conceptual quiz on the first try.",
    category: "Scholar",
    iconName: "GraduationCap",
    xpReward: 50,
  },
  {
    id: "foundations-scholar",
    title: "Foundations Scholar",
    description: "Completed all Level 1 quantum foundations lessons.",
    category: "Scholar",
    iconName: "Trophy",
    xpReward: 80,
  },
  {
    id: "coherent-streak",
    title: "Coherent Streak",
    description: "Maintained a 3-day learning streak without decoherence.",
    category: "Scholar",
    iconName: "Flame",
    xpReward: 60,
  },
  {
    id: "lab-pioneer",
    title: "Lab Pioneer",
    description: "Simulated 10 or more quantum circuits in Quantum Lab.",
    category: "Circuits",
    iconName: "FlaskConical",
    xpReward: 40,
  },
  {
    id: "copilot-inquirer",
    title: "Quantum Inquirer",
    description: "Consulted Gemini Quantum Copilot for theoretical insight.",
    category: "Scholar",
    iconName: "Bot",
    xpReward: 25,
  },
  {
    id: "algorithm-master",
    title: "Algorithm Architect",
    description: "Completed all quantum algorithm lessons & challenges.",
    category: "Algorithms",
    iconName: "Cpu",
    xpReward: 100,
  },
];

export type GamificationState = {
  xp: number;
  unlockedAchievements: { id: string; unlockedAt: string }[];
  simulationCount: number;
  copilotInquiryCount: number;
  streak: {
    lastActiveDate: string; // YYYY-MM-DD
    currentStreak: number;
    longestStreak: number;
  };
  quizzes: Record<
    string,
    {
      passed: boolean;
      score: number;
      total: number;
      attempts: number;
      bestScore: number;
      completedAt: string;
    }
  >;
  history: {
    id: string;
    description: string;
    xp: number;
    timestamp: string;
  }[];
};

const STORAGE_KEY = "qubitlabs-gamification";

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getYesterdayString(): string {
  const yesterday = new Date(Date.now() - 86400000);
  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, "0");
  const day = String(yesterday.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const DEFAULT_STATE: GamificationState = {
  xp: 0,
  unlockedAchievements: [],
  simulationCount: 0,
  copilotInquiryCount: 0,
  streak: {
    lastActiveDate: "",
    currentStreak: 0,
    longestStreak: 0,
  },
  quizzes: {},
  history: [],
};

export function getGamificationState(): GamificationState {
  if (typeof window === "undefined") {
    return DEFAULT_STATE;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_STATE;
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATE,
      ...parsed,
      streak: { ...DEFAULT_STATE.streak, ...(parsed.streak || {}) },
      quizzes: parsed.quizzes || {},
      unlockedAchievements: parsed.unlockedAchievements || [],
      history: parsed.history || [],
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveGamificationState(state: GamificationState): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event("qubitlabs-gamification-updated"));
  } catch (err) {
    console.error("Failed to persist gamification state:", err);
  }
}

export function getCurrentRank(xp: number): {
  rank: Rank;
  currentLevelXP: number;
  nextLevelXP: number;
  progressPercent: number;
  nextRank: Rank | null;
} {
  let activeRank = RANKS[0];
  let nextRank: Rank | null = RANKS[1];

  for (let i = 0; i < RANKS.length; i++) {
    if (xp >= RANKS[i].minXP) {
      activeRank = RANKS[i];
      nextRank = i + 1 < RANKS.length ? RANKS[i + 1] : null;
    }
  }

  if (!nextRank) {
    return {
      rank: activeRank,
      currentLevelXP: xp - activeRank.minXP,
      nextLevelXP: 0,
      progressPercent: 100,
      nextRank: null,
    };
  }

  const range = nextRank.minXP - activeRank.minXP;
  const progressInLevel = Math.max(0, xp - activeRank.minXP);
  const progressPercent = Math.min(100, Math.round((progressInLevel / range) * 100));

  return {
    rank: activeRank,
    currentLevelXP: progressInLevel,
    nextLevelXP: range,
    progressPercent,
    nextRank,
  };
}

export function updateStreak(): GamificationState {
  const state = getGamificationState();
  const today = getTodayString();
  const yesterday = getYesterdayString();

  if (state.streak.lastActiveDate === today) {
    return state;
  }

  let newCurrent = 1;
  if (state.streak.lastActiveDate === yesterday) {
    newCurrent = state.streak.currentStreak + 1;
  }

  const newLongest = Math.max(state.streak.longestStreak, newCurrent);

  state.streak = {
    lastActiveDate: today,
    currentStreak: newCurrent,
    longestStreak: newLongest,
  };

  // Check 3-day streak achievement
  if (newCurrent >= 3 && !state.unlockedAchievements.some((a) => a.id === "coherent-streak")) {
    state.unlockedAchievements.push({
      id: "coherent-streak",
      unlockedAt: new Date().toISOString(),
    });
    state.xp += 60;
  }

  saveGamificationState(state);
  return state;
}

export function awardXP(amount: number, description: string): GamificationState {
  const state = updateStreak();
  state.xp += amount;
  state.history = [
    {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      description,
      xp: amount,
      timestamp: new Date().toISOString(),
    },
    ...state.history.slice(0, 19),
  ];

  saveGamificationState(state);
  return state;
}

export function unlockAchievement(achievementId: string): GamificationState {
  const state = getGamificationState();
  if (state.unlockedAchievements.some((a) => a.id === achievementId)) {
    return state;
  }

  const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
  if (!achievement) {
    return state;
  }

  state.unlockedAchievements.push({
    id: achievementId,
    unlockedAt: new Date().toISOString(),
  });
  state.xp += achievement.xpReward;
  state.history = [
    {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      description: `Achievement: ${achievement.title}`,
      xp: achievement.xpReward,
      timestamp: new Date().toISOString(),
    },
    ...state.history.slice(0, 19),
  ];

  saveGamificationState(state);
  return state;
}

export function recordSimulation(): GamificationState {
  const state = updateStreak();
  state.simulationCount += 1;

  // Award 15 XP for simulating
  state.xp += 15;

  if (state.simulationCount >= 10 && !state.unlockedAchievements.some((a) => a.id === "lab-pioneer")) {
    const ach = ACHIEVEMENTS.find((a) => a.id === "lab-pioneer");
    if (ach) {
      state.unlockedAchievements.push({
        id: ach.id,
        unlockedAt: new Date().toISOString(),
      });
      state.xp += ach.xpReward;
    }
  }

  saveGamificationState(state);
  return state;
}

export function recordCopilotInquiry(): GamificationState {
  const state = updateStreak();
  state.copilotInquiryCount += 1;

  if (!state.unlockedAchievements.some((a) => a.id === "copilot-inquirer")) {
    const ach = ACHIEVEMENTS.find((a) => a.id === "copilot-inquirer");
    if (ach) {
      state.unlockedAchievements.push({
        id: ach.id,
        unlockedAt: new Date().toISOString(),
      });
      state.xp += ach.xpReward;
    }
  }

  saveGamificationState(state);
  return state;
}

export function recordQuizSubmission(
  lessonId: string,
  score: number,
  total: number
): { state: GamificationState; xpEarned: number; isPerfect: boolean; passed: boolean } {
  const state = updateStreak();
  const passed = score / total >= 0.66;
  const isPerfect = score === total;
  const existing = state.quizzes[lessonId];
  const attempts = (existing?.attempts || 0) + 1;
  const isFirstTry = attempts === 1;

  let xpEarned = 0;
  // If passed for the first time
  if (passed && (!existing || !existing.passed)) {
    xpEarned += 25;
  }
  // Bonus if perfect on first attempt
  if (isPerfect && isFirstTry) {
    xpEarned += 15;
    if (!state.unlockedAchievements.some((a) => a.id === "theory-ace")) {
      unlockAchievement("theory-ace");
    }
  }

  state.quizzes[lessonId] = {
    passed: passed || Boolean(existing?.passed),
    score,
    total,
    attempts,
    bestScore: Math.max(score, existing?.bestScore || 0),
    completedAt: new Date().toISOString(),
  };

  if (xpEarned > 0) {
    state.xp += xpEarned;
    state.history = [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        description: `Quiz: ${lessonId} (${score}/${total})`,
        xp: xpEarned,
        timestamp: new Date().toISOString(),
      },
      ...state.history.slice(0, 19),
    ];
  }

  saveGamificationState(state);
  return { state, xpEarned, isPerfect, passed };
}
