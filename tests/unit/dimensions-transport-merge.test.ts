/**
 * UNIT TESTS — Category 1
 * client/src/dimensions/transport/merge.ts — the last-writer-wins register
 * (ARCHITECTURE-DIMENSIONS.md §6.4). Pure function: no mocks, no I/O.
 * §6.7 lists this as testable now, with no anon key: "merge.ts convergence
 * — unit tests, both orderings, ties. Pure function."
 */
import { describe, it, expect } from 'vitest';
import { opWins, type ObjectRevision } from '@/dimensions/transport/merge';
import type { ActorId, SceneOp } from '@/dimensions/transport/types';

const actor = (id: string) => id as ActorId;

function op(overrides: Partial<SceneOp>): SceneOp {
  return {
    opId: 'op-1',
    objectId: 'obj-1' as SceneOp['objectId'],
    actorId: actor('a'),
    seq: 1,
    at: Date.now(),
    patch: {},
    ...overrides,
  };
}

const rev = (seq: number, actorId: string | null): ObjectRevision => ({
  seq,
  actorId: actorId === null ? null : actor(actorId),
});

describe('opWins — higher seq always wins (both orderings)', () => {
  it('a higher seq beats a lower seq regardless of actorId ordering', () => {
    expect(opWins(op({ seq: 3, actorId: actor('a') }), rev(2, 'z'))).toBe(true);
    expect(opWins(op({ seq: 3, actorId: actor('z') }), rev(2, 'a'))).toBe(true);
  });

  it('a lower seq never beats a higher seq, regardless of actorId ordering', () => {
    expect(opWins(op({ seq: 2, actorId: actor('z') }), rev(3, 'a'))).toBe(false);
    expect(opWins(op({ seq: 2, actorId: actor('a') }), rev(3, 'z'))).toBe(false);
  });
});

describe('opWins — ties break on actorId, deterministically on every peer', () => {
  it('same seq: the incoming op wins only if its actorId sorts after the current holder', () => {
    expect(opWins(op({ seq: 5, actorId: actor('b') }), rev(5, 'a'))).toBe(true);
    expect(opWins(op({ seq: 5, actorId: actor('a') }), rev(5, 'b'))).toBe(false);
  });

  it('is a total order: swapping which side holds which actorId flips the result', () => {
    const a = actor('alice');
    const b = actor('bob');
    expect(opWins(op({ seq: 1, actorId: b }), rev(1, 'alice'))).toBe(true);
    expect(opWins(op({ seq: 1, actorId: a }), rev(1, 'bob'))).toBe(false);
  });

  it('treats a null current actorId (never written) as sorting before any real actorId', () => {
    expect(opWins(op({ seq: 0, actorId: actor('a') }), rev(0, null))).toBe(true);
  });

  it('an identical op against its own current register does not win (no-op replay is not applied twice)', () => {
    const holder = actor('a');
    expect(opWins(op({ seq: 4, actorId: holder }), rev(4, 'a'))).toBe(false);
  });
});

describe('opWins — `at` is never consulted (peer clocks are untrusted)', () => {
  it('an op with an earlier `at` still wins on seq alone', () => {
    expect(opWins(op({ seq: 10, actorId: actor('a'), at: 0 }), rev(9, 'a'))).toBe(true);
  });

  it('an op with a later `at` still loses on seq alone', () => {
    expect(opWins(op({ seq: 1, actorId: actor('a'), at: Number.MAX_SAFE_INTEGER }), rev(2, 'a'))).toBe(false);
  });
});
