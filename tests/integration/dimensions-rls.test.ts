/**
 * INTEGRATION TESTS — Category 2 (Acceptance: T-009's negative-RLS test,
 * plus T-016 finding S-9's single-room CHECK)
 *
 * ARCHITECTURE-DIMENSIONS.md / T-009's acceptance criteria: "A negative test
 * proves RLS holds: a request carrying only the anon key attempting an
 * operation the policy forbids receives a rejection, with the actual
 * response body recorded." The forbidden operation, per
 * `supabase/migrations/0001_dimensions_room_state.sql`, is DELETE —
 * `CollaborationTransport` never issues one, and the migration grants it to
 * nobody. This file also covers T-016 finding S-9: unlimited anon-created
 * rooms could exhaust storage shared with `contact_submissions`;
 * `0002_dimensions_room_state_single_room.sql` bounds it to one room via a
 * CHECK, tested the same way — a request carrying only the anon key,
 * attempting what the constraint now forbids.
 *
 * This suite talks to a REAL Supabase project over the network — it needs
 * `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, and it needs the
 * migrations above already applied there. Neither is available in this
 * repo/session (see T-009's and this task's reports): there is no `.env` at
 * the repo root, and this task does not run migrations against the live
 * project — the user does. Every test below is skipped, not faked, when
 * those preconditions are not met — `describe.skipIf` reports the suite as
 * skipped in the runner's output, which is this project's honest way of
 * saying "NOT RUN", never "passing".
 *
 * Once both env vars are set and the migrations have been applied, running
 * `npx vitest run tests/integration/dimensions-rls.test.ts` performs the
 * actual negative tests end-to-end and prints the real response bodies.
 */
import { describe, it, expect } from 'vitest';

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const canRun = Boolean(url && anonKey);

describe.skipIf(!canRun)('dimensions_room_state RLS — live negative test', () => {
  it('DELETE with only the anon key is rejected (no GRANT, no policy)', async () => {
    const response = await fetch(
      `${url}/rest/v1/dimensions_room_state?room_id=eq.dimensions-negative-rls-test`,
      {
        method: 'DELETE',
        headers: {
          apikey: anonKey as string,
          Authorization: `Bearer ${anonKey}`,
        },
      },
    );
    const body = await response.json().catch(() => null);

    // Recorded here so a run of this suite leaves the actual evidence in
    // the test output, per this task's brief ("with the actual response
    // body recorded").
    console.log('[T-009 negative RLS test] DELETE response:', response.status, JSON.stringify(body));

    expect(response.ok).toBe(false);
    expect(body?.code).toBe('42501');
  });

  it('SELECT with only the anon key succeeds — the public-sandbox read policy', async () => {
    const response = await fetch(`${url}/rest/v1/dimensions_room_state?limit=1`, {
      headers: { apikey: anonKey as string, Authorization: `Bearer ${anonKey}` },
    });
    expect(response.ok).toBe(true);
  });

  /**
   * T-016 finding S-9, fixed by `supabase/migrations/
   * 0002_dimensions_room_state_single_room.sql`: a CHECK constraint pins
   * `room_id` to `'dimensions-demo'`, so an anon caller cannot create
   * unlimited rooms and exhaust storage shared with `contact_submissions`.
   * This is genuinely run end-to-end once `0002` is applied to the live
   * project — see this task's report for the local-Postgres verification
   * performed in place of that (no anon key is available in this session).
   */
  it('INSERT of a second, differently-named room is rejected by the single-room CHECK (T-016 S-9)', async () => {
    const response = await fetch(`${url}/rest/v1/dimensions_room_state`, {
      method: 'POST',
      headers: {
        apikey: anonKey as string,
        Authorization: `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ room_id: 'dimensions-s9-negative-test' }),
    });
    const body = await response.json().catch(() => null);
    console.log('[T-016 S-9 negative test] INSERT response:', response.status, JSON.stringify(body));

    expect(response.ok).toBe(false);
    expect(body?.code).toBe('23514'); // check_violation
  });
});

describe.skipIf(canRun)('dimensions_room_state RLS — live negative test (NOT RUN)', () => {
  it('is skipped: no VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in this environment', () => {
    expect(canRun).toBe(false);
  });
});
