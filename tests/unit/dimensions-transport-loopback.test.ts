/**
 * UNIT TESTS — Category 1, with Category 2 (integration-shaped) intent
 * client/src/dimensions/transport/loopbackTransport.ts —
 * ARCHITECTURE-DIMENSIONS.md §6.7: "Cross-tab behaviour in dev via
 * `loopbackTransport`." This exercises the real `BroadcastChannel` relay and
 * the shared `validation.ts`/`rateLimiter.ts` pipeline end-to-end, without a
 * Supabase project or an anon key — the credential-free proof this task's
 * brief asks for that the transport machinery genuinely works.
 *
 * Not a substitute for T-010's two-`browser.newContext()` acceptance test —
 * see the file header of `loopbackTransport.ts` for why.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { createLoopbackTransport } from '@/dimensions/transport/loopbackTransport';
import type { ActorId, ActorPresence, ObjectId, SceneOp } from '@/dimensions/transport/types';

const validObjectIds = new Set(['obj-1', 'obj-2']);

function uniqueRoomId(label: string): string {
  return `room-${label}-${Math.random().toString(36).slice(2)}`;
}

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
    clear: () => {
      map.clear();
    },
    key: (index: number) => Array.from(map.keys())[index] ?? null,
    get length() {
      return map.size;
    },
  } as Storage;
}

/** Resolves the first time `register`'s callback fires with args matching `predicate`. */
function waitForCall<Args extends unknown[]>(
  register: (cb: (...args: Args) => void) => () => void,
  predicate: (args: Args) => boolean,
): Promise<Args> {
  return new Promise((resolve) => {
    const unsubscribe = register(((...args: Args) => {
      if (predicate(args)) {
        unsubscribe();
        resolve(args);
      }
    }) as (...args: Args) => void);
  });
}

const openTransports: Array<ReturnType<typeof createLoopbackTransport>> = [];
function tracked(options: Parameters<typeof createLoopbackTransport>[0]) {
  const transport = createLoopbackTransport(options);
  openTransports.push(transport);
  return transport;
}

afterEach(async () => {
  await Promise.all(openTransports.splice(0).map((t) => t.leave().catch(() => {})));
});

