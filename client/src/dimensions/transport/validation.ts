/**
 * Peer payload validation — client/src/dimensions/transport/validation.ts
 *
 * ARCHITECTURE-DIMENSIONS.md §6.5: "Row Level Security does not inspect
 * broadcast payloads." Realtime Authorization gates who may *join* a
 * channel, never what a joined peer may *send* — a peer that can join can
 * send arbitrary JSON. Every inbound `SceneOp` and `ActorPresence` is
 * therefore parsed with a `zod` schema *before it reaches the store*. This
 * is mandatory and load-bearing, not defence in depth (§3.3). `zod@4.1.12`
 * is already installed (Verified — `package.json`).
 *
 * A rejected message is dropped and counted, never applied. Every
 * transport implementation (`supabaseTransport.ts`, `loopbackTransport.ts`)
 * must run every inbound peer payload through `parseSceneOp` /
 * `parseActorPresence` before invoking an `onOp` / `onPresence` listener, and
 * every loaded digital-twin row through `parseSceneSnapshot` before
 * `loadSnapshot` resolves (T-016 finding S-2). Before `parseSceneSnapshot`
 * existed, both transports cast the raw row straight to `SceneSnapshot` with
 * a bare TypeScript `as` — no runtime check — even though the row is
 * anon-writable (`supabase/migrations/0001_dimensions_room_state.sql` grants
 * anon INSERT/UPDATE `WITH CHECK (true)`, capped only at 60 KiB of
 * arbitrarily-shaped JSON) and `loadSnapshot` runs once after `join`,
 * *before any op is applied* — so hostile stored JSON reached
 * `render/projector.ts` ahead of every bound `SceneOpPatchSchema` enforces,
 * and a degenerate transform could blank the scene for every visitor,
 * persistently, because it lives in the database.
 *
 * The numeric bounds below are not given by the architecture document and
 * are chosen here, documented so they can be revisited:
 *  - Position components: finite, within ±10 000 units — generous for any
 *    plausible authored scene, but rejects a peer trying to send a
 *    coordinate large enough to destabilise the physics integrator or the
 *    camera.
 *  - Scale components: finite, in (0, 100] — zero or negative scale is
 *    either meaningless or a normals-flipping attack; 100x is far beyond
 *    any authored object's scale.
 *  - Quaternion components: finite, within [-1.0001, 1.0001] — a small
 *    epsilon beyond the unit range absorbs ordinary floating-point slop in
 *    a normalised quaternion without accepting an obviously invalid one.
 *  - `displayName`: 1-40 characters. Rendered as a text node only, never as
 *    HTML (`SECURITY.md`: escape output for its destination context) — that
 *    is a rendering-layer responsibility this schema cannot enforce, but
 *    control characters are rejected here since they have no legitimate use
 *    in a display name.
 *  - `colorHex`: a strict `#rrggbb` string — anything else is rejected
 *    rather than passed through to a `style` attribute unchanged.
 *  - `objectId` (when no model set is supplied — see `buildSceneOpSchema`):
 *    1-100 characters. T-016 finding S-4 measured a 1,000,000-character
 *    `objectId` accepted with no cap, each becoming a new key in the
 *    store's `objects` record (unbounded memory growth) and, via
 *    `saveSnapshot`, eventually failing the twin row's 60 KiB CHECK and
 *    silently breaking persistence for the whole room. `opId` (100) and
 *    `actorId` (64, below) already had caps; this brings `objectId` in line.
 *  - `label` (`SceneObject.label`, digital-twin objects only — the live
 *    wire's `SceneOp` has no `label` field): 1-200 characters, same
 *    control-character filter as `displayName`. T-016 finding S-2:
 *    `state/types.ts`'s `label` field has no cap, unlike `displayName`'s
 *    1-40 + regex, and it reaches the DOM as every scene object's
 *    accessible name (`a11y/SceneOutline.tsx`) — React escapes it, so this
 *    is unbounded attacker-controlled text in the accessible-name tree, not
 *    XSS. 200 is generous against every authored label (longest today is
 *    "Toy car — at the loading dock", 30 characters — verified,
 *    `model/process.ts`) while bounding a hostile row's contribution.
 *  - Snapshot object count: capped at 128. The authored model has 6 objects
 *    today (verified, `model/process.ts`); 128 leaves over 20x headroom for
 *    physics- and interaction-owned entries while keeping an anon-writable
 *    row from growing the store without bound (§3.3's "bounded blast
 *    radius", applied to the twin the same way `objectId` membership
 *    applies to it on the live wire).
 *  - `revision` / `savedAt`: coerced to a number, then required finite,
 *    integer, non-negative, and at most `Number.MAX_SAFE_INTEGER`. T-016
 *    finding S-2: both are `Number(...)`-cast from an anon-writable Postgres
 *    `bigint` column with no bound before this schema existed.
 */
