/**
 * The swap point — client/src/dimensions/transport/index.ts
 *
 * ARCHITECTURE-DIMENSIONS.md §6.2: `createTransport()` selects an
 * implementation from build-time env and is the only line that changes when
 * the transport vendor changes. **T-010 imports from `./types` and
 * `./index` and from nothing else.**
 *
 * Both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` absent ⇒
 * `nullTransport`, reported honestly as `unconfigured` (§13). This is the
 * transport most visitors hit today: no anon key exists in this repo (see
 * this task's report). Neither variable is ever logged.
 *
 * **Why `createSupabaseTransport` is not imported at the top of this file.**
 * §6.3 / §9.4 require the ~22.36 kB gzip Supabase payload to load only when
 * the user clicks "Join the shared stage" — not merely on entering
 * `/dimensions`. §6.2 also fixes `createTransport()`'s signature as
 * synchronous (`(): CollaborationTransport`, not `Promise<...>`), which is
 * the signature T-010 codes against. Satisfying both at once rules out a
 * static `import { createSupabaseTransport } from "./supabaseTransport"`
 * here: Vite bundles a statically-imported module into whatever chunk the
 * importing file lands in, fetched as soon as *anything* imports `./index`
 * — regardless of whether `createTransport()` is ever actually invoked,
 * which would load the vendor SDK on route entry instead of on join.
 *
 * The fix is `createLazySupabaseTransport` below: it satisfies
 * `CollaborationTransport` immediately (`status: { kind: "idle" }`, no
 * network activity) and defers the dynamic `import("./supabaseTransport")`
 * — Vite's own per-dynamic-import chunk boundary — until its `join()` is
 * first called. That single dynamic import is the only place the vendor SDK
 * is reachable from this module's own call graph. `vite.config.ts`'s
 * `manualChunks` additionally names that chunk `vendor-collab` (§9.5), for
 * stable, filename-prefix assertions in T-015/T-016 — it is not what makes
 * the loading lazy; the dynamic import alone already guarantees that.
 */
import type {
  ActorPresence,
  CollaborationTransport,
  SceneOp,
  SceneSnapshot,
  TransportStatus,
} from "./types";
import { createNullTransport } from "./nullTransport";

function createLazySupabaseTransport(
  url: string,
  anonKey: string
): CollaborationTransport {
  let status: TransportStatus = { kind: "idle" };
  let real: CollaborationTransport | null = null;

  const opListeners = new Set<(op: SceneOp) => void>();
  const presenceListeners = new Set<
    (actors: readonly ActorPresence[]) => void
  >();
  const statusListeners = new Set<(status: TransportStatus) => void>();

  function setStatus(next: TransportStatus): void {
    status = next;
    statusListeners.forEach(listener => listener(status));
  }

  /**
   * Loads the real transport and wires it to forward through this
   * wrapper's own listener sets, exactly once. Every `onOp`/`onPresence`/
   * `onStatus` subscriber registered on this wrapper — whether registered
   * before or after this runs — is read live from the `Set`s each time an
   * event arrives, so registration order relative to `join()` does not
   * matter and no listener is ever double-registered on `real` directly.
   */
  async function ensureReal(): Promise<CollaborationTransport> {
    if (real) return real;
    const { createSupabaseTransport } = await import("./supabaseTransport");
    const created = createSupabaseTransport(url, anonKey);
    created.onOp(op => {
      opListeners.forEach(listener => listener(op));
    });
    created.onPresence(actors => {
      presenceListeners.forEach(listener => listener(actors));
    });
    created.onStatus(next => {
      status = next;
      statusListeners.forEach(listener => listener(status));
    });
    real = created;
    return created;
  }

  return {
    get status() {
      return status;
    },

    async join(roomId, self): Promise<void> {
      setStatus({ kind: "connecting" });
      const transport = await ensureReal();
      await transport.join(roomId, self);
    },

    async leave(): Promise<void> {
      if (!real) return; // never joined — nothing to leave
      await real.leave();
    },

    async publish(op: SceneOp): Promise<void> {
      if (!real) {
        throw new Error(
          `Cannot publish op "${op.opId}" for object "${op.objectId}": join() has not been called yet.`
        );
      }
      await real.publish(op);
    },

    async loadSnapshot(roomId: string): Promise<SceneSnapshot | null> {
      if (!real) {
        throw new Error(
          `Cannot load a snapshot for room "${roomId}": join() has not been called yet.`
        );
      }
      return real.loadSnapshot(roomId);
    },

    async saveSnapshot(roomId: string, snapshot: SceneSnapshot): Promise<void> {
      if (!real) {
        throw new Error(
          `Cannot save a snapshot for room "${roomId}": join() has not been called yet.`
        );
      }
      await real.saveSnapshot(roomId, snapshot);
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

/**
 * The swap point. Changing transport vendor = write one file implementing
 * `CollaborationTransport` and change the one line below that constructs it.
 */
export function createTransport(): CollaborationTransport {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!url || !anonKey) {
    return createNullTransport(
      "This build has no shared-session configuration."
    );
  }
  return createLazySupabaseTransport(url, anonKey);
}
