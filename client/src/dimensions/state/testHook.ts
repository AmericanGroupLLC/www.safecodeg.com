/**
 * The scene test hook — client/src/dimensions/state/testHook.ts
 *
 * ARCHITECTURE-DIMENSIONS.md §10 (D-HOOK): `window.__AGL_DIMENSIONS__`,
 * read-only, present in production builds unconditionally (not gated behind
 * `import.meta.env.DEV`) — `VERIFY.md` forbids a UI PASS on code inspection,
 * and a hook that vanished in production would mean every acceptance test
 * verified an artifact that is not the one deployed.
 *
 * Scope note (T-010): `getTransport()` is now populated — the full §10.1
 * interface's last piece. `getPhysics()` and `getLiveData()` are T-007's;
 * `getXR()` is T-012's. This hook reports only what this build actually does.
 */

import type { CameraSnapshot } from "../render/camera";
import type { RenderStats } from "../render/loop";
// `import type` only — see physics/sandbox.ts's own header comment on why
// this must never become a value import from this file.
import type { PhysicsSnapshot } from "../physics/sandbox";
import type { LiveDataStatus } from "../live/useLiveData";
import type { XrUiState } from "../xr/detect";
import type { XrSessionMode } from "../xr/session";
import type { ActorId, SceneState } from "./types";
import type { TransportStatus } from "../transport/types";

export interface DimensionsLiveDataSnapshot {
  source: string;
  status: LiveDataStatus;
  fetchedAt: number | null;
  value: unknown;
  error: string | null;
}

export interface DimensionsXrSnapshot {
  state: XrUiState;
  supported: { vr: boolean; ar: boolean } | null;
  sessionMode: XrSessionMode | null;
  /** Frames actually rendered to a live `XRSession`. 0 until one starts (render/loop.ts's `getXrFrameCount()`). */
  xrFrames: number;
}

/**
 * 6D (T-010). No key or token appears here — `status` is the same
 * discriminated union the UI already renders (§7.2-style honesty), `actors`
 * is the presence list already shown on screen, and the op counters are
 * telemetry, not credentials (D-HOOK, §10.3: "no key, no token, no
 * credential" — the anon key lives only in `transport/supabaseTransport.ts`).
 */
export interface DimensionsTransportSnapshot {
  status: TransportStatus;
  actorCount: number;
  actors: readonly ActorId[];
  /** Ops that passed the S-5 allowlist check and won the LWW comparison. */
  opsApplied: number;
  /** Ops dropped — either not a member of the authored model, or lost the LWW comparison. */
  opsRejected: number;
}

export interface DimensionsTestHook {
  /** false until the first frame has rendered. Tests await this. */
  readonly ready: boolean;
  getState(): SceneState;
  getRenderStats(): RenderStats | null;
  getCamera(): CameraSnapshot;
  /** `null` until the physics chunk has loaded and been run at least once (§10.2). */
  getPhysics(): PhysicsSnapshot | null;
  getLiveData(): DimensionsLiveDataSnapshot;
  /** `null` until the async capability probe (`xr/detect.ts`'s `probeXR()`) has resolved at least once. */
  getXR(): DimensionsXrSnapshot | null;
  getTransport(): DimensionsTransportSnapshot;
}

export interface DimensionsTestHookSource {
  getState(): SceneState;
  getRenderStats(): RenderStats | null;
  getCamera(): CameraSnapshot;
  getPhysics(): PhysicsSnapshot | null;
  getLiveData(): DimensionsLiveDataSnapshot;
  getXR(): DimensionsXrSnapshot | null;
  getTransport(): DimensionsTransportSnapshot;
}

declare global {
  interface Window {
    __AGL_DIMENSIONS__?: DimensionsTestHook;
  }
}

export interface InstalledTestHook {
  setReady(ready: boolean): void;
  uninstall(): void;
}

/** Assigned synchronously, before the first frame, per §10.2. */
export function installTestHook(
  source: DimensionsTestHookSource
): InstalledTestHook {
  let ready = false;

  const hook: DimensionsTestHook = {
    get ready() {
      return ready;
    },
    getState: () => source.getState(),
    getRenderStats: () => source.getRenderStats(),
    getCamera: () => source.getCamera(),
    getPhysics: () => source.getPhysics(),
    getLiveData: () => source.getLiveData(),
    getXR: () => source.getXR(),
    getTransport: () => source.getTransport(),
  };

  window.__AGL_DIMENSIONS__ = hook;

  return {
    setReady(value: boolean) {
      ready = value;
    },
    uninstall() {
      delete window.__AGL_DIMENSIONS__;
    },
  };
}
