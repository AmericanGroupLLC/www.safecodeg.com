/**
 * The loopback transport — client/src/dimensions/transport/loopbackTransport.ts
 *
 * ARCHITECTURE-DIMENSIONS.md §6.2, §6.7: "`loopbackTransport` is a
 * development aid and a unit-test fixture. It is not a substitute for the
 * T-010 acceptance test and must never be used to make that test pass."
 * `BroadcastChannel` does not cross Playwright `browser.newContext()`
 * boundaries, and even if it did, a test that passes over an in-browser
 * channel would prove nothing about the shipped (Supabase) transport.
 *
 * This file implements `CollaborationTransport` with `BroadcastChannel` (for
 * cross-tab relay within one browser) and `localStorage` (for the digital
 * twin, so a fresh tab can `loadSnapshot()` what a previous tab saved). It
 * runs every inbound peer payload through the same `validation.ts` /
 * `rateLimiter.ts` machinery `supabaseTransport.ts` uses, which is precisely
 * what makes it useful as a fast, credential-free way to exercise that
 * shared pipeline (§6.7's "Payload validation — malformed, hostile, NaN,
 * unknown ids" row) without a live Supabase project.
 *
 * **Not reachable from `createTransport()`.** `./index.ts` never imports
 * this file — only test files (and, at a developer's option, a dev-only
 * manual wiring outside this task's scope) do. Verify with:
 * `grep -rln "loopbackTransport" client/src --include=*.ts --include=*.tsx | grep -v /tests/`
 * which must return nothing outside this file itself.
 */
import type {
  ActorPresence,
  CollaborationTransport,
  SceneOp,
  SceneSnapshot,
  TransportStatus,
} from "./types";
import { parseActorPresence, parseSceneOp } from "./validation";
import { createRateLimiter, type RateLimiter } from "./rateLimiter";

type WireMessage =
  | { kind: "op"; op: unknown }
  | { kind: "presence-announce"; presence: unknown }
  | { kind: "presence-leave"; actorId: unknown }
  | { kind: "presence-request" };

const WIRE_MESSAGE_KINDS = [
  "op",
  "presence-announce",
  "presence-leave",
  "presence-request",
];

function isWireMessage(value: unknown): value is WireMessage {
  return (
    typeof value === "object" &&
    value !== null &&
    "kind" in value &&
    (value as { kind: unknown }).kind !== undefined &&
    WIRE_MESSAGE_KINDS.includes((value as { kind: unknown }).kind as string)
  );
}

export interface LoopbackTransportOptions {
  /** The authored model's id set — used to validate inbound peer ops (§6.5). */
  validObjectIds: ReadonlySet<string>;
  /** Injectable for tests. Defaults to the global `BroadcastChannel`. */
  channelFactory?: (name: string) => BroadcastChannel;
  /**
   * Injectable for tests. Defaults to the global `localStorage`. Pass `null`
   * to disable the digital-twin fixture (e.g. an environment with no
   * storage) — `loadSnapshot` then always resolves `null` and `saveSnapshot`
   * is a no-op, same as `nullTransport`.
   */
  storage?: Storage | null;
  rateLimiter?: RateLimiter;
}

function snapshotStorageKey(roomId: string): string {
  return `dimensions:loopback:snapshot:${roomId}`;
}

