/**
 * The absent transport — client/src/dimensions/transport/nullTransport.ts
 *
 * ARCHITECTURE-DIMENSIONS.md §13: "Both [`VITE_SUPABASE_URL`,
 * `VITE_SUPABASE_ANON_KEY`] absent ⇒ `createTransport()` returns
 * `nullTransport` and the UI reports `unconfigured`. Absence degrades
 * honestly; it never breaks the page and never shows a fake peer."
 *
 * This is the transport most visitors hit today, since no anon key exists
 * in this build yet (see this task's Notes). It never opens a socket, never
 * makes a network request, and never reports a peer that is not real.
 *
 * Behaviour, chosen deliberately and documented because it is easy to get
 * backwards:
 *  - `join()` and `publish()` **reject**. Calling either while `status.kind`
 *    is `"unconfigured"` is a caller bug — the UI must gate the "Join the
 *    shared stage" control on `status.kind !== "unconfigured"` (§6.3) so
 *    these are never reached in normal operation. Rejecting loudly, rather
 *    than silently pretending to succeed, surfaces that bug instead of
 *    hiding it behind a fake "connected" state.
 *  - `leave()` and `saveSnapshot()` are safe no-ops. Unlike `join`/`publish`,
 *    these are the kind of call a caller may reasonably issue unconditionally
 *    during cleanup (unmount, `pagehide`) without first checking `status` —
 *    there is nothing to leave and nowhere to save, so doing nothing is the
 *    honest outcome, not an error.
 *  - `loadSnapshot()` resolves `null` — "no data available" is already a
 *    legitimate value in `CollaborationTransport`'s own return type.
 *  - `onStatus` never fires: `status` is fixed for the lifetime of this
 *    transport. Callers read the current value from the `status` getter;
 *    `onStatus` only ever needs to notify of a *change*, and there is none
 *    to report.
 */
import type {
  ActorPresence,
  CollaborationTransport,
  SceneOp,
  SceneSnapshot,
  TransportStatus,
} from "./types";

/**
 * @param reason - Shown verbatim by the UI (§7.2's exhaustive state table).
 *   e.g. "This build has no shared-session configuration."
 */
export function createNullTransport(reason: string): CollaborationTransport {
  const status: TransportStatus = { kind: "unconfigured", reason };

  return {
    get status() {
      return status;
    },

    async join(): Promise<void> {
      throw new Error(
        `Cannot join the shared stage: ${reason} The caller must not invoke join() while ` +
          `status.kind === "unconfigured" — gate the "Join the shared stage" control on that.`
      );
    },

    async leave(): Promise<void> {
      // Never connected — nothing to leave.
    },

    async publish(_op: SceneOp): Promise<void> {
      throw new Error(
        `Cannot publish to the shared stage: ${reason} The caller must not invoke publish() ` +
          `while status.kind === "unconfigured".`
      );
    },

    async loadSnapshot(_roomId: string): Promise<SceneSnapshot | null> {
      return null;
    },

    async saveSnapshot(
      _roomId: string,
      _snapshot: SceneSnapshot
    ): Promise<void> {
      // Nowhere to save — a best-effort no-op, not an error (see file header).
    },

    onOp(_cb: (op: SceneOp) => void): () => void {
      // Never connects, so this never fires.
      return () => {};
    },

    onPresence(_cb: (actors: readonly ActorPresence[]) => void): () => void {
      return () => {};
    },

    onStatus(_cb: (status: TransportStatus) => void): () => void {
      // status is fixed for this transport's lifetime — never fires.
      return () => {};
    },
  };
}