import { z } from "zod";
import type {
  ActorId,
  ActorPresence,
  ObjectId,
  SceneObject,
  SceneOp,
  SceneSnapshot,
} from "./types";

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; reason: string };

const POSITION_BOUND = 10_000;
const SCALE_MAX = 100;
const QUAT_EPSILON = 1.0001;
export const MAX_DISPLAY_NAME_LENGTH = 40;
const MAX_OP_ID_LENGTH = 100;
const MAX_ROOM_ID_LENGTH = 64;
const MAX_OBJECT_ID_LENGTH = 100;
export const MAX_LABEL_LENGTH = 200;
export const MAX_SNAPSHOT_OBJECT_COUNT = 128;

const finite = z.number().finite();

const boundedNumber = (bound: number) => finite.min(-bound).max(bound);

const Vec3Schema = z
  .object({
    x: boundedNumber(POSITION_BOUND),
    y: boundedNumber(POSITION_BOUND),
    z: boundedNumber(POSITION_BOUND),
  })
  .strict();

const ScaleVec3Schema = z
  .object({
    x: finite.gt(0).max(SCALE_MAX),
    y: finite.gt(0).max(SCALE_MAX),
    z: finite.gt(0).max(SCALE_MAX),
  })
  .strict();

const QuatSchema = z
  .object({
    x: boundedNumber(QUAT_EPSILON),
    y: boundedNumber(QUAT_EPSILON),
    z: boundedNumber(QUAT_EPSILON),
    w: boundedNumber(QUAT_EPSILON),
  })
  .strict();

/** No control characters (0x00-0x1F, 0x7F) — a display name has no legitimate use for them. */
const NO_CONTROL_CHARS = /^[^\x00-\x1F\x7F]*$/;

const DisplayNameSchema = z
  .string()
  .min(1)
  .max(MAX_DISPLAY_NAME_LENGTH)
  .regex(
    NO_CONTROL_CHARS,
    "control characters are not allowed in a display name"
  );

const ColorHexSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "expected a #rrggbb color");

const SceneOpPatchSchema = z
  .object({
    position: Vec3Schema.optional(),
    rotation: QuatSchema.optional(),
    scale: ScaleVec3Schema.optional(),
    visible: z.boolean().optional(),
  })
  .strict();

/**
 * Builds the schema for one inbound `SceneOp`.
 *
 * `validObjectIds`, when supplied, comes from the authored model (which this
 * module does not import) so `objectId` membership can be checked: a peer
 * cannot invent objects, which is what keeps the object count from growing
 * without bound (§3.3's "bounded blast radius").
 *
 * **Why it is optional, and who must supply it.** `CollaborationTransport`'s
 * factory is reached only through `createTransport(): CollaborationTransport`
 * (§6.2) — zero parameters, by the fixed contract T-010 codes against — so
 * `supabaseTransport.ts` has no channel through which the authored model's id
 * set could reach it. Its internal use of this function necessarily omits
 * `validObjectIds` and therefore validates everything *except* model
 * membership. **The caller wiring `transport.onOp()` into the store (T-010)
 * knows the model and must close this gap itself** — either call
 * `isKnownObjectId(op.objectId, validObjectIds)` before applying a delivered
 * op, or re-run `parseSceneOp(raw, validObjectIds)` with the real set. This is
 * a documented, load-bearing seam, not an oversight: see this task's report
 * for why the fixed interface forces it.
 */
