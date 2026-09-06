/**
 * The 6D wiring hook — client/src/dimensions/transport/useCollaboration.ts
 *
 * Connects `createTransport()` (§6.2, the swap point) to the store's 6D
 * methods (`state/store.ts`'s `applyOp` / `publishLocalOp` / `setActors` /
 * `hydrateFromSnapshot`), and owns the parts of ARCHITECTURE-DIMENSIONS.md
 * §6 that are neither the transport's job nor the store's:
 *
 *  - §6.3: `join()` is called **only** from this hook's own `join()`, which
 *    `CollabPanel.tsx` calls **only** from a click handler — never from an
 *    effect on mount. This file's own mount effect calls `createTransport()`
 *    (cheap, synchronous, no network — §6.2) and registers `onOp`/
 *    `onPresence`/`onStatus`, but never `.join()`.
 *  - T-016 finding S-5: the `onOp` callback below is `(op) => store.applyOp(op)`
 *    — `store.applyOp` is where the objectId allowlist (built from
 *    `ProcessModel.objects`, never composed state) and the LWW comparison
 *    both live (`state/store.ts`). This file adds no second copy of that
 *    check; it just wires the one that exists straight to the wire.
 *  - T-016 finding S-5 (the `loadSnapshot` half): `transport.loadSnapshot()`
 *    cannot itself check object-id membership (`validation.ts`'s
 *    `buildSceneSnapshotSchema` comment — `createTransport()` is a
 *    zero-parameter factory with no channel to the authored model). This
 *    hook is the caller with that channel, so `join()` filters the loaded
 *    snapshot's `objects` against `store.getValidObjectIds()` itself before
 *    calling `store.hydrateFromSnapshot()`.
 *  - T-016 finding S-11: every user-facing string this hook exposes for a
 *    failed `join` / `publish` / `loadSnapshot` / `saveSnapshot` is one of
 *    the fixed constants below — never `error.message` or `error.hint`
 *    (`supabaseTransport.ts:258-263,285-290` interpolates both into the
 *    `Error` it throws, and those can name the failing table or constraint).
 *    The raw error is logged with `console.error` — for a developer looking
 *    at devtools, never for a visitor.
 *  - §6.6: the digital twin. `saveSnapshot` is throttled to at most once
 *    per 2s (and only when `revision` changed since the last save), plus a
 *    flush on `pagehide`/`visibilitychange`.
 *  - T-011 ("remote session control", never "device control" — see this
 *    task's report for why that label is load-bearing): a controller/
 *    controlled role pair layered on the *same* `SceneOp` channel T-010
 *    already validates and merges. See `CONTROL_TARGET_ID` and
 *    `RemoteControlState` below for the mechanism.
 *
 * **Test-only transport injection.** The `BroadcastChannel`-based dev/test
 * transport fixture in this same directory (see its own file header, and
 * ARCHITECTURE-DIMENSIONS.md §6.7) is documented as reachable from nowhere
 * but itself and its own unit test — enforced by a grep over its exact
 * filename across `client/src`, which must match only that one file. This
 * hook therefore never imports it, even dynamically (a dynamic import
 * string would still match that grep). Instead,
 * a Playwright spec proving genuine two-page synchronisation (T-010's
 * acceptance test, adapted per this task's brief: "you can genuinely prove
 * two-page synchronisation in one context, and you should" since
 * `BroadcastChannel` does not cross `browser.newContext()` boundaries and no
 * Supabase anon key exists) injects its OWN `CollaborationTransport`
 * implementation via `page.addInitScript`, assigned to
 * `window.__AGL_DIMENSIONS_TEST_TRANSPORT__`. This hook only ever calls that
 * factory if it is present — inert in every real build, where the property
 * is never defined.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { createTransport } from "./index";
import type {
  ActorId,
  ActorPresence,
  CollaborationTransport,
  ObjectId,
  SceneOp,
  TransportStatus,
} from "./types";
import type { DimensionsStore } from "../state/store";

declare global {
  interface Window {
    /** Test-only seam — see this file's header. Never set outside a Playwright `addInitScript`. */
    __AGL_DIMENSIONS_TEST_TRANSPORT__?: () => CollaborationTransport;
  }
}

