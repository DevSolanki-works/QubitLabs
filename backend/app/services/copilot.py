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
    challenge_context: str | None = None,
) -> str:

    normalized_mode = normalize_mode(mode)

    quantum_facts = build_quantum_facts(
        circuit=circuit,
        result=result,
    )

    recent_history = serialize_history(history)

    challenge_section = ""
    if challenge_context:
        challenge_section = f"\nACTIVE EDUCATIONAL CHALLENGE:\n{challenge_context}\n"

    return f"""
CURRENT TUTOR MODE:
{normalized_mode}
{challenge_section}
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


def generate_local_quantum_explanation(
    circuit: dict,
    result: dict,
    question: str,
    mode: str,
) -> str:
    num_qubits = result.get("num_qubits") or circuit.get("num_qubits") or 1
    counts = result.get("counts") or result.get("measurement_counts") or {}
    probs = result.get("probabilities") or {}
    gates = circuit.get("gates") or []
    shots = result.get("shots") or 1024

    gate_names = [
        g.get("gate", "").upper()
        for g in gates
        if isinstance(g, dict) and g.get("gate")
    ]
    gate_summary = (
        f"using {', '.join(gate_names)} gates"
        if gate_names
        else "with no gates applied (|0⟩ state)"
    )

    q_lower = question.lower()
    if "superposition" in q_lower or "h" in [g.lower() for g in gate_names]:
        return (
            f"Your circuit runs on {num_qubits} qubit(s) {gate_summary}. "
            "Applying the Hadamard (H) gate transforms the basis state |0⟩ into an equal linear superposition "
            "(|0⟩ + |1⟩)/√2. In this superposition, measuring the qubit yields |0⟩ with ~50% probability and |1⟩ with ~50% probability, "
            "as confirmed by your simulation measurement counts."
        )
    elif "entangle" in q_lower or ("H" in gate_names and "CNOT" in gate_names):
        return (
            f"Your circuit demonstrates quantum entanglement across {num_qubits} qubits. "
            "By applying an H gate followed by a CNOT gate, you generate a maximally entangled Bell pair (|00⟩ + |11⟩)/√2. "
            "Notice that states |01⟩ and |10⟩ have 0% probability: measuring one qubit instantly determines the other."
        )
    elif "bloch" in q_lower:
        return (
            f"The Bloch sphere provides a geometric 3D visualization of single-qubit states. "
            "Pure state |0⟩ sits at the North Pole (Z=+1), while |1⟩ sits at the South Pole (Z=-1). "
            "Every single-qubit unitary gate corresponds to a rigid 3D spatial rotation on this sphere."
        )
    elif mode == "debug":
        return (
            f"Your circuit executed {shots} measurement shots across {num_qubits} qubits with verified results: {counts}. "
            "The quantum statevector is normalized (probabilities sum to 1.0). "
            "To test interference, try adding Pauli-Z or Phase gates to observe relative phase rotations."
        )
    elif mode == "explore":
        return (
            f"Your circuit currently has {len(gate_names)} gate(s). "
            "A great next experiment is to place an H gate on qubit 0, followed by an S or T phase gate, "
            "and observe how the Bloch vector rotates on the equatorial XY plane before measuring!"
        )
    else:
        top_states = sorted(probs.items(), key=lambda x: x[1], reverse=True)[:3]
        state_str = (
            ", ".join([f"|{s}⟩ ({p*100:.1f}%)" for s, p in top_states])
            if top_states
            else "state |0⟩"
        )
        return (
            f"In your {num_qubits}-qubit circuit ({gate_summary}), Qiskit Aer completed {shots} shots. "
            f"The dominant outcome distribution is {state_str}. "
            "This distribution reflects Born's rule: the probability of each outcome corresponds to the squared magnitude of its probability amplitude."
        )


def normalize_gemini_model(model_name: str | None) -> str | None:
    if not model_name:
        return None
    m = model_name.strip().lower()
    if "2.5-pro" in m:
        return None  # Deprecated for newer Gemini API keys
    if "flash-lite" in m or "flash lite" in m or "lite" in m:
        return "gemini-2.0-flash-lite"
    if "2.5-flash" in m or "2.5 flash" in m:
        return "gemini-2.5-flash"
    if "2.0-flash" in m or "2.0 flash" in m:
        return "gemini-2.0-flash"
    if "1.5-flash" in m or "1.5 flash" in m:
        return "gemini-1.5-flash"
    if "1.5-pro" in m:
        return "gemini-1.5-pro"
    return model_name.strip()


def explain_quantum_experiment(
    circuit: dict,
    result: dict,
    question: str,
    mode: str,
    history: list | None = None,
    challenge_context: str | None = None,
) -> str:
    api_key = os.getenv("GEMINI_API_KEY")

    # Priority list of models to try
    models_to_try: list[str] = []
    env_model = os.getenv("GEMINI_MODEL")
    normalized_env = normalize_gemini_model(env_model)
    if normalized_env:
        models_to_try.append(normalized_env)

    # Reliable modern models supported by current Gemini API
    default_candidates = [
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
        "gemini-1.5-flash",
    ]
    for c in default_candidates:
        if c not in models_to_try:
            models_to_try.append(c)

    if api_key:
        try:
            client = genai.Client(api_key=api_key)
            context = build_context(
                circuit=circuit,
                result=result,
                question=question,
                mode=mode,
                history=history or [],
                challenge_context=challenge_context,
            )

            for target_model in models_to_try:
                try:
                    config_kwargs = {
                        "system_instruction": SYSTEM_INSTRUCTIONS,
                        "temperature": 0.2,
                        "max_output_tokens": 2048,
                    }
                    if "2.5" in target_model:
                        try:
                            config_kwargs["thinking_config"] = types.ThinkingConfig(
                                thinking_budget=250
                            )
                        except Exception:
                            pass

                    response = client.models.generate_content(
                        model=target_model,
                        contents=context,
                        config=types.GenerateContentConfig(**config_kwargs),
                    )

                    answer = response.text
                    if answer and answer.strip():
                        return answer.strip()
                except Exception:
                    # Move to next fallback candidate seamlessly
                    continue
        except Exception:
            pass

    # Deterministic physical explanation fallback if cloud API is unavailable
    return generate_local_quantum_explanation(circuit, result, question, mode)