/**
 * 6D panel — client/src/dimensions/transport/CollabPanel.tsx
 *
 * Pure presentation, following the same convention as `physics/PhysicsPanel.tsx`
 * and `xr/XRPanel.tsx`: `DimensionsStage.tsx` owns `useCollaboration`'s
 * result; this file only renders what it is handed and reports user actions
 * back up. No Supabase vendor import, direct or otherwise.
 *
 * T-016 finding S-9 (as amended by the T-018 rejection, F-4): the
 * public-sandbox notice below is rendered whenever `join()` is reachable at
 * all — i.e. in every `TransportStatus` except `"unconfigured"` — so it is on
 * screen **before** the Join button is ever clicked, not merely before it is
 * clicked. With an anon key and no authentication, "anyone who can load this
 * page can move objects and can reset the twin" is literally true (§3.3), so
 * the notice says exactly that, in plain words, not as a caveat added after.
 *
 * It is gated OFF in `"unconfigured"` (no anon key in this build — the
 * default, shipped state) because there the join form itself renders
 * nothing (line ~107 below): a notice describing what "anyone who joins" can
 * do, next to no way to join at all, would describe controls that do not
 * exist rather than a real risk a visitor is about to take on. `CollabPanel`
 * already reports that state honestly via `collab-status`
 * ("Not available in this build: …"); the sandbox notice does not need to
 * repeat it.
 */

import { useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, LogOut, RotateCcw, Users } from "lucide-react";
import type { ActorId, ActorPresence, TransportStatus } from "./types";

export interface CollabPanelProps {
  status: TransportStatus;
  actors: readonly ActorPresence[];
  selfActorId: ActorId;
  joined: boolean;
  lastErrorMessage: string | null;
  opsApplied: number;
  opsRejected: number;
  lastSavedAt: number | null;
  onJoin: (displayName: string) => void;
  onLeave: () => void;
  onMoveTarget: (delta: { x?: number; z?: number }) => void;
  /** T-016 S-9 — makes the sandbox notice's "or reset it" a real, exercised control. */
  onResetTarget: () => void;
}

const NUDGE_STEP = 0.4;

function statusText(status: TransportStatus): string {
  switch (status.kind) {
    case "unconfigured":
      return `Not available in this build: ${status.reason}`;
    case "idle":
      return "You are working alone — the shared stage is not connected.";
    case "connecting":
      return "Joining the shared stage…";
    case "connected":
      return "Connected to the shared stage.";
    case "reconnecting":
      return `Reconnecting (attempt ${status.attempt})…`;
    case "disconnected":
      return `Disconnected: ${status.reason}`;
  }
}

