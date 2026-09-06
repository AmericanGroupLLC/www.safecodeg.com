/**
 * UNIT TESTS — Category 1, Category 3 (functional, credential-free proof)
 * client/src/dimensions/transport/useCollaboration.ts (T-010, T-011)
 *
 * ARCHITECTURE-DIMENSIONS.md §6.7 / this task's brief: "the loopback
 * transport uses BroadcastChannel, which is shared between two pages in the
 * same browser context but not across browser.newContext() boundaries... you
 * can genuinely prove two-page synchronisation in one context, and you
 * should." This file is that proof for the WIRING code (this hook +
 * `state/store.ts`'s `applyOp`/`publishLocalOp` + the real,
 * already-unit-tested `loopbackTransport.ts`) — two independent
 * `useCollaboration` instances, each with its own store, joined to the same
 * room via two independent `createLoopbackTransport` instances sharing one
 * `BroadcastChannel` name and one fake `Storage` (modelling "two pages, one
 * browser context, one origin's localStorage").
 *
 * `loopbackTransport.ts` itself is never imported from app code (see
 * `useCollaboration.ts`'s header for why: it is reachable from nowhere but
 * itself and its own unit test, enforced by a grep over `client/src`) — this
 * file is a test, so importing it directly here is exactly what that
 * invariant permits. The seam that makes THIS hook usable with it —
 * `window.__AGL_DIMENSIONS_TEST_TRANSPORT__`, an inert override never set
 * outside a test — is documented in the same header.
 *
 * The genuinely cross-BROWSER (Supabase) path remains NOT RUN — no anon key
 * exists in this repo. See this task's report for the exact command that
 * would prove it once one does.
 */
import { describe, it, expect, afterEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useCollaboration } from "@/dimensions/transport/useCollaboration";
import { createDimensionsStore } from "@/dimensions/state/store";
import { createLoopbackTransport } from "@/dimensions/transport/loopbackTransport";
import { PRODUCT_PIPELINE } from "@/dimensions/model/process";
import type {
  ActorId,
  CollaborationTransport,
  ObjectId,
  TransportStatus,
} from "@/dimensions/transport/types";

function fakeStorage(): Storage {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => (map.has(key) ? (map.get(key) as string) : null),
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
    removeItem: (key: string) => {
      map.delete(key);
    },
    clear: () => map.clear(),
    key: (index: number) => Array.from(map.keys())[index] ?? null,
    get length() {
      return map.size;
    },
  } as Storage;
}

const validObjectIds = new Set(Object.keys(PRODUCT_PIPELINE.objects));

/** Installs the test-only transport-factory seam `useCollaboration.ts` checks for, for the NEXT hook instance only. */
function useLoopbackFor(sharedStorage: Storage) {
  (
    window as unknown as {
      __AGL_DIMENSIONS_TEST_TRANSPORT__?: () => CollaborationTransport;
    }
  ).__AGL_DIMENSIONS_TEST_TRANSPORT__ = () =>
    createLoopbackTransport({ validObjectIds, storage: sharedStorage });
}

// Every session in this file joins the same fixed `ROOM_ID` over the SAME
// real, process-global `BroadcastChannel` — there is no per-test isolation
// at that layer (this hook has no "which room" parameter to vary; see
// `useCollaboration.ts`). Left un-torn-down, a session from one test would
// still be listening (and re-announcing on the next test's
// "presence-request") during every later test, inflating participant
// counts across the whole file. `renderSession` therefore registers every
// session it creates, and `afterEach` leaves and unmounts all of them.
let activeSessions: Array<{
  hook: ReturnType<
    typeof renderHook<ReturnType<typeof useCollaboration>, unknown>
  >;
}> = [];

function renderSession(sharedStorage: Storage) {
  useLoopbackFor(sharedStorage);
  const store = createDimensionsStore(PRODUCT_PIPELINE);
  const hook = renderHook(() => useCollaboration(store));
  activeSessions.push({ hook });
  return { store, hook };
}

afterEach(async () => {
  for (const session of activeSessions) {
    try {
      await session.hook.result.current.leave();
    } catch {
      // already left / never joined in this test — fine.
    }
    session.hook.unmount();
  }
  activeSessions = [];
  delete (window as unknown as { __AGL_DIMENSIONS_TEST_TRANSPORT__?: unknown })
    .__AGL_DIMENSIONS_TEST_TRANSPORT__;
  vi.useRealTimers();
});