function buildSceneOpSchema(validObjectIds?: ReadonlySet<string>) {
  return z
    .object({
      opId: z.string().min(1).max(MAX_OP_ID_LENGTH),
      objectId: validObjectIds
        ? z.string().refine(id => validObjectIds.has(id), {
            message: "objectId is not part of the authored model",
          })
        : z.string().min(1).max(MAX_OBJECT_ID_LENGTH),
      actorId: z.string().min(1).max(MAX_ROOM_ID_LENGTH),
      seq: z.number().int().nonnegative().finite(),
      at: finite,
      patch: SceneOpPatchSchema,
    })
    .strict();
}

/**
 * Reports whether `objectId` belongs to the authored model's id set. A thin,
 * named wrapper around `validObjectIds.has(objectId)` so store-side glue code
 * (T-010) has an obvious, discoverable place to perform the model-membership
 * half of §6.5's validation that `parseSceneOp` cannot perform on its own
 * when called without `validObjectIds` (see `buildSceneOpSchema`'s comment).
 *
 * @example
 * ```ts
 * transport.onOp((op) => {
 *   if (!isKnownObjectId(op.objectId, new Set(Object.keys(model.objects)))) {
 *     console.warn("[6D] dropped op: unknown objectId", op.objectId);
 *     return;
 *   }
 *   applyOp(op);
 * });
 * ```
 */
export function isKnownObjectId(
  objectId: string,
  validObjectIds: ReadonlySet<string>
): boolean {
  return validObjectIds.has(objectId);
}

/**
 * Parses and validates one inbound `SceneOp`. Returns `{ ok: false }` with a
 * human-readable reason for anything malformed, hostile, or out of range —
 * the caller must drop the message rather than apply it.
 *
 * Pass `validObjectIds` when the caller knows the authored model (e.g. a
 * test, or `loopbackTransport.ts`'s constructor option) to additionally
 * reject an object id the model does not have. Omit it — as
 * `supabaseTransport.ts` must, per `buildSceneOpSchema`'s comment — to
 * validate everything else without that check.
 *
 * @example
 * ```ts
 * const validIds = new Set(["obj-1", "obj-2"]);
 * const result = parseSceneOp(rawFromPeer, validIds);
 * if (!result.ok) {
 *   console.warn("[6D] rejected peer op:", result.reason);
 * } else {
 *   applyOp(result.value);
 * }
 * ```
 */
export function parseSceneOp(
  raw: unknown,
  validObjectIds?: ReadonlySet<string>
): ValidationResult<SceneOp> {
  const result = buildSceneOpSchema(validObjectIds).safeParse(raw);
  if (!result.success) {
    return {
      ok: false,
      reason: result.error.issues
        .map(i => `${i.path.join(".")}: ${i.message}`)
        .join("; "),
    };
  }
  const parsed = result.data;
  return {
    ok: true,
    value: {
      opId: parsed.opId,
      objectId: parsed.objectId as ObjectId,
      actorId: parsed.actorId as ActorId,
      seq: parsed.seq,
      at: parsed.at,
      patch: parsed.patch,
    },
  };
}

/** No control characters — same rationale as `displayName`'s. */
const LabelSchema = z
  .string()
  .min(1)
  .max(MAX_LABEL_LENGTH)
  .regex(NO_CONTROL_CHARS, "control characters are not allowed in a label");

