from fastapi import APIRouter, HTTPException

from app.quantum.models.copilot import (
    CopilotRequest,
    CopilotResponse,
)

from app.services.copilot import (
    explain_quantum_experiment,
    generate_local_quantum_explanation,
)


router = APIRouter(
    prefix="/api/copilot",
    tags=["copilot"],
)

quantum_router = APIRouter(
    prefix="/api/quantum",
    tags=["quantum"],
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

    except Exception:
        fallback = generate_local_quantum_explanation(
            circuit=request.circuit or {},
            result=request.result or {},
            question=request.question or "",
            mode=request.mode or "explain",
        )
        return CopilotResponse(
            answer=fallback,
            mode=request.mode or "explain",
        )


@quantum_router.post("/copilot")
def quantum_copilot(payload: dict):
    question = payload.get("question") or payload.get("prompt") or "Explain this circuit"
    mode = payload.get("mode") or "explain"
    circuit = payload.get("circuit") or {}
    result = payload.get("result") or {}
    history = payload.get("history") or []
    challenge = payload.get("challenge_context")
    if isinstance(challenge, dict):
        challenge_str = challenge.get("title")
    else:
        challenge_str = challenge

    try:
        answer = explain_quantum_experiment(
            circuit=circuit,
            result=result,
            question=question,
            mode=mode,
            history=history,
            challenge_context=challenge_str,
        )
        return {
            "answer": answer,
            "response": answer,
            "message": answer,
            "mode": mode,
        }
    except Exception:
        fallback = generate_local_quantum_explanation(
            circuit=circuit,
            result=result,
            question=question,
            mode=mode,
        )
        return {
            "answer": fallback,
            "response": fallback,
            "message": fallback,
            "mode": mode,
        }