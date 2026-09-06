/**
 * UNIT TESTS — Category 1 (Acceptance: the `unconfigured` path)
 * client/src/dimensions/transport/nullTransport.ts — this is the transport
 * most visitors hit today (no Supabase anon key exists in this repo yet).
 * ARCHITECTURE-DIMENSIONS.md §13: "Absence degrades honestly; it never
 * breaks the page and never shows a fake peer." This suite is what proves
 * that path genuinely works, per this task's brief.
 */
import { describe, it, expect, vi } from "vitest";
import { createNullTransport } from "@/dimensions/transport/nullTransport";
import type { ActorId, ObjectId, SceneOp } from "@/dimensions/transport/types";

const REASON = "This build has no shared-session configuration.";

function makeOp(): SceneOp {
  return {
    opId: "op-1",
    objectId: "obj-1" as ObjectId,
    actorId: "actor-1" as ActorId,
    seq: 1,
    at: Date.now(),
    patch: { visible: true },
  };
}

describe("createNullTransport — reports the honest unconfigured status", () => {
  it('status is { kind: "unconfigured" } carrying the given reason, verbatim', () => {
    const transport = createNullTransport(REASON);
    expect(transport.status).toEqual({ kind: "unconfigured", reason: REASON });
  });

  it("status never changes for the lifetime of this transport", async () => {
    const transport = createNullTransport(REASON);
    const seen: unknown[] = [];
    transport.onStatus(s => seen.push(s));
    await transport.leave();
    await transport.saveSnapshot("room-1", {
      objects: {},
      revision: 0,
      savedAt: Date.now(),
    });
    expect(seen).toEqual([]); // onStatus never fired — nothing to report
    expect(transport.status).toEqual({ kind: "unconfigured", reason: REASON });
  });
});

describe("createNullTransport — never breaks the page and never fakes a peer", () => {
  it("join() rejects rather than pretending to connect", async () => {
    const transport = createNullTransport(REASON);
    await expect(
      transport.join("room-1", {
        actorId: "a" as ActorId,
        displayName: "Ada",
        colorHex: "#3366ff",
      })
    ).rejects.toThrow();
  });

  it("join()'s rejection names the reason so the caller can act on it", async () => {
    const transport = createNullTransport(REASON);
    await expect(
      transport.join("room-1", {
        actorId: "a" as ActorId,
        displayName: "Ada",
        colorHex: "#3366ff",
      })
    ).rejects.toThrow(/no shared-session configuration/);
  });

  it("publish() rejects rather than silently discarding the op", async () => {
    const transport = createNullTransport(REASON);
    await expect(transport.publish(makeOp())).rejects.toThrow();
  });

  it("leave() is a safe no-op — never connected, so there is nothing to leave", async () => {
    const transport = createNullTransport(REASON);
    await expect(transport.leave()).resolves.toBeUndefined();
  });

  it('loadSnapshot() resolves null — an honest "no data", not an error', async () => {
    const transport = createNullTransport(REASON);
    await expect(transport.loadSnapshot("room-1")).resolves.toBeNull();
  });

  it("saveSnapshot() is a safe no-op — nowhere to save, but does not throw", async () => {
    const transport = createNullTransport(REASON);
    await expect(
      transport.saveSnapshot("room-1", {
        objects: {},
        revision: 0,
        savedAt: Date.now(),
      })
    ).resolves.toBeUndefined();
  });

  it("onOp never fires — there is no wire to receive ops from", async () => {
    const transport = createNullTransport(REASON);
    const cb = vi.fn();
    const unsubscribe = transport.onOp(cb);
    await transport.leave();
    expect(cb).not.toHaveBeenCalled();
    expect(() => unsubscribe()).not.toThrow();
  });

  it("onPresence never fires — no peer list is ever fabricated", async () => {
    const transport = createNullTransport(REASON);
    const cb = vi.fn();
    const unsubscribe = transport.onPresence(cb);
    await transport.leave();
    expect(cb).not.toHaveBeenCalled();
    expect(() => unsubscribe()).not.toThrow();
  });
});
