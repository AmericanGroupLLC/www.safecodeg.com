/**
 * The 6D swap-point contract — client/src/dimensions/transport/types.ts
 *
 * ARCHITECTURE-DIMENSIONS.md §6.1 (D-6D-TRANSPORT). ZERO vendor imports: no
 * Supabase vendor SDK type may appear anywhere in this file, ever. Enforced
 * by grepping the whole tree for the vendor package scope — the only match
 * must be `./supabaseTransport.ts`.
 *
 * `ObjectId`, `ActorId`, `SceneObject` and `ActorPresence` are owned by the
 * state layer (§5.2, `../state/types.ts`) — object/actor identity is defined
 * there, not here. They are imported `type`-only, so this module carries no
 * runtime dependency on the state layer and the import is erased at build
 * time (verifiable: nothing here needs `../state/types` to exist at
 * runtime, only at type-check time).
 */
import type {
  ObjectId,
  ActorId,
  SceneObject,
  ActorPresence,
} from "../state/types";

export type { ObjectId, ActorId, SceneObject, ActorPresence };

/**
 * The transport's connection lifecycle, rendered honestly by the UI at every
 * state — see ARCHITECTURE-DIMENSIONS.md §7.2 for the exhaustive state table.
 */
export type TransportStatus =
  | { kind: "unconfigured"; reason: string } // no anon key in this build
  | { kind: "idle" } // configured, never joined
  | { kind: "connecting" }
  | { kind: "connected"; since: number }
  | { kind: "reconnecting"; attempt: number; lastError: string }
  | { kind: "disconnected"; reason: string };

/**
 * One authored change to one shared object. Serializable; idempotent by
 * `opId`. `patch` fields are all optional — a peer sends only what changed.
 */
export interface SceneOp {
  opId: string;
  objectId: ObjectId;
  actorId: ActorId;
  /** Per-object logical counter: prevSeqForThisObject + 1. Not a wall clock. */
  seq: number;
  /** Advisory display only. Never used for ordering — peer clocks are untrusted. */
  at: number;
  patch: Partial<
    Pick<SceneObject, "position" | "rotation" | "scale" | "visible">
  >;
}

export interface SceneSnapshot {
  objects: Record<string, SceneObject>;
  revision: number;
  savedAt: number;
}

/**
 * The vendor-neutral collaboration contract. Every 6D consumer (T-010) codes
 * against this interface and against `createTransport()` in `./index` —
 * against nothing else. Changing the transport vendor means writing one new
 * file that implements this interface and changing one line in `./index`.
 */
export interface CollaborationTransport {
  readonly status: TransportStatus;

  /** Explicit user action only. MUST NOT be called on mount (§6.3). */
  join(
    roomId: string,
    self: Pick<ActorPresence, "actorId" | "displayName" | "colorHex">
  ): Promise<void>;
  leave(): Promise<void>;

  /** Resolves when the op is handed to the wire, not when a peer acknowledges it. */
  publish(op: SceneOp): Promise<void>;

  /** Digital twin. `loadSnapshot` runs once after join; `saveSnapshot` is throttled. */
  loadSnapshot(roomId: string): Promise<SceneSnapshot | null>;
  saveSnapshot(roomId: string, snapshot: SceneSnapshot): Promise<void>;

  /** Each returns its own unsubscribe function. */
  onOp(cb: (op: SceneOp) => void): () => void;
  onPresence(cb: (actors: readonly ActorPresence[]) => void): () => void;
  onStatus(cb: (status: TransportStatus) => void): () => void;
}
