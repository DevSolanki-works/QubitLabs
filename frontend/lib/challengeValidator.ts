import type { Challenge } from "./challenges";

type CircuitGate = {
  gate: string;
  qubit: number;
  column: number;
  target?: number;
};

type SimulationResult = {
  probabilities?: Record<string, number>;
};

function normalizeGate(gate: string) {
  return gate.toUpperCase() === "CX"
    ? "CNOT"
    : gate.toUpperCase();
}

export function validateChallenge(
  challenge: Challenge,
  gates: CircuitGate[],
  result?: SimulationResult | null
) {
  const normalizedGates = gates
    .map((gate) => ({
      ...gate,
      gate: normalizeGate(gate.gate),
    }))
    .sort((a, b) => a.column - b.column);

  // --------------------------------------------------
  // Required gates
  // --------------------------------------------------

  for (const required of challenge.requiredGates) {
    const found = normalizedGates.some((gate) => {
      if (
        gate.gate !== normalizeGate(required.gate) ||
        gate.qubit !== required.qubit
      ) {
        return false;
      }

      if (
        required.target !== undefined &&
        gate.target !== required.target
      ) {
        return false;
      }

      return true;
    });

    if (!found) {
      if (required.target !== undefined) {
        return {
          passed: false,
          reason: `Add a ${required.gate} from q${required.qubit} to q${required.target}.`,
        };
      }

      return {
        passed: false,
        reason: `Add the ${required.gate} gate to q${required.qubit}.`,
      };
    }
  }

  // --------------------------------------------------
  // Check ordering
  // --------------------------------------------------

  const hGate = normalizedGates.find(
    (gate) =>
      gate.gate === "H" &&
      gate.qubit === 0
  );

  const cnotGate = normalizedGates.find(
    (gate) =>
      gate.gate === "CNOT" &&
      gate.qubit === 0 &&
      gate.target === 1
  );

  if (hGate && cnotGate) {
    if (hGate.column >= cnotGate.column) {
      return {
        passed: false,
        reason:
          "The H gate should come before the CNOT. Try placing H on an earlier column.",
      };
    }
  }

  // --------------------------------------------------
  // Need simulation
  // --------------------------------------------------

  if (!result?.probabilities) {
    return {
      passed: false,
      reason:
        "Run the circuit to check your result.",
    };
  }

  // --------------------------------------------------
  // Probability validation
  // --------------------------------------------------

  if (challenge.targetProbabilities) {
    const probabilities =
      result.probabilities;

    for (const [state, target] of Object.entries(
      challenge.targetProbabilities
    )) {
      const actual =
        probabilities[state] ?? 0;

      if (
        Math.abs(actual - target) > 0.1
      ) {
        return {
          passed: false,
          reason:
            "The circuit is valid, but the measurement probabilities are not at the target yet.",
        };
      }
    }

    // Reject unexpected states
    for (const [
      state,
      probability,
    ] of Object.entries(probabilities)) {
      if (
        !(state in challenge.targetProbabilities) &&
        probability > 0.1
      ) {
        return {
          passed: false,
          reason:
            "The result contains an unexpected measurement outcome. Check your circuit and try again.",
        };
      }
    }
  }

  // --------------------------------------------------
  // Success
  // --------------------------------------------------

  return {
    passed: true,
    reason:
      "Challenge complete. You created the target quantum state.",
  };
}