-- =====================================================================
-- 6D shared-stage digital twin — ARCHITECTURE-DIMENSIONS.md §6.6, T-009
-- =====================================================================
--
-- One row per "room". Today exactly one room backs the /dimensions page,
-- but the schema does not assume that stays true — `room_id` is whatever
-- string the client passes to `join()`/`loadSnapshot()`/`saveSnapshot()`
-- (client/src/dimensions/transport/types.ts). Each row holds the
-- `SceneSnapshot` those two methods read and write.
--
-- Security model, stated once here rather than scattered across policies:
-- this is an intentional PUBLIC SANDBOX (§3.3). There is no Supabase Auth in
-- this design — anon key only; anonymous auth with per-room ownership was
-- considered and rejected in §3.3 specifically to avoid re-adding an auth
-- surface to protect a demo stage that holds no private data. With no
-- identity concept, there is no owner to check a row against. Anyone
-- holding the published anon key may read, create, or overwrite any room's
-- state; that is the accepted, documented property, not an oversight — the
-- UI is required (§6.3) to label the stage as such. What IS enforced:
--
--   1. RLS is enabled, and every operation the client actually performs
--      (SELECT, INSERT, UPDATE — see `supabaseTransport.ts`) has an explicit
--      policy stating which caller may touch which row.
--   2. DELETE has no policy and no GRANT. The client never issues one (see
--      the `CollaborationTransport` interface — there is no `deleteRoom`
--      method), so there is no legitimate caller for it, anon or otherwise.
--      This asymmetry is deliberate: it is what T-009's negative-RLS
--      acceptance test exercises (see this task's report for the exact
--      request and the response it must produce).
--   3. CHECK constraints bound the shape and size of what an anon caller can
--      write, independent of RLS — a second, database-layer expression of
--      §3.3's "blast radius is bounded client-side" (rate limits and the
--      objectId allow-list are the client-side two; this is belt-and-braces,
--      not a substitute for either).
--
-- Reversibility (`.ai/backend.md`: "keep migrations reversible where the
-- database supports it"): this project's migrations are plain forward SQL —
-- there is no paired "down" file convention in this repo (verified against
-- the sibling AmericanGroupLLC-Backend repo's supabase/migrations/, which
-- has none either). The exact rollback is given as a comment at the bottom
-- of this file instead: everything below is reversible with a DROP TABLE.

CREATE TABLE IF NOT EXISTS public.dimensions_room_state (
  room_id text PRIMARY KEY
    CHECK (room_id ~ '^[a-z0-9][a-z0-9-]{1,63}$'),
  objects jsonb NOT NULL DEFAULT '{}'::jsonb
    -- 60 KiB, not the more obvious 64 KiB: supabaseTransport.ts sends every
    -- write — including the pagehide/visibilitychange exit-time flush this
    -- table exists to survive (§6.6) — via `fetch(..., { keepalive: true })`,
    -- and Chromium caps a keepalive request body at 64 KiB. Staying under
    -- that with margin means an oversized snapshot fails here with a clear
    -- database error, rather than as a fetch the client can't distinguish
    -- from a network blip.
    CHECK (pg_column_size(objects) <= 61440),
  revision bigint NOT NULL DEFAULT 0
    CHECK (revision >= 0),
  -- Epoch milliseconds — matches `SceneSnapshot.savedAt`'s wire type (a JS
  -- `number`) exactly, so neither loadSnapshot nor saveSnapshot needs a
  -- client-side date-string conversion. Deliberately not `timestamptz`.
  saved_at bigint NOT NULL DEFAULT (extract(epoch from clock_timestamp()) * 1000)::bigint
    CHECK (saved_at > 0)
);

COMMENT ON TABLE public.dimensions_room_state IS
  '6D digital twin (ARCHITECTURE-DIMENSIONS.md Sec 6.6). Public sandbox: RLS grants anon '
  'SELECT/INSERT/UPDATE on every row; DELETE is granted to nobody (T-009''s negative-RLS test).';

