export type Challenge = {
  id: string;
  lessonId: string;
  title: string;
  instruction: string;

  requiredGates: {
    gate: string;
    qubit: number;
    target?: number;
  }[];

  targetProbabilities?: Record<string, number>;
};

export const challenges: Challenge[] = [
  {
    id: "superposition-01",
    lessonId: "superposition",
    title: "Create Superposition",

    instruction:
      "Add an H gate to q0 and run the circuit. Create an equal superposition of q0 while q1 remains unchanged.",

    requiredGates: [
      {
        gate: "H",
        qubit: 0,
      },
    ],

    targetProbabilities: {
      "00": 0.5,
      "01": 0.5,
    },
  },

  {
    id: "entanglement-01",
    lessonId: "entanglement",
    title: "Create a Bell State",

    instruction:
      "Create an entangled pair using an H gate on q0 followed by a CNOT from q0 to q1.",

    requiredGates: [
      {
        gate: "H",
        qubit: 0,
      },
      {
        gate: "CNOT",
        qubit: 0,
        target: 1,
      },
    ],

    targetProbabilities: {
      "00": 0.5,
      "11": 0.5,
    },
  },
];

export function getChallengeForLesson(
  lessonId: string
): Challenge | undefined {
  return challenges.find(
    (challenge) => challenge.lessonId === lessonId
  );
}