export default function CollabPanel({
  status,
  actors,
  selfActorId,
  joined,
  lastErrorMessage,
  opsApplied,
  opsRejected,
  lastSavedAt,
  onJoin,
  onLeave,
  onMoveTarget,
  onResetTarget,
}: CollabPanelProps) {
  const [displayName, setDisplayName] = useState(() => `Visitor-${Math.floor(1000 + Math.random() * 9000)}`);
  const [expandedActorId, setExpandedActorId] = useState<string | null>(null);

  const canJoin = status.kind === "idle" || status.kind === "disconnected";
  const isBusy = status.kind === "connecting" || status.kind === "reconnecting";

  return (
    <div className="rounded-2xl p-5 sm:p-6" style={{ background: "rgba(17,19,39,0.5)", border: "1px solid rgba(124,58,237,0.2)" }}>
      <div className="mb-3">
        <div className="text-[10px] uppercase tracking-widest font-mono mb-1" style={{ color: "rgba(167,139,250,0.6)" }}>
          6D — Multi-user collaboration
        </div>
        <h3 className="font-bold text-white text-lg" style={{ fontFamily: "Sora, sans-serif" }}>
          A shared stage, with a durable twin
        </h3>
      </div>

      {/* T-016 S-9 / T-018 F-4: shown whenever joining is actually reachable
          (i.e. not "unconfigured"), before the Join button is ever clicked —
          never when there is no join control on the page at all. */}
      {status.kind !== "unconfigured" && (
        <p
          data-testid="collab-sandbox-notice"
          className="text-xs mb-4 rounded-xl px-3 py-2"
          style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", color: "rgba(252,211,77,0.9)" }}
        >
          This is a public sandbox. There is no login and no per-user ownership — anyone who joins can move the
          shared object below or reset it. Nothing private is stored here.
        </p>
      )}

      <p role="status" data-testid="collab-status" className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>
        {statusText(status)}
      </p>

      {lastErrorMessage && (
        <p role="alert" data-testid="collab-error" className="text-xs mb-4" style={{ color: "#FCA5A5" }}>
          {lastErrorMessage}
        </p>
      )}

      {status.kind === "unconfigured" ? null : !joined ? (
        <form
          className="flex flex-wrap items-end gap-3 mb-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!canJoin) return;
            onJoin(displayName.trim() || "Visitor");
          }}
        >
          <div>
            <label htmlFor="collab-display-name" className="block text-[10px] uppercase tracking-widest font-mono mb-1" style={{ color: "rgba(167,139,250,0.6)" }}>
              Your display name
            </label>
            <input
              id="collab-display-name"
              data-testid="collab-display-name"
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              maxLength={40}
              className="px-3 py-2 rounded-lg text-sm"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(124,58,237,0.25)", color: "white" }}
            />
          </div>
          <button
            type="submit"
            data-testid="collab-join"
            disabled={!canJoin}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #7C3AED, #5B21B6)" }}
          >
            <Users className="w-4 h-4" /> {isBusy ? "Joining…" : "Join the shared stage"}
          </button>
        </form>
      ) : (
        <div className="mb-4">
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <span
              data-testid="collab-participant-count"
              className="text-[10px] uppercase tracking-widest font-mono px-2.5 py-1 rounded-full"
              style={{ background: "rgba(52,211,153,0.15)", color: "#34D399" }}
            >
              {actors.length} {actors.length === 1 ? "participant" : "participants"}
            </span>
            <button
              type="button"
              onClick={onLeave}
              data-testid="collab-leave"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
              style={{ color: "rgba(255,255,255,0.8)", border: "1px solid rgba(124,58,237,0.25)" }}
            >
              <LogOut className="w-3.5 h-3.5" /> Leave
            </button>
          </div>

          <ul className="flex flex-wrap gap-2 mb-4" aria-label="Participants in the shared stage">
            {actors.map((actor) => {
              const expanded = expandedActorId === (actor.actorId as string);
              return (
                <li key={actor.actorId as string}>
                  <button
                    type="button"
                    data-testid="collab-actor"
                    aria-expanded={expanded}
                    aria-label={`Participant: ${actor.displayName}${actor.actorId === selfActorId ? " (you)" : ""}, joined at ${new Date(actor.joinedAt).toLocaleTimeString()}`}
                    onClick={() => setExpandedActorId(expanded ? null : (actor.actorId as string))}
                    className="text-xs font-medium px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.85)" }}
                  >
                    <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: "50%", background: actor.colorHex, display: "inline-block" }} />
                    {actor.displayName}
                    {actor.actorId === selfActorId ? " (you)" : ""}
                    {expanded ? ` — joined ${new Date(actor.joinedAt).toLocaleTimeString()}` : ""}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mb-2">
            <div className="text-[10px] uppercase tracking-widest font-mono mb-2" style={{ color: "rgba(167,139,250,0.6)" }}>
              Move the shared platform
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button type="button" data-testid="collab-move-left" aria-label="Move the shared platform left" onClick={() => onMoveTarget({ x: -NUDGE_STEP })} className="p-2 rounded-lg" style={{ border: "1px solid rgba(124,58,237,0.25)", color: "white" }}>
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button type="button" data-testid="collab-move-right" aria-label="Move the shared platform right" onClick={() => onMoveTarget({ x: NUDGE_STEP })} className="p-2 rounded-lg" style={{ border: "1px solid rgba(124,58,237,0.25)", color: "white" }}>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button type="button" data-testid="collab-move-forward" aria-label="Move the shared platform forward" onClick={() => onMoveTarget({ z: -NUDGE_STEP })} className="p-2 rounded-lg" style={{ border: "1px solid rgba(124,58,237,0.25)", color: "white" }}>
                <ArrowUp className="w-4 h-4" />
              </button>
              <button type="button" data-testid="collab-move-back" aria-label="Move the shared platform back" onClick={() => onMoveTarget({ z: NUDGE_STEP })} className="p-2 rounded-lg" style={{ border: "1px solid rgba(124,58,237,0.25)", color: "white" }}>
                <ArrowDown className="w-4 h-4" />
              </button>
              <button
                type="button"
                data-testid="collab-reset"
                aria-label="Reset the shared platform to its starting position"
                onClick={onResetTarget}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium ml-1"
                style={{ border: "1px solid rgba(124,58,237,0.25)", color: "rgba(255,255,255,0.75)" }}
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </div>

          <p data-testid="collab-twin-status" className="text-xs mt-3" style={{ color: "rgba(255,255,255,0.5)" }}>
            Digital twin: {lastSavedAt ? `last saved by this session at ${new Date(lastSavedAt).toLocaleTimeString()}` : "not yet saved this session"}.{" "}
            {opsApplied} change{opsApplied === 1 ? "" : "s"} applied, {opsRejected} rejected.
          </p>
        </div>
      )}
    </div>
  );
}