/** One shared public stage for the whole site (§3.3: "the shared stage is a public sandbox"). */
export const ROOM_ID = "dimensions-public-stage";

/** T-011's demo target — `platform`'s `stage` is `null`, so it is visible at every `t` (`model/process.ts`), which is what makes a remote move visually provable in a screenshot regardless of where the 4D timeline currently is. */
export const CONTROL_TARGET_ID = "platform" as ObjectId;

const SAVE_THROTTLE_MS = 2000;
const COMMAND_TIMEOUT_MS = 4000;

/** T-016 finding S-11: fixed, never `error.message`/`error.hint`. The raw error is `console.error`-logged for developers, never shown. */
const JOIN_ERROR_MESSAGE = "Could not join the shared stage. Please try again in a moment.";
const PUBLISH_ERROR_MESSAGE = "Your last change could not be sent to the shared stage.";
const SNAPSHOT_LOAD_ERROR_MESSAGE = "The shared stage's saved state could not be loaded.";
const SNAPSHOT_SAVE_ERROR_MESSAGE = "The shared stage's current state could not be saved.";

const COLOR_PALETTE = ["#F59E0B", "#34D399", "#60A5FA", "#F472B6", "#A78BFA", "#FB923C"];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function randomActorId(): ActorId {
  const bytes =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return bytes as ActorId;
}

function colorForActor(actorId: string): string {
  return COLOR_PALETTE[hashString(actorId) % COLOR_PALETTE.length];
}

export type RemoteControlRole = "none" | "controller" | "controlled";

export interface RemoteControlCommandResult {
  /** `"confirmed"` only once an op from a DIFFERENT actorId — genuinely received over the wire — won the LWW comparison for `CONTROL_TARGET_ID`. Never set from the command that was sent. */
  status: "sending" | "confirmed" | "timed-out";
  confirmedByActorId: ActorId | null;
}

export interface UseCollaborationResult {
  status: TransportStatus;
  selfActorId: ActorId;
  actors: readonly ActorPresence[];
  /** `true` once this session has actually joined (`status.kind === "connected"`). */
  joined: boolean;
  /** Fixed, non-leaking error text (T-016 S-11) for the most recent failed join/publish/snapshot-load, or `null`. */
  lastErrorMessage: string | null;
  join(displayName: string): Promise<void>;
  leave(): Promise<void>;
  /** T-010 — any joined peer may nudge the shared object (§3.3: "a public sandbox anyone may edit or reset"). */
  moveTarget(delta: { x?: number; z?: number }): Promise<void>;
  /** T-016 S-9 — any joined peer may reset the shared object to its authored baseline. `baselinePosition` is the caller's own computed "no 6D override" position (see `resetTarget`'s implementation comment). */
  resetTarget(baselinePosition: { x: number; y: number; z: number }): Promise<void>;
  opsApplied: number;
  opsRejected: number;
  /** Digital twin (§6.6) — when this session last successfully wrote the shared-stage row, or `null` if it never has this session. */
  lastSavedAt: number | null;
  remoteControlRole: RemoteControlRole;
  setRemoteControlRole(role: RemoteControlRole): void;
  /** Only meaningful when `remoteControlRole === "controller"`. */
  lastCommand: RemoteControlCommandResult | null;
  sendRemoteCommand(delta: { x?: number; z?: number }): Promise<void>;
  /** Only meaningful when `remoteControlRole === "controlled"`. The last inbound command this session applied and echoed back, or `null`. */
  lastReceivedCommand: { fromActorId: ActorId; patch: SceneOp["patch"]; at: number } | null;
}

