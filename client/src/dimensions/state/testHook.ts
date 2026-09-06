/**
 * The scene test hook — client/src/dimensions/state/testHook.ts
 *
 * ARCHITECTURE-DIMENSIONS.md §10 (D-HOOK): `window.__AGL_DIMENSIONS__`,
 * read-only, present in production builds unconditionally (not gated behind
 * `import.meta.env.DEV`) — `VERIFY.md` forbids a UI PASS on code inspection,
 * and a hook that vanished in production would mean every acceptance test
 * verified an artifact that is not the one deployed.
 *
 * Scope note (T-004/T-005/T-006/T-007): the full §10.1 interface also
 * specifies `getTransport()` and `getXR()`. Those are added by the tasks
 * that build those capabilities (T-009/T-010, T-011/T-012) — adding them
 * here now would mean inventing the shape of a transport status and an XR
 * probe result for capabilities that do not exist in this build yet, which
 * is exactly what the user's "never claim a capability that is not active"
 * rule forbids. `getPhysics()` and `getLiveData()` are T-007's, added here
 * now that 5D interaction, physics and live data are real. This hook
 * reports only what this build actually does.
 */

import type { CameraSnapshot } from "../render/camera";
import type { RenderStats } from "../render/loop";
// `import type` only — see physics/sandbox.ts's own header comment on why
// this must never become a value import from this file.
import type { PhysicsSnapshot } from "../physics/sandbox";
import type { LiveDataStatus } from "../live/useLiveData";
import type { SceneState } from "./types";

export interface DimensionsLiveDataSnapshot {
  source: string;
  status: LiveDataStatus;
  fetchedAt: number | null;
  value: unknown;
  error: string | null;
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
}

export interface DimensionsTestHookSource {
  getState(): SceneState;
  getRenderStats(): RenderStats | null;
  getCamera(): CameraSnapshot;
  getPhysics(): PhysicsSnapshot | null;
  getLiveData(): DimensionsLiveDataSnapshot;
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
export function installTestHook(source: DimensionsTestHookSource): InstalledTestHook {
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
