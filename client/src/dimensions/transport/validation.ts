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
 * `parseActorPresence` before invoking an `onOp` / `onPresence` listener.
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
 */
import { z } from "zod";
import type { ActorId, ActorPresence, ObjectId, SceneOp } from "./types";

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; reason: string };

const POSITION_BOUND = 10_000;
const SCALE_MAX = 100;
const QUAT_EPSILON = 1.0001;
export const MAX_DISPLAY_NAME_LENGTH = 40;
const MAX_OP_ID_LENGTH = 100;
const MAX_ROOM_ID_LENGTH = 64;

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
        : z.string().min(1),
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
