from typing import Literal

from pydantic import BaseModel, Field


GateName = Literal[
    "H",
    "X",
    "Y",
    "Z",
    "S",
    "T",
    "CX",
    "CNOT",
    "M",
]


class GateOperation(BaseModel):
    gate: GateName

    qubit: int | None = None

    control: int | None = None

    target: int | None = None

    column: int | None = None


class SimulationRequest(BaseModel):
    num_qubits: int = Field(
        default=2,
        ge=1,
        le=12,
    )

    gates: list[GateOperation] = []

    shots: int = Field(
        default=1024,
        ge=1,
        le=100000,
    )


class SimulationResponse(BaseModel):
    num_qubits: int
    circuit: list[dict]
    statevector: list[dict[str, float]]
    probabilities: dict[str, float]
    counts: dict[str, int]
    shots: int