export function createLoopbackTransport(
  options: LoopbackTransportOptions
): CollaborationTransport {
  const validObjectIds = options.validObjectIds;
  const channelFactory =
    options.channelFactory ?? ((name: string) => new BroadcastChannel(name));
  const storage: Storage | null =
    options.storage !== undefined
      ? options.storage
      : typeof localStorage !== "undefined"
        ? localStorage
        : null;
  const limiter = options.rateLimiter ?? createRateLimiter();

  let status: TransportStatus = { kind: "idle" };
  let channel: BroadcastChannel | null = null;
  let selfPresence: ActorPresence | null = null;
  const peerPresences = new Map<string, ActorPresence>();

  const opListeners = new Set<(op: SceneOp) => void>();
  const presenceListeners = new Set<
    (actors: readonly ActorPresence[]) => void
  >();
  const statusListeners = new Set<(status: TransportStatus) => void>();

  function setStatus(next: TransportStatus): void {
    status = next;
    statusListeners.forEach(listener => listener(status));
  }

  function notifyPresence(): void {
    const peers = Array.from(peerPresences.values());
    const all = selfPresence ? [selfPresence, ...peers] : peers;
    presenceListeners.forEach(listener => listener(all));
  }

  function handleMessage(event: MessageEvent<unknown>): void {
    const message = event.data;
    if (!isWireMessage(message)) return;

    if (message.kind === "op") {
      const result = parseSceneOp(message.op, validObjectIds);
      if (!result.ok) {
        console.warn("[6D loopback] rejected malformed op:", result.reason);
        return;
      }
      if (!limiter.allow(result.value.actorId as string)) {
        console.warn(
          "[6D loopback] dropped op: rate limit exceeded for actor",
          result.value.actorId
        );
        return;
      }
      opListeners.forEach(listener => listener(result.value));
      return;
    }

    if (message.kind === "presence-announce") {
      const result = parseActorPresence(message.presence);
      if (!result.ok) {
        console.warn(
          "[6D loopback] rejected malformed presence:",
          result.reason
        );
        return;
      }
      peerPresences.set(result.value.actorId as string, result.value);
      notifyPresence();
      return;
    }

    if (message.kind === "presence-leave") {
      if (typeof message.actorId === "string") {
        peerPresences.delete(message.actorId);
        notifyPresence();
      }
      return;
    }

    // message.kind === "presence-request" — a peer just joined and cannot
    // see anyone who announced before it started listening (BroadcastChannel
    // delivers only messages posted after a channel is constructed). Answer
    // by re-announcing, so join order never determines who sees whom.
    if (selfPresence && channel) {
      channel.postMessage({
        kind: "presence-announce",
        presence: selfPresence,
      } satisfies WireMessage);
    }
  }

  return {
    get status() {
      return status;
    },

    async join(roomId, self): Promise<void> {
      if (typeof BroadcastChannel === "undefined") {
        const reason = "BroadcastChannel is not available in this environment.";
        setStatus({ kind: "disconnected", reason });
        throw new Error(reason);
      }

      setStatus({ kind: "connecting" });

      const now = Date.now();
      selfPresence = {
        actorId: self.actorId,
        displayName: self.displayName,
        colorHex: self.colorHex,
        joinedAt: now,
        lastSeenAt: now,
      };
      peerPresences.clear();

      channel = channelFactory(`dimensions:${roomId}`);
      channel.onmessage = handleMessage;
      channel.postMessage({
        kind: "presence-announce",
        presence: selfPresence,
      } satisfies WireMessage);
      // Ask anyone already in the room (who joined, and announced, before
      // this channel existed) to re-announce — see handleMessage's
      // "presence-request" case.
      channel.postMessage({ kind: "presence-request" } satisfies WireMessage);

      setStatus({ kind: "connected", since: now });
      notifyPresence();
    },

    async leave(): Promise<void> {
      if (channel && selfPresence) {
        channel.postMessage({
          kind: "presence-leave",
          actorId: selfPresence.actorId,
        } satisfies WireMessage);
      }
      channel?.close();
      channel = null;
      selfPresence = null;
      peerPresences.clear();
      setStatus({ kind: "idle" });
    },

    async publish(op: SceneOp): Promise<void> {
      if (!channel) {
        throw new Error(
          "Cannot publish: join() has not completed successfully."
        );
      }
      channel.postMessage({ kind: "op", op } satisfies WireMessage);
    },

    async loadSnapshot(roomId: string): Promise<SceneSnapshot | null> {
      if (!storage) return null;
      const raw = storage.getItem(snapshotStorageKey(roomId));
      if (!raw) return null;
      try {
        return JSON.parse(raw) as SceneSnapshot;
      } catch {
        console.warn(
          "[6D loopback] discarding an unparsable stored snapshot for room",
          roomId
        );
        return null;
      }
    },

    async saveSnapshot(roomId: string, snapshot: SceneSnapshot): Promise<void> {
      if (!storage) return;
      try {
        storage.setItem(snapshotStorageKey(roomId), JSON.stringify(snapshot));
      } catch (err) {
        console.warn(
          "[6D loopback] failed to persist a snapshot for room",
          roomId,
          err
        );
      }
    },

    onOp(cb: (op: SceneOp) => void): () => void {
      opListeners.add(cb);
      return () => opListeners.delete(cb);
    },

    onPresence(cb: (actors: readonly ActorPresence[]) => void): () => void {
      presenceListeners.add(cb);
      return () => presenceListeners.delete(cb);
    },

    onStatus(cb: (status: TransportStatus) => void): () => void {
      statusListeners.add(cb);
      return () => statusListeners.delete(cb);
    },
  };
}
