/**
 * UNIT TESTS — Category 1
 * client/src/dimensions/physics/sandbox.ts (T-007, 5D physics)
 *
 * Exercises the real cannon-es 0.20.0 world directly, headlessly — no
 * browser, no WebGL, no React. This proves the physics engine itself
 * behaves correctly (gravity, collision, impulse) independent of anything
 * rendering-related; `tests/e2e/dimensions.spec.ts` separately proves it is
 * actually wired into the running page.
 */
import { describe, it, expect } from "vitest";
import { createPhysicsSandbox } from "@/dimensions/physics/sandbox";

/** Steps the sandbox `n` times, collecting a snapshot after every step. */
function collect(sandbox: ReturnType<typeof createPhysicsSandbox>, n: number) {
  const out: ReturnType<typeof sandbox.getSnapshot>[] = [];
  for (let i = 0; i < n; i++) {
    sandbox.step();
    out.push(sandbox.getSnapshot());
  }
  return out;
}

describe("createPhysicsSandbox — a real cannon-es 0.20.0 world", () => {
  it("does nothing until start() is called (§8.1: physics does not auto-start)", () => {
    const sandbox = createPhysicsSandbox();
    const before = sandbox.getSnapshot().bodies.ball.position.y;
    for (let i = 0; i < 30; i++) sandbox.step();
    expect(sandbox.getSnapshot().bodies.ball.position.y).toBe(before);
    expect(sandbox.getSnapshot().steps).toBe(0);
  });

  it("gravity produces a monotonically decreasing y across at least 30 consecutive reads", () => {
    const sandbox = createPhysicsSandbox();
    sandbox.start();
    const samples = collect(sandbox, 40).map(s => s.bodies.ball.position.y);

    let longestRun = 1;
    let current = 1;
    for (let i = 1; i < samples.length; i++) {
      if (samples[i] < samples[i - 1]) {
        current += 1;
        longestRun = Math.max(longestRun, current);
      } else {
        current = 1;
      }
    }
    expect(longestRun).toBeGreaterThanOrEqual(30);
  });

  it("a collision (the ball bouncing off the ground) produces a velocity sign change", () => {
    const sandbox = createPhysicsSandbox();
    sandbox.start();
    const velocitiesY = collect(sandbox, 150).map(
      s => s.bodies.ball.velocity.y
    );

    const signChange = velocitiesY.some((v, i) => {
      if (i === 0) return false;
      const prev = velocitiesY[i - 1];
      return prev < -0.05 && v > 0.05;
    });
    expect(signChange).toBe(true);
  });

  it("is not scripted: applying two different impulse magnitudes produces two different resting x positions", () => {
    function restingXAfterImpulse(magnitude: number): number {
      const sandbox = createPhysicsSandbox();
      sandbox.start();
      for (let i = 0; i < 40; i++) sandbox.step(); // let it fall and land
      sandbox.applyImpulse(magnitude);
      for (let i = 0; i < 400; i++) sandbox.step(); // let friction/damping settle it
      return sandbox.getSnapshot().bodies.ball.position.x;
    }

    const low = restingXAfterImpulse(1);
    const high = restingXAfterImpulse(4);
    expect(Math.abs(high - low)).toBeGreaterThan(0.1);
  });

  it("reset() returns the ball to its authored starting state and zeroes the step count", () => {
    const sandbox = createPhysicsSandbox();
    const initial = sandbox.getSnapshot().bodies.ball.position;
    sandbox.start();
    for (let i = 0; i < 40; i++) sandbox.step();
    expect(sandbox.getSnapshot().steps).toBeGreaterThan(0);
    expect(sandbox.getSnapshot().bodies.ball.position).not.toEqual(initial);

    sandbox.reset();
    const afterReset = sandbox.getSnapshot();
    expect(afterReset.steps).toBe(0);
    expect(afterReset.bodies.ball.position).toEqual(initial);
    expect(afterReset.bodies.ball.velocity).toEqual({ x: 0, y: 0, z: 0 });
    expect(sandbox.isRunning()).toBe(false);
  });

  it("auto-pauses once the ball settles, so it does not step forever (§8.1: no ambient animation)", () => {
    const sandbox = createPhysicsSandbox();
    sandbox.start();
    for (let i = 0; i < 400; i++) sandbox.step(); // fall, bounce, and settle
    expect(sandbox.isRunning()).toBe(false);

    const stepsAtRest = sandbox.getSnapshot().steps;
    sandbox.step(); // a no-op call while not running
    expect(sandbox.getSnapshot().steps).toBe(stepsAtRest);
  });

  it("applyImpulse wakes an auto-rested sandbox back up once start() is called again", () => {
    const sandbox = createPhysicsSandbox();
    sandbox.start();
    for (let i = 0; i < 400; i++) sandbox.step();
    expect(sandbox.isRunning()).toBe(false);

    sandbox.applyImpulse(3);
    sandbox.start();
    expect(sandbox.isRunning()).toBe(true);
    const beforeX = sandbox.getSnapshot().bodies.ball.position.x;
    sandbox.step();
    const afterX = sandbox.getSnapshot().bodies.ball.position.x;
    expect(afterX).not.toBe(beforeX);
  });
});
