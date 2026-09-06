/**
 * The invalidation-driven render loop — client/src/dimensions/render/loop.ts
 *
 * ARCHITECTURE-DIMENSIONS.md §8.1 (D-A11Y): renders only when something
 * changed or an interaction is in flight; stops within `SETTLE_MS` of the
 * last input. This is not only a reduced-motion behaviour — §8.1's last
 * paragraph makes it the *default* loop too: "Idling at 60 fps on a
 * marketing site is a battery cost with no benefit."
 *
 * Built on `renderer.setAnimationLoop`, the same call three delegates to
 * `WebXRManager` (§1.1) — so this loop needs no change to also serve an XR
 * session; T-012 only teaches it two things about that path:
 *
 *   1. While `renderer.xr.isPresenting`, every frame renders unconditionally
 *      — the invalidation/settle logic below is a battery optimisation for
 *      the flat page and does not apply inside a live headset session,
 *      where skipping a frame shows the device a stale or black frame.
 *   2. `xrFrames` counts frames actually presented to an `XRSession` — three
 *      passes the `XRFrame` as this callback's second argument only while
 *      presenting (undefined otherwise), so counting only when that second
 *      argument is present is itself proof the count reflects a real
 *      session, not the ordinary rAF loop.
 *
 * `getStats().frame` is `renderer.info.render.frame`, which three only
 * increments inside an actual `render()` call — never on a skipped frame —
 * which is what gives T-004's "frame stops increasing within 500 ms of the
 * last input" assertion a concrete, already-true meaning.
 */

import * as THREE from "three";

export interface RenderStats {
  frame: number;
  calls: number;
  triangles: number;
  programs: number;
}

export interface RenderLoopHandle {
  /** Call on any input or state change that should produce at least one more rendered frame. */
  invalidate(): void;
  getStats(): RenderStats;
  /** Frames actually rendered to a live `XRSession` (§7 D-HOOK's `getXR().xrFrames`). 0 outside a session. */
  getXrFrameCount(): number;
  dispose(): void;
}

const SETTLE_MS = 500;

function nowMs(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

export function startRenderLoop(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  /** Runs every animation frame, whether or not this frame ends up rendering — e.g. store.tick + controls.update + projector.sync. */
  onBeforeFrame: (timestampMs: number) => void,
  /** Runs immediately after a frame that actually rendered — e.g. flipping the test hook's `ready` flag. */
  onAfterRender?: () => void
): RenderLoopHandle {
  let needsRenderUntilMs = 0;
  let xrFrameCount = 0;

  function invalidate() {
    needsRenderUntilMs = nowMs() + SETTLE_MS;
  }
  invalidate(); // the first frame always renders, so `ready` can flip true

  function frame(timestampMs: number, xrFrame?: XRFrame) {
    onBeforeFrame(timestampMs);
    if (renderer.xr.isPresenting) {
      // A live XRSession's frame loop is not the invalidation-driven one —
      // it renders every frame the device asks for, unconditionally.
      if (xrFrame) xrFrameCount += 1;
      renderer.render(scene, camera);
      onAfterRender?.();
      return;
    }
    if (timestampMs <= needsRenderUntilMs) {
      renderer.render(scene, camera);
      onAfterRender?.();
    }
  }

  renderer.setAnimationLoop(frame);

  function getStats(): RenderStats {
    const info = renderer.info;
    return {
      frame: info.render.frame,
      calls: info.render.calls,
      triangles: info.render.triangles,
      programs: info.programs?.length ?? 0,
    };
  }

  function getXrFrameCount(): number {
    return xrFrameCount;
  }

  function dispose() {
    renderer.setAnimationLoop(null);
  }

  return { invalidate, getStats, getXrFrameCount, dispose };
}