const SceneObjectRevSchema = z
  .object({
    seq: z.number().int().nonnegative().finite(),
    actorId: z.union([z.string().min(1).max(MAX_ROOM_ID_LENGTH), z.null()]),
  })
  .strict();

/**
 * The full digital-twin object shape (`state/types.ts`'s `SceneObject`).
 * Reuses `Vec3Schema` / `QuatSchema` / `ScaleVec3Schema` — the same bounds
 * `SceneOpPatchSchema` applies to a live op apply here too, per T-016's S-2
 * finding, since a stored snapshot is exactly as untrusted as a live one and
 * is loaded *before* any op (and its bounds) can act on it.
 */
const SceneObjectSchema = z
  .object({
    id: z.string().min(1).max(MAX_OBJECT_ID_LENGTH),
    kind: z.string().min(1).max(MAX_OBJECT_ID_LENGTH),
    position: Vec3Schema,
    rotation: QuatSchema,
    scale: ScaleVec3Schema,
    visible: z.boolean(),
    stage: z.union([z.string().min(1).max(MAX_OBJECT_ID_LENGTH), z.null()]),
    label: LabelSchema,
    rev: SceneObjectRevSchema,
  })
  .strict();

/**
 * `revision` / `savedAt` arrive from an anon-writable Postgres `bigint`
 * column (`supabase/migrations/0001_dimensions_room_state.sql`) by way of
 * `JSON.parse`, so by the time they reach this module they are already a JS
 * number (or, depending on the JSON producer, a numeric string) with no
 * guarantee they are finite or fit in `Number.MAX_SAFE_INTEGER`.
 * `z.coerce.number()` accepts either representation; the bounds after it are
 * what actually matter — this replaces the old blind `Number(...)` cast.
 */
const SafeNonNegativeIntegerSchema = z.coerce
  .number()
  .finite()
  .int()
  .nonnegative()
  .max(Number.MAX_SAFE_INTEGER);

/**
 * Builds the schema for one inbound `SceneSnapshot` (the digital-twin row,
 * §6.6). `validObjectIds` is optional for exactly the reason
 * `buildSceneOpSchema` gives: `supabaseTransport.ts`'s `loadSnapshot` has no
 * channel to the authored model's id set (the same zero-parameter
 * `createTransport()` seam), so it can validate shape, numeric bounds, and
 * object count, but not id membership. `loopbackTransport.ts` already holds
 * `validObjectIds` as a constructor option and passes it through to close
 * that gap, the same way it already does for `parseSceneOp`.
 *
 * The object count is capped independently of membership — `objects` grows
 * without bound would be an attack even if every id happened to be one the
 * model has.
 */
function buildSceneSnapshotSchema(validObjectIds?: ReadonlySet<string>) {
  return z
    .object({
      objects: z.record(
        z.string().min(1).max(MAX_OBJECT_ID_LENGTH),
        SceneObjectSchema
      ),
      revision: SafeNonNegativeIntegerSchema,
      savedAt: SafeNonNegativeIntegerSchema,
    })
    .strict()
    .superRefine((snapshot, ctx) => {
      const ids = Object.keys(snapshot.objects);
      if (ids.length > MAX_SNAPSHOT_OBJECT_COUNT) {
        ctx.addIssue({
          code: "custom",
          path: ["objects"],
          message: `snapshot has ${ids.length} objects, more than the ${MAX_SNAPSHOT_OBJECT_COUNT}-object cap`,
        });
      }
      if (validObjectIds) {
        for (const id of ids) {
          if (!validObjectIds.has(id)) {
            ctx.addIssue({
              code: "custom",
              path: ["objects", id],
              message: "objectId is not part of the authored model",
            });
          }
        }
      }
    });
}