export function useCollaboration(store: DimensionsStore): UseCollaborationResult {
  const transportRef = useRef<CollaborationTransport | null>(null);
  if (!transportRef.current) {
    transportRef.current =
      typeof window !== "undefined" && window.__AGL_DIMENSIONS_TEST_TRANSPORT__
        ? window.__AGL_DIMENSIONS_TEST_TRANSPORT__()
        : createTransport();
  }
  const transport = transportRef.current;

  const [selfActorId] = useState<ActorId>(() => randomActorId());
  const [status, setStatus] = useState<TransportStatus>(transport.status);
  const [actors, setActorsState] = useState<readonly ActorPresence[]>([]);
  const [lastErrorMessage, setLastErrorMessage] = useState<string | null>(null);
  const [opCounters, setOpCounters] = useState(() => store.getOpCounters());
  const [remoteControlRole, setRemoteControlRoleState] = useState<RemoteControlRole>("none");
  const [lastCommand, setLastCommand] = useState<RemoteControlCommandResult | null>(null);
  const [lastReceivedCommand, setLastReceivedCommand] = useState<UseCollaborationResult["lastReceivedCommand"]>(null);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

  const remoteControlRoleRef = useRef<RemoteControlRole>("none");
  const selfActorIdRef = useRef(selfActorId);
  const echoCounterRef = useRef(0);
  const commandTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaveAtRef = useRef(0);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedRevisionRef = useRef(-1);
  const joinedRoomRef = useRef(false);

  useEffect(() => {
    remoteControlRoleRef.current = remoteControlRole;
  }, [remoteControlRole]);

  const describeAndLog = useCallback((context: string, fixedMessage: string, error: unknown) => {
    // eslint-disable-next-line no-console
    console.error(`[6D] ${context}:`, error);
    setLastErrorMessage(fixedMessage);
  }, []);

  const flushSnapshotSave = useCallback(() => {
    if (!joinedRoomRef.current) return;
    const revision = store.getSnapshot().revision;
    if (revision === savedRevisionRef.current) return;
    savedRevisionRef.current = revision;
    const savedAt = Date.now();
    lastSaveAtRef.current = savedAt;
    const snapshot = {
      objects: store.getSnapshot().objects,
      revision,
      savedAt,
    };
    void transport
      .saveSnapshot(ROOM_ID, snapshot)
      .then(() => setLastSavedAt(savedAt))
      .catch((error) => {
        describeAndLog("saveSnapshot failed", SNAPSHOT_SAVE_ERROR_MESSAGE, error);
      });
  }, [store, transport, describeAndLog]);

  const scheduleSnapshotSave = useCallback(() => {
    if (!joinedRoomRef.current) return;
    if (saveTimerRef.current) return; // already scheduled
    const elapsed = Date.now() - lastSaveAtRef.current;
    const wait = Math.max(0, SAVE_THROTTLE_MS - elapsed);
    saveTimerRef.current = setTimeout(() => {
      saveTimerRef.current = null;
      flushSnapshotSave();
    }, wait);
  }, [flushSnapshotSave]);

  // Mount-once: construct the transport, register listeners. Never calls
  // `.join()` — that is an explicit user action (§6.3), triggered only by
  // this hook's own `join()` below, itself only reachable from a click.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setStatus(transport.status);

    const unsubscribeStatus = transport.onStatus((next) => {
      setStatus(next);
      // §6.4/T-010 "disconnection is honest": a transport that is no longer
      // connected must stop presenting its last-known peer list as current.
      if (next.kind !== "connected" && next.kind !== "reconnecting") {
        setActorsState([]);
      }
    });

    const unsubscribePresence = transport.onPresence((next) => {
      setActorsState(next);
    });

    const unsubscribeOp = transport.onOp((op) => {
      const applied = store.applyOp(op);
      setOpCounters(store.getOpCounters());
      if (!applied) return;

      // T-011: only a session explicitly acting as "controlled" echoes a
      // confirmation back, and only for the designated control target, and
      // only for an op it did not itself just send an echo for — the
      // `ack:` opId prefix is what stops two "controlled" sessions from
      // echoing each other forever (see this file's header).
      if (
        remoteControlRoleRef.current === "controlled" &&
        op.objectId === CONTROL_TARGET_ID &&
        op.actorId !== selfActorIdRef.current &&
        !op.opId.startsWith("ack:")
      ) {
        setLastReceivedCommand({ fromActorId: op.actorId, patch: op.patch, at: Date.now() });
        echoCounterRef.current += 1;
        const echoOp: SceneOp = {
          opId: `ack:${selfActorIdRef.current}:${op.objectId}:${echoCounterRef.current}`,
          objectId: op.objectId,
          actorId: selfActorIdRef.current,
          seq: op.seq + 1,
          at: Date.now(),
          patch: op.patch,
        };
        if (store.applyOp(echoOp)) {
          setOpCounters(store.getOpCounters());
          void transport.publish(echoOp).catch((error) => {
            describeAndLog("publish (confirmation echo) failed", PUBLISH_ERROR_MESSAGE, error);
          });
        }
      }

      // The controller side: any op on the target whose actorId is not our
      // own is a genuine, wire-delivered fact about the target's state —
      // this is what "derived from the response" means. It is checked here
      // (not only in the dedicated `sendRemoteCommand` timeout path) so a
      // confirmation is recognised even if it arrives after this hook gave
      // up waiting.
      if (
        remoteControlRoleRef.current === "controller" &&
        op.objectId === CONTROL_TARGET_ID &&
        op.actorId !== selfActorIdRef.current
      ) {
        if (commandTimeoutRef.current) {
          clearTimeout(commandTimeoutRef.current);
          commandTimeoutRef.current = null;
        }
        setLastCommand({ status: "confirmed", confirmedByActorId: op.actorId });
      }
    });

    const unsubscribeStore = store.subscribe(() => {
      setOpCounters(store.getOpCounters());
      scheduleSnapshotSave();
    });

    const handleExitFlush = () => flushSnapshotSave();
    document.addEventListener("visibilitychange", handleExitFlush);
    window.addEventListener("pagehide", handleExitFlush);

    return () => {
      unsubscribeStatus();
      unsubscribePresence();
      unsubscribeOp();
      unsubscribeStore();
      document.removeEventListener("visibilitychange", handleExitFlush);
      window.removeEventListener("pagehide", handleExitFlush);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (commandTimeoutRef.current) clearTimeout(commandTimeoutRef.current);
    };
  }, []);

  const join = useCallback(
    async (displayName: string) => {
      setLastErrorMessage(null);
      try {
        await transport.join(ROOM_ID, {
          actorId: selfActorId,
          displayName,
          colorHex: colorForActor(selfActorId as string),
        });
        joinedRoomRef.current = true;

        try {
          const snapshot = await transport.loadSnapshot(ROOM_ID);
          if (snapshot) {
            // T-016 S-5: filter against the authored model's id set before
            // this ever reaches the store — `transport.loadSnapshot()`
            // cannot do this itself (see `validation.ts`'s
            // `buildSceneSnapshotSchema` comment; this hook is the caller
            // with the model reference it structurally lacks).
            const validIds = store.getValidObjectIds();
            const filtered: Record<string, (typeof snapshot.objects)[string]> = {};
            for (const [id, object] of Object.entries(snapshot.objects)) {
              if (validIds.has(id)) filtered[id] = object;
              else console.warn("[6D] dropped a stored snapshot object not in the authored model:", id);
            }
            store.hydrateFromSnapshot(filtered);
            savedRevisionRef.current = store.getSnapshot().revision;
          }
        } catch (error) {
          describeAndLog("loadSnapshot failed", SNAPSHOT_LOAD_ERROR_MESSAGE, error);
        }
      } catch (error) {
        joinedRoomRef.current = false;
        describeAndLog("join failed", JOIN_ERROR_MESSAGE, error);
        throw error;
      }
    },
    [transport, selfActorId, store, describeAndLog],
  );

  const leave = useCallback(async () => {
    flushSnapshotSave();
    joinedRoomRef.current = false;
    await transport.leave();
    setActorsState([]);
  }, [transport, flushSnapshotSave]);

  const publishPosition = useCallback(
    async (objectId: ObjectId, position: { x: number; y: number; z: number }) => {
      const op = store.publishLocalOp(objectId, selfActorId, { position });
      if (!op) return null;
      try {
        await transport.publish(op);
      } catch (error) {
        describeAndLog("publish failed", PUBLISH_ERROR_MESSAGE, error);
      }
      return op;
    },
    [store, selfActorId, transport, describeAndLog],
  );

  const publishDelta = useCallback(
    async (objectId: ObjectId, delta: { x?: number; z?: number }) => {
      const current = store.getSnapshot().objects[objectId as string];
      if (!current) return null;
      const nextPosition = {
        x: current.position.x + (delta.x ?? 0),
        y: current.position.y,
        z: current.position.z + (delta.z ?? 0),
      };
      return publishPosition(objectId, nextPosition);
    },
    [store, publishPosition],
  );

  const moveTarget = useCallback(
    async (delta: { x?: number; z?: number }) => {
      await publishDelta(CONTROL_TARGET_ID, delta);
    },
    [publishDelta],
  );

  /**
   * T-016 S-9: the sandbox notice (`CollabPanel.tsx`) states plainly that
   * "anyone who joins can move the shared object below or reset it" — this
   * is what makes "reset it" a real, exercised UI capability rather than
   * only a true-but-invisible property of the RLS policy (anon
   * INSERT/UPDATE `WITH CHECK (true)`). `baselinePosition` is computed by
   * the caller (`DimensionsStage.tsx`, which has the authored `ProcessModel`
   * and the current `t`) via `composeScene({ ..., remote: {} })` — i.e.
   * "what this object would show with no 6D override applied" — so this
   * hook does not need to know the model's shape or duplicate §5.3's
   * pipeline to compute it.
   */
  const resetTarget = useCallback(
    async (baselinePosition: { x: number; y: number; z: number }) => {
      await publishPosition(CONTROL_TARGET_ID, baselinePosition);
    },
    [publishPosition],
  );

  const setRemoteControlRole = useCallback((role: RemoteControlRole) => {
    remoteControlRoleRef.current = role;
    setRemoteControlRoleState(role);
    setLastCommand(null);
    setLastReceivedCommand(null);
    if (commandTimeoutRef.current) {
      clearTimeout(commandTimeoutRef.current);
      commandTimeoutRef.current = null;
    }
  }, []);

  const sendRemoteCommand = useCallback(
    async (delta: { x?: number; z?: number }) => {
      setLastCommand({ status: "sending", confirmedByActorId: null });
      if (commandTimeoutRef.current) clearTimeout(commandTimeoutRef.current);
      // The controller deliberately does NOT apply this locally (see this
      // file's header) — its own displayed state only ever advances from an
      // inbound op, so "confirmed" can never be an assumption about the
      // command that was just sent.
      const current = store.getSnapshot().objects[CONTROL_TARGET_ID as string];
      if (!current) return;
      const nextPosition = {
        x: current.position.x + (delta.x ?? 0),
        y: current.position.y,
        z: current.position.z + (delta.z ?? 0),
      };
      const rev = current.rev;
      const op: SceneOp = {
        opId: `cmd:${selfActorId}:${CONTROL_TARGET_ID}:${Date.now()}`,
        objectId: CONTROL_TARGET_ID,
        actorId: selfActorId,
        seq: rev.seq + 1,
        at: Date.now(),
        patch: { position: nextPosition },
      };
      try {
        await transport.publish(op);
      } catch (error) {
        describeAndLog("publish (remote command) failed", PUBLISH_ERROR_MESSAGE, error);
        setLastCommand({ status: "timed-out", confirmedByActorId: null });
        return;
      }
      commandTimeoutRef.current = setTimeout(() => {
        setLastCommand((prev) => (prev?.status === "sending" ? { status: "timed-out", confirmedByActorId: null } : prev));
      }, COMMAND_TIMEOUT_MS);
    },
    [store, selfActorId, transport, describeAndLog],
  );

  return {
    status,
    selfActorId,
    actors,
    joined: status.kind === "connected",
    lastErrorMessage,
    join,
    leave,
    moveTarget,
    resetTarget,
    opsApplied: opCounters.applied,
    opsRejected: opCounters.rejected,
    lastSavedAt,
    remoteControlRole,
    setRemoteControlRole,
    lastCommand,
    sendRemoteCommand,
    lastReceivedCommand,
  };
}
