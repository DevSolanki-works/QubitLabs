from fastapi import APIRouter, HTTPException

from app.quantum.models.copilot import (
    CopilotRequest,
    CopilotResponse,
)

from app.services.copilot import (
    explain_quantum_experiment,
)


router = APIRouter(
    prefix="/api/copilot",
    tags=["copilot"],
)


@router.post(
    "/explain",
    response_model=CopilotResponse,
)
def explain(request: CopilotRequest):

    try:
        answer = explain_quantum_experiment(
            circuit=request.circuit,
            result=request.result,
            question=request.question,
            mode=request.mode,
            history=request.history,
            challenge_context=request.challenge_context,
        )

        return CopilotResponse(
            answer=answer,
            mode=request.mode,
        )

    except RuntimeError as exc:
        raise HTTPException(
            status_code=503,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Copilot error: {exc}",
        ) from exc