/**
 * Parses and validates one inbound `SceneSnapshot` — the digital-twin row
 * §6.6 loads once after `join()`, **before any op is applied**. This is
 * T-016 finding S-2's fix: before this function existed, both transports
 * cast the raw row straight to `SceneSnapshot` with a bare TypeScript `as`,
 * with no runtime check, even though the row is anon-writable and capped
 * only at 60 KiB of arbitrarily-shaped JSON. Every object is validated
 * against the same bounds `SceneOpPatchSchema` uses; the object count and
 * every label's length are capped; `revision`/`savedAt` are bounded to a
 * safe non-negative integer. A rejected snapshot must be treated the same
 * way a rejected op or presence record is — dropped, never applied — which
 * for a snapshot means the caller falls back to "no snapshot was saved"
 * rather than crashing or rendering degenerate geometry.
 *
 * Pass `validObjectIds` when the caller knows the authored model (e.g.
 * `loopbackTransport.ts`) to additionally reject an object id the model
 * does not have. Omit it — as `supabaseTransport.ts` must, per
 * `buildSceneSnapshotSchema`'s comment — to validate everything else
 * without that check.
 *
 * @example
 * ```ts
 * const result = parseSceneSnapshot(rawRow);
 * if (!result.ok) {
 *   console.warn("[6D] discarding an invalid stored snapshot:", result.reason);
 *   return null; // treated the same as "nothing saved yet"
 * }
 * return result.value;
 * ```
 */
export function parseSceneSnapshot(
  raw: unknown,
  validObjectIds?: ReadonlySet<string>
): ValidationResult<SceneSnapshot> {
  const result = buildSceneSnapshotSchema(validObjectIds).safeParse(raw);
  if (!result.success) {
    return {
      ok: false,
      reason: result.error.issues
        .map(i => `${i.path.join(".")}: ${i.message}`)
        .join("; "),
    };
  }
  const parsed = result.data;
  const objects: Record<string, SceneObject> = {};
  for (const [id, obj] of Object.entries(parsed.objects)) {
    objects[id] = {
      id: obj.id as ObjectId,
      kind: obj.kind,
      position: obj.position,
      rotation: obj.rotation,
      scale: obj.scale,
      visible: obj.visible,
      stage: obj.stage,
      label: obj.label,
      rev: {
        seq: obj.rev.seq,
        actorId: obj.rev.actorId as ActorId | null,
      },
    };
  }
  return {
    ok: true,
    value: {
      objects,
      revision: parsed.revision,
      savedAt: parsed.savedAt,
    },
  };
}

// Deliberately NOT `.strict()`, unlike the schemas above: Supabase Realtime's
// presence tracker decorates every tracked payload with its own
// `presence_ref` field (and this client does not control that), so unknown
// keys must be stripped rather than rejected. Zod's default object mode does
// exactly that — the extra key is dropped from `.value` without an error.
const ActorPresenceSchema = z.object({
  actorId: z.string().min(1).max(MAX_ROOM_ID_LENGTH),
  displayName: DisplayNameSchema,
  colorHex: ColorHexSchema,
  joinedAt: finite,
  lastSeenAt: finite,
});

/**
 * Parses and validates one inbound `ActorPresence`. Same rationale as
 * `parseSceneOp`: presence payloads are relayed between clients with no RLS
 * inspection, so a malformed or hostile record (an oversized `displayName`,
 * a non-hex `colorHex` destined for a `style` attribute) must be rejected
 * before it reaches the store.
 */
export function parseActorPresence(
  raw: unknown
): ValidationResult<ActorPresence> {
  const result = ActorPresenceSchema.safeParse(raw);
  if (!result.success) {
    return {
      ok: false,
      reason: result.error.issues
        .map(i => `${i.path.join(".")}: ${i.message}`)
        .join("; "),
    };
  }
  const parsed = result.data;
  return {
    ok: true,
    value: {
      actorId: parsed.actorId as ActorId,
      displayName: parsed.displayName,
      colorHex: parsed.colorHex,
      joinedAt: parsed.joinedAt,
      lastSeenAt: parsed.lastSeenAt,
    },
  };
}