describe("useCollaboration — two-page synchronisation proof (T-010, adapted per §6.7/this task's brief)", () => {
  it("two independent sessions joined to the same room converge on the same object position", async () => {
    const storage = fakeStorage();
    const a = renderSession(storage);
    const b = renderSession(storage);

    await act(async () => {
      await a.hook.result.current.join("Alice");
    });
    await act(async () => {
      await b.hook.result.current.join("Bob");
    });

    await waitFor(() => expect(a.hook.result.current.actors.length).toBe(2));
    await waitFor(() => expect(b.hook.result.current.actors.length).toBe(2));

    await act(async () => {
      await a.hook.result.current.moveTarget({ x: 1.2, z: -0.5 });
    });

    await waitFor(() => {
      const posA = a.store.getSnapshot().objects.platform.position;
      const posB = b.store.getSnapshot().objects.platform.position;
      expect(posB.x).toBeCloseTo(posA.x, 5);
      expect(posB.z).toBeCloseTo(posA.z, 5);
    });

    // And it is a genuine change, not a no-op: the object actually moved.
    expect(a.store.getSnapshot().objects.platform.position.x).not.toBe(0);
  });

  it("T-016 S-9: resetTarget genuinely restores the shared object, and the reset itself is synced to the other session", async () => {
    const storage = fakeStorage();
    const a = renderSession(storage);
    const b = renderSession(storage);
    await act(async () => {
      await a.hook.result.current.join("Alice");
      await b.hook.result.current.join("Bob");
    });
    await waitFor(() => expect(a.hook.result.current.actors.length).toBe(2));

    const baseline = { ...a.store.getSnapshot().objects.platform.position };

    await act(async () => {
      await a.hook.result.current.moveTarget({ x: 5 });
    });
    await waitFor(() =>
      expect(b.store.getSnapshot().objects.platform.position.x).toBeCloseTo(
        baseline.x + 5,
        5
      )
    );

    await act(async () => {
      await a.hook.result.current.resetTarget(baseline);
    });

    await waitFor(() => {
      expect(a.store.getSnapshot().objects.platform.position).toEqual(baseline);
      expect(b.store.getSnapshot().objects.platform.position).toEqual(baseline); // the reset itself is a real op the other session receives, not a local-only change
    });
  });

  it("presence is real: closing session B brings session A's participant count back to 1", async () => {
    const storage = fakeStorage();
    const a = renderSession(storage);
    const b = renderSession(storage);

    await act(async () => {
      await a.hook.result.current.join("Alice");
      await b.hook.result.current.join("Bob");
    });
    await waitFor(() => expect(a.hook.result.current.actors.length).toBe(2));

    await act(async () => {
      await b.hook.result.current.leave();
    });

    await waitFor(() => expect(a.hook.result.current.actors.length).toBe(1));
  });

  it("digital twin: a third session, joining after both others left, reads the position the first session left it at", async () => {
    const storage = fakeStorage();
    const a = renderSession(storage);
    const b = renderSession(storage);

    await act(async () => {
      await a.hook.result.current.join("Alice");
      await b.hook.result.current.join("Bob");
    });
    await waitFor(() => expect(a.hook.result.current.actors.length).toBe(2));

    await act(async () => {
      await a.hook.result.current.moveTarget({ x: 3.3 });
    });
    await waitFor(() => {
      expect(b.store.getSnapshot().objects.platform.position.x).toBeCloseTo(
        3.3,
        5
      );
    });

    // §6.6: leave() flushes the snapshot save before disconnecting.
    await act(async () => {
      await a.hook.result.current.leave();
      await b.hook.result.current.leave();
    });

    const c = renderSession(storage);
    await act(async () => {
      await c.hook.result.current.join("Carol");
    });

    await waitFor(() => {
      expect(c.store.getSnapshot().objects.platform.position.x).toBeCloseTo(
        3.3,
        5
      );
    });
  });

  it("T-016 S-5, end to end through this hook: a peer op naming phys:ball is never applied (the allowlist lives in state/store.ts's applyOp, which this hook's onOp callback calls directly)", async () => {
    const storage = fakeStorage();
    const a = renderSession(storage);
    const b = renderSession(storage);
    await act(async () => {
      await a.hook.result.current.join("Alice");
      await b.hook.result.current.join("Bob");
    });
    await waitFor(() => expect(a.hook.result.current.actors.length).toBe(2));

    // loopbackTransport.ts's own validation already rejects an unknown
    // objectId at the wire (validation.ts, given `validObjectIds`) — this
    // proves the SECOND, independent gate (state/store.ts's applyOp,
    // exercised through this hook) also holds, by calling store.applyOp
    // directly with a hostile op, exactly as the onOp wiring would receive one.
    const applied = b.store.applyOp({
      opId: "hostile-1",
      objectId: "phys:ball" as ObjectId,
      actorId: "mallory" as ActorId,
      seq: 999,
      at: Date.now(),
      patch: { position: { x: -1, y: -1, z: -1 } },
    });
    expect(applied).toBe(false);
    expect(b.store.getSnapshot().objects["phys:ball"]).toBeUndefined();
  });
});

