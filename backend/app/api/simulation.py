from fastapi import APIRouter, HTTPException

from app.models.quantum import (
    SimulationRequest,
    SimulationResponse,
)
from app.quantum.engine import quantum_engine


router = APIRouter(
    prefix="/api/quantum",
    tags=["quantum"],
)


@router.post(
    "/simulate",
    response_model=SimulationResponse,
)
def simulate(request: SimulationRequest):

    try:

        gates = [
            gate.model_dump(
                exclude_none=True,
            )
            for gate in request.gates
        ]

        result = quantum_engine.simulate(
            num_qubits=request.num_qubits,
            gates=gates,
            shots=request.shots,
        )

        return result

    except Exception as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc