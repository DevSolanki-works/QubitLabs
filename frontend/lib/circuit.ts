import {
  CircuitOperation,
  QuantumCircuit,
} from "./quantum";

export function createId(): string {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

export function createEmptyCircuit(
  numQubits = 2,
  numColumns = 6
): QuantumCircuit {
  return {
    numQubits,
    numColumns,
    operations: [],
  };
}

export function addSingleQubitGate(
  circuit: QuantumCircuit,
  type: "H" | "X" | "Y" | "Z" | "S" | "T" | "M",
  qubit: number,
  column: number
): QuantumCircuit {
  const operations = circuit.operations.filter(
    (operation) =>
      !(
        "qubit" in operation &&
        operation.qubit === qubit &&
        operation.column === column
      )
  );

  operations.push({
    id: createId(),
    type,
    qubit,
    column,
  });

  return {
    ...circuit,
    operations,
  };
}

export function addCNOT(
  circuit: QuantumCircuit,
  control: number,
  target: number,
  column: number
): QuantumCircuit {
  const operations = circuit.operations.filter(
    (operation) =>
      !(
        operation.type === "CNOT" &&
        operation.column === column
      )
  );

  operations.push({
    id: createId(),
    type: "CNOT",
    control,
    target,
    column,
  });

  return {
    ...circuit,
    operations,
  };
}

export function removeOperation(
  circuit: QuantumCircuit,
  id: string
): QuantumCircuit {
  return {
    ...circuit,
    operations: circuit.operations.filter(
      (operation) => operation.id !== id
    ),
  };
}

export function clearCircuit(
  circuit: QuantumCircuit
): QuantumCircuit {
  return {
    ...circuit,
    operations: [],
  };
}

export function addQubit(
  circuit: QuantumCircuit
): QuantumCircuit {
  if (circuit.numQubits >= 12) {
    return circuit;
  }

  return {
    ...circuit,
    numQubits: circuit.numQubits + 1,
  };
}

export function removeQubit(
  circuit: QuantumCircuit
): QuantumCircuit {
  if (circuit.numQubits <= 1) {
    return circuit;
  }

  const newQubitCount =
    circuit.numQubits - 1;

  return {
    ...circuit,
    numQubits: newQubitCount,
    operations: circuit.operations.filter(
      (operation) => {
        if ("qubit" in operation) {
          return operation.qubit < newQubitCount;
        }

        return (
          operation.control < newQubitCount &&
          operation.target < newQubitCount
        );
      }
    ),
  };
}

export function addColumn(
  circuit: QuantumCircuit
): QuantumCircuit {
  if (circuit.numColumns >= 20) {
    return circuit;
  }

  return {
    ...circuit,
    numColumns: circuit.numColumns + 1,
  };
}

export function removeColumn(
  circuit: QuantumCircuit
): QuantumCircuit {
  if (circuit.numColumns <= 1) {
    return circuit;
  }

  const newColumnCount =
    circuit.numColumns - 1;

  return {
    ...circuit,
    numColumns: newColumnCount,
    operations: circuit.operations.filter(
      (operation) =>
        operation.column < newColumnCount
    ),
  };
}

export function serializeCircuit(
  circuit: QuantumCircuit
) {
  return circuit.operations.map(
    (operation: CircuitOperation) => {
      if (operation.type === "CNOT") {
        return {
          gate: "CNOT",
          control: operation.control,
          target: operation.target,
          column: operation.column,
        };
      }

      return {
        gate: operation.type,
        qubit: operation.qubit,
        column: operation.column,
      };
    }
  );
}