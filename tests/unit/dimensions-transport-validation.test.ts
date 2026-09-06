/**
 * UNIT TESTS — Category 1 (with Category 6 security intent)
 * client/src/dimensions/transport/validation.ts — ARCHITECTURE-DIMENSIONS.md
 * §6.5: "Row Level Security does not inspect broadcast payloads... client-
 * side zod validation of every inbound peer payload is therefore mandatory
 * — not defence in depth." §6.7 lists this as testable now, with no anon
 * key: "Payload validation — malformed, hostile, NaN, unknown ids."
 */
import { describe, it, expect } from 'vitest';
import { isKnownObjectId, parseActorPresence, parseSceneOp, parseSceneSnapshot } from '@/dimensions/transport/validation';

const validObjectIds = new Set(['obj-1', 'obj-2']);

function validRawOp(overrides: Record<string, unknown> = {}) {
  return {
    opId: 'op-1',
    objectId: 'obj-1',
    actorId: 'actor-1',
    seq: 1,
    at: Date.now(),
    patch: { position: { x: 1, y: 2, z: 3 } },
    ...overrides,
  };
}

describe('parseSceneOp — accepts a well-formed op', () => {
  it('accepts a minimal valid op with no model-id check requested', () => {
    const result = parseSceneOp(validRawOp());
    expect(result.ok).toBe(true);
  });

  it('accepts a valid op whose objectId is in the supplied model set', () => {
    const result = parseSceneOp(validRawOp(), validObjectIds);
    expect(result.ok).toBe(true);
  });

  it('accepts a patch touching only a subset of the patchable fields', () => {
    const result = parseSceneOp(validRawOp({ patch: { visible: false } }));
    expect(result.ok).toBe(true);
  });

  it('accepts an empty patch (a no-op wire message is still structurally valid)', () => {
    const result = parseSceneOp(validRawOp({ patch: {} }));
    expect(result.ok).toBe(true);
  });
});

describe('parseSceneOp — the objectId/model-membership seam (§6.5, and this task\'s report)', () => {
  it('rejects an objectId the supplied model set does not have', () => {
    const result = parseSceneOp(validRawOp({ objectId: 'obj-does-not-exist' }), validObjectIds);
    expect(result.ok).toBe(false);
  });

  it('a peer cannot invent a brand-new object id when a model set is supplied', () => {
    const result = parseSceneOp(validRawOp({ objectId: 'phys:injected-9999' }), validObjectIds);
    expect(result.ok).toBe(false);
  });

  it('without a supplied model set, any non-empty objectId string passes (documented: the caller must check membership itself)', () => {
    const result = parseSceneOp(validRawOp({ objectId: 'not-in-any-model' }));
    expect(result.ok).toBe(true);
  });

  it('isKnownObjectId is the primitive the caller uses to close that gap', () => {
    expect(isKnownObjectId('obj-1', validObjectIds)).toBe(true);
    expect(isKnownObjectId('obj-9', validObjectIds)).toBe(false);
  });
});

describe('parseSceneOp — malformed and hostile numeric payloads are rejected', () => {
  it('rejects NaN in a position component', () => {
    const result = parseSceneOp(validRawOp({ patch: { position: { x: NaN, y: 0, z: 0 } } }));
    expect(result.ok).toBe(false);
  });

  it('rejects Infinity in a position component', () => {
    const result = parseSceneOp(validRawOp({ patch: { position: { x: Infinity, y: 0, z: 0 } } }));
    expect(result.ok).toBe(false);
  });

  it('rejects -Infinity in a rotation component', () => {
    const result = parseSceneOp(validRawOp({ patch: { rotation: { x: 0, y: 0, z: 0, w: -Infinity } } }));
    expect(result.ok).toBe(false);
  });

  it('rejects a position component far outside any plausible scene bound', () => {
    const result = parseSceneOp(validRawOp({ patch: { position: { x: 1e12, y: 0, z: 0 } } }));
    expect(result.ok).toBe(false);
  });

  it('rejects zero scale (degenerate / normals-flipping)', () => {
    const result = parseSceneOp(validRawOp({ patch: { scale: { x: 0, y: 1, z: 1 } } }));
    expect(result.ok).toBe(false);
  });

  it('rejects negative scale', () => {
    const result = parseSceneOp(validRawOp({ patch: { scale: { x: -1, y: 1, z: 1 } } }));
    expect(result.ok).toBe(false);
  });

  it('rejects an absurdly large scale', () => {
    const result = parseSceneOp(validRawOp({ patch: { scale: { x: 1e9, y: 1, z: 1 } } }));
    expect(result.ok).toBe(false);
  });

  it('rejects a quaternion component far outside the unit range', () => {
    const result = parseSceneOp(validRawOp({ patch: { rotation: { x: 500, y: 0, z: 0, w: 1 } } }));
    expect(result.ok).toBe(false);
  });

  it('rejects a negative seq', () => {
    const result = parseSceneOp(validRawOp({ seq: -1 }));
    expect(result.ok).toBe(false);
  });

  it('rejects a non-integer seq', () => {
    const result = parseSceneOp(validRawOp({ seq: 1.5 }));
    expect(result.ok).toBe(false);
  });

  it('rejects a non-finite `at`', () => {
    const result = parseSceneOp(validRawOp({ at: NaN }));
    expect(result.ok).toBe(false);
  });
});

