-- =====================================================================
-- 6D shared-stage digital twin — bound the room count, T-016 finding S-9
-- =====================================================================
--
-- New migration file, not an edit to 0001_dimensions_room_state.sql — that
-- migration may already have been applied against the live project
-- (`.ai/backend.md`: "keep migrations reversible where the database
-- supports it"; editing an applied migration is not a reversible change,
-- issuing a new one is).
--
-- The finding: `dimensions_room_state`'s INSERT policy is granted to `anon`
-- `WITH CHECK (true)` (0001), and the only other constraint on `room_id` is
-- the format CHECK (`^[a-z0-9][a-z0-9-]{1,63}$`), which every syntactically
-- plausible slug satisfies. Nothing bounds *how many distinct rooms* an anon
-- caller can create. Each row is capped at 60 KiB (0001's `pg_column_size`
-- CHECK), but an anon caller may insert unlimited rows — one per distinct
-- `room_id` — until the Supabase project's plan-level storage limit is hit.
-- That is more than a cosmetic quota problem here: this project
-- (`smvvjivvlprjhzhoizym`) also holds `contact_submissions`, so exhausting
-- storage from this single anon-writable, unbounded table takes the contact
-- form down with it — a shared blast radius, not one contained to a demo
-- page.
--
-- The fix, exactly as the reviewer recommended (the smallest reversible
-- control, not a rewrite of the RLS model 0001 already documents as an
-- intentional public sandbox): while exactly one room backs the
-- `/dimensions` page — `client/src/dimensions/transport/types.ts`'s
-- `CollaborationTransport.join(roomId, ...)` takes whatever string the
-- caller passes, and T-010 (not yet built — see this task's report) is the
-- only planned caller — a CHECK constraint pins `room_id` to that one
-- value. `'dimensions-demo'` is not a new choice: it is the room id 0001's
-- own negative-RLS-test curl example already names.
--
-- This is deliberately a CHECK, not a change to the INSERT policy: RLS
-- still runs `WITH CHECK (true)` (0001's policy is unedited, per the "new
-- migration, not an edit" note above), and this constraint is evaluated
-- alongside it — a violation surfaces as an ordinary Postgres CHECK
-- violation (23514), the same failure class an oversized `objects` payload
-- already produces against 0001's `pg_column_size` CHECK, not a new error
-- shape the client has to learn.
--
-- Reopening this later (a second real room) means dropping this
-- constraint and, if genuine multi-tenant isolation across rooms is ever
-- needed, revisiting 0001's "no owner to check a row against" design at the
-- same time — noted here so the connection is not lost.
--
-- **Pre-condition, confirmed against a scratch local Postgres running this
-- exact file:** ADDing a CHECK validates every existing row and aborts
-- (23514) if any violates it — so if this project's live table already
-- holds a row whose `room_id` is not `'dimensions-demo'` (e.g. a probe
-- row created before this fix shipped), that row must be deleted first, or
-- this migration fails to apply rather than silently skipping the check.
-- Applying it here against a fresh table, and against one holding only the
-- `'dimensions-demo'` row, both succeed; a table also holding a
-- differently-named row does not, until that row is removed.

ALTER TABLE public.dimensions_room_state
  ADD CONSTRAINT dimensions_room_state_single_room_id
  CHECK (room_id = 'dimensions-demo');

COMMENT ON CONSTRAINT dimensions_room_state_single_room_id
  ON public.dimensions_room_state IS
  'T-016 finding S-9: bounds anon-writable row count to the one room the '
  'feature currently uses, so an anon caller cannot create unlimited rooms '
  'and exhaust storage shared with contact_submissions. Drop this '
  'constraint (see rollback below) if a second genuine room is ever added.';

-- =====================================================================
-- Rollback (not automatic — run by hand if this migration must be undone):
--
--   ALTER TABLE public.dimensions_room_state
--     DROP CONSTRAINT IF EXISTS dimensions_room_state_single_room_id;
--
-- This does not touch any row or any other constraint from 0001 — it only
-- removes the single-room bound, reopening room creation to anything the
-- format CHECK already allows.
-- =====================================================================
