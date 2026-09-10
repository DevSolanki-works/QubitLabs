from __future__ import annotations

from typing import Any

import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
from qiskit_aer import AerSimulator


SUPPORTED_GATES = {
    "H",
    "X",
    "Y",
    "Z",
    "S",
    "T",
    "CX",
    "CNOT",
    "M",
}


class QuantumEngine:
    """
    Quantum simulation engine for QubitLabs.

    Uses Qiskit's Statevector class for deterministic statevector
    calculation and Qiskit Aer for shot-based measurement simulation.
    """

    def __init__(self) -> None:
        self.simulator = AerSimulator()

    def build_circuit(
        self,
        num_qubits: int,
        gates: list[dict[str, Any]],
        include_measurements: bool = True,
    ) -> QuantumCircuit:

        qc = QuantumCircuit(num_qubits, num_qubits)

        has_measurement = False

        for operation in gates:
            gate = operation["gate"].upper()
            qubit = operation.get("qubit")

            if gate not in SUPPORTED_GATES:
                raise ValueError(f"Unsupported gate: {gate}")

            if gate == "H":
                self._validate_qubit(qubit, num_qubits)
                qc.h(qubit)

            elif gate == "X":
                self._validate_qubit(qubit, num_qubits)
                qc.x(qubit)

            elif gate == "Y":
                self._validate_qubit(qubit, num_qubits)
                qc.y(qubit)

            elif gate == "Z":
                self._validate_qubit(qubit, num_qubits)
                qc.z(qubit)

            elif gate == "S":
                self._validate_qubit(qubit, num_qubits)
                qc.s(qubit)

            elif gate == "T":
                self._validate_qubit(qubit, num_qubits)
                qc.t(qubit)

            elif gate in {"CX", "CNOT"}:
                control = operation.get("control")
                target = operation.get("target")

                if control is None or target is None:
                    raise ValueError(
                        "CNOT requires both control and target."
                    )

                self._validate_qubit(control, num_qubits)
                self._validate_qubit(target, num_qubits)

                if control == target:
                    raise ValueError(
                        "CNOT control and target must be different qubits."
                    )

                qc.cx(control, target)

            elif gate == "M":
                self._validate_qubit(qubit, num_qubits)
                qc.measure(qubit, qubit)
                has_measurement = True

        # If the frontend didn't explicitly add measurements,
        # automatically measure every qubit for shot simulation.
        if include_measurements and not has_measurement:
            qc.measure(range(num_qubits), range(num_qubits))

        return qc

    def build_unitary_circuit(
        self,
        num_qubits: int,
        gates: list[dict[str, Any]],
    ) -> QuantumCircuit:

        """
        Build a circuit containing only quantum operations.

        This circuit intentionally contains no measurements because
        statevector calculation must happen before measurement.
        """

        qc = QuantumCircuit(num_qubits)

        for operation in gates:
            gate = operation["gate"].upper()
            qubit = operation.get("qubit")

            if gate == "H":
                self._validate_qubit(qubit, num_qubits)
                qc.h(qubit)

            elif gate == "X":
                self._validate_qubit(qubit, num_qubits)
                qc.x(qubit)

            elif gate == "Y":
                self._validate_qubit(qubit, num_qubits)
                qc.y(qubit)

            elif gate == "Z":
                self._validate_qubit(qubit, num_qubits)
                qc.z(qubit)

            elif gate == "S":
                self._validate_qubit(qubit, num_qubits)
                qc.s(qubit)

            elif gate == "T":
                self._validate_qubit(qubit, num_qubits)
                qc.t(qubit)

            elif gate in {"CX", "CNOT"}:
                control = operation.get("control")
                target = operation.get("target")

                if control is None or target is None:
                    raise ValueError(
                        "CNOT requires both control and target."
                    )

                self._validate_qubit(control, num_qubits)
                self._validate_qubit(target, num_qubits)

                if control == target:
                    raise ValueError(
                        "CNOT control and target must be different qubits."
                    )

                qc.cx(control, target)

            elif gate == "M":
                # Measurements are intentionally ignored here.
                continue

            else:
                raise ValueError(f"Unsupported gate: {gate}")

        return qc

    def simulate(
        self,
        num_qubits: int,
        gates: list[dict[str, Any]],
        shots: int = 1024,
    ) -> dict[str, Any]:

        # ---------------------------------------------------------
        # 1. Build measurement-free quantum circuit
        # ---------------------------------------------------------

        unitary_circuit = self.build_unitary_circuit(
            num_qubits=num_qubits,
            gates=gates,
        )

        # ---------------------------------------------------------
        # 2. Calculate exact statevector
        # ---------------------------------------------------------

        statevector = Statevector.from_instruction(
            unitary_circuit
        )

        probabilities = self._statevector_probabilities(
            statevector,
            num_qubits,
        )

        # ---------------------------------------------------------
        # 3. Run shot-based measurement simulation
        # ---------------------------------------------------------

        measurement_circuit = self.build_circuit(
            num_qubits=num_qubits,
            gates=gates,
            include_measurements=True,
        )

        result = self.simulator.run(
            measurement_circuit,
            shots=shots,
        ).result()

        counts = result.get_counts()

        # ---------------------------------------------------------
        # 4. Return everything frontend needs
        # ---------------------------------------------------------

        return {
            "num_qubits": num_qubits,
            "circuit": gates,
            "statevector": self._serialize_statevector(
                statevector
            ),
            "probabilities": probabilities,
            "counts": dict(counts),
            "shots": shots,
        }

    @staticmethod
    def _validate_qubit(
        qubit: int | None,
        num_qubits: int,
    ) -> None:

        if qubit is None:
            raise ValueError("Qubit index is required.")

        if not isinstance(qubit, int):
            raise ValueError("Qubit index must be an integer.")

        if qubit < 0 or qubit >= num_qubits:
            raise ValueError(
                f"Qubit {qubit} is outside the circuit range "
                f"0-{num_qubits - 1}."
            )

    @staticmethod
    def _serialize_statevector(
        statevector,
    ) -> list[dict[str, float]]:

        output = []

        for amplitude in statevector:

            output.append(
                {
                    "real": float(np.real(amplitude)),
                    "imaginary": float(np.imag(amplitude)),
                    "magnitude": float(np.abs(amplitude)),
                    "phase": float(np.angle(amplitude)),
                }
            )

        return output

    @staticmethod
    def _statevector_probabilities(
        statevector,
        num_qubits: int,
    ) -> dict[str, float]:

        probabilities = {}

        for index, amplitude in enumerate(statevector):

            probability = float(np.abs(amplitude) ** 2)

            if probability < 1e-10:
                continue

            bitstring = format(
                index,
                f"0{num_qubits}b",
            )

            probabilities[bitstring] = round(
                probability,
                6,
            )

        return probabilities


quantum_engine = QuantumEngine()