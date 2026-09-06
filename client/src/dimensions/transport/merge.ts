/**
 * Conflict resolution — client/src/dimensions/transport/merge.ts
 *
 * ARCHITECTURE-DIMENSIONS.md §6.4: a last-writer-wins register, per object.
 * PURE. No transport knowledge, no I/O — only a type-only import, so this
 * file is trivially unit-testable and usable from any transport
 * implementation (§6.7: "merge.ts convergence — unit tests, both orderings,
 * ties. Pure function.").
 */
import type { ActorId, SceneOp } from "./types";

/**
 * The per-object register a `SceneOp` competes against. Structurally
 * identical to `SceneObject["rev"]` (§5.2) — declared locally so this file
 * depends only on `ActorId`, not on the whole `SceneObject` shape.
 */
export interface ObjectRevision {
  seq: number;
  actorId: ActorId | null;
}

/**
 * Total order per object. Deterministic on every peer, so all peers
 * converge on the same state regardless of arrival order.
 *
 * `seq` is a per-object logical counter (`prevSeq + 1`), not a per-actor
 * counter and not a clock — peer wall clocks are untrusted, which is why
 * `SceneOp.at` is advisory-only and never consulted here. Ties break on a
 * plain string comparison of `actorId`, which is total (every string
 * compares to every other string) and identical on every peer, so it can
 * never leave two peers converged on different winners.
 *
 * @param op - The incoming (candidate) op for one object.
 * @param current - The object's current register, i.e. `SceneObject["rev"]`.
 * @returns `true` if `op` should be applied — it either carries a strictly
 *   higher `seq`, or an equal `seq` whose `actorId` sorts after the current
 *   holder's.
 *
 * @example
 * ```ts
 * opWins({ ...op, seq: 3, actorId: "b" as ActorId }, { seq: 2, actorId: "a" as ActorId });
 * // => true — seq 3 beats seq 2
 * opWins({ ...op, seq: 2, actorId: "a" as ActorId }, { seq: 2, actorId: "b" as ActorId });
 * // => false — same seq, "a" < "b", current holder keeps it
 * ```
 */
export function opWins(op: SceneOp, current: ObjectRevision): boolean {
  if (op.seq !== current.seq) return op.seq > current.seq;
  return (op.actorId as string) > ((current.actorId ?? "") as string);
}