describe('parseSceneOp — malformed shapes are rejected', () => {
  it('rejects a completely wrong type', () => {
    expect(parseSceneOp(null).ok).toBe(false);
    expect(parseSceneOp('a string').ok).toBe(false);
    expect(parseSceneOp(42).ok).toBe(false);
    expect(parseSceneOp([]).ok).toBe(false);
  });

  it('rejects a missing required field', () => {
    const raw = validRawOp();
    delete (raw as Record<string, unknown>).seq;
    expect(parseSceneOp(raw).ok).toBe(false);
  });

  it('rejects an unexpected extra top-level field (strict schema)', () => {
    const result = parseSceneOp(validRawOp({ __proto__polluted: true, extraField: 'nope' }));
    expect(result.ok).toBe(false);
  });

  it('rejects an unrecognised key inside patch (strict schema)', () => {
    const result = parseSceneOp(validRawOp({ patch: { position: { x: 0, y: 0, z: 0 }, kind: 'hostile-field-injection' } }));
    expect(result.ok).toBe(false);
  });

  it('rejects an opId longer than the cap', () => {
    const result = parseSceneOp(validRawOp({ opId: 'x'.repeat(500) }));
    expect(result.ok).toBe(false);
  });

  it('rejects an empty opId', () => {
    const result = parseSceneOp(validRawOp({ opId: '' }));
    expect(result.ok).toBe(false);
  });

  it('rejects an objectId with no length cap when no model set is supplied (T-016 S-4: measured a 1,000,000-character objectId accepted)', () => {
    const result = parseSceneOp(validRawOp({ objectId: 'x'.repeat(1_000_000) }));
    expect(result.ok).toBe(false);
  });
});

describe('parseActorPresence — accepts well-formed presence', () => {
  function validPresence(overrides: Record<string, unknown> = {}) {
    return {
      actorId: 'actor-1',
      displayName: 'Ada',
      colorHex: '#3366ff',
      joinedAt: Date.now(),
      lastSeenAt: Date.now(),
      ...overrides,
    };
  }

  it('accepts a minimal valid presence record', () => {
    expect(parseActorPresence(validPresence()).ok).toBe(true);
  });

  it('strips (does not reject) an unrecognised field such as Realtime\'s injected `presence_ref`', () => {
    const result = parseActorPresence(validPresence({ presence_ref: 'phx-ref-abc123' }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).not.toHaveProperty('presence_ref');
    }
  });
});