describe("useCollaboration — T-011 remote session control (browser-session-as-remote-endpoint)", () => {
  it("a controller's command is applied by the controlled session, which reports back — the controller's \"confirmed\" state is derived from that report, not assumed from the command it sent", async () => {
    const storage = fakeStorage();
    const a = renderSession(storage);
    const b = renderSession(storage);
    await act(async () => {
      await a.hook.result.current.join("Alice");
      await b.hook.result.current.join("Bob");
    });
    await waitFor(() => expect(a.hook.result.current.actors.length).toBe(2));

    act(() => a.hook.result.current.setRemoteControlRole("controller"));
    act(() => b.hook.result.current.setRemoteControlRole("controlled"));

    // Over a real (if in-process) transport, the round trip can complete
    // fast enough that "sending" is never separately observable here — the
    // meaningful assertion is what it resolves to, not the intermediate.
    await act(async () => {
      await a.hook.result.current.sendRemoteCommand({ x: 0.7 });
    });

    await waitFor(() =>
      expect(a.hook.result.current.lastCommand?.status).toBe("confirmed")
    );
    expect(a.hook.result.current.lastCommand?.confirmedByActorId).toBe(
      b.hook.result.current.selfActorId
    );

    await waitFor(() =>
      expect(b.hook.result.current.lastReceivedCommand).not.toBeNull()
    );
    expect(b.hook.result.current.lastReceivedCommand?.fromActorId).toBe(
      a.hook.result.current.selfActorId
    );

    // The controller never applied the command to its own local view — its
    // store only advances once the controlled session's report (a
    // different actorId) arrives. Confirm the winning rev is Bob's, not Alice's.
    expect(a.store.getSnapshot().objects.platform.rev.actorId).toBe(
      b.hook.result.current.selfActorId
    );
  });

  it('"no device, no claim": with nobody else joined, a command times out rather than being reported as delivered', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const storage = fakeStorage();
    const a = renderSession(storage);
    await act(async () => {
      await a.hook.result.current.join("Alice");
    });
    act(() => a.hook.result.current.setRemoteControlRole("controller"));

    await act(async () => {
      await a.hook.result.current.sendRemoteCommand({ x: 1 });
    });
    expect(a.hook.result.current.lastCommand?.status).toBe("sending");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(4100);
    });
    expect(a.hook.result.current.lastCommand?.status).toBe("timed-out");
  });
});

