/**
 * 6D "remote session control" panel — client/src/dimensions/transport/RemoteControlPanel.tsx
 *
 * T-011. OQ-2 was resolved by the user as **browser-session-as-remote-endpoint**:
 * one browser genuinely drives another over the same `CollaborationTransport`
 * channel T-010 already validates and merges — never a physical device. This
 * file is the only place that label is spelled out to a visitor, and it is
 * spelled out deliberately: "remote session control", never "device
 * control" — the fabrication the user's "genuinely working" requirement
 * exists to prevent. Neither "device" nor "online" appears anywhere below.
 *
 * Mechanism (see `useCollaboration.ts`'s header for the full reasoning): the
 * controller sends a `SceneOp` and does **not** apply it to its own local
 * view — its displayed state only ever advances from an inbound op carrying
 * a different `actorId`, which is what makes "confirmed" a fact read off
 * the wire rather than an assumption about the command just sent. The
 * controlled session applies the inbound op and echoes its own resulting
 * op back (`ack:`-prefixed `opId`, so a second "controlled" session never
 * echoes the echo).
 *
 * Honesty rule this file exists to satisfy (T-011's acceptance criteria,
 * adapted from WebSerial/WebHID language to the resolved OQ-2 answer): with
 * nobody else joined, or before joining at all, this panel says exactly
 * that and renders no control that looks live.
 *
 * T-018 rejection, F-4: the "not joined" message used to read "Join the
 * shared stage above to use remote session control" in EVERY not-joined
 * state, including `status.kind === "unconfigured"` — the default, shipped
 * state — where `CollabPanel` renders no join control at all (see its
 * header). That pointed a visitor at a control that does not exist. `status`
 * is now a required prop so this panel can tell the two states apart and
 * give the unconfigured state its own honest message instead.
 */

import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import type { ActorId, ActorPresence, TransportStatus } from "./types";
import type {
  RemoteControlCommandResult,
  RemoteControlRole,
} from "./useCollaboration";

export interface RemoteControlPanelProps {
  status: TransportStatus;
  joined: boolean;
  actors: readonly ActorPresence[];
  selfActorId: ActorId;
  role: RemoteControlRole;
  onSetRole: (role: RemoteControlRole) => void;
  lastCommand: RemoteControlCommandResult | null;
  onSendCommand: (delta: { x?: number; z?: number }) => void;
  lastReceivedCommand: { fromActorId: ActorId; at: number } | null;
}

const NUDGE_STEP = 0.4;

function displayNameFor(
  actors: readonly ActorPresence[],
  actorId: ActorId | null
): string {
  if (actorId === null) return "another session";
  return (
    actors.find(a => a.actorId === actorId)?.displayName ?? "another session"
  );
}

export default function RemoteControlPanel({
  status,
  joined,
  actors,
  selfActorId,
  role,
  onSetRole,
  lastCommand,
  onSendCommand,
  lastReceivedCommand,
}: RemoteControlPanelProps) {
  const [pendingRole, setPendingRole] = useState<RemoteControlRole>(role);
  const peerCount = actors.filter(a => a.actorId !== selfActorId).length;

  return (
    <div
      className="rounded-2xl p-5 sm:p-6"
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
          6D — Remote session control
        </div>
        <h3
          className="font-bold text-white text-lg"
          style={{ fontFamily: "Sora, sans-serif" }}
        >
          One browser session driving another
        </h3>
      </div>

      <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>
        This sends move commands to another joined browser session over the
        shared-stage channel above — it does not control any physical device. If
        no other session is available to receive a command, that is reported
        honestly below rather than shown as if it worked.
      </p>

      {status.kind === "unconfigured" ? (
        <p
          role="status"
          data-testid="remote-control-status"
          className="text-xs"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          Not available in this build: {status.reason}
        </p>
      ) : !joined ? (
        <p
          role="status"
          data-testid="remote-control-status"
          className="text-xs"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          Join the shared stage above to use remote session control.
        </p>
      ) : (
        <>
          <fieldset className="mb-4">
            <legend
              className="text-[10px] uppercase tracking-widest font-mono mb-2"
              style={{ color: "rgba(167,139,250,0.6)" }}
            >
              This session&apos;s role
            </legend>
            <div className="flex flex-col gap-2">
              {[
                {
                  value: "none" as const,
                  label: "Do not send or receive commands",
                },
                {
                  value: "controller" as const,
                  label: "Send commands to another session",
                },
                {
                  value: "controlled" as const,
                  label: "Receive commands and report back",
                },
              ].map(option => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 text-sm"
                  style={{ color: "rgba(255,255,255,0.85)" }}
                >
                  <input
                    type="radio"
                    name="remote-control-role"
                    value={option.value}
                    checked={pendingRole === option.value}
                    data-testid={`remote-control-role-${option.value}`}
                    onChange={() => {
                      setPendingRole(option.value);
                      onSetRole(option.value);
                    }}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>

          {pendingRole === "controller" && (
            <div data-testid="remote-control-controller">
              {peerCount === 0 ? (
                <p
                  role="status"
                  data-testid="remote-control-no-peer"
                  className="text-xs"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  No other session is available yet — a command would have
                  nowhere to go.
                </p>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <button
                      type="button"
                      data-testid="remote-control-send-left"
                      onClick={() => onSendCommand({ x: -NUDGE_STEP })}
                      disabled={lastCommand?.status === "sending"}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
                      style={{
                        background: "linear-gradient(135deg, #7C3AED, #5B21B6)",
                      }}
                    >
                      <ArrowLeftRight className="w-4 h-4" /> Send: move left
                    </button>
                    <button
                      type="button"
                      data-testid="remote-control-send-right"
                      onClick={() => onSendCommand({ x: NUDGE_STEP })}
                      disabled={lastCommand?.status === "sending"}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
                      style={{
                        background: "linear-gradient(135deg, #7C3AED, #5B21B6)",
                      }}
                    >
                      <ArrowLeftRight className="w-4 h-4" /> Send: move right
                    </button>
                  </div>
                  <p
                    role="status"
                    data-testid="remote-control-command-status"
                    className="text-xs"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    {lastCommand === null && "No command sent yet."}
                    {lastCommand?.status === "sending" &&
                      "Command sent — waiting for the other session to report back…"}
                    {lastCommand?.status === "confirmed" &&
                      `Reported back by ${displayNameFor(actors, lastCommand.confirmedByActorId)}: the move was applied there.`}
                    {lastCommand?.status === "timed-out" &&
                      "No report received. Is another session set to “Receive commands and report back”?"}
                  </p>
                </>
              )}
            </div>
          )}

          {pendingRole === "controlled" && (
            <p
              role="status"
              data-testid="remote-control-received"
              className="text-xs"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              {lastReceivedCommand
                ? `Received and applied a move command from ${displayNameFor(actors, lastReceivedCommand.fromActorId)} at ${new Date(lastReceivedCommand.at).toLocaleTimeString()}, and reported it back.`
                : "Waiting to receive a move command from a session set to “Send commands to another session”."}
            </p>
          )}
        </>
      )}
    </div>
  );
}
