/**
 * The Supabase transport — client/src/dimensions/transport/supabaseTransport.ts
 *
 * **THE ONLY FILE IN THE REPO PERMITTED TO IMPORT `@supabase/*`** (§6.2).
 * Every other file reaches Supabase only through the `CollaborationTransport`
 * interface in `./types`. Enforced by:
 *   `grep -rn "@supabase" client/src --include=*.ts --include=*.tsx`
 * which must match only this file.
 *
 * D-6D-TRANSPORT (§3): Supabase Realtime (presence + broadcast) for the live
 * channel, Supabase PostgREST for the durable digital twin. Client libraries
 * are `@supabase/realtime-js` + `@supabase/postgrest-js` directly — never
 * `@supabase/supabase-js` (§3.2: measured 22.36 kB gzip vs 58.02 kB, and it
 * keeps `auth-js`/`storage-js`/`functions-js` out of T-016's dependency
 * review, since this feature authenticates nobody and stores no files).
 *
 * **§6.5's objectId-membership check is deliberately NOT performed here.**
 * `createTransport(): CollaborationTransport` (`./index.ts`) is a
 * zero-parameter factory by the fixed contract T-010 codes against, so this
 * module has no channel through which the authored model's id set could
 * reach it. See `validation.ts`'s `buildSceneOpSchema` comment for the full
 * reasoning and `isKnownObjectId` for the primitive the caller wiring
 * `onOp()` into the store must use to close that gap. Every other part of
 * §6.5 — finite numeric bounds, `displayName`/`colorHex` shape, `opId`/
 * `actorId` shape, and the per-actor rate cap — IS enforced here, before any
 * `onOp` / `onPresence` listener is invoked. `loadSnapshot`'s row is run
 * through `parseSceneSnapshot` on the same terms — object-id membership
 * omitted for the identical structural reason, everything else (numeric
 * bounds, label shape, object count, revision/savedAt range) enforced.
 */
import { PostgrestClient } from "@supabase/postgrest-js";
import {
  RealtimeClient,
  REALTIME_SUBSCRIBE_STATES,
  type RealtimeChannel,
} from "@supabase/realtime-js";
import type {
  ActorPresence,
  CollaborationTransport,
  SceneOp,
  SceneSnapshot,
  TransportStatus,
} from "./types";
import {
  parseActorPresence,
  parseSceneOp,
  parseSceneSnapshot,
} from "./validation";
import { createRateLimiter } from "./rateLimiter";

/** Must match `supabase/migrations/0001_dimensions_room_state.sql`. */
const ROOM_STATE_TABLE = "dimensions_room_state";
const BROADCAST_EVENT = "scene_op";

/**
 * @param url - `VITE_SUPABASE_URL`, e.g. `https://xyzcompany.supabase.co`.
 * @param anonKey - `VITE_SUPABASE_ANON_KEY`. Public by design; safety rests
 *   entirely on the RLS policies in the migration named above. Never logged,
 *   never echoed — referred to only by variable name, per this task's brief.
 */
