/**
 * UNIT TESTS — Category 1, with Category 6 security intent
 * client/src/dimensions/transport/supabaseTransport.ts's `loadSnapshot` —
 * T-016 finding S-2: before `parseSceneSnapshot` was wired in, this method
 * cast the raw PostgREST row straight to `SceneSnapshot` with a bare
 * TypeScript `as` — no runtime check at all — even though the row is
 * anon-writable by design (`supabase/migrations/0001_dimensions_room_state.sql`
 * grants anon INSERT/UPDATE `WITH CHECK (true)`, capped only at 60 KiB of
 * arbitrarily-shaped JSON).
 *
 * This file never touches a live Supabase project (none is reachable — see
 * TASKS.md's D-6D-TRANSPORT decision). Instead it stubs the ambient global
 * `fetch` that `@supabase/postgrest-js` calls internally (the same `fetch`
 * `supabaseTransport.ts` wraps for `keepalive: true`, §6.6), and crafts the
 * exact response shape PostgREST returns for `.maybeSingle()` — a single
 * JSON object, not an array, on HTTP 200. `@supabase/realtime-js` is
 * exercised for real (merely constructed; `loadSnapshot` never calls
 * `.connect()`), which is why this suite imports the real
 * `createSupabaseTransport` rather than mocking the module, unlike
 * `dimensions-transport-index.test.ts`.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { createSupabaseTransport } from "@/dimensions/transport/supabaseTransport";

function mockPostgrestFetch(bodyText: string, status = 200): typeof fetch {
  return vi.fn(
    async () =>
      new Response(bodyText, {
        status,
        headers: { "content-type": "application/json" },
      })
  ) as unknown as typeof fetch;
}

const VALID_OBJECT_JSON =
  '{"id":"obj-1","kind":"crate-closed","position":{"x":9,"y":9,"z":9},' +
  '"rotation":{"x":0,"y":0,"z":0,"w":1},"scale":{"x":1,"y":1,"z":1},' +
  '"visible":true,"stage":null,"label":"Closed crate","rev":{"seq":0,"actorId":null}}';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("createSupabaseTransport — loadSnapshot validates the stored row (T-016 S-2)", () => {
  it("returns a well-formed row, translating saved_at to savedAt", async () => {
    vi.stubGlobal(
      "fetch",
      mockPostgrestFetch(
        `{"objects":{"obj-1":${VALID_OBJECT_JSON}},"revision":3,"saved_at":123456}`
      )
    );
    const transport = createSupabaseTransport(
      "https://example.supabase.co",
      "anon-key-value"
    );
    const loaded = await transport.loadSnapshot("dimensions-demo");
    expect(loaded).toEqual({
      objects: {
        "obj-1": {
          id: "obj-1",
          kind: "crate-closed",
          position: { x: 9, y: 9, z: 9 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          scale: { x: 1, y: 1, z: 1 },
          visible: true,
          stage: null,
          label: "Closed crate",
          rev: { seq: 0, actorId: null },
        },
      },
      revision: 3,
      savedAt: 123456,
    });
  });

  it("resolves null when no row exists for the room (PostgREST returns an empty body)", async () => {
    vi.stubGlobal("fetch", mockPostgrestFetch(""));
    const transport = createSupabaseTransport(
      "https://example.supabase.co",
      "anon-key-value"
    );
    const loaded = await transport.loadSnapshot("dimensions-demo");
    expect(loaded).toBeNull();
  });

  /**
   * `1e309` is valid JSON number syntax (a decimal literal) but exceeds
   * `Number.MAX_VALUE`, so `JSON.parse` — exactly what postgrest-js does to
   * the response body — turns it into `Infinity`. This is what an anon
   * caller can genuinely store in the `objects` jsonb column: valid JSON,
   * hostile once parsed. §6.5: "NaN and Infinity are rejected before they
   * can poison the physics integrator or the projector."
   */
  it("discards a stored row whose position is Infinity rather than returning it", async () => {
    vi.stubGlobal(
      "fetch",
      mockPostgrestFetch(
        '{"objects":{"obj-1":{"id":"obj-1","kind":"crate-closed","position":{"x":1e309,"y":0,"z":0},' +
          '"rotation":{"x":0,"y":0,"z":0,"w":1},"scale":{"x":1,"y":1,"z":1},"visible":true,"stage":null,' +
          '"label":"Closed crate","rev":{"seq":0,"actorId":null}}},"revision":1,"saved_at":1}'
      )
    );
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const transport = createSupabaseTransport(
      "https://example.supabase.co",
      "anon-key-value"
    );
    const loaded = await transport.loadSnapshot("dimensions-demo");

    expect(loaded).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  /**
   * `revision`/`savedAt` are `bigint` columns an anon caller can write any
   * value into. This literal is far beyond `Number.MAX_SAFE_INTEGER` while
   * still being syntactically a normal (if huge) JSON integer.
   */
  it("discards a stored row whose revision exceeds Number.MAX_SAFE_INTEGER", async () => {
    vi.stubGlobal(
      "fetch",
      mockPostgrestFetch(
        `{"objects":{},"revision":90071992547409929999,"saved_at":1}`
      )
    );
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const transport = createSupabaseTransport(
      "https://example.supabase.co",
      "anon-key-value"
    );
    const loaded = await transport.loadSnapshot("dimensions-demo");

    expect(loaded).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("discards a stored row with more objects than the cap", async () => {
    const objects: string[] = [];
    for (let i = 0; i < 200; i++) {
      objects.push(
        `"obj-${i}":${VALID_OBJECT_JSON.replace('"obj-1"', `"obj-${i}"`)}`
      );
    }
    vi.stubGlobal(
      "fetch",
      mockPostgrestFetch(
        `{"objects":{${objects.join(",")}},"revision":1,"saved_at":1}`
      )
    );
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const transport = createSupabaseTransport(
      "https://example.supabase.co",
      "anon-key-value"
    );
    const loaded = await transport.loadSnapshot("dimensions-demo");

    expect(loaded).toBeNull();
    warnSpy.mockRestore();
  });
});
