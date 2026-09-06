/**
 * XR session lifecycle — client/src/dimensions/xr/session.ts
 *
 * ARCHITECTURE-DIMENSIONS.md §7.3: `renderer.xr.enabled = true`;
 * `await renderer.xr.setSession(session)`. The EXISTING
 * `renderer.setAnimationLoop(cb)` owned by `render/loop.ts` then serves
 * both the non-immersive and the immersive path — three's own
 * `WebGLRenderer.js:1584` delegates to `xr.setAnimationLoop` once a
 * session is set (Verified — read this session, §1.1's payoff). No second
 * render loop is created here.
 *
 * This file never decides what the UI shows. It only ever does two things:
 * ask the browser for a real `XRSession` (or reject with the browser's own
 * reason), and tear one down. `DimensionsStage.tsx` maps a rejection to the
 * `session-rejected` state and a live session to `session-running` (§7.2).
 */

import * as THREE from "three";

export type XrSessionMode = "immersive-ar" | "immersive-vr";

/**
 * The transient session-lifecycle layer §7.2 stacks on top of `xr/detect.ts`'s
 * capability probe to produce the last three of the eleven UI states
 * (`session-rejected`, `session-running`, and "idle" reverting to whatever
 * the probe already said). Shared by `XRPanel.tsx`, `DimensionsStage.tsx` and
 * the test hook so all three agree on what "running" means.
 */
export type XrSessionPhase = "idle" | "requesting" | "running" | "rejected";

export interface XRSessionHandle {
  readonly session: XRSession;
  readonly mode: XrSessionMode;
  /** Ends the session. Safe to call more than once. Resolves after the "end" event (and this handle's `onEnd` callback) has fired. */
  end(): Promise<void>;
}

export interface RequestSessionCallbacks {
  /** Fires exactly once, whether `end()` was called locally or the session ended for any other reason (device removed, OS-level exit, …). */
  onEnd?: () => void;
}

/**
 * Requests a real immersive `XRSession` and hands it to the renderer's
 * `WebXRManager`. Rejects with whatever the browser itself throws
 * (`SecurityError`, `NotSupportedError`, a user-cancellation error, …) —
 * the caller reads `error.message` for the `session-rejected` state's
 * "\<reason from the rejection\>" text (§7.2) rather than this function
 * inventing one.
 */
export async function requestXRSession(
  renderer: THREE.WebGLRenderer,
  mode: XrSessionMode,
  callbacks: RequestSessionCallbacks = {},
): Promise<XRSessionHandle> {
  const xr = typeof navigator !== "undefined" ? navigator.xr : undefined;
  if (!xr) {
    throw new Error("navigator.xr is not available in this browser.");
  }

  const session = await xr.requestSession(mode, {
    optionalFeatures: ["local-floor", "bounded-floor"],
  });

  renderer.xr.enabled = true;
  await renderer.xr.setSession(session);

  let ended = false;
  function handleEnd() {
    if (ended) return;
    ended = true;
    session.removeEventListener("end", handleEnd);
    callbacks.onEnd?.();
  }
  session.addEventListener("end", handleEnd);

  return {
    session,
    mode,
    async end() {
      if (ended) return;
      await session.end(); // fires "end" -> handleEnd -> callbacks.onEnd()
    },
  };
}
