/**
 * The 5D physics sandbox — client/src/dimensions/physics/sandbox.ts
 *
 * ARCHITECTURE-DIMENSIONS.md §2 (D-5D-PHYSICS): `cannon-es@0.20.0`, no React
 * bridge, no worker, stepped on the main thread with a fixed timestep.
 *
 * **Deviation from §2's literal wording, recorded here rather than left for
 * someone to discover later.** §2 names `world.fixedStep()`. Measured this
 * session: `fixedStep()` reads `performance.now()` internally and advances
 * the simulation by *real elapsed wall-clock time* since the previous call
 * (an accumulator). Called in a tight synchronous loop — which is exactly
 * how a headless unit test exercises this module, and how `tests/unit/
 * dimensions-physics-sandbox.test.ts` first caught this — almost no real
 * time elapses between calls, so it advances almost nothing: a 40-call loop
 * produced one real integration step, not 40. That is incompatible with
 * both deterministic testing and this app's own invalidation-driven render
 * loop (not a guaranteed 60fps ticker). `world.step(dt)` called with a
 * single argument, by contrast, performs exactly one fixed-size integration
 * step per call regardless of real time — deterministic, and exactly
 * frame-rate-independent testing needs. This file uses that single-argument
 * form. The tradeoff, accepted: on a real device that drops below ~60fps,
 * simulated time will fall slightly behind wall-clock time (one call still
 * only advances 1/60s of simulation) rather than catching up — a minor,
 * visually unnoticeable slow-motion effect on a marketing-site demo, traded
 * for determinism. `world.fixedStep()` remains available if a future task
 * needs real-time catch-up behaviour badly enough to accept the same
 * testability cost this file was just rewritten to avoid.
 *
 * This is the ONLY file in the repo that imports `cannon-es` at the value
 * level (§2.3: "the swap is contained: physics/sandbox.ts is the only file
 * importing cannon-es"). Every other file that needs to know a physics
 * body's shape imports the `PhysicsSnapshot` / `PhysicsBodySnapshot` TYPES
 * from here with `import type` — which is erased at build time — so this
 * module (and `cannon-es` with it) is reachable only through the single
 * dynamic `import("./physics/sandbox")` call in `DimensionsStage.tsx`,
 * fired the first time the user clicks "Run simulation". That dynamic
 * import is what puts `cannon-es` in the separate `vendor-physics` chunk
 * (`vite.config.ts`'s `manualChunks`) instead of the always-loaded one.
 *
 * §2.4 (the design conflict T-006/T-007 would otherwise hit): this sandbox
 * is forward-only. There is no `setTime`/scrub method here — only `step()`
 * (advance) and `reset()` (return to the authored starting state). It is
 * never driven by the 4D timeline's `t`.
 *
 * No `three` import here, and no knowledge of rendering at all — `getSnapshot()`
 * returns plain, JSON-serializable data (§5.1); turning it into a rendered
 * ball is `state/compose.ts` and `render/projector.ts`'s job, not this file's.
 */

import * as CANNON from "cannon-es";
import type { Vec3 } from "../state/types";
import {
  PHYSICS_BALL_RADIUS,
  PHYSICS_GROUND_Y,
  PHYSICS_START_POSITION,
} from "./constants";

export interface PhysicsBodySnapshot {
  position: Vec3;
  velocity: Vec3;
}

export interface PhysicsSnapshot {
  /** Total fixed steps actually taken since the last `reset()`. Zero while paused. */
  steps: number;
  bodies: Readonly<Record<string, PhysicsBodySnapshot>>;
}

export interface PhysicsSandbox {
  /** No-op while paused. Call once per animation frame; advances the simulation by exactly one fixed timestep (see this file's header comment on why this is `world.step(dt)`, not `world.fixedStep()`). */
  step(): void;
  /** Explicit user action only (§8.1: "does not auto-start"). */
  start(): void;
  pause(): void;
  isRunning(): boolean;
  /**
   * A user-controlled horizontal impulse on the ball. This is what makes
   * the resting position depend on user input rather than a scripted
   * animation (T-007's "physics is not scripted" criterion): two different
   * magnitudes produce two different resting positions because friction and
   * damping, not a keyframe, decide where the ball stops.
   */
  applyImpulse(magnitudeX: number): void;
  /** Forward-only sandbox, returned to its authored starting state (§2.4). Never wired to the 4D scrubber. */
  reset(): void;
  getSnapshot(): PhysicsSnapshot;
  dispose(): void;
}

