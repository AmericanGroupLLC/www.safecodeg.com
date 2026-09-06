/**
 * UI / UX — Category 10 placeholder runner.
 *
 * TESTING.md assigns this category to Frontend, verified by Reviewer — it is
 * never Testing's to write, and it can never PASS on code inspection alone
 * (TESTING.md: "A UI category marked PASS without a rendered result inspected
 * is a fabricated pass"). This repo has no automated UI/UX suite yet, so this
 * script exists only so `test:ui` is discoverable by the verification gate
 * and reports an honest, non-fabricated result instead of being silently
 * omitted.
 *
 * Exits 0: absence of an owned suite here is not a failure of the harness.
 */
console.log('UI / UX (category 10) is owned by Frontend and verified by Reviewer, per TESTING.md.');
console.log('No automated suite exists in this repository — this script performs no checks.');
console.log('A real PASS requires a rendered screenshot inspected against the requirement,');
console.log('plus keyboard focus order and contrast, captured by Frontend when UI ships.');
console.log('Result: NOT RUN (by design, no suite present) — not a fabricated PASS.');
process.exit(0);