describe('createLoopbackTransport — join/leave lifecycle', () => {
  it('starts idle and becomes connected once join() resolves', async () => {
    const transport = tracked({ validObjectIds });
    expect(transport.status).toEqual({ kind: 'idle' });

    await transport.join(uniqueRoomId('lifecycle'), { actorId: 'a' as ActorId, displayName: 'Ada', colorHex: '#112233' });

    expect(transport.status.kind).toBe('connected');
  });

  it('returns to idle after leave()', async () => {
    const transport = tracked({ validObjectIds });
    await transport.join(uniqueRoomId('lifecycle'), { actorId: 'a' as ActorId, displayName: 'Ada', colorHex: '#112233' });
    await transport.leave();
    expect(transport.status).toEqual({ kind: 'idle' });
  });

  it('rejects join() when BroadcastChannel is unavailable, and reports it honestly', async () => {
    vi.stubGlobal('BroadcastChannel', undefined);
    try {
      const transport = tracked({ validObjectIds });
      await expect(
        transport.join(uniqueRoomId('no-bc'), { actorId: 'a' as ActorId, displayName: 'Ada', colorHex: '#112233' }),
      ).rejects.toThrow(/BroadcastChannel/);
      expect(transport.status.kind).toBe('disconnected');
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

describe('createLoopbackTransport — presence relay is real, not simulated', () => {
  it('two peers converge on seeing each other regardless of join order', async () => {
    const roomId = uniqueRoomId('presence');
    const a = tracked({ validObjectIds });
    const b = tracked({ validObjectIds });

    await a.join(roomId, { actorId: 'a' as ActorId, displayName: 'Ada', colorHex: '#112233' });

    const bSeesA = waitForCall<[readonly ActorPresence[]]>(
      (cb) => b.onPresence(cb),
      ([actors]) => actors.some((actor) => actor.actorId === ('a' as ActorId)),
    );
    const aSeesB = waitForCall<[readonly ActorPresence[]]>(
      (cb) => a.onPresence(cb),
      ([actors]) => actors.some((actor) => actor.actorId === ('b' as ActorId)),
    );

    await b.join(roomId, { actorId: 'b' as ActorId, displayName: 'Bea', colorHex: '#445566' });

    await Promise.all([bSeesA, aSeesB]);
  });

  it('a departing peer is removed from the others\' presence list', async () => {
    const roomId = uniqueRoomId('leave');
    const a = tracked({ validObjectIds });
    const b = tracked({ validObjectIds });

    await a.join(roomId, { actorId: 'a' as ActorId, displayName: 'Ada', colorHex: '#112233' });
    const bSeesA = waitForCall<[readonly ActorPresence[]]>(
      (cb) => b.onPresence(cb),
      ([actors]) => actors.some((actor) => actor.actorId === ('a' as ActorId)),
    );
    await b.join(roomId, { actorId: 'b' as ActorId, displayName: 'Bea', colorHex: '#445566' });
    await bSeesA;

    const bSeesALeave = waitForCall<[readonly ActorPresence[]]>(
      (cb) => b.onPresence(cb),
      ([actors]) => !actors.some((actor) => actor.actorId === ('a' as ActorId)),
    );
    await a.leave();
    await bSeesALeave;
  });

  it('with the network blocked (no join ever called), no peer ever appears', async () => {
    const transport = tracked({ validObjectIds });
    const cb = vi.fn();
    transport.onPresence(cb);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(cb).not.toHaveBeenCalled();
  });
});

describe('createLoopbackTransport — ops relay through the real validation pipeline', () => {
  it('a valid op published by one peer is delivered to another, already parsed', async () => {
    const roomId = uniqueRoomId('ops');
    const a = tracked({ validObjectIds });
    const b = tracked({ validObjectIds });

    await a.join(roomId, { actorId: 'a' as ActorId, displayName: 'Ada', colorHex: '#112233' });
    await b.join(roomId, { actorId: 'b' as ActorId, displayName: 'Bea', colorHex: '#445566' });

    const op: SceneOp = {
      opId: 'op-1',
      objectId: 'obj-1' as ObjectId,
      actorId: 'a' as ActorId,
      seq: 1,
      at: Date.now(),
      patch: { position: { x: 1, y: 2, z: 3 } },
    };

    const received = waitForCall<[SceneOp]>((cb) => b.onOp(cb), ([received]) => received.opId === 'op-1');
    await a.publish(op);
    const [deliveredOp] = await received;

    expect(deliveredOp.objectId).toBe('obj-1');
    expect(deliveredOp.patch.position).toEqual({ x: 1, y: 2, z: 3 });
  });

  it('a hostile op (unknown objectId) is silently dropped, never delivered', async () => {
    const roomId = uniqueRoomId('hostile');
    const a = tracked({ validObjectIds });
    const b = tracked({ validObjectIds });

    await a.join(roomId, { actorId: 'a' as ActorId, displayName: 'Ada', colorHex: '#112233' });
    await b.join(roomId, { actorId: 'b' as ActorId, displayName: 'Bea', colorHex: '#445566' });

    const cb = vi.fn();
    b.onOp(cb);

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await a.publish({
      opId: 'hostile-1',
      objectId: 'never-authored' as ObjectId,
      actorId: 'a' as ActorId,
      seq: 1,
      at: Date.now(),
      patch: {},
    });

    // Prove a legitimate, later op still arrives — the hostile one did not
    // wedge the channel, it was dropped cleanly.
    const goodOpReceived = waitForCall<[SceneOp]>((cbGood) => b.onOp(cbGood), ([op]) => op.opId === 'good-1');
    await a.publish({
      opId: 'good-1',
      objectId: 'obj-1' as ObjectId,
      actorId: 'a' as ActorId,
      seq: 2,
      at: Date.now(),
      patch: { visible: true },
    });
    await goodOpReceived;

    expect(cb).not.toHaveBeenCalledWith(expect.objectContaining({ opId: 'hostile-1' }));
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('an op exceeding the per-actor rate cap is dropped', async () => {
    const roomId = uniqueRoomId('ratelimit');
    let now = 0;
    const a = tracked({ validObjectIds, rateLimiter: undefined });
    const b = tracked({
      validObjectIds,
      rateLimiter: (await import('@/dimensions/transport/rateLimiter')).createRateLimiter({
        maxEvents: 1,
        windowMs: 1000,
        now: () => now,
      }),
    });

    await a.join(roomId, { actorId: 'a' as ActorId, displayName: 'Ada', colorHex: '#112233' });
    await b.join(roomId, { actorId: 'b' as ActorId, displayName: 'Bea', colorHex: '#445566' });

    const deliveredOps: SceneOp[] = [];
    b.onOp((op) => deliveredOps.push(op));

    const firstDelivered = waitForCall<[SceneOp]>((cb) => b.onOp(cb), ([op]) => op.opId === 'first');
    await a.publish({ opId: 'first', objectId: 'obj-1' as ObjectId, actorId: 'a' as ActorId, seq: 1, at: 0, patch: {} });
    await firstDelivered;

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await a.publish({ opId: 'second', objectId: 'obj-1' as ObjectId, actorId: 'a' as ActorId, seq: 2, at: 0, patch: {} });
    // Give the (dropped) second message a chance to have been delivered if
    // the rate limit did not work.
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(deliveredOps.map((op) => op.opId)).toEqual(['first']);
    warnSpy.mockRestore();
  });
});

describe('createLoopbackTransport — digital twin via injected storage', () => {
  it('a value saved by one instance is loaded by a fresh instance sharing the same storage', async () => {
    const storage = fakeStorage();
    const roomId = uniqueRoomId('twin');
    const writer = tracked({ validObjectIds, storage });

    const snapshot = {
      objects: { 'obj-1': { position: { x: 9, y: 9, z: 9 } } as unknown as Record<string, unknown> } as unknown as Record<
        string,
        never
      >,
      revision: 3,
      savedAt: 123456,
    };
    await writer.saveSnapshot(roomId, snapshot as never);

    const reader = tracked({ validObjectIds, storage });
    const loaded = await reader.loadSnapshot(roomId);

    expect(loaded).toEqual(snapshot);
  });

  it('loadSnapshot resolves null for a room nothing has ever saved', async () => {
    const transport = tracked({ validObjectIds, storage: fakeStorage() });
    const loaded = await transport.loadSnapshot(uniqueRoomId('never-saved'));
    expect(loaded).toBeNull();
  });

  it('loadSnapshot resolves null (never breaks) when storage is disabled', async () => {
    const transport = tracked({ validObjectIds, storage: null });
    await transport.saveSnapshot('room-x', { objects: {}, revision: 0, savedAt: 0 });
    const loaded = await transport.loadSnapshot('room-x');
    expect(loaded).toBeNull();
  });
});