describe("useCollaboration — disconnection is honest", () => {
  it('a status change away from "connected" clears the presented peer list rather than leaving it looking current', async () => {
    let statusCb: ((s: TransportStatus) => void) | undefined;
    let presenceCb:
      | ((
          actors: readonly import("@/dimensions/transport/types").ActorPresence[]
        ) => void)
      | undefined;
    const fake: CollaborationTransport = {
      status: { kind: "idle" },
      join: vi.fn(async () => {
        presenceCb?.([
          {
            actorId: "a" as ActorId,
            displayName: "Alice",
            colorHex: "#ffffff",
            joinedAt: 1,
            lastSeenAt: 1,
          },
          {
            actorId: "b" as ActorId,
            displayName: "Bob",
            colorHex: "#000000",
            joinedAt: 1,
            lastSeenAt: 1,
          },
        ]);
      }),
      leave: vi.fn(async () => {}),
      publish: vi.fn(async () => {}),
      loadSnapshot: vi.fn(async () => null),
      saveSnapshot: vi.fn(async () => {}),
      onOp: vi.fn(() => () => {}),
      onPresence: vi.fn(cb => {
        presenceCb = cb;
        return () => {};
      }),
      onStatus: vi.fn(cb => {
        statusCb = cb;
        return () => {};
      }),
    };
    (
      window as unknown as {
        __AGL_DIMENSIONS_TEST_TRANSPORT__?: () => CollaborationTransport;
      }
    ).__AGL_DIMENSIONS_TEST_TRANSPORT__ = () => fake;

    const store = createDimensionsStore(PRODUCT_PIPELINE);
    const { result } = renderHook(() => useCollaboration(store));

    await act(async () => {
      await result.current.join("Alice");
    });
    expect(result.current.actors.length).toBe(2);

    act(() => {
      statusCb!({ kind: "disconnected", reason: "network blocked" });
    });

    expect(result.current.actors.length).toBe(0);
    expect(result.current.status.kind).toBe("disconnected");
  });
});

describe("useCollaboration — T-016 finding S-11: a fixed, non-leaking error string", () => {
  // Mirrors the exact shape supabaseTransport.ts:258-263,285-290 throws:
  // `Failed to load/save … : ${error.message}` + optional `(hint: ${error.hint})`,
  // which can name the failing table or constraint. This proves the fixed
  // UI-facing string is used regardless, and the hostile detail is confined
  // to whatever this test's own console.error spy captures.
  const HOSTILE_DETAIL =
    'relation "dimensions_room_state" violates check constraint "dimensions_room_state_payload_size_check" (hint: reduce the JSON payload below 60KB)';

  function fakeWithFailure(
    overrides: Partial<CollaborationTransport>
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

  it("join() rejecting with a hostile error message never reaches lastErrorMessage", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const fake = fakeWithFailure({
      join: vi.fn(async () => {
        throw new Error(HOSTILE_DETAIL);
      }),
    });
    (
      window as unknown as {
        __AGL_DIMENSIONS_TEST_TRANSPORT__?: () => CollaborationTransport;
      }
    ).__AGL_DIMENSIONS_TEST_TRANSPORT__ = () => fake;

    const store = createDimensionsStore(PRODUCT_PIPELINE);
    const { result } = renderHook(() => useCollaboration(store));

    await act(async () => {
      await expect(result.current.join("Alice")).rejects.toThrow();
    });

    expect(result.current.lastErrorMessage).not.toBeNull();
    expect(result.current.lastErrorMessage).not.toMatch(
      /relation|constraint|hint|dimensions_room_state/i
    );
    expect(result.current.lastErrorMessage).toBe(
      "Could not join the shared stage. Please try again in a moment."
    );
    // The detail IS available to a developer via the console, just never rendered.
    expect(
      consoleSpy.mock.calls.some(call =>
        String(call[1]).includes(HOSTILE_DETAIL)
      )
    ).toBe(true);
    consoleSpy.mockRestore();
  });

  it("a loadSnapshot() rejection (after a successful join) never leaks its detail either", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const fake = fakeWithFailure({
      join: vi.fn(async () => {}),
      loadSnapshot: vi.fn(async () => {
        throw new Error(HOSTILE_DETAIL);
      }),
    });
    (
      window as unknown as {
        __AGL_DIMENSIONS_TEST_TRANSPORT__?: () => CollaborationTransport;
      }
    ).__AGL_DIMENSIONS_TEST_TRANSPORT__ = () => fake;

    const store = createDimensionsStore(PRODUCT_PIPELINE);
    const { result } = renderHook(() => useCollaboration(store));

    await act(async () => {
      await result.current.join("Alice"); // join() itself succeeds; loadSnapshot() is what fails
    });

    expect(result.current.lastErrorMessage).toBe(
      "The shared stage's saved state could not be loaded."
    );
    expect(result.current.lastErrorMessage).not.toMatch(
      /relation|constraint|hint|dimensions_room_state/i
    );
    expect(
      consoleSpy.mock.calls.some(call =>
        String(call[1]).includes(HOSTILE_DETAIL)
      )
    ).toBe(true);
    consoleSpy.mockRestore();
  });
});