ALTER TABLE public.dimensions_room_state ENABLE ROW LEVEL SECURITY;

-- Start from zero privileges rather than trust whatever this project's
-- default privileges happen to grant new tables (some Supabase project
-- templates default-grant `anon`/`authenticated` broad access). This is
-- what makes the DELETE rejection below a genuine, portable guarantee
-- rather than an artifact of this one project's current configuration.
REVOKE ALL ON public.dimensions_room_state FROM PUBLIC, anon, authenticated;

-- SELECT — which caller may touch which row: anon may read every room's
-- state. This table holds no private data (§3.3); unrestricted read is the
-- accepted design, not a missing filter.
GRANT SELECT ON public.dimensions_room_state TO anon;

DROP POLICY IF EXISTS "anon may read every room's shared state" ON public.dimensions_room_state;
CREATE POLICY "anon may read every room's shared state"
  ON public.dimensions_room_state
  FOR SELECT
  TO anon
  USING (true);

-- INSERT — anon may create a new room's row, bounded by the CHECK
-- constraints above. There is no per-user ownership concept for this public
-- stage, so there is nothing to compare the caller against.
GRANT INSERT ON public.dimensions_room_state TO anon;

DROP POLICY IF EXISTS "anon may create a room's shared state" ON public.dimensions_room_state;
CREATE POLICY "anon may create a room's shared state"
  ON public.dimensions_room_state
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- UPDATE — anon may overwrite any room's state. This is the explicitly
-- accepted "anyone may edit or reset the shared stage" property (§3.3);
-- there is no owner to check against.
GRANT UPDATE ON public.dimensions_room_state TO anon;

DROP POLICY IF EXISTS "anon may overwrite a room's shared state" ON public.dimensions_room_state;
CREATE POLICY "anon may overwrite a room's shared state"
  ON public.dimensions_room_state
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- DELETE — intentionally NO policy and NO grant. `CollaborationTransport`
-- (client/src/dimensions/transport/types.ts) has no method that issues a
-- DELETE, so there is no legitimate caller for one, anon or otherwise. RLS
-- enabled + no policy denies the operation at the row-security layer; the
-- missing GRANT additionally denies it at the privilege layer (Postgres
-- error 42501, insufficient_privilege — PostgREST surfaces this as a 4xx
-- with that code in the response body), which is what turns the negative
-- test into a genuine rejection rather than a silent zero-row match.
--
-- This is the operation T-009's negative-RLS acceptance test targets. Run,
-- with only the anon key:
--
--   curl -s -w '\nHTTP %{http_code}\n' -X DELETE \
--     "$VITE_SUPABASE_URL/rest/v1/dimensions_room_state?room_id=eq.dimensions-demo" \
--     -H "apikey: $VITE_SUPABASE_ANON_KEY" \
--     -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY"
--
-- Expected: a 4xx status with a JSON body whose `code` is `42501` and whose
-- `message` names the missing DELETE privilege. This has not been run
-- against the live project — see T-009's report for why, and for the exact
-- provisioning steps that make it runnable.

-- =====================================================================
-- Rollback (not automatic — run by hand if this migration must be undone):
--
--   DROP POLICY IF EXISTS "anon may read every room's shared state" ON public.dimensions_room_state;
--   DROP POLICY IF EXISTS "anon may create a room's shared state" ON public.dimensions_room_state;
--   DROP POLICY IF EXISTS "anon may overwrite a room's shared state" ON public.dimensions_room_state;
--   REVOKE ALL ON public.dimensions_room_state FROM anon, authenticated;
--   DROP TABLE IF EXISTS public.dimensions_room_state;
--
-- This drops the table and all rows in it — the entire shared-stage digital
-- twin. There is no soft-delete; that is consistent with this table holding
-- no private data.
-- =====================================================================
