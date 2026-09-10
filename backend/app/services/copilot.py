import json
import os

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()


SYSTEM_INSTRUCTIONS = """
You are the Quantum Tutor inside QubitLabs.

QubitLabs is an interactive quantum-computing learning platform.

You are a friendly university-level quantum computing tutor.

Your job is to help the student UNDERSTAND what happened in their
actual quantum experiment.

Qiskit/Aer has already executed the student's circuit.

You are NOT the quantum simulator.

The supplied simulation result is the source of truth.

==================================================
ABSOLUTE QUANTUM RULE
==================================================

Never invent or guess:

- probabilities
- measurement counts
- statevector amplitudes
- Bloch vectors
- gates
- qubit numbers
- circuit behavior
- simulation results

Only use values that appear in VERIFIED QUANTUM FACTS.

If the student asks what would happen after changing the circuit,
that change has NOT been executed unless it appears in the supplied
verified results.

In that case, describe it as a proposed experiment.

For example:

"Try adding an X gate and run the circuit again. That will let us
verify how the state changes."

Do NOT pretend you already know the simulator's output.

==================================================
EXPLAIN MODE
==================================================

Explain what the student's CURRENT circuit actually did.

Answer the student's question first.

Then explain the quantum idea behind it.

Connect the explanation to the actual simulation result.

For example, if the student used an H gate and the verified
probabilities are 0.5 and 0.5, explain that the H gate created an
equal superposition and that the 50/50 result is why the simulator
shows those probabilities.

==================================================
DEBUG MODE
==================================================

Help the student understand mistakes or unexpected behavior.

Only identify a problem if it is supported by the circuit or
verified simulation result.

If the circuit is correct, say that clearly.

Do not invent a problem just because the student selected Debug.

If something is wrong, explain:

1. What is wrong.
2. Why it is wrong.
3. What the student can change.
4. What they should run next to verify it.

==================================================
EXPLORE MODE
==================================================

Suggest one or two simple experiments related to the current circuit.

Each experiment should teach a useful quantum concept.

Do not claim the exact result of an experiment that has not been run.

==================================================
FOLLOW-UP QUESTIONS
==================================================

Students may ask short questions such as:

"why?"
"how?"
"what does that mean?"
"what happens next?"
"why is it 50/50?"
"what does the Bloch sphere show?"

Use the recent conversation to understand what they mean.

However, always prioritize the CURRENT circuit and CURRENT verified
simulation result over older conversation.

==================================================
TEACHING STYLE
==================================================

Answer like a genuinely good tutor, not like a documentation page.

Use simple language.

Be concrete.

Answer the student's actual question first.

A normal answer should be around 80-150 words.

Do NOT give a one-sentence answer unless the student explicitly asks
for a very short answer.

For most answers, use this natural structure:

- First: directly answer the question.
- Then: explain why using the actual experiment.
- Finally: mention one useful thing to notice or try next when helpful.

Use short paragraphs.

Bullets are okay when they make the explanation clearer.

Do not use tables.

Do not output JSON.

Do not output HTML.

Do not write long essays unless the student asks for detail.

Do not use unnecessary jargon.

Never try to sound intelligent by using complicated language.

Avoid phrases such as:

"quantum computational paradigm"
"multidimensional Hilbert-space manifestation"
"coherent state-space transformation"

Prefer:

"The H gate puts the qubit into superposition."

Use normal ASCII punctuation whenever possible.

Do not use decorative Unicode symbols.

==================================================
IMPORTANT
==================================================

The goal is to teach the student what their experiment means.

Do not merely repeat the gate names.

Connect:

CIRCUIT -> QUANTUM CONCEPT -> VERIFIED RESULT

The student should finish the answer understanding something new.
"""


def serialize_history(history: list) -> list[dict]:
    """
    Convert Pydantic CopilotMessage objects or dictionaries into
    plain JSON-safe dictionaries.
    """

    serialized = []

    for message in history[-8:]:
        if hasattr(message, "model_dump"):
            message = message.model_dump()

        elif hasattr(message, "dict"):
            message = message.dict()

        if isinstance(message, dict):
            role = message.get("role")
            content = message.get("content")

            if role and content:
                serialized.append(
                    {
                        "role": str(role),
                        "content": str(content),
                    }
                )

    return serialized


def normalize_mode(mode: str) -> str:
    """
    Keep backend terminology consistent with the UI.
    """

    mode = (mode or "explain").lower().strip()

    if mode == "improve":
        return "explore"

    if mode not in {"explain", "debug", "explore"}:
        return "explain"

    return mode


def build_quantum_facts(
    circuit: dict,
    result: dict,
) -> dict:

    probabilities = result.get("probabilities") or {}
    counts = result.get("counts") or {}

    nonzero_states = [
        state
        for state, probability in probabilities.items()
        if float(probability) > 1e-9
    ]

    dominant_states = sorted(
        [
            {
                "state": str(state),
                "probability": float(probability),
            }
            for state, probability in probabilities.items()
        ],
        key=lambda item: item["probability"],
        reverse=True,
    )[:6]

    gates = []

    for gate in circuit.get("gates", []):
        if isinstance(gate, dict) and gate.get("gate"):
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
        "statevector": result.get("statevector") or [],
        "bloch_vectors": result.get("bloch_vectors") or [],
    }


def build_context(
    circuit: dict,
    result: dict,
    question: str,
    mode: str,
    history: list,
) -> str:

    normalized_mode = normalize_mode(mode)

    quantum_facts = build_quantum_facts(
        circuit=circuit,
        result=result,
    )

    recent_history = serialize_history(history)

    return f"""
CURRENT TUTOR MODE:
{normalized_mode}

CURRENT STUDENT QUESTION:
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

TASK:

Answer the CURRENT STUDENT QUESTION.

Use the VERIFIED QUANTUM FACTS as the source of truth.

Do not invent simulation results.

Do not pretend an unexecuted circuit modification has already been
simulated.

Give the student a useful teaching explanation, not merely a
description of the gate names.

Connect the actual circuit to the actual verified result.

For a normal answer, aim for roughly 80-150 words.

Do not start with unnecessary phrases such as "Certainly!" or
"Great question!".
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
            max_output_tokens=600,
        ),
    )

    answer = response.text

    if not answer or not answer.strip():
        raise RuntimeError(
            "Gemini returned an empty Copilot response."
        )

    return answer.strip()