import { validateChallenge } from "../lib/challengeValidator";
import {
  challenges,
  getChallengeById,
  getChallengeForLesson,
} from "../lib/challenges";
import { lessons, getLessonById, getNextLesson } from "../lib/lessons";
import { getLessonStatus, getProgress } from "../lib/progress";

let passedCount = 0;
let totalCount = 0;

function assert(condition: boolean, testName: string) {
  totalCount++;
  if (condition) {
    console.log(`✓ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`✗ FAIL: ${testName}`);
    process.exitCode = 1;
  }
}

console.log("==================================================");
console.log("RUNNING AUTOMATED CHALLENGE & PROGRESS TESTS");
console.log("==================================================");

// ----------------------------------------------------
// 1. Superposition Challenge Tests
// ----------------------------------------------------
const superpChallenge = getChallengeForLesson("superposition")!;
assert(!!superpChallenge, "Superposition challenge found");

// Valid superposition circuit
const validSuperpGates = [{ gate: "H", qubit: 0, column: 0 }];
const validSuperpResult = {
  num_qubits: 2,
  probabilities: { "00": 0.502, "01": 0.498 },
  shots: 1024,
};
const res1 = validateChallenge(superpChallenge, validSuperpGates, validSuperpResult);
assert(res1.passed === true, "Valid Superposition passes validation");

// Missing H gate
const res2 = validateChallenge(superpChallenge, [], validSuperpResult);
assert(res2.passed === false, "Empty circuit fails required gate check");

// Missing simulation results
const res3 = validateChallenge(superpChallenge, validSuperpGates, null);
assert(res3.passed === false, "Missing simulation fails with run prompt");

// Incorrect probabilities (e.g. state was never put into superposition)
const unsuperpResult = {
  num_qubits: 2,
  probabilities: { "00": 1.0 },
  shots: 1024,
};
const res4 = validateChallenge(superpChallenge, validSuperpGates, unsuperpResult);
assert(res4.passed === false, "Incorrect probabilities fail validation");

// Unexpected state (e.g. |10⟩ appeared)
const unexpectedStateResult = {
  num_qubits: 2,
  probabilities: { "00": 0.45, "01": 0.35, "10": 0.20 },
  shots: 1024,
};
const res5 = validateChallenge(superpChallenge, validSuperpGates, unexpectedStateResult);
assert(res5.passed === false, "Unexpected outcome state rejected");

// ----------------------------------------------------
// 2. Bell State Challenge Tests
// ----------------------------------------------------
const bellChallenge = getChallengeForLesson("entanglement")!;
assert(!!bellChallenge, "Bell State challenge found");

// Valid Bell state circuit (H on q0 col 0, CNOT(0->1) col 1)
const validBellGates = [
  { gate: "H", qubit: 0, column: 0 },
  { gate: "CNOT", control: 0, target: 1, column: 1 },
];
const validBellResult = {
  num_qubits: 2,
  probabilities: { "00": 0.501, "11": 0.499 },
  shots: 1024,
};
const res6 = validateChallenge(bellChallenge, validBellGates, validBellResult);
assert(res6.passed === true, "Valid Bell State circuit passes validation");

// Inverted order: CNOT before H
const invertedBellGates = [
  { gate: "CNOT", control: 0, target: 1, column: 0 },
  { gate: "H", qubit: 0, column: 1 },
];
const res7 = validateChallenge(bellChallenge, invertedBellGates, validBellResult);
assert(res7.passed === false && res7.reason.includes("before"), "CNOT before H correctly rejected by order validator");

// Wrong CNOT target: control 0, target 2
const wrongTargetGates = [
  { gate: "H", qubit: 0, column: 0 },
  { gate: "CNOT", control: 0, target: 2, column: 1 },
];
const res8 = validateChallenge(bellChallenge, wrongTargetGates, validBellResult);
assert(res8.passed === false, "CNOT with wrong target rejected");

// ----------------------------------------------------
// 3. Deutsch Algorithm Challenge Tests
// ----------------------------------------------------
const deutschChallenge = getChallengeForLesson("deutsch-jozsa")!;
assert(!!deutschChallenge, "Deutsch challenge found");

const validDeutschGates = [
  { gate: "X", qubit: 1, column: 0 },
  { gate: "H", qubit: 0, column: 1 },
  { gate: "H", qubit: 1, column: 1 },
  { gate: "CNOT", control: 0, target: 1, column: 2 },
  { gate: "H", qubit: 0, column: 3 },
];
// In Qiskit 'q1 q0' format: q0 is 1 for balanced oracle -> '01' and '11'
const validDeutschResult = {
  num_qubits: 2,
  probabilities: { "01": 0.50, "11": 0.50 },
  shots: 1024,
};
const res9 = validateChallenge(deutschChallenge, validDeutschGates, validDeutschResult);
assert(res9.passed === true, "Valid Deutsch algorithm circuit passes");

// ----------------------------------------------------
// 4. Grover Search Algorithm Tests
// ----------------------------------------------------
const groverChallenge = getChallengeForLesson("grovers-algorithm")!;
assert(!!groverChallenge, "Grover challenge found");

const validGroverGates = [
  { gate: "H", qubit: 0, column: 0 },
  { gate: "H", qubit: 1, column: 0 },
  { gate: "H", qubit: 1, column: 1 },
  { gate: "CNOT", control: 0, target: 1, column: 2 },
  { gate: "H", qubit: 1, column: 3 },
  { gate: "H", qubit: 0, column: 4 },
  { gate: "H", qubit: 1, column: 4 },
  { gate: "X", qubit: 0, column: 5 },
  { gate: "X", qubit: 1, column: 5 },
  { gate: "H", qubit: 1, column: 6 },
  { gate: "CNOT", control: 0, target: 1, column: 7 },
  { gate: "H", qubit: 1, column: 8 },
  { gate: "X", qubit: 0, column: 9 },
  { gate: "X", qubit: 1, column: 9 },
  { gate: "H", qubit: 0, column: 10 },
  { gate: "H", qubit: 1, column: 10 },
];
const validGroverResult = {
  num_qubits: 2,
  probabilities: { "11": 1.0 },
  shots: 1024,
};
const res10 = validateChallenge(groverChallenge, validGroverGates, validGroverResult);
assert(res10.passed === true, "Valid 2-qubit Grover search circuit passes validation");

// ----------------------------------------------------
// 5. Curriculum & Progression Tests
// ----------------------------------------------------
assert(lessons.length === 6, "All 6 lessons configured in curriculum");
assert(getNextLesson("superposition")?.id === "entanglement", "Next lesson after superposition is entanglement");
assert(getNextLesson("grovers-algorithm") === null, "Grover is the final lesson");

const testLessonIds = lessons.map((l) => l.id);
const status1 = getLessonStatus("qubit-basics", [], testLessonIds);
assert(status1 === "current", "First uncompleted lesson has 'current' status");

const status2 = getLessonStatus("qubit-basics", ["qubit-basics"], testLessonIds);
assert(status2 === "completed", "Completed lesson has 'completed' status");

const status3 = getLessonStatus("measurement", ["qubit-basics"], testLessonIds);
assert(status3 === "current", "Second lesson becomes 'current' once first is completed");

const status4 = getLessonStatus("superposition", ["qubit-basics"], testLessonIds);
assert(status4 === "available", "Future lesson has 'available' status");

console.log("==================================================");
console.log(`TOTAL: ${passedCount}/${totalCount} TESTS PASSED`);
console.log("==================================================");
