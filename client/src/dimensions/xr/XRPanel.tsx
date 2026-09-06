/**
 * 7D panel — client/src/dimensions/xr/XRPanel.tsx
 *
 * Pure presentation, following the same convention as `physics/PhysicsPanel.tsx`
 * and `live/LiveDataPanel.tsx`: `DimensionsStage.tsx` owns the probe result,
 * the session handle and the test hook; this file only renders what it is
 * handed and reports user actions back up.
 *
 * Renders `[data-testid="xr-status"]` with the exact copy from
 * ARCHITECTURE-DIMENSIONS.md §7.2 (`xrStatusText`, `./detect.ts`) for
 * whichever of the eleven states applies, and nothing else — no control is
 * ever rendered that this build cannot back with a real capability check
 * or a real session.
 */

import { Eye, Glasses, LogOut } from "lucide-react";
import { resolveXrUiState, xrStatusText, type XrCapability } from "./detect";
import type { XrSessionMode, XrSessionPhase } from "./session";

export interface XRPanelProps {
  /** `null` until the async capability probe resolves — never guessed at in the meantime. */
  capability: XrCapability | null;
  sessionPhase: XrSessionPhase;
  /** The browser's own rejection message, verbatim — set only when `sessionPhase === "rejected"`. */
  rejectReason: string | null;
  /** The mode of the session currently running, or most recently requested. */
  activeMode: XrSessionMode | null;
  /** Runtime path to a real, built `.usdz` asset (§7.4). */
  quickLookHref: string;
  onEnter: (mode: XrSessionMode) => void;
  onExit: () => void;
}

export default function XRPanel({
  capability,
  sessionPhase,
  rejectReason,
  activeMode,
  quickLookHref,
  onEnter,
  onExit,
}: XRPanelProps) {
  return (
    <div className="rounded-2xl p-5 sm:p-6" style={{ background: "rgba(17,19,39,0.5)", border: "1px solid rgba(124,58,237,0.2)" }}>
      <div className="mb-3">
        <div className="text-[10px] uppercase tracking-widest font-mono mb-1" style={{ color: "rgba(167,139,250,0.6)" }}>
          7D — Immersive AR / VR
        </div>
        <h3 className="font-bold text-white text-lg" style={{ fontFamily: "Sora, sans-serif" }}>
          WebXR, detected honestly
        </h3>
      </div>

      {!capability ? (
        <p role="status" data-testid="xr-status" className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
          Checking this browser&apos;s AR/VR support…
        </p>
      ) : (
        <XRPanelBody
          capability={capability}
          sessionPhase={sessionPhase}
          rejectReason={rejectReason}
          activeMode={activeMode}
          quickLookHref={quickLookHref}
          onEnter={onEnter}
          onExit={onExit}
        />
      )}
    </div>
  );
}

function XRPanelBody({
  capability,
  sessionPhase,
  rejectReason,
  activeMode,
  quickLookHref,
  onEnter,
  onExit,
}: Omit<XRPanelProps, "capability"> & { capability: XrCapability }) {
  const running = sessionPhase === "running";
  const requesting = sessionPhase === "requesting";

  const displayState = resolveXrUiState(capability.state, sessionPhase);
  const statusText = xrStatusText(displayState, { reason: rejectReason, mode: activeMode });

  const arAvailable = capability.supported?.ar ?? false;
  const vrAvailable = capability.supported?.vr ?? false;
  // §7.2's last row: "session ended -> reverts to ar-only/vr-only/ar-and-vr" —
  // the enter controls come back exactly when the underlying capability still
  // says a device is there, whether or not the most recent attempt (if any)
  // was rejected. Only a currently-running session hides them.
  const showEnterControls = !running && (arAvailable || vrAvailable);

  return (
    <>
      <p role="status" data-testid="xr-status" className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>
        {statusText}
      </p>

      {running && (
        <div className="flex flex-wrap items-center gap-3">
          <span
            data-testid="xr-session-indicator"
            className="text-[10px] uppercase tracking-widest font-mono px-2.5 py-1 rounded-full"
            style={{ background: "rgba(52,211,153,0.15)", color: "#34D399" }}
          >
            Connected
          </span>
          <button
            type="button"
            onClick={onExit}
            data-testid="xr-exit"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ color: "rgba(255,255,255,0.85)", border: "1px solid rgba(124,58,237,0.35)" }}
          >
            <LogOut className="w-4 h-4" /> Exit immersive session
          </button>
        </div>
      )}

      {showEnterControls && (
        <div className="flex flex-wrap items-center gap-2">
          {arAvailable && (
            <button
              type="button"
              onClick={() => onEnter("immersive-ar")}
              data-testid="xr-enter-ar"
              disabled={requesting}
              aria-label="Enter immersive AR"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #7C3AED, #5B21B6)" }}
            >
              <Glasses className="w-4 h-4" /> {requesting && activeMode === "immersive-ar" ? "Requesting…" : "Enter AR"}
            </button>
          )}
          {vrAvailable && (
            <button
              type="button"
              onClick={() => onEnter("immersive-vr")}
              data-testid="xr-enter-vr"
              disabled={requesting}
              aria-label="Enter immersive VR"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #7C3AED, #5B21B6)" }}
            >
              <Eye className="w-4 h-4" /> {requesting && activeMode === "immersive-vr" ? "Requesting…" : "Enter VR"}
            </button>
          )}
        </div>
      )}

      {displayState === "quicklook-only" && (
        <a
          href={quickLookHref}
          rel="ar"
          data-testid="xr-quicklook-link"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all"
          style={{ background: "linear-gradient(135deg, #7C3AED, #5B21B6)" }}
        >
          <Glasses className="w-4 h-4" /> Open a sample model in AR (Quick Look)
        </a>
      )}
    </>
  );
}
