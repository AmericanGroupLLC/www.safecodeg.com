/**
 * UNIT TESTS — Category 1, Acceptance (the swap point, §6.2 / §6.3 / §9.4)
 * client/src/dimensions/transport/index.ts — `createTransport()`.
 *
 * Two things this task's brief holds Backend accountable for and that this
 * suite proves directly, without a browser or a build:
 *  1. Absent env vars ⇒ the null transport, never a crash, never a fake peer.
 *  2. `@supabase/*` (via `./supabaseTransport`) is not reached merely by
 *     calling `createTransport()` — only by calling `.join()` on the result.
 *     That is the mechanism (§6.3/§9.4) that keeps the ~22.36 kB gzip
 *     Supabase payload out of the chunk loaded on route entry.
 *
 * `./supabaseTransport` is mocked for the whole file: exercising the real
 * `@supabase/*` network code is `supabaseTransport.ts`'s own concern (it
 * requires a live anon key this repo does not have — see this task's
 * report), not something this suite needs a real network for.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type {
  ActorId,
  CollaborationTransport,
  ObjectId,
  SceneOp,
} from "@/dimensions/transport/types";

const { createSupabaseTransport } = vi.hoisted(() => ({
  createSupabaseTransport: vi.fn(),
}));

vi.mock("@/dimensions/transport/supabaseTransport", () => ({
  createSupabaseTransport,
}));

function stubRealTransport(
  overrides: Partial<CollaborationTransport> = {}
): CollaborationTransport {
  return {
    status: { kind: "idle" },
    join: vi.fn(async () => {}),
    leave: vi.fn(async () => {}),
    publish: vi.fn(async () => {}),
    loadSnapshot: vi.fn(async () => null),
    saveSnapshot: vi.fn(async () => {}),
    onOp: vi.fn(() => () => {}),
    onPresence: vi.fn(() => () => {}),
    onStatus: vi.fn(() => () => {}),
    ...overrides,
  };
}

const self = {
  actorId: "a" as ActorId,
  displayName: "Ada",
  colorHex: "#112233",
};

beforeEach(() => {
  createSupabaseTransport.mockReset();
  createSupabaseTransport.mockImplementation(() => stubRealTransport());
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("createTransport — env-based selection (§6.2, §13)", () => {
  it("returns the null transport, honestly unconfigured, when both env vars are absent", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", "");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "");
    const { createTransport } = await import("@/dimensions/transport/index");
    expect(createTransport().status).toEqual({
      kind: "unconfigured",
      reason: "This build has no shared-session configuration.",
    });
  });

  it("returns the null transport when only the URL is present", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "");
    const { createTransport } = await import("@/dimensions/transport/index");
    expect(createTransport().status.kind).toBe("unconfigured");
  });

  it("returns the null transport when only the anon key is present", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", "");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "anon-key-value");
    const { createTransport } = await import("@/dimensions/transport/index");
    expect(createTransport().status.kind).toBe("unconfigured");
  });

  it("never calls createSupabaseTransport when unconfigured", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", "");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "");
    const { createTransport } = await import("@/dimensions/transport/index");
    createTransport();
    expect(createSupabaseTransport).not.toHaveBeenCalled();
  });
});

describe("createTransport — the Supabase payload loads only on join(), not on construction", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "anon-key-value");
  });

  it("createTransport() itself never touches ./supabaseTransport", async () => {
    const { createTransport } = await import("@/dimensions/transport/index");
    const transport = createTransport();
    expect(transport.status).toEqual({ kind: "idle" });
    expect(createSupabaseTransport).not.toHaveBeenCalled();
  });

  it("join() triggers exactly one createSupabaseTransport call, with the configured url/key", async () => {
    const { createTransport } = await import("@/dimensions/transport/index");
    const transport = createTransport();

    await transport.join("room-1", self);

    expect(createSupabaseTransport).toHaveBeenCalledTimes(1);
    expect(createSupabaseTransport).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "anon-key-value"
    );
  });

  it("a second join() does not construct a second real transport", async () => {
    const { createTransport } = await import("@/dimensions/transport/index");
    const transport = createTransport();
    await transport.join("room-1", self);
    await transport.leave();
    await transport.join("room-1", self);
    expect(createSupabaseTransport).toHaveBeenCalledTimes(1);
  });

  it("publish() before join() throws rather than silently discarding the op", async () => {
    const { createTransport } = await import("@/dimensions/transport/index");
    const transport = createTransport();
    const op: SceneOp = {
      opId: "op-1",
      objectId: "obj-1" as ObjectId,
      actorId: self.actorId,
      seq: 1,
      at: Date.now(),
      patch: {},
    };
    await expect(transport.publish(op)).rejects.toThrow();
    expect(createSupabaseTransport).not.toHaveBeenCalled();
  });

  it("loadSnapshot() before join() throws rather than returning a misleading null", async () => {
    const { createTransport } = await import("@/dimensions/transport/index");
    const transport = createTransport();
    await expect(transport.loadSnapshot("room-1")).rejects.toThrow();
  });

  it("leave() before any join() is a safe no-op", async () => {
    const { createTransport } = await import("@/dimensions/transport/index");
    const transport = createTransport();
    await expect(transport.leave()).resolves.toBeUndefined();
    expect(createSupabaseTransport).not.toHaveBeenCalled();
  });
});

describe("createTransport — the wrapper forwards the real transport's events", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "anon-key-value");
  });

  it("forwards onOp callbacks registered before join() completes", async () => {
    let capturedOnOp: ((op: SceneOp) => void) | undefined;
    createSupabaseTransport.mockImplementation(() =>
      stubRealTransport({
        onOp: vi.fn((cb: (op: SceneOp) => void) => {
          capturedOnOp = cb;
          return () => {};
        }),
      })
    );

    const { createTransport } = await import("@/dimensions/transport/index");
    const transport = createTransport();

    const received: SceneOp[] = [];
    transport.onOp(op => received.push(op));

    await transport.join("room-1", self);

    expect(capturedOnOp).toBeDefined();
    const op: SceneOp = {
      opId: "op-1",
      objectId: "obj-1" as ObjectId,
      actorId: self.actorId,
      seq: 1,
      at: 0,
      patch: {},
    };
    capturedOnOp!(op);

    expect(received).toEqual([op]);
  });

  it("mirrors the real transport's status transitions through .status and onStatus", async () => {
    let pushStatus: ((s: CollaborationTransport["status"]) => void) | undefined;
    createSupabaseTransport.mockImplementation(() =>
      stubRealTransport({
        onStatus: vi.fn((cb: (s: CollaborationTransport["status"]) => void) => {
          pushStatus = cb;
          return () => {};
        }),
      })
    );

    const { createTransport } = await import("@/dimensions/transport/index");
    const transport = createTransport();
    const seen: CollaborationTransport["status"][] = [];
    transport.onStatus(s => seen.push(s));

    await transport.join("room-1", self);
    pushStatus!({ kind: "connected", since: 12345 });

    expect(transport.status).toEqual({ kind: "connected", since: 12345 });
    expect(seen.at(-1)).toEqual({ kind: "connected", since: 12345 });
  });
});