describe('parseActorPresence — hostile and malformed presence is rejected', () => {
  function validPresence(overrides: Record<string, unknown> = {}) {
    return {
      actorId: 'actor-1',
      displayName: 'Ada',
      colorHex: '#3366ff',
      joinedAt: Date.now(),
      lastSeenAt: Date.now(),
      ...overrides,
    };
  }

  it('rejects an oversized displayName', () => {
    const result = parseActorPresence(validPresence({ displayName: 'x'.repeat(500) }));
    expect(result.ok).toBe(false);
  });

  it('rejects an empty displayName', () => {
    const result = parseActorPresence(validPresence({ displayName: '' }));
    expect(result.ok).toBe(false);
  });

  it('rejects a displayName containing control characters', () => {
    const result = parseActorPresence(validPresence({ displayName: 'Ada\u0000hidden' }));
    expect(result.ok).toBe(false);
  });

  it('rejects a colorHex that is not a strict #rrggbb string', () => {
    for (const bad of ['red', '#fff', '#gggggg', 'javascript:alert(1)', '#3366ff; background: url(x)']) {
      expect(parseActorPresence(validPresence({ colorHex: bad })).ok).toBe(false);
    }
  });

  it('rejects a non-finite joinedAt/lastSeenAt', () => {
    expect(parseActorPresence(validPresence({ joinedAt: NaN })).ok).toBe(false);
    expect(parseActorPresence(validPresence({ lastSeenAt: Infinity })).ok).toBe(false);
  });

  it('rejects a completely wrong type', () => {
    expect(parseActorPresence(null).ok).toBe(false);
    expect(parseActorPresence('actor-1').ok).toBe(false);
  });
});

/**
 * T-016 finding S-2: `supabaseTransport.ts` and `loopbackTransport.ts` both
 * cast the digital-twin row straight to `SceneSnapshot` with a bare `as` —
 * no runtime check at all — even though the row is anon-writable (§6.6's
 * migration grants anon INSERT/UPDATE `WITH CHECK (true)`, capped only at
 * 60 KiB of arbitrarily-shaped JSON) and `loadSnapshot` runs once after
 * `join`, before any op is applied, so hostile stored JSON reaches
 * `render/projector.ts` ahead of every other control. `parseSceneSnapshot`
 * closes that gap the same way `parseSceneOp` closes it for the live wire.
 */
function validSceneObject(overrides: Record<string, unknown> = {}) {
  return {
    id: 'obj-1',
    kind: 'crate-closed',
    position: { x: 1, y: 2, z: 3 },
    rotation: { x: 0, y: 0, z: 0, w: 1 },
    scale: { x: 1, y: 1, z: 1 },
    visible: true,
    stage: 'warehouse',
    label: 'Closed crate',
    rev: { seq: 0, actorId: null },
    ...overrides,
  };
}

function validRawSnapshot(overrides: Record<string, unknown> = {}) {
  return {
    objects: { 'obj-1': validSceneObject() },
    revision: 3,
    savedAt: Date.now(),
    ...overrides,
  };
}

describe('parseSceneSnapshot — accepts a well-formed snapshot', () => {
  it('accepts a minimal valid snapshot with no model-id check requested', () => {
    const result = parseSceneSnapshot(validRawSnapshot());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.objects['obj-1'].label).toBe('Closed crate');
      expect(result.value.revision).toBe(3);
    }
  });

  it('accepts an empty objects map', () => {
    const result = parseSceneSnapshot(validRawSnapshot({ objects: {} }));
    expect(result.ok).toBe(true);
  });

  it('accepts a snapshot whose object ids are all in the supplied model set', () => {
    const result = parseSceneSnapshot(validRawSnapshot(), new Set(['obj-1']));
    expect(result.ok).toBe(true);
  });

  it('a null rev.actorId (never-edited-by-a-peer object) is valid', () => {
    const result = parseSceneSnapshot(validRawSnapshot({
      objects: { 'obj-1': validSceneObject({ rev: { seq: 0, actorId: null } }) },
    }));
    expect(result.ok).toBe(true);
  });
});

describe('parseSceneSnapshot — the objectId/model-membership seam, same as parseSceneOp', () => {
  it('rejects a snapshot object whose id the supplied model set does not have', () => {
    const result = parseSceneSnapshot(validRawSnapshot(), new Set(['some-other-id']));
    expect(result.ok).toBe(false);
  });

  it('without a supplied model set, any object id passes shape validation (documented: the caller must check membership itself)', () => {
    const result = parseSceneSnapshot(
      validRawSnapshot({ objects: { 'not-in-any-model': validSceneObject({ id: 'not-in-any-model' }) } }),
    );
    expect(result.ok).toBe(true);
  });
});

