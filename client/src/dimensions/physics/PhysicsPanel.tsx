/**
 * Physics sandbox panel — client/src/dimensions/physics/PhysicsPanel.tsx
 *
 * Pure presentation. `DimensionsStage.tsx` owns the physics sandbox instance
 * (created lazily via the dynamic `import("./sandbox")` the first time "Run
 * simulation" is clicked — ARCHITECTURE-DIMENSIONS.md §2, §9) and passes
 * down only the state this panel needs to render controls, never a
 * per-frame numeric readout: the visual proof that physics is really
 * running is the ball moving in the canvas above, driven directly by the
 * render loop, not by a 60fps React re-render of this panel.
 *
 * No `cannon-es` import here, not even a type-only one that would need one —
 * this file only imports the zero-import `../physics/constants`, so it stays
 * in the always-loaded `vendor-three` chunk without pulling physics along.
 */

import {
  PHYSICS_IMPULSE_MAX,
  PHYSICS_IMPULSE_MIN,
  PHYSICS_IMPULSE_STEP,
} from "./constants";

export interface PhysicsPanelProps {
  loading: boolean;
  running: boolean;
  /** True once "Run simulation" has been clicked at least once since the last Reset — this is what disables the 4D scrubber (§2.4). */
  engaged: boolean;
  impulse: number;
  onImpulseChange: (value: number) => void;
  onRun: () => void;
  onReset: () => void;
  onApplyImpulse: () => void;
}

export default function PhysicsPanel({
  loading,
  running,
  engaged,
  impulse,
  onImpulseChange,
  onRun,
  onReset,
  onApplyImpulse,
}: PhysicsPanelProps) {
  const status = loading
    ? "Loading the physics engine (cannon-es)…"
    : running
      ? "Running — gravity and collisions are live, computed this frame."
      : engaged
        ? "Paused/resting. Reset to return the ball to its starting position."
        : "Not yet started. Click Run to drop the ball under real gravity.";

  return (
    <div
      className="rounded-2xl p-5 sm:p-6 mb-6"
      style={{
        background: "rgba(17,19,39,0.5)",
        border: "1px solid rgba(124,58,237,0.2)",
      }}
    >
      <div className="mb-3">
        <div
          className="text-[10px] uppercase tracking-widest font-mono mb-1"
          style={{ color: "rgba(167,139,250,0.6)" }}
        >
          Physics sandbox
        </div>
        <h3
          className="font-bold text-white text-lg"
          style={{ fontFamily: "Sora, sans-serif" }}
        >
          cannon-es 0.20.0 — a real, forward-only simulation
        </h3>
        <p
          className="text-xs mt-1 max-w-2xl"
          style={{ color: "rgba(255,255,255,0.45)" }}
        >
          This runs on its own clock, separate from the timeline above (a
          physics integrator can&apos;t be scrubbed backwards). Use Reset, not
          the scrubber, to return it to its starting state.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          type="button"
          onClick={onRun}
          data-testid="physics-run"
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #7C3AED, #5B21B6)" }}
        >
          {loading ? "Loading…" : "Run simulation"}
        </button>
        <button
          type="button"
          onClick={onReset}
          data-testid="physics-reset"
          className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
          style={{
            color: "rgba(255,255,255,0.8)",
            border: "1px solid rgba(124,58,237,0.25)",
          }}
        >
          Reset
        </button>
      </div>

      <label
        htmlFor="physics-impulse-slider"
        className="block text-xs mb-1"
        style={{ color: "rgba(255,255,255,0.6)" }}
      >
        Impulse strength — a user-controlled sideways nudge, not a scripted move
      </label>
      <div className="flex items-center gap-3">
        <input
          id="physics-impulse-slider"
          data-testid="physics-impulse-slider"
          type="range"
          min={PHYSICS_IMPULSE_MIN}
          max={PHYSICS_IMPULSE_MAX}
          step={PHYSICS_IMPULSE_STEP}
          value={impulse}
          onChange={event => onImpulseChange(Number(event.target.value))}
          className="flex-1"
          aria-valuetext={`${impulse} newton-seconds`}
        />
        <span
          className="font-mono text-xs w-16 text-right"
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          {impulse.toFixed(1)}
        </span>
        <button
          type="button"
          onClick={onApplyImpulse}
          data-testid="physics-impulse-apply"
          // Gated on `engaged` (loaded and run at least once since Reset),
          // not on the momentary `running` — the sandbox auto-pauses itself
          // once the ball settles (physics/sandbox.ts's rest detection), and
          // applying an impulse to a resting ball is exactly the point: it
          // wakes the sandbox back up. Gating on `running` would make this
          // button go dead the moment the ball stopped, which is backwards.
          disabled={!engaged}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-40"
          style={{
            color: "rgba(255,255,255,0.8)",
            border: "1px solid rgba(124,58,237,0.25)",
          }}
        >
          Apply impulse
        </button>
      </div>

      <p
        role="status"
        data-testid="physics-status"
        className="text-xs mt-4"
        style={{ color: "rgba(255,255,255,0.5)" }}
      >
        {status}
      </p>
    </div>
  );
}