const FIXED_TIME_STEP = 1 / 60;
/**
 * Auto-rest detection. Without this, a settled ball keeps `running === true`
 * forever, which would keep `store.setPhysicsSnapshot` committing and the
 * render loop invalidating at 60fps for the rest of the session — exactly
 * the ambient, always-on animation §8.1's invalidation-driven loop exists to
 * avoid. Once the ball's speed stays below `REST_SPEED_EPSILON` for
 * `REST_STREAK_STEPS` consecutive fixed steps, the sandbox pauses itself.
 * `applyImpulse` (via the caller's `start()`) wakes it back up.
 */
const REST_SPEED_EPSILON = 0.03;
const REST_STREAK_STEPS = 24; // ~0.4s of simulated time at 60Hz

export function createPhysicsSandbox(): PhysicsSandbox {
  const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });
  world.broadphase = new CANNON.NaiveBroadphase();
  world.allowSleep = false; // a sleeping ball would stop reporting fresh state to the hook

  const groundMaterial = new CANNON.Material("physics-ground");
  const ballMaterial = new CANNON.Material("physics-ball");
  world.addContactMaterial(
    new CANNON.ContactMaterial(groundMaterial, ballMaterial, {
      friction: 0.5,
      restitution: 0.55,
    }),
  );

  const ground = new CANNON.Body({ mass: 0, shape: new CANNON.Plane(), material: groundMaterial });
  // CANNON.Plane's default normal is +Z; rotate it to face +Y so it reads as a horizontal floor.
  ground.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
  ground.position.set(0, PHYSICS_GROUND_Y, 0);
  world.addBody(ground);

  const ball = new CANNON.Body({
    mass: 1,
    shape: new CANNON.Sphere(PHYSICS_BALL_RADIUS),
    material: ballMaterial,
    position: new CANNON.Vec3(PHYSICS_START_POSITION.x, PHYSICS_START_POSITION.y, PHYSICS_START_POSITION.z),
    linearDamping: 0.35,
    angularDamping: 0.6,
  });
  world.addBody(ball);

  let steps = 0;
  let running = false;
  let restingStreak = 0;

  function step() {
    if (!running) return;
    world.step(FIXED_TIME_STEP); // single-argument form — one fixed step, no real-clock accumulator (see header comment)
    steps += 1;

    if (ball.velocity.length() < REST_SPEED_EPSILON) {
      restingStreak += 1;
      if (restingStreak >= REST_STREAK_STEPS) {
        running = false;
        restingStreak = 0;
      }
    } else {
      restingStreak = 0;
    }
  }

  function start() {
    running = true;
    restingStreak = 0;
  }

  function pause() {
    running = false;
    restingStreak = 0;
  }

  function isRunning() {
    return running;
  }

  function applyImpulse(magnitudeX: number) {
    ball.applyImpulse(new CANNON.Vec3(magnitudeX, 0, 0));
  }

  function reset() {
    running = false;
    restingStreak = 0;
    steps = 0;
    ball.position.set(PHYSICS_START_POSITION.x, PHYSICS_START_POSITION.y, PHYSICS_START_POSITION.z);
    ball.velocity.set(0, 0, 0);
    ball.angularVelocity.set(0, 0, 0);
    ball.quaternion.set(0, 0, 0, 1);
  }

  function getSnapshot(): PhysicsSnapshot {
    return {
      steps,
      bodies: {
        ball: {
          position: { x: ball.position.x, y: ball.position.y, z: ball.position.z },
          velocity: { x: ball.velocity.x, y: ball.velocity.y, z: ball.velocity.z },
        },
      },
    };
  }

  function dispose() {
    running = false;
  }

  return { step, start, pause, isRunning, applyImpulse, reset, getSnapshot, dispose };
}
