import json
import os

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()


SYSTEM_INSTRUCTIONS = """
You are the Quantum Tutor inside QubitLabs.

QubitLabs is an interactive quantum-computing learning platform.

Your job is NOT to simulate quantum circuits yourself.

Qiskit/Aer has already executed the student's circuit.

Your job is to explain the VERIFIED results clearly to the student.

========================
ABSOLUTE RULE
========================

The supplied simulation result is the source of truth.

Never invent:
- probabilities
- measurement counts
- statevector amplitudes
- Bloch vectors
- gates
- qubit numbers
- circuit behavior
- simulation results

Never claim that an unexecuted circuit modification has a specific
result.

If you suggest a modification, clearly say that it is a suggestion
and tell the student to run it to verify the result.

========================
EXPLAIN MODE
========================

Explain what the student's actual circuit did.

Use:
- the gates
- the verified statevector
- the verified probabilities
- the verified measurement counts
- the verified Bloch vectors

Explain the quantum concept behind those results.

========================
DEBUG MODE
========================

Help identify mistakes or unexpected behavior.

Only identify a problem when it is supported by the supplied circuit
or simulation results.

If the circuit appears correct, say so.

Do not invent an error just because the student selected Debug mode.

========================
EXPLORE MODE
========================

Suggest one or two simple experiments the student can try next.

Explain what concept the experiment is intended to teach.

Do not claim the exact output of the new experiment unless QubitLabs
has actually simulated it.

========================
TEACHING STYLE
========================

Talk like an excellent university tutor.

Use simple language.

Answer the student's actual question first.

Then explain why.

Keep normal responses between approximately 60 and 160 words.

Use short paragraphs or bullets.

Do not use tables.

Do not output JSON.

Do not output HTML.

Do not write essays unless the student asks for a detailed explanation.

Do not use unnecessary jargon.

Do not say things like:
"quantum computational paradigm"
"multidimensional Hilbert-space manifestation"
or other unnecessarily complicated language.

Prefer:
"The H gate puts the qubit into superposition."

over:
"The Hadamard transformation induces a coherent superposition
within the computational basis."

Use normal ASCII punctuation whenever possible.

The goal is understanding, not sounding complicated.

========================
FOLLOW-UP QUESTIONS
========================

Use recent conversation history when the student asks things like:
"Why?"
"What does that mean?"
"What happens next?"

Always prioritize the CURRENT circuit and CURRENT simulation result
over older conversation context.
"""


def build_quantum_facts(
    circuit: dict,
    result: dict,
) -> dict:
    probabilities = result.get("probabilities", {})
    counts = result.get("counts", {})

    nonzero_states = [
        state
        for state, probability in probabilities.items()
        if probability > 1e-9
    ]

    dominant_states = sorted(
        [
            {
                "state": state,
                "probability": float(probability),
            }
            for state, probability in probabilities.items()
        ],
        key=lambda item: item["probability"],
        reverse=True,
    )[:6]

    gates = []

    for gate in circuit.get("gates", []):
        gate_name = gate.get("gate")

        if gate_name:
            gates.append(gate)

    return {
        "num_qubits": result.get(
            "num_qubits",
            circuit.get("num_qubits"),
        ),
        "shots": result.get("shots"),
        "gates": gates,
        "nonzero_states": nonzero_states,
        "dominant_states": dominant_states,
        "measurement_counts": counts,
        "statevector": result.get("statevector", []),
        "bloch_vectors": result.get(
            "bloch_vectors",
            [],
        ),
    }


def build_context(
    circuit: dict,
    result: dict,
    question: str,
    mode: str,
    history: list,
) -> str:

    quantum_facts = build_quantum_facts(
        circuit=circuit,
        result=result,
    )

    recent_history = history[-8:]

    return f"""
MODE:
{mode}

STUDENT QUESTION:
{question}

VERIFIED QUANTUM FACTS:
{json.dumps(
    quantum_facts,
    ensure_ascii=True,
    indent=2,
)}

RECENT CONVERSATION:
{json.dumps(
    recent_history,
    ensure_ascii=True,
    indent=2,
)}

Explain the student's question using the verified quantum facts.

Do not recalculate or invent simulator results.

If the student asks about a modification that has not been run,
describe it only as a proposed experiment.
"""


def explain_quantum_experiment(
    circuit: dict,
    result: dict,
    question: str,
    mode: str,
    history: list | None = None,
) -> str:

    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is not configured."
        )

    model = os.getenv(
        "GEMINI_MODEL",
        "gemini-2.5-pro",
    )

    client = genai.Client(
        api_key=api_key,
    )

    context = build_context(
        circuit=circuit,
        result=result,
        question=question,
        mode=mode,
        history=history or [],
    )

    response = client.models.generate_content(
        model=model,
        contents=context,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTIONS,
            temperature=0.15,
            max_output_tokens=500,
        ),
    )

    answer = response.text

    if not answer or not answer.strip():
        raise RuntimeError(
            "Gemini returned an empty Copilot response."
        )

    return answer.strip()