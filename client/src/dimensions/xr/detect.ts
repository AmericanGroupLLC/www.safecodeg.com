/**
 * WebXR + AR Quick Look capability probe — client/src/dimensions/xr/detect.ts
 *
 * ARCHITECTURE-DIMENSIONS.md §7 (D-7D-DETECT): a four-step probe — WebGL
 * context, `navigator.xr`, `isSessionSupported('immersive-vr')` and
 * `('immersive-ar')` (probed independently, each wrapped so a REJECTION is
 * caught and never treated as `false`), then AR Quick Look via
 * `document.createElement('a').relList.supports('ar')` — feeding the
 * eleven enumerated UI states in §7.2.
 *
 * The rule that matters most (§7.1): a rejected `isSessionSupported` maps
 * to its own `blocked-by-policy` state, never to "unsupported". Reporting a
 * permissions-policy rejection as "your browser doesn't support it" would
 * be a false statement about the visitor's browser — `.htaccess:51` sets
 * `Permissions-Policy "camera=(), microphone=(), geolocation=(self)"`
 * (Verified — read this session), so this is a live possibility here, not
 * a hypothetical one. §7.1's own inference — that `xr-spatial-tracking`
 * (WebXR's actual permissions-policy feature) is not in that list and so
 * keeps its default `self` allowlist — is Inferred, not measured; this
 * module's job is to tell the truth either way, at runtime, per visitor.
 *
 * `session-rejected` and `session-running` are NOT produced by this probe —
 * they are session-lifecycle outcomes, layered on top of this module's
 * result by whoever calls `xr/session.ts` (`DimensionsStage.tsx`). This
 * file only ever returns the other nine states.
 */

export type XrUiState =
  | "no-webgl"
  | "no-webxr"
  | "quicklook-only"
  | "no-device"
  | "blocked-by-policy"
  | "ar-only"
  | "vr-only"
  | "ar-and-vr"
  | "session-rejected"
  | "session-running";

import type { XrSessionPhase } from "./session";

export interface XrCapability {
  state: Exclude<XrUiState, "session-rejected" | "session-running">;
  /** `null` until `navigator.xr` exists and both session-support checks resolved without rejecting. */
  supported: { vr: boolean; ar: boolean } | null;
  /** The exact reason named in the UI (§7.2) — never a generic message. `null` when the state needs none (the two `*-available` rows speak for themselves). */
  reason: string | null;
}

/** Step 1. Independent of `navigator.xr` — a device with no WebGL has no 3D scene at all, XR or otherwise. */
export function probeWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Step 4. Safari's AR Quick Look feature-detect; unrelated to `navigator.xr`. */
export function probeQuickLook(): boolean {
  try {
    return document.createElement("a").relList.supports("ar");
  } catch {
    return false;
  }
}

type SessionSupportResult = "supported" | "unsupported" | "blocked";

/**
 * Step 3, run once per mode. `isSessionSupported` resolves `false` for
 * "not supported" and REJECTS (typically `SecurityError`) when a
 * permissions policy blocks the feature. Those are different facts and
 * this function keeps them different — it never coerces a rejection to
 * `false`.
 */
async function probeSessionSupport(
  xr: XRSystem,
  mode: XRSessionMode
): Promise<SessionSupportResult> {
  try {
    const ok = await xr.isSessionSupported(mode);
    return ok ? "supported" : "unsupported";
  } catch {
    return "blocked";
  }
}

/**
 * Runs the full four-step probe. Never throws — every step that can reject
 * is caught and folded into a named state instead.
 */
