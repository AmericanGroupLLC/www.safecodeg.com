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
 * session, when T-011/T-012 add one.
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
  onAfterRender?: () => void,
): RenderLoopHandle {
  let needsRenderUntilMs = 0;

  function invalidate() {
    needsRenderUntilMs = nowMs() + SETTLE_MS;
  }
  invalidate(); // the first frame always renders, so `ready` can flip true

  function frame(timestampMs: number) {
    onBeforeFrame(timestampMs);
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

  function dispose() {
    renderer.setAnimationLoop(null);
  }

  return { invalidate, getStats, dispose };
}
