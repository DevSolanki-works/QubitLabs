from typing import Literal

from pydantic import BaseModel, Field


CopilotMode = Literal[
    "explain",
    "debug",
    "explore",
]


class CopilotMessage(BaseModel):
    role: Literal[
        "user",
        "assistant",
    ]

    content: str = Field(
        min_length=1,
        max_length=4000,
    )


class CopilotRequest(BaseModel):
    question: str = Field(
        min_length=1,
        max_length=2000,
    )

    mode: CopilotMode = "explain"

    circuit: dict

    result: dict

    history: list[CopilotMessage] = Field(
        default_factory=list,
        max_length=8,
    )


class CopilotResponse(BaseModel):
    answer: str

    mode: CopilotMode