export function createSupabaseTransport(
  url: string,
  anonKey: string
): CollaborationTransport {
  const realtime = new RealtimeClient(`${url}/realtime/v1`, {
    params: { apikey: anonKey },
  });

  // §6.6: `saveSnapshot` must survive a `pagehide`/`visibilitychange` flush —
  // `navigator.sendBeacon` cannot set the `apikey`/`Authorization` headers
  // PostgREST requires. Rather than a second code path for the exit-time
  // flush, every request from this client sets `keepalive: true`
  // unconditionally: harmless for an ordinary in-app call, and it is what
  // lets the periodic throttled save and the exit-time flush share one
  // implementation. Chromium caps a `keepalive` request body at 64 KiB,
  // which is why the migration's payload-size CHECK constraint uses 60 KiB
  // as its ceiling — comfortably under that cap so an oversized snapshot
  // fails with a clear database error rather than a silently-dropped fetch.
  const postgrest = new PostgrestClient(`${url}/rest/v1`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
    fetch: (input, init) => fetch(input, { ...init, keepalive: true }),
  });

  let status: TransportStatus = { kind: "idle" };
  let channel: RealtimeChannel | null = null;
  let reconnectAttempt = 0;
  let intentionalLeave = false;

  const opListeners = new Set<(op: SceneOp) => void>();
  const presenceListeners = new Set<
    (actors: readonly ActorPresence[]) => void
  >();
  const statusListeners = new Set<(status: TransportStatus) => void>();
  const limiter = createRateLimiter();

  function setStatus(next: TransportStatus): void {
    status = next;
    statusListeners.forEach(listener => listener(status));
  }

  function notifyPresence(): void {
    if (!channel) return;
    const state = channel.presenceState();
    const actors: ActorPresence[] = [];
    for (const key of Object.keys(state)) {
      // A presence key can carry more than one tracked entry (e.g. the same
      // actor with two open tabs); the most recently seen entry wins.
      let best: ActorPresence | null = null;
      for (const entry of state[key]) {
        const result = parseActorPresence(entry);
        if (!result.ok) {
          console.warn(
            "[6D supabase] rejected malformed presence record:",
            result.reason
          );
          continue;
        }
        if (!best || result.value.lastSeenAt > best.lastSeenAt)
          best = result.value;
      }
      if (best) actors.push(best);
    }
    presenceListeners.forEach(listener => listener(actors));
  }

  return {
    get status() {
      return status;
    },

    async join(roomId, self): Promise<void> {
      intentionalLeave = false;
      reconnectAttempt = 0;
      setStatus({ kind: "connecting" });
      realtime.connect();

      const nextChannel = realtime.channel(`room:${roomId}`, {
        config: {
          // self:false — this client never receives its own broadcasts back;
          // no `ack` — publish() must resolve once handed to the wire, not
          // once a peer (or the server) acknowledges it (§6.1's contract).
          broadcast: { self: false },
          // enabled:true — this client always wants to see who else is
          // present, not only to be seen.
          presence: { key: self.actorId, enabled: true },
        },
      });
      channel = nextChannel;

      nextChannel.on("broadcast", { event: BROADCAST_EVENT }, message => {
        const result = parseSceneOp(message.payload);
        if (!result.ok) {
          console.warn("[6D supabase] rejected malformed op:", result.reason);
          return;
        }
        if (!limiter.allow(result.value.actorId as string)) {
          console.warn(
            "[6D supabase] dropped op: rate limit exceeded for actor",
            result.value.actorId
          );
          return;
        }
        opListeners.forEach(listener => listener(result.value));
      });

      nextChannel.on("presence", { event: "sync" }, () => {
        notifyPresence();
      });

      // realtime-js's own join-timeout / CHANNEL_ERROR paths guarantee this
      // callback eventually fires with a terminal or retry status, so this
      // promise is not additionally time-boxed here.
      await new Promise<void>((resolve, reject) => {
        nextChannel.subscribe(async (subscribeStatus, err) => {
          if (subscribeStatus === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
            reconnectAttempt = 0;
            const now = Date.now();
            await nextChannel.track({
              actorId: self.actorId,
              displayName: self.displayName,
              colorHex: self.colorHex,
              joinedAt: now,
              lastSeenAt: now,
            } satisfies ActorPresence);
            setStatus({ kind: "connected", since: now });
            resolve();
            return;
          }

          if (
            subscribeStatus === REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR ||
            subscribeStatus === REALTIME_SUBSCRIBE_STATES.TIMED_OUT
          ) {
            const reason = err?.message ?? subscribeStatus;
            if (status.kind === "connected" || status.kind === "reconnecting") {
              // Already joined once — realtime-js retries the join
              // internally; reflect that as "reconnecting", not a failure.
              reconnectAttempt += 1;
              setStatus({
                kind: "reconnecting",
                attempt: reconnectAttempt,
                lastError: reason,
              });
            } else {
              // Never connected yet — this is a join failure.
              setStatus({ kind: "disconnected", reason });
              reject(new Error(`Failed to join the shared stage: ${reason}`));
            }
            return;
          }

          // subscribeStatus === REALTIME_SUBSCRIBE_STATES.CLOSED
          if (!intentionalLeave) {
            setStatus({
              kind: "disconnected",
              reason: "The channel was closed unexpectedly.",
            });
          }
        });
      });
    },

    async leave(): Promise<void> {
      intentionalLeave = true;
      if (channel) {
        const result = await realtime.removeChannel(channel);
        if (result !== "ok") {
          console.warn(
            "[6D supabase] removeChannel did not report ok:",
            result
          );
        }
        channel = null;
      }
      await realtime.disconnect();
      setStatus({ kind: "idle" });
    },

    async publish(op: SceneOp): Promise<void> {
      if (!channel) {
        throw new Error(
          `Cannot publish op "${op.opId}" for object "${op.objectId}": join() has not completed successfully.`
        );
      }
      const result = await channel.send({
        type: "broadcast",
        event: BROADCAST_EVENT,
        payload: op,
      });
      if (result !== "ok") {
        throw new Error(
          `Failed to publish op "${op.opId}" for object "${op.objectId}": ${result}`
        );
      }
    },

    async loadSnapshot(roomId: string): Promise<SceneSnapshot | null> {
      const { data, error } = await postgrest
        .from(ROOM_STATE_TABLE)
        .select("objects, revision, saved_at")
        .eq("room_id", roomId)
        .maybeSingle();

      if (error) {
        throw new Error(
          `Failed to load the shared-stage snapshot for room "${roomId}": ${error.message}` +
            (error.hint ? ` (hint: ${error.hint})` : "")
        );
      }
      // No row yet for this room is an honest "nothing saved" — not an error.
      if (!data) return null;

      // §6.5/§6.6, T-016 finding S-2: this row is anon-writable (the
      // migration grants anon INSERT/UPDATE `WITH CHECK (true)`) and
      // `loadSnapshot` runs once after `join`, before any op is applied, so
      // it is validated exactly as a live peer payload is — never cast
      // straight to `SceneSnapshot`. `validObjectIds` is intentionally
      // omitted: see `validation.ts`'s `buildSceneSnapshotSchema` comment
      // for why this transport has no channel to the authored model's id
      // set. An invalid stored row is treated the same as "nothing saved".
      const result = parseSceneSnapshot({
        objects: data.objects,
        revision: data.revision,
        savedAt: data.saved_at,
      });
      if (!result.ok) {
        console.warn(
          "[6D supabase] discarding an invalid stored snapshot for room",
          roomId,
          ":",
          result.reason
        );
        return null;
      }
      return result.value;
    },

    async saveSnapshot(roomId: string, snapshot: SceneSnapshot): Promise<void> {
      const { error } = await postgrest.from(ROOM_STATE_TABLE).upsert(
        {
          room_id: roomId,
          objects: snapshot.objects,
          revision: snapshot.revision,
          saved_at: snapshot.savedAt,
        },
        { onConflict: "room_id" }
      );

      if (error) {
        throw new Error(
          `Failed to save the shared-stage snapshot for room "${roomId}": ${error.message}` +
            (error.hint ? ` (hint: ${error.hint})` : "")
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