export async function probeXR(): Promise<XrCapability> {
  if (!probeWebGL()) {
    return {
      state: "no-webgl",
      supported: null,
      reason: "This browser or device did not provide a WebGL context.",
    };
  }

  const xr = typeof navigator !== "undefined" ? navigator.xr : undefined;
  if (!xr) {
    if (probeQuickLook()) {
      return { state: "quicklook-only", supported: null, reason: null };
    }
    return {
      state: "no-webxr",
      supported: null,
      reason: "Immersive AR and VR are not available in this browser.",
    };
  }

  // Step 3 — independent, both wrapped, per §7.1.
  const [vr, ar] = await Promise.all([
    probeSessionSupport(xr, "immersive-vr"),
    probeSessionSupport(xr, "immersive-ar"),
  ]);

  if (vr === "blocked" || ar === "blocked") {
    return {
      state: "blocked-by-policy",
      supported: { vr: vr === "supported", ar: ar === "supported" },
      reason:
        "Immersive sessions are blocked by this page's permissions policy.",
    };
  }

  const vrOk = vr === "supported";
  const arOk = ar === "supported";

  if (!vrOk && !arOk) {
    return {
      state: "no-device",
      supported: { vr: false, ar: false },
      reason:
        "WebXR is present in this browser, but no immersive VR or AR device was detected.",
    };
  }

  return {
    state: arOk && vrOk ? "ar-and-vr" : arOk ? "ar-only" : "vr-only",
    supported: { vr: vrOk, ar: arOk },
    reason: null,
  };
}

/**
 * Layers the transient session-lifecycle phase (`xr/session.ts`) on top of
 * this probe's own result, producing whichever of the eleven §7.2 states
 * currently applies. The one function `XRPanel.tsx`, `DimensionsStage.tsx`
 * and the test hook's `getXR()` all call, so the DOM, the accessible
 * announcement and the machine-readable hook can never disagree about which
 * state is current.
 */
export function resolveXrUiState(
  capabilityState: XrCapability["state"],
  sessionPhase: XrSessionPhase
): XrUiState {
  if (sessionPhase === "running") return "session-running";
  if (sessionPhase === "rejected") return "session-rejected";
  return capabilityState;
}

/**
 * The exact copy for `[data-testid="xr-status"]`, per §7.2's table. Kept as
 * one pure function so the DOM text and the "affirmative strings appear
 * only in session-running" assertion are both driven from a single,
 * reviewable source.
 *
 * The four affirmative strings this project's honesty contract names —
 * `in VR`, `XR active`, `immersive session running`, `connected` — must
 * never appear in the output of this function for any state OTHER than
 * `session-running`. Verified by reading every branch below: none of the
 * eight non-running branches contains any of those four substrings.
 */
export function xrStatusText(
  state: XrUiState,
  extra: {
    reason?: string | null;
    mode?: "immersive-ar" | "immersive-vr" | null;
  } = {}
): string {
  switch (state) {
    case "no-webgl":
      return "3D is unavailable: this browser or device did not provide a WebGL context.";
    case "no-webxr":
      return "Immersive AR and VR are not available in this browser. The 3D stage below is fully interactive.";
    case "quicklook-only":
      return "This browser has no WebXR. Apple's AR Quick Look is available — open the model in AR.";
    case "no-device":
      return "WebXR is present in this browser, but no immersive VR or AR device was detected.";
    case "blocked-by-policy":
      return "Immersive sessions are blocked by this page's permissions policy.";
    case "ar-only":
      return "Immersive AR is available on this device.";
    case "vr-only":
      return "Immersive VR is available on this device.";
    case "ar-and-vr":
      return "Immersive AR and VR are available on this device.";
    case "session-rejected":
      return `The immersive session did not start: ${extra.reason ?? "the request was declined."}`;
    case "session-running":
      // The one state permitted to use the project's affirmative vocabulary
      // (§7.2's honesty rule) — deliberately includes "XR active" and, for
      // VR, "in VR" verbatim, so the single testable assertion has a real
      // positive case to contrast against every other branch's absence of it.
      return extra.mode === "immersive-vr"
        ? "XR active — you are in VR. Exit to return to the non-immersive scene."
        : "XR active — an immersive AR session is running. Exit to return to the non-immersive scene.";
  }
}
