import type { Challenge } from "./challenges";

export type CircuitGate = {
  gate: string;
  qubit?: number;
  control?: number;
  target?: number;
  column: number;
};

export type SimulationResultLike = {
  num_qubits?: number;
  probabilities?: Record<string, number>;
  counts?: Record<string, number>;
  shots?: number;
};

export type ValidationMetric = {
  label: string;
  actual: string;
  expected: string;
  passed: boolean;
};

export type ValidationResult = {
  passed: boolean;
  reason: string;
  metrics: ValidationMetric[];
};

function normalizeGate(gate: string): string {
  const upper = gate.toUpperCase().trim();
  return upper === "CX" ? "CNOT" : upper;
}

export function validateChallenge(
  challenge: Challenge,
  gates: CircuitGate[],
  result?: SimulationResultLike | null
): ValidationResult {
  const metrics: ValidationMetric[] = [];

  // --------------------------------------------------
  // 1. Normalize operations
  // --------------------------------------------------
  const normalizedGates = gates
    .map((g) => ({
      gate: normalizeGate(g.gate),
      qubit: g.qubit !== undefined ? g.qubit : g.control,
      control: g.control !== undefined ? g.control : g.qubit,
      target: g.target,
      column: g.column,
    }))
    .sort((a, b) => a.column - b.column);

  // --------------------------------------------------
  // 2. Check required gates
  // --------------------------------------------------
  for (const req of challenge.requiredGates) {
    const reqGate = normalizeGate(req.gate);
    const reqControl = req.control !== undefined ? req.control : req.qubit;
    const reqTarget = req.target;

    const found = normalizedGates.some((g) => {
      if (g.gate !== reqGate) return false;

      if (reqGate === "CNOT") {
        if (reqControl !== undefined && g.control !== reqControl) return false;
        if (reqTarget !== undefined && g.target !== reqTarget) return false;
      } else {
        if (req.qubit !== undefined && g.qubit !== req.qubit) return false;
      }

      return true;
    });

    if (!found) {
      if (reqGate === "CNOT") {
        return {
          passed: false,
          reason: `Add a CNOT gate with control on q${reqControl} and target on q${reqTarget}.`,
          metrics,
        };
      }
      return {
        passed: false,
        reason: `Add the ${reqGate} gate to q${req.qubit ?? 0}.`,
        metrics,
      };
    }
  }

  // --------------------------------------------------
  // 3. Check gate order
  // --------------------------------------------------
  if (challenge.gateOrder && challenge.gateOrder.length > 0) {
    for (const order of challenge.gateOrder) {
      const beforeGateName = normalizeGate(order.beforeGate);
      const afterGateName = normalizeGate(order.afterGate);

      const beforeGate = normalizedGates.find(
        (g) =>
          g.gate === beforeGateName &&
          (order.beforeQubit === undefined || g.qubit === order.beforeQubit)
      );

      const afterGate = normalizedGates.find(
        (g) =>
          g.gate === afterGateName &&
          (order.afterQubit === undefined || g.qubit === order.afterQubit)
      );

      if (beforeGate && afterGate && beforeGate.column >= afterGate.column) {
        return {
          passed: false,
          reason: `The ${order.beforeGate} gate must come before the ${order.afterGate} gate. Place it in an earlier column.`,
          metrics,
        };
      }
    }
  }

  // --------------------------------------------------
  // 4. Verify simulation was executed
  // --------------------------------------------------
  if (!result || !result.probabilities) {
    return {
      passed: false,
      reason: "Run the circuit to simulate and evaluate the quantum state.",
      metrics,
    };
  }

  const probabilities = result.probabilities;

  // --------------------------------------------------
  // 5. Target probabilities validation (e.g. Superposition, Bell state)
  // --------------------------------------------------
  if (challenge.targetProbabilities) {
    const tolerance = 0.12;

    for (const [state, target] of Object.entries(challenge.targetProbabilities)) {
      const actual = probabilities[state] ?? 0;
      const passState = Math.abs(actual - target) <= tolerance;

      metrics.push({
        label: `|${state}⟩ Probability`,
        actual: `${(actual * 100).toFixed(1)}%`,
        expected: `~${(target * 100).toFixed(0)}%`,
        passed: passState,
      });

      if (!passState) {
        return {
          passed: false,
          reason: `State |${state}⟩ probability is ${(actual * 100).toFixed(1)}%, but expected ~${(target * 100).toFixed(0)}%. Check your gate placement.`,
          metrics,
        };
      }
    }

    // Reject unexpected states with significant probability (> 10%)
    for (const [state, actual] of Object.entries(probabilities)) {
      if (!(state in challenge.targetProbabilities) && actual > 0.1) {
        metrics.push({
          label: `Unexpected |${state}⟩`,
          actual: `${(actual * 100).toFixed(1)}%`,
          expected: "0%",
          passed: false,
        });

        return {
          passed: false,
          reason: `Unexpected measurement state |${state}⟩ appeared with ${(actual * 100).toFixed(1)}% probability. Verify your circuit configuration.`,
          metrics,
        };
      }
    }
  }

  // --------------------------------------------------
  // 6. Custom target condition (e.g. Deutsch algorithm phase kickback)
  // --------------------------------------------------
  if (challenge.targetCondition) {
    const cond = challenge.targetCondition;
    if (cond.type === "qubit_probability") {
      let matchingProb = 0;

      for (const [bitstring, prob] of Object.entries(probabilities)) {
        // Qiskit bitstring order: q_n-1 ... q_0. So q_k is at index (len - 1 - k)
        const charIdx = bitstring.length - 1 - cond.qubit;
        if (charIdx >= 0 && bitstring[charIdx] === String(cond.expectedValue)) {
          matchingProb += prob;
        }
      }

      const passCondition = matchingProb >= cond.minProbability;
      metrics.push({
        label: `q${cond.qubit} = |${cond.expectedValue}⟩`,
        actual: `${(matchingProb * 100).toFixed(1)}%`,
        expected: `≥ ${(cond.minProbability * 100).toFixed(0)}%`,
        passed: passCondition,
      });

      if (!passCondition) {
        return {
          passed: false,
          reason: `${cond.description}. Current probability is ${(matchingProb * 100).toFixed(1)}%.`,
          metrics,
        };
      }
    }
  }

  // --------------------------------------------------
  // Success!
  // --------------------------------------------------
  return {
    passed: true,
    reason: "Challenge complete! You created the target quantum state.",
    metrics,
  };
}