describe('parseSceneSnapshot — degenerate transforms that would blank the scene are rejected', () => {
  it('rejects NaN in a stored position component', () => {
    const result = parseSceneSnapshot(validRawSnapshot({
      objects: { 'obj-1': validSceneObject({ position: { x: NaN, y: 0, z: 0 } }) },
    }));
    expect(result.ok).toBe(false);
  });

  it('rejects Infinity in a stored rotation component', () => {
    const result = parseSceneSnapshot(validRawSnapshot({
      objects: { 'obj-1': validSceneObject({ rotation: { x: 0, y: 0, z: 0, w: Infinity } }) },
    }));
    expect(result.ok).toBe(false);
  });

  it('rejects zero/negative scale', () => {
    const result = parseSceneSnapshot(validRawSnapshot({
      objects: { 'obj-1': validSceneObject({ scale: { x: 0, y: 1, z: 1 } }) },
    }));
    expect(result.ok).toBe(false);
  });

  it('rejects a position component far outside any plausible scene bound', () => {
    const result = parseSceneSnapshot(validRawSnapshot({
      objects: { 'obj-1': validSceneObject({ position: { x: 1e12, y: 0, z: 0 } }) },
    }));
    expect(result.ok).toBe(false);
  });
});

describe('parseSceneSnapshot — the fields §6.5/§6.6 name as previously unchecked', () => {
  it('rejects a label with no length cap (state/types.ts has none) once it is far beyond any authored label', () => {
    const result = parseSceneSnapshot(validRawSnapshot({
      objects: { 'obj-1': validSceneObject({ label: 'x'.repeat(100_000) }) },
    }));
    expect(result.ok).toBe(false);
  });

  it('rejects control characters in a label — unbounded attacker text otherwise reaches the a11y tree', () => {
    const result = parseSceneSnapshot(validRawSnapshot({
      objects: { 'obj-1': validSceneObject({ label: 'crate hidden' }) },
    }));
    expect(result.ok).toBe(false);
  });

  it('caps the total object count — an anon-writable row cannot grow the store without bound', () => {
    const objects: Record<string, unknown> = {};
    for (let i = 0; i < 500; i++) {
      objects[`obj-${i}`] = validSceneObject({ id: `obj-${i}` });
    }
    const result = parseSceneSnapshot(validRawSnapshot({ objects }));
    expect(result.ok).toBe(false);
  });

  it('rejects a revision beyond Number.MAX_SAFE_INTEGER (anon-writable bigint column)', () => {
    const result = parseSceneSnapshot(validRawSnapshot({ revision: Number.MAX_SAFE_INTEGER + 1024 }));
    expect(result.ok).toBe(false);
  });

  it('rejects a savedAt beyond Number.MAX_SAFE_INTEGER', () => {
    const result = parseSceneSnapshot(validRawSnapshot({ savedAt: Number.MAX_SAFE_INTEGER * 2 }));
    expect(result.ok).toBe(false);
  });

  it('rejects a negative revision', () => {
    const result = parseSceneSnapshot(validRawSnapshot({ revision: -1 }));
    expect(result.ok).toBe(false);
  });
});

describe('parseSceneSnapshot — malformed shapes are rejected, exactly like the old bare cast would not catch', () => {
  it('rejects a completely wrong type', () => {
    expect(parseSceneSnapshot(null).ok).toBe(false);
    expect(parseSceneSnapshot('a string').ok).toBe(false);
    expect(parseSceneSnapshot(42).ok).toBe(false);
    expect(parseSceneSnapshot([]).ok).toBe(false);
  });

  it('rejects a snapshot missing the objects field entirely', () => {
    const raw = validRawSnapshot();
    delete (raw as Record<string, unknown>).objects;
    expect(parseSceneSnapshot(raw).ok).toBe(false);
  });

  it('rejects an object missing a required field (e.g. rev)', () => {
    const object = validSceneObject();
    delete (object as Record<string, unknown>).rev;
    const result = parseSceneSnapshot(validRawSnapshot({ objects: { 'obj-1': object } }));
    expect(result.ok).toBe(false);
  });

  it('rejects an unexpected extra field on an object (strict schema)', () => {
    const result = parseSceneSnapshot(validRawSnapshot({
      objects: { 'obj-1': validSceneObject({ hostileField: 'injected' }) },
    }));
    expect(result.ok).toBe(false);
  });

  it('rejects an unexpected extra top-level field (strict schema)', () => {
    const result = parseSceneSnapshot(validRawSnapshot({ extraField: 'nope' }));
    expect(result.ok).toBe(false);
  });
});
