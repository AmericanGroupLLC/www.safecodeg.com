# Dimensional Capability Stack (3D–7D) — Architecture

Owner: Architect. Produced for **T-001**. Authoritative for T-004 … T-017.

The governing constraint is the user's: **every level genuinely working — not
faked, mocked, or a static picture of itself**, and **the UI must never claim a
capability is active when it is not.** Where this document chooses between two
workable designs, that constraint is the tiebreaker, and where a capability
cannot be genuinely delivered, the design produces an honest state rather than a
plausible one.

Evidence classes per `VERIFY.md` are marked inline. Nothing below is presented as
fact unless it was measured or read this session.

---

## 0. Measurement methodology

Every bundle number in this document was measured, not estimated or recalled.

**Method (Verified — ran it).** An isolated Vite project outside this repo, at
`vite@7.1.12` + `@vitejs/plugin-react@5.2.0` (matching this repo's `vite@^7.1.7`
and `@vitejs/plugin-react@^5.0.4` declared in `package.json`). One entry file per
candidate stack, each exercising a realistic surface (scene + camera + loader +
raycast for 3D; world + bodies + collision + material for physics; channel +
presence + broadcast + row read/write for transport). Built with
`vite build --logLevel error`, then every emitted `assets/*.js` measured raw and
under `gzip -9`.

A baseline entry of `react@19.2.8` + `react-dom@19.2.8` alone measured
**60,369 B gzip**. Every "delta" below is *total minus that baseline*, which is
the quantity that matters here: the entry chunk already contains React, so the
delta is what a lazily-loaded chunk actually costs.

kB means 1,000 bytes throughout, matching Vite's own reporting and the
936.81 kB / 936,809 B baseline recorded in `TASKS.md`.

**Honest caveat (stated, not buried).** The probe entries approximate the final
code; they are not the final code. Final chunk sizes will differ. These figures
are decision-grade for *choosing between libraries* — they are not a prediction of
the shipped bundle. T-015 measures the real thing and is the authority on it.

### Measured results

| Probe | total gzip B | delta over React base | delta kB gzip |
|---|---|---|---|
| react 19.2.8 + react-dom (baseline) | 60,369 | — | — |
| `three` 0.185.1, core classes only | 188,491 | 128,122 | **128.12** |
| `three` + `GLTFLoader` + `OrbitControls` | 220,102 | 159,733 | **159.73** |
| … + `@react-three/fiber` 9.7.0 | 314,130 | 253,761 | **253.76** |
| … + `@react-three/drei` 10.7.8 (6 components) | 349,927 | 289,558 | **289.56** |
| `cannon-es` 0.20.0 | 85,529 | 25,160 | **25.16** |
| `@dimforge/rapier3d-compat` 0.20.0 | 1,144,093 | 1,083,724 | **1083.72** |
| `@react-three/rapier` 2.2.0 (+ fiber + three) | 1,144,713 | 1,084,344 | **1084.34** |
| `@supabase/supabase-js` 2.115.0 | 118,385 | 58,016 | **58.02** |
| `@supabase/realtime-js` 2.115.0 alone | 77,675 | 17,306 | **17.31** |
| `realtime-js` + `postgrest-js` 2.115.0 | 82,732 | 22,363 | **22.36** |

Derived (Verified — arithmetic on the rows above):

- `@react-three/fiber` over raw three, like-for-like: **+94.03 kB gzip**
- `@react-three/drei` over fiber, 6 components: **+35.80 kB gzip**
- R3F + drei over raw three: **+129.83 kB gzip**
- rapier over cannon-es: **+1058.56 kB gzip — a factor of 43.1×**
- `rapier_wasm3d_bg.wasm` alone, `gzip -9`: **760,396 B = 760.40 kB** (Verified)

---

## 1. Decision D-3D-RUNTIME — raw `three` 0.185.1, no React renderer

**Decision: `three@0.185.1` used directly, plus `OrbitControls` and `GLTFLoader`
from `three/examples/jsm/`. No `@react-three/fiber`, no `@react-three/drei`, no
`@react-three/xr`.**

Three independent reasons, in order of weight.

### 1.1 R3F has no WebXR support at all, and 7D is a first-class requirement

**Verified — ran it.** `grep -c "xr" node_modules/@react-three/fiber/dist/react-three-fiber.esm.js`
returns **0**. The shipped ESM bundle of `@react-three/fiber@9.7.0` contains not a
single occurrence of the substring `xr`. It does not call
`WebGLRenderer.setAnimationLoop`, does not touch `renderer.xr`, and has no
concept of an `XRSession`. R3F drives its own `requestAnimationFrame` loop.

**Verified — read it.** `three` ships `WebXRManager` at
`node_modules/three/src/renderers/webxr/WebXRManager.js`, and
`node_modules/three/src/renderers/WebGLRenderer.js:1584` reads
`xr.setAnimationLoop( callback );` inside `this.setAnimationLoop`. Raw three
therefore switches from the page's rAF to the XR session's frame loop
automatically, through the one loop we already own.

Choosing R3F means adding `@react-three/xr` — a third dependency, a second
catalogue, and a second render-loop owner — to obtain what raw three already
has. For a feature whose 7D layer is a stated requirement, that is the decisive
consideration, independent of bundle size.

### 1.2 R3F defeats three's tree-shaking, measurably

**Verified — ran it.** `node_modules/@react-three/fiber/dist/react-three-fiber.esm.js:4`
and `node_modules/@react-three/fiber/dist/events-156d8d12.esm.js:3` both read
`import * as THREE from 'three';`. A namespace import of the whole library is
what R3F's `extend()` catalogue requires, and it is why the fiber probe measured
**+94.03 kB gzip** over the raw-three probe: the bundler can no longer drop the
three classes we never touch.

`+129.83 kB gzip` for R3F + drei is not a budget violation — it lands in a lazy
chunk, not the entry chunk — but it is roughly half the current entire site
(257.08 kB gzip) paid again, on shared hosting, for ergonomics.

### 1.3 R3F's central benefit is one this architecture provides anyway

R3F's real value is "the scene is a pure projection of props." Section 5 makes
that a hard invariant of this design regardless of renderer: the authoritative
state is a plain serializable store and the scene graph is a derived projection
of it. With R3F, the projection is `state → JSX` and React's reconciler diffs it.
Without R3F, the projection is `state → Object3D` mutations written in one file
(`render/projector.ts`) that this design already requires to exist for
determinism reasons. R3F would be a second reconciler stacked on top of the first.

Owning the projection also buys three things the acceptance criteria need
directly:

- **T-005** requires triangle and draw-call counts. `renderer.info.render.calls`
  and `.triangles` are read straight off the renderer we own.
- **T-006** requires *byte-identical* state when `t` is reached two different
  ways. Determinism is far easier to guarantee when one file performs every
  mutation.
- **T-010** requires peer labels that are "keyboard-reachable with accessible
  names". drei's `<Html>` would render them; a DOM overlay we own renders real
  `<button>` elements, which is what §8 requires anyway.

### Alternatives rejected

| Rejected | Why |
|---|---|
| `@react-three/fiber` + `@react-three/drei` | Zero WebXR support (Verified, §1.1); +129.83 kB gzip (Verified); its main benefit duplicates §5's invariant. |
| `@react-three/fiber` + `drei` + `@react-three/xr` | All of the above plus a third dependency and a second render-loop owner, expanding T-016's review surface for no capability raw three lacks. |
| Babylon.js | Would replace, not extend, a stack this repo has none of; no measurement taken, so no size claim is made. Rejected on "prefer the smallest arrangement" (`QUALITY.md`), not on measured size. |

### Consequences the implementer must accept

- `OrbitControls` and `GLTFLoader` are imported from `three/examples/jsm/…` and
  are already inside the 159.73 kB figure.
- Peer labels, object pickers and the scene outline are ordinary DOM positioned
  by `camera.project()`, not canvas-drawn text. §8 requires this for
  accessibility in any case.
- `client/src/dimensions/render/projector.ts` is the **only** file permitted to
  mutate an `Object3D`. That rule is what keeps §5's invariant true.

---

## 2. Decision D-5D-PHYSICS — `cannon-es` 0.20.0, stepped on the main thread

**Decision: `cannon-es@0.20.0`, no React bridge library, no worker, fixed
timestep via `world.fixedStep()`.**

### 2.1 Why not rapier

**Verified — measured.** `@dimforge/rapier3d-compat@0.20.0` costs
**1083.72 kB gzip**. That is **4.2× the entire current site entry chunk**
(257.08 kB gzip) for one panel on one page.

**Verified — read it.** The cause is that the `-compat` build base64-inlines its
WebAssembly: `node_modules/@dimforge/rapier3d-compat/dist/rapier_wasm3d_bg.wasm`
is **2,021,200 bytes**, and base64 expands binary by a third while gzip recovers
little of it.

The non-`compat` `@dimforge/rapier3d` emits the `.wasm` as a separate asset, at
**760.40 kB gzip** (Verified — `gzip -9` on the file). That path is also
operationally hazardous on this specific host:

- **Verified — read `/home/srpatcha/agl/www.safecodeg.com/.htaccess`.** There is
  no `AddType` for `.wasm` anywhere in the file. Apache would serve it as
  `application/octet-stream`, and `WebAssembly.instantiateStreaming` rejects on a
  wrong MIME type.
- **Verified — same file.** The `mod_deflate` block lists `text/html`, `text/css`,
  `text/javascript`, `application/javascript`, `application/json`,
  `image/svg+xml`, `font/woff2`, `font/woff`. `application/wasm` is absent, so
  the 2 MB payload would ship **uncompressed**.

Both are fixable with two `.htaccess` lines, but they are latent production
failures introduced for a capability cannon-es delivers at 1/43 the size.

There is also a state-machine cost: `rapier3d-compat` requires
`await RAPIER.init()` before a world exists. That adds an asynchronous
initialisation state to a page whose honesty contract is a state machine (§7).
Fewer states is fewer ways to display something untrue. cannon-es is synchronous.

### 2.2 Why not a purpose-built solver

`QUALITY.md` states "prefer reuse over replacement" and `CLAUDE.md` ranks
correctness first. A hand-written impulse solver with restitution and Coulomb
friction is textbook but has a long correctness tail, and T-007's third criterion
(two impulse magnitudes → two different resting positions) depends on that tail
being right. At **25.16 kB gzip**, cannon-es removes the size argument that would
have justified writing one.

### 2.3 The accepted risk, stated plainly

**Verified — `npm view cannon-es time`.** The last release, 0.20.0, was published
**2022-08-12**. As of 2026-09-05 that is four years without a release.

This is a real finding and T-016 will raise it. It is **accepted**, with these
controls, and the reasoning is recorded so it is not relitigated:

- **Verified** — `cannon-es` declares **zero runtime dependencies**
  (`require('cannon-es/package.json').dependencies` is `{}`). There is no
  transitive surface.
- It is pure JavaScript numerics with no I/O, no parsing of untrusted formats, no
  `eval`, and no network access. The classical stale-dependency risk — an
  unpatched parser or fetch path — has no analogue here. Its inputs are numbers
  this application supplies.
- It is MIT, and published under the `pmndrs` organisation (`maintainers`
  includes `drcmda`, the maintainer of `@react-three/fiber`) — Verified via
  `npm view`. Not deprecated.
- **The one genuine exposure is 6D**: a hostile peer could broadcast values that
  reach physics inputs. §6.5 makes zod validation of every peer payload a hard
  requirement, and physics inputs are clamped to finite ranges before they reach
  the world. That control is required regardless of which engine is chosen.

**Owner of this accepted risk: Security (T-016), to confirm or overturn.** If
overturned, the swap is contained: `client/src/dimensions/physics/sandbox.ts` is
the only file importing `cannon-es`, and the store contract (§5) does not mention
it.

### 2.4 The design conflict this decision resolves

**T-006 and T-007 contain requirements that contradict each other if physics is
part of the 4D timeline, and an implementer would hit the wall without this
paragraph.**

- T-006: setting `t` to a value and returning to it must restore *byte-identical*
  state. That demands a pure, reversible `f(t)`.
- T-007: physics must be a genuine forward integration with path-dependent
  resting positions. A stateful integrator **cannot be scrubbed backwards**.

They are therefore **two separate state domains with two separate clocks**:

- The **4D timeline** is `sceneAt(t)` — pure, reversible, scrubbable. It carries
  the named process/lifecycle simulation.
- The **5D physics sandbox** is forward-only, has its own clock, is **not** wired
  to the scrubber, and is returned to a known state by an explicit **Reset**
  control, never by scrubbing.

The UI must state this rather than hide it: while the physics sandbox is running,
the timeline scrubber is disabled with the visible reason *"the physics sandbox
runs forward only — use Reset to return it to its starting state."* That is the
honesty rule applied to an internal design constraint.

---

## 3. Decision D-6D-TRANSPORT — Supabase Realtime, behind a vendor-neutral swap point

**Decision: Supabase Realtime (presence + broadcast) for the live channel and
Supabase PostgREST for the durable digital twin, reached only through the
`CollaborationTransport` interface in §6.1. Client libraries:
`@supabase/realtime-js` + `@supabase/postgrest-js`, not `@supabase/supabase-js`.**

### 3.1 Why

The single strongest reason: **a WebSocket host has nowhere to run, and choosing
one is a decision to acquire and operate infrastructure that this feature does
not justify.**

- **Verified — read `.github/workflows/deploy.yml:76-81`.** Deployment is
  `rsync -avz --delete … dist/public/ …:~/public_html/` to HostGator shared
  hosting. There is no process host anywhere in this pipeline. The Express/tRPC
  server under `server/` is built by `pnpm run build` and deployed nowhere.
- The existing Decisions table already records "no new always-on host is
  introduced by the plan". A WebSocket server would reverse that decision for one
  page.
- **Verified — ran it this session.** `https://smvvjivvlprjhzhoizym.supabase.co`
  returns **401** on `/rest/v1/`, `/realtime/v1/` and `/auth/v1/health`. 401 rather
  than 404 or a connection failure means the project exists and those paths are
  routed. This is *not* evidence that Realtime is enabled in project settings —
  see §3.4.
- **Verified — read `deploy.yml:52-59`.** The build step already injects `VITE_*`
  variables. Adding `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` requires two
  lines in an existing `env:` block and no pipeline change. The pattern is
  already established at `client/src/const.ts:5-6` and
  `client/src/components/Map.tsx:89-91`.
- The digital-twin half of T-010 needs durable storage. A WebSocket host would
  still need a database behind it, so the WebSocket option is strictly additive
  work, not an alternative to Supabase.

### 3.2 Why `realtime-js` + `postgrest-js` rather than `supabase-js`

**Verified — measured.** `@supabase/supabase-js` costs **58.02 kB gzip**;
`@supabase/realtime-js` + `@supabase/postgrest-js` together cost **22.36 kB gzip**.
The difference is `auth-js`, `storage-js` and `functions-js` — three subsystems
this feature never calls (Verified: `supabase-js`'s declared dependencies are
`auth-js`, `postgrest-js`, `storage-js`, `realtime-js`, `functions-js`).

Saving 35.66 kB gzip matters less than the second effect: **T-016 must review
every new dependency per `SECURITY.md`.** Not shipping an auth client and a
storage client to a page that authenticates nobody and stores no files removes
them from that review entirely.

### 3.3 The tradeoff the Planner flagged, and what it actually is

The Planner's note — that with Supabase, "6D correctness rests on RLS policies
rather than server code we control" — is correct but **understates the exposure in
one specific way that T-009 and T-016 must not miss**:

> **Row Level Security does not inspect broadcast payloads.** RLS governs rows in
> Postgres. Supabase Realtime *broadcast* and *presence* messages are relayed
> between clients; Realtime Authorization gates **who may join a channel**, not
> what they may put in a message. A peer that can join can send arbitrary JSON.

Therefore, client-side validation of every peer payload is **mandatory and
load-bearing**, not defence in depth. §6.5 specifies it. This is an architectural
requirement, not an implementation preference.

Three further consequences, each recorded as an accepted property rather than
discovered later:

1. **The shared stage is a public sandbox and must be labelled as one.** With an
   anon key and no authentication, anyone who can load the page can move objects
   and can reset the twin. There is no per-user data, so there is nothing to
   leak — but there is something to vandalise. The UI says so in plain words.
   *Rejected alternative:* Supabase anonymous auth with per-room ownership
   policies. Rejected because it adds `@supabase/auth-js` (part of the 35.66 kB
   just removed), a user-identity concept this feature has no use for, and an
   auth surface for T-016 — to protect a public demo stage with no private data.
   Revisit only if OQ-2 resolves to something with real-world effect.
2. **6D is opt-in.** Joining is an explicit user action (§6.3). This is a privacy
   requirement — presence broadcasts your existence — and it is also what keeps
   every visitor to `/dimensions` from opening a WebSocket against a plan whose
   concurrency limits are unverified (§3.4).
3. **Blast radius is bounded client-side**: op rate per actor, total object count,
   and rejection of any `objectId` not present in the authored model. A peer
   cannot invent objects, cannot flood, and cannot grow the twin without bound.

### 3.4 Preconditions T-009 must verify first, and must not assume

**NOT VERIFIED, and I could not verify them — I have no anon key.** Each is a
precondition, with the check that settles it:

| Unverified | The check that settles it |
|---|---|
| Realtime is enabled for project `smvvjivvlprjhzhoizym` | Open a channel with the anon key and observe `SUBSCRIBED`; a disabled project fails to subscribe. |
| The plan's concurrent-connection and message-rate limits | Supabase dashboard → project usage. Record the numbers in T-009's Notes. |
| Realtime Authorization is required for this project's channel | Attempt to join with the anon key; if rejected, an RLS policy on `realtime.messages` is needed and T-009 must add it. |

A **401 is not evidence that Realtime is enabled.** It is evidence the host exists
and routes the path. No claim beyond that is supported.

### 3.5 Alternatives rejected

| Rejected | Why |
|---|---|
| A dedicated WebSocket host | No deploy target exists (Verified, §3.1); would reverse a recorded decision; would still need a database for the twin. |
| WebRTC data channels, peer-to-peer | Still requires a signalling server and a TURN relay — the same "nowhere to run it" problem, plus NAT traversal, plus no durable twin. |
| `@supabase/supabase-js` | +35.66 kB gzip and three unused subsystems added to T-016's review (Verified, §3.2). |
| A CRDT library (Yjs, Automerge) | No stated requirement for text merging or intention preservation. §6.4's last-writer-wins register converges in ~15 lines. `QUALITY.md`: do not design for hypothetical requirements. |

---

## 4. Decision D-5D-AI — **OPEN**, seam specified, policy left to the user

**This decision is deliberately not resolved.** OQ-1 is with the user, and the
three options (Supabase Edge Function proxy, in-browser model, in-browser solver)
produce materially different builds and different deployment surfaces. Choosing
one here would pre-empt a choice that is the user's to make.

**What is decided is the seam**, so T-008 can begin the day OQ-1 is answered
without a structural question, and so that whichever answer arrives, the honesty
requirement is enforced by the type system rather than by copy review:

```ts
// client/src/dimensions/ai/types.ts
export interface SolverDisclosure {
  /** e.g. "A* pathfinding solver" or "Llama-3.2-1B-Instruct" — never a category word. */
  name: string;
  kind: "in-browser-solver" | "in-browser-model" | "remote-endpoint";
  /** e.g. "runs in this browser tab" or "https://<ref>.functions.supabase.co/scenario" */
  where: string;
}

export interface ScenarioSolver {
  readonly id: string;
  /** Rendered verbatim by the UI. The panel has no other source of self-description. */
  readonly disclosure: SolverDisclosure;
  solve(input: ScenarioInput, signal: AbortSignal): Promise<ScenarioResult>;
}
```

T-008's third criterion — "the UI states plainly what the AI is … so a visitor is
not told a solver is an LLM or vice versa" — becomes structural: the panel renders
`disclosure` and has no other string to render. It cannot drift from the truth,
because there is nowhere for a marketing adjective to live.

**Impact of each answer on this architecture** (so the user's choice is informed):

| OQ-1 answer | Owner | Bundle | Deployment |
|---|---|---|---|
| In-browser solver (Planner default) | frontend | small; own chunk | none — ships through the existing rsync |
| In-browser model | frontend | large model download; must be a separate lazy chunk and must not enter the entry chunk | none, but see the entry-chunk budget in §9 |
| Supabase Edge Function proxy | backend | ~0 client | **adds `supabase functions deploy` outside the rsync pipeline.** `DEPLOYMENT.md` must gain a step; T-017's fifth criterion covers this. |

**What this seam forecloses: nothing among the three.** All three implement
`ScenarioSolver`. The remote-endpoint option is the only one with a deployment
consequence, and it is named above rather than discovered during T-017.

---

## 5. The shared scene and state model — the core design

Everything else composes correctly only if this part is right.

### 5.1 The invariant

> **The authoritative state is a plain, JSON-serializable object. No `three`
> object appears in it. The scene graph is a derived projection of that state,
> and `render/projector.ts` is the only file that mutates an `Object3D`.**

This one rule is what makes the five layers compose instead of becoming five
separate demos. Each layer needs it for a different reason:

| Layer | Why it needs state outside the scene graph |
|---|---|
| 4D | `sceneAt(t)` must be pure and reversible. `Object3D` accumulates; a pure function cannot live inside it. |
| 5D | Physics writes transforms; a raycast writes selection. Both need one place to write. |
| 6D | State must go on the wire and into a database row. `Object3D` holds matrices, parent pointers and cyclic references, and does not serialize. |
| 7D | The same state renders into an `XRSession`. If it lived in the scene graph, the XR path would fork. |
| Tests | T-005 … T-012 read state through a hook with no GPU involved. |

The inverse is the failure mode this design exists to prevent: if state lives in
the scene graph, 4D scrubbing becomes a property of animation code rather than of
a function, 6D has nothing serializable to send, and every level is written
twice.

### 5.2 Types

```ts
// client/src/dimensions/state/types.ts
export type ObjectId = string & { readonly __objectId: unique symbol };
export type ActorId  = string & { readonly __actorId:  unique symbol };

export interface Vec3 { x: number; y: number; z: number }
export interface Quat { x: number; y: number; z: number; w: number }

export interface SceneObject {
  id: ObjectId;
  /** Key into the model's geometry registry. Never a URL, never a three object. */
  kind: string;
  position: Vec3;
  rotation: Quat;
  scale: Vec3;
  visible: boolean;
  /** 4D lifecycle stage this object belongs to; null = present in every stage. */
  stage: string | null;
  /** Accessible name. Required, never empty — §8 renders it as a real control. */
  label: string;
  /** 6D last-writer-wins register. Both fields move together or neither does. */
  rev: { seq: number; actorId: ActorId | null };
}

export interface SceneState {
  /** Increments on every committed change. The test hook and the throttled
   *  snapshot writer both use it to detect "nothing happened". */
  revision: number;
  /** 4D simulation time in seconds, quantised (§5.5). */
  t: number;
  objects: Readonly<Record<string, SceneObject>>;
  /** 5D */
  selection: ObjectId | null;
  /** 4D, sourced from the process model — never hand-written in the UI. */
  stages: readonly StageDescriptor[];
  /** 6D. Empty until the user joins. */
  actors: Readonly<Record<string, ActorPresence>>;
}
```

### 5.3 Composition — one pure function, a fixed pipeline

Not a plugin system, not a registry. Five named steps in a fixed order, in one
file, so the merge is deterministic and "which layer last wrote this object" is
always answerable:

```ts
// client/src/dimensions/state/compose.ts
export interface ComposeInput {
  model: ProcessModel;                       // authored baseline
  t: number;                                 // 4D
  physics: PhysicsSnapshot | null;           // 5D, forward-only
  interaction: InteractionState;             // 5D  (selection, scenario inputs)
  remote: RemoteState;                       // 6D  (peer ops + presence)
}

/** Pure. Same input object graph ⇒ structurally identical output, every time. */
export function composeScene(input: ComposeInput): SceneState;
```

Order and ownership, both fixed:

1. **baseline** — `model.objects`. Owns every id in the authored model.
2. **timeline (4D)** — `timelineAt(model, t)`. Overrides `visible` and transforms
   for ids the current stages address.
3. **physics (5D)** — owns only ids prefixed `phys:`. It never touches an
   authored id, which is what keeps the 4D timeline pure.
4. **interaction (5D)** — owns `selection` and scenario-derived transforms.
5. **presence (6D)** — applied last, per-object, and **only when it wins the
   comparison in §6.4**. Applied last because a remote peer's committed change is
   the most recent fact about a shared object.

### 5.4 The store

**Decision: a hand-written external store on React 19's `useSyncExternalStore`.
No Redux, no Zustand, no Jotai — zero new dependencies.**

`useSyncExternalStore` is part of React 19.2.1, already installed (Verified —
`package.json` declares `"react": "^19.2.1"`). `@tanstack/react-query` is present
but is a server-cache library and is the wrong tool for a 60 fps simulation.

The performance contract, which is not optional:

- **The render loop never reads React state.** Each frame calls
  `store.getSnapshot()` directly. A 60 fps `setState` would re-render the tree 60
  times a second.
- **React subscribes only to UI-relevant slices** via `useSyncExternalStore` with
  a selector: `selection`, participant count, transport status, XR state,
  live-data status, and the displayed `t`. These change at human speed.
- Writes are batched per frame and commit once, incrementing `revision`.

### 5.5 4D determinism — the two rules and the one mechanism

T-006 requires that `t = 0.5` reached by dragging and `t = 0.5` set by a direct
control produce **byte-identical** state. That is unachievable by accident, and
an implementer who does not read this section will not be able to satisfy the
criterion. Three things make it true:

1. **Quantise `t` on every write.** `t = Math.round(tRaw / STEP) * STEP` with
   `STEP = 1/120` s. Both the scrubber and the direct control write through the
   same setter, so both land on the same lattice. `0.5 = 60/120` is on it.
2. **Never accumulate.** Playback computes `t = tAtPlay + (now - wallClockAtPlay) / 1000`
   and then quantises. `t += dt` drifts and is banned in the timeline layer.
3. **No non-determinism in the timeline layer.** `client/src/dimensions/model/timeline.ts`
   must contain no `Math.random()`, no `Date.now()`, no `performance.now()`.
   Checkable: `grep -nE "Math\.random|Date\.now|performance\.now" client/src/dimensions/model/timeline.ts`
   returns nothing. If jitter is ever wanted, use a PRNG seeded on
   `(objectId, t)` — deterministic by construction.

### 5.6 The 4D model data

```ts
// client/src/dimensions/model/process.ts
export interface StageDescriptor {
  id: string;
  /** Rendered in the UI. T-006 compares rendered labels against this list. */
  label: string;
  startsAt: number;   // seconds
  endsAt: number;
  objectIds: readonly ObjectId[];
}

export interface ProcessModel {
  id: string;
  /** The named lifecycle/process — T-006 requires it be named in the UI. */
  label: string;
  duration: number;
  stages: readonly StageDescriptor[];
  objects: Readonly<Record<string, SceneObject>>;
  keyframes: Readonly<Record<string, readonly Keyframe[]>>;
}

/** PURE. Reads only (model, t). */
export function timelineAt(model: ProcessModel, t: number): TimelineSlice;
```

The stage labels the UI renders come from `model.stages`, never from a separate
string table. That is what makes T-006's "each stage shown corresponds to a stage
in the model data" structurally true rather than a thing to remember.

### 5.7 The 3D model asset

**It must be a runtime fetch, not a bundled import.** T-005 requires stubbing the
model request to a 500 via `page.route` and observing an error state — which is
only possible if a network request exists.

- Location: `client/public/models/<name>.glb`. Vite's `publicDir` is
  `client/public` (Verified — `vite.config.ts` sets
  `publicDir: path.resolve(import.meta.dirname, "client", "public")`), so the
  file is copied verbatim to `dist/public/models/` and is never processed by the
  bundler.
- Loaded by `GLTFLoader`, which reads an `ArrayBuffer` and does not depend on the
  response MIME type — so no `.htaccess` change is needed for `.glb`.
- T-005 requires the asset's provenance in its Notes. Whoever adds the file
  records where it came from and under what licence.

---

## 6. 6D — the swap-point interface

### 6.1 The contract T-010 codes against

`client/src/dimensions/transport/types.ts` — **zero vendor imports**. No Supabase
type appears in it, ever.

```ts
export type TransportStatus =
  | { kind: "unconfigured"; reason: string }        // no anon key in this build
  | { kind: "idle" }                                // configured, never joined
  | { kind: "connecting" }
  | { kind: "connected"; since: number }
  | { kind: "reconnecting"; attempt: number; lastError: string }
  | { kind: "disconnected"; reason: string };

export interface ActorPresence {
  actorId: ActorId;
  displayName: string;   // never empty — this is an accessible name (§8)
  colorHex: string;
  joinedAt: number;
  lastSeenAt: number;
}

/** One authored change to one shared object. Serializable; idempotent by opId. */
export interface SceneOp {
  opId: string;
  objectId: ObjectId;
  actorId: ActorId;
  /** Per-object logical counter: prevSeqForThisObject + 1. Not a wall clock. */
  seq: number;
  /** Advisory display only. Never used for ordering — peer clocks are untrusted. */
  at: number;
  patch: Partial<Pick<SceneObject, "position" | "rotation" | "scale" | "visible">>;
}

export interface SceneSnapshot {
  objects: Record<string, SceneObject>;
  revision: number;
  savedAt: number;
}

export interface CollaborationTransport {
  readonly status: TransportStatus;

  /** Explicit user action only. MUST NOT be called on mount. */
  join(roomId: string, self: Pick<ActorPresence, "actorId" | "displayName" | "colorHex">): Promise<void>;
  leave(): Promise<void>;

  /** Resolves when the op is handed to the wire, not when a peer acknowledges it. */
  publish(op: SceneOp): Promise<void>;

  /** Digital twin. loadSnapshot runs once after join; saveSnapshot is throttled. */
  loadSnapshot(roomId: string): Promise<SceneSnapshot | null>;
  saveSnapshot(roomId: string, snapshot: SceneSnapshot): Promise<void>;

  /** Each returns its own unsubscribe function. */
  onOp(cb: (op: SceneOp) => void): () => void;
  onPresence(cb: (actors: readonly ActorPresence[]) => void): () => void;
  onStatus(cb: (status: TransportStatus) => void): () => void;
}
```

### 6.2 The swap point, and how it is enforced

```
client/src/dimensions/transport/
  types.ts               ← the contract above. ZERO vendor imports.
  index.ts               ← createTransport(): CollaborationTransport   ← SWAP POINT
  supabaseTransport.ts   ← THE ONLY FILE IN THE REPO THAT IMPORTS @supabase/*
  nullTransport.ts       ← reports { kind: "unconfigured" }; never connects
  loopbackTransport.ts   ← BroadcastChannel; dev + unit tests for merge.ts
  merge.ts               ← §6.4, pure, no transport knowledge
```

`index.ts` selects an implementation from build-time env and is the only line
that changes when the transport changes:

```ts
export function createTransport(): CollaborationTransport {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return createNullTransport("This build has no shared-session configuration.");
  }
  return createSupabaseTransport(url, key);
}
```

Changing transport = write one file implementing `CollaborationTransport`, change
one line here. T-010 imports from `./types` and `./index` and from nothing else.

**Enforceable acceptance criterion for T-009 and T-016** — this is the criterion
that keeps the swap point real rather than nominal:

```
grep -rn "@supabase" client/src --include=*.ts --include=*.tsx
```

returns matches **only** in `client/src/dimensions/transport/supabaseTransport.ts`.

### 6.3 Joining is an explicit user action

`join()` is called from a control labelled *"Join the shared stage"*, never from
an effect on mount. Three reasons, all load-bearing:

1. **Honesty.** Before you join, the UI says *"You are working alone — the shared
   stage is not connected."* That is true, and it is the default state.
2. **Privacy.** Presence broadcasts your existence to strangers. That needs an
   act, not a page load.
3. **Quota.** §3.4 records that concurrency limits are unverified. Every visitor
   to `/dimensions` opening a socket is how an unverified limit becomes an outage.

This also puts the 6D payload (22.36 kB gzip) behind its own dynamic import (§9).

### 6.4 Conflict resolution — last-writer-wins register, per object

```ts
// client/src/dimensions/transport/merge.ts
/** Total order per object. Deterministic on every peer, so all peers converge. */
export function opWins(op: SceneOp, current: SceneObject["rev"]): boolean {
  if (op.seq !== current.seq) return op.seq > current.seq;
  return (op.actorId as string) > ((current.actorId ?? "") as string);  // stable tiebreak
}
```

`seq` is a per-object logical counter (`prevSeq + 1`), not a per-actor counter and
not a clock — peer wall clocks are untrusted, which is why `SceneOp.at` is marked
advisory. Ties break on `actorId` string comparison, which is total and identical
on every peer, so all peers converge on the same state.

**Local input priority.** While the local user is dragging object X, incoming ops
for X are held and dropped at drag end. Three lines, and it prevents the visual
fight that two simultaneous drags otherwise produce. It is input priority, not a
lock protocol — no coordination, no failure mode when a peer disappears.

### 6.5 Peer payloads are an untrusted boundary — mandatory validation

Per §3.3, **RLS does not inspect broadcast payloads**. Every inbound `SceneOp`
and every `ActorPresence` is parsed with a `zod` schema before it reaches the
store. `zod@4.1.12` is already installed (Verified — `package.json`).

The schema enforces, and a rejected message is dropped and counted, never applied:

- `objectId` **is a member of the authored model's id set** — a peer cannot invent
  objects, so the object count cannot grow without bound.
- Every numeric field is finite and within a stated range. `NaN` and `Infinity`
  are rejected before they can poison the physics integrator or the projector.
- `displayName` is length-capped and rendered **as a text node, never as HTML**.
  It is attacker-controlled and reaches the DOM; `SECURITY.md` requires output
  escaped for its destination context.
- Op rate per `actorId` is capped; the excess is dropped.

T-016 reviews this path. It is the highest-value control in the 6D layer.

### 6.6 Durable twin

- One row per room in a Supabase table, holding `SceneSnapshot`.
- `saveSnapshot` is throttled (at most one write per 2 s, and only when
  `revision` changed), plus a flush on `pagehide` and `visibilitychange` using
  `fetch(..., { keepalive: true })` — `navigator.sendBeacon` cannot set the
  `apikey` and `Authorization` headers PostgREST requires.
- The flush-on-exit is what makes T-010's third-context criterion pass: the third
  browser reads the row the first two left behind.
- `loadSnapshot` runs once after `join`, before any op is applied.

### 6.7 Developing and testing without an anon key

The brief requires this, and the honest split is:

| Testable now, no key | Blocked on the key |
|---|---|
| `merge.ts` convergence — unit tests, both orderings, ties. Pure function. | T-010's two-`browser.newContext()` synchronisation test |
| Payload validation — malformed, hostile, `NaN`, unknown ids | T-010's presence-count test |
| Every `TransportStatus` UI state, driven by a stub transport | T-010's third-context digital-twin test |
| The `unconfigured` state end-to-end via `nullTransport` | T-009 entirely (migration, RLS, negative test) |
| Cross-tab behaviour in dev via `loopbackTransport` | |

**`loopbackTransport` is a development aid and a unit-test fixture. It is not a
substitute for the T-010 acceptance test and must never be used to make that test
pass.** `BroadcastChannel` does not cross Playwright `browser.newContext()`
boundaries, and even if it did, a test that passes over an in-browser channel
would prove nothing about the shipped transport. Until the anon key exists,
**T-010's two-context criterion is reported NOT RUN with "no Supabase anon key
available" as the reason** — per the recorded decision that a capability which
cannot be genuinely delivered is reported NOT RUN, never simulated.

---

## 7. Decision D-7D-DETECT — the capability probe and the exhaustive UI states

### 7.1 What is probed, in this order

```ts
// client/src/dimensions/xr/detect.ts
export type XrUiState =
  | "no-webgl" | "no-webxr" | "quicklook-only" | "no-device"
  | "blocked-by-policy" | "ar-only" | "vr-only" | "ar-and-vr"
  | "session-rejected" | "session-running";

export async function probeXR(): Promise<XrCapability>;
```

1. **WebGL** — `canvas.getContext("webgl2") ?? canvas.getContext("webgl")`. Null ⇒
   `no-webgl`; stop. Everything else depends on it.
2. **`navigator.xr`** — absent ⇒ probe AR Quick Look, then `quicklook-only` or
   `no-webxr`.
3. **Session support** — `navigator.xr.isSessionSupported("immersive-vr")` and
   `…("immersive-ar")`, probed **independently**, each wrapped so a rejection is
   caught.
4. **AR Quick Look** — `document.createElement("a").relList.supports("ar")`.

**A rejected `isSessionSupported` is not `false`.** It rejects (typically
`SecurityError`) when a permissions policy blocks the feature, and reporting that
as "your browser doesn't support it" would be a false statement about the
visitor's browser. It maps to its own state, `blocked-by-policy`, which names the
page's policy as the cause.

That distinction is not hypothetical here. **Verified — read
`/home/srpatcha/agl/www.safecodeg.com/.htaccess:51`:**

```
Header always set Permissions-Policy "camera=(), microphone=(), geolocation=(self)"
```

**Inferred, not verified — I have no XR device and could not test this.** The
WebXR permissions-policy feature is `xr-spatial-tracking`, and a feature omitted
from a `Permissions-Policy` header keeps its default allowlist (`self`), so this
header should not block same-origin WebXR; plain `immersive-ar` passthrough is
not gated on the `camera` feature, which gates raw camera *access*. **This is
reasoning, not a measurement.** T-012 must verify it on a real Android Chrome
device, and if AR is blocked, the remedy is one line appended to that header:
`, xr-spatial-tracking=(self)`. The `blocked-by-policy` state exists so that a
visitor is told the truth in the meantime rather than being told their device is
at fault.

### 7.2 The exhaustive state table

Every row renders, every row is truthful, and T-012 covers every row.

| State | Condition | What `[data-testid="xr-status"]` says | What renders |
|---|---|---|---|
| `no-webgl` | No WebGL context | "3D is unavailable: this browser or device did not provide a WebGL context." | No canvas. Static HTML fallback: the model's stage list and object labels as real text. No XR controls. |
| `no-webxr` | WebGL ok; no `navigator.xr`; no Quick Look | "Immersive AR and VR are not available in this browser. The 3D stage below is fully interactive." | 3D scene. XR control **absent**, not disabled-but-present. |
| `quicklook-only` | No `navigator.xr`; `relList.supports("ar")` | "This browser has no WebXR. Apple's AR Quick Look is available — open the model in AR." | 3D scene + a real `<a rel="ar" href="/models/<name>.usdz">` |
| `no-device` | `navigator.xr` present; both `isSessionSupported` false | "WebXR is present in this browser, but no immersive VR or AR device was detected." | 3D scene; XR control absent |
| `blocked-by-policy` | `isSessionSupported` rejected | "Immersive sessions are blocked by this page's permissions policy." | 3D scene; XR control absent; reason named |
| `ar-only` | ar true, vr false | "Immersive AR is available on this device." | 3D scene + "Enter AR" |
| `vr-only` | vr true, ar false | "Immersive VR is available on this device." | 3D scene + "Enter VR" |
| `ar-and-vr` | both true | "Immersive AR and VR are available on this device." | 3D scene + both |
| `session-rejected` | `requestSession` rejected | "The immersive session did not start: \<reason from the rejection\>." | 3D scene; control re-enabled |
| `session-running` | live `XRSession` | "Immersive \<ar\|vr\> session is running." | Headset render; page shows an exit control |
| — | session ended | reverts to `ar-only`/`vr-only`/`ar-and-vr` | 3D scene restored |

**The rule T-012 asserts:** the affirmative strings — `in VR`, `XR active`,
`immersive session running`, `connected` — appear in the DOM in **`session-running`
and nowhere else**. That is the user's honesty requirement expressed as one
assertion.

Note that `quicklook-only` describes AR Quick Look as Apple's AR viewer, by name.
It is real AR and is presented as its own path, not as a consolation for missing
WebXR and not as something this page implements.

### 7.3 Session management

- `renderer.xr.enabled = true`; `await renderer.xr.setSession(session)`.
- The **existing** `renderer.setAnimationLoop(cb)` then serves both paths —
  Verified at `node_modules/three/src/renderers/WebGLRenderer.js:1584`. One loop,
  one projector, one store. This is §1.1 paying off.
- `session.addEventListener("end", …)` restores the non-immersive scene and the
  pre-session `xrUiState`.
- **XR is additive, never a gate.** The non-immersive 3D scene is fully usable in
  every state above. No control is hidden because XR is unavailable.

### 7.4 The USDZ asset — one deployment note

- Location: `client/public/models/<name>.usdz` ⇒ `dist/public/models/<name>.usdz`.
  T-012 checks it with `curl -I` returning 200, so it must be a static file, not
  a bundled import.
- **`.htaccess` needs `AddType model/vnd.usdz+zip .usdz`.** *(Verified: no
  `AddType` directive of any kind exists in the current `.htaccess`. Inferred:
  stock Apache `mime.types` has no `.usdz` entry, and iOS Quick Look is
  MIME-sensitive.)* This is the **only** deployment change this architecture
  requires, and T-017's fifth criterion should record it. `.glb` needs nothing —
  `GLTFLoader` reads an `ArrayBuffer` and ignores the response MIME type.
- Both files must be edited in **`client/public/.htaccess`**, which is what
  reaches `dist/public/`. The repo-root `.htaccess` is a byte-identical copy
  (Verified — `diff` reports no difference); keep them in step.

---

## 8. Accessibility contract — reduced motion and keyboard

`QUALITY.md:46` forbids ignoring an accessibility issue. A WebGL canvas is an
opaque rectangle to assistive technology, so the contract is not "make the canvas
accessible" — it is **"the accessible interface is a parallel DOM tree that reads
and writes the same store."**

### 8.1 `prefers-reduced-motion: reduce`

| Behaviour | Under `reduce` |
|---|---|
| 4D autoplay | **Does not start.** The timeline stays fully operable by direct control. (T-006 criterion.) |
| Render loop | **Invalidation-driven.** Renders only when `revision` changed or an interaction is in flight; stops when the interaction settles. No ambient drift, no auto-orbit. |
| Physics sandbox | Does not auto-start. Requires the explicit **Run** control. |
| Camera | `OrbitControls.enableDamping = false` — discrete steps, no easing. |
| Framer Motion page chrome | The library respects the media query; no bespoke handling. |

Observable in the DOM, which T-004 requires: `[data-testid="motion-mode"]` reads
`reduced` or `full`, and `getRenderStats().frame` stops increasing within 500 ms
of the last input. That gives T-004 its "reaches a settled state" assertion a
concrete meaning.

The default (no `reduce`) render loop is invalidation-driven too, with continuous
frames only while an interaction, playback, or the physics sandbox is active.
Idling at 60 fps on a marketing site is a battery cost with no benefit.

### 8.2 Keyboard

- The canvas takes `tabindex="0"`, an `aria-label` naming what it shows, and
  `aria-describedby` pointing at a text summary of the current scene.
- **An explicit focus ring on the canvas.** A canvas under a CSS reset frequently
  loses its default outline; this must be styled deliberately, not assumed.
- **`a11y/SceneOutline.tsx` is the real interface.** Every selectable object is a
  real `<button>` in a list, with `SceneObject.label` as its accessible name and
  `aria-pressed` reflecting selection. Selecting by raycast and selecting from the
  list write the same `selection` state. This is why `label` is non-optional in
  `SceneObject`.
- **Camera keys, while the canvas has focus:** arrows orbit, `+`/`-` and
  `PageUp`/`PageDown` dolly, `Home` resets. Each keypress produces a discrete,
  measurable camera delta — this is exactly what T-005's "keyboard controls move
  and orbit the camera, asserted by the same position delta" tests.
- **The key handler binds to the canvas element, not to `window`**, so it never
  hijacks page scrolling when the canvas is not focused.
- **6D peer labels are real `<button>` elements** in a DOM overlay positioned by
  `camera.project()`, each with the peer's `displayName` as its accessible name.
  This satisfies T-010's last criterion and is a further reason §1 rejected
  drei's `<Html>`.
- **`a11y/LiveRegion.tsx`** — one `aria-live="polite"` region announcing selection
  changes, XR state transitions, transport status changes and live-data errors.
  Throttled, so it informs rather than floods.

---

## 9. Decision D-SPLIT — the code-split boundary

### 9.1 Starting conditions

- Entry chunk today: `dist/public/assets/index-Cp_awnwx.js`, **936,809 bytes raw**
  (Verified — `ls -la`), 257.08 kB gzip (per the baseline recorded in `TASKS.md`).
- **Verified — ran it.** `grep -rn "import(" client/src` over `.ts`/`.tsx` returns
  **0**. There is not one dynamic import in the client today, which is why the
  build emits a single chunk.
- **Verified — read `vite.config.ts`.** No `rollupOptions`, no `manualChunks`.
  Vite's default behaviour — split at every dynamic import — is intact and unused.

### 9.2 The boundary

```
client/src/App.tsx
 └─ <Route path="/dimensions" component={DimensionsPage} />
      client/src/pages/Dimensions.tsx        ← STATIC. In the entry chunk.
        · Navigation, Footer, page chrome, headings
        · the capability matrix and every honest-degradation panel
        · imports @/dimensions/contract (types + level constants) — zero cost
        └─ const Stage = lazy(() => import("@/dimensions/DimensionsStage"))
             ← THE ONLY dynamic import for this feature.
               three, cannon-es, @supabase/*, XR, projector, store:
               reachable ONLY through here.
```

### 9.3 The rule that keeps the boundary from rotting

> **Outside `client/src/dimensions/`, the only permitted references into it are
> (a) `import type`, (b) `@/dimensions/contract`, and (c) the single
> `lazy(() => import("@/dimensions/DimensionsStage"))` call in
> `client/src/pages/Dimensions.tsx`.**

`client/src/dimensions/contract.ts` **has zero imports of its own** — it is types
plus a handful of string constants, so it may safely enter the entry chunk. That
zero-import property is what makes it safe, and it is grep-checkable, so state it
as an acceptance criterion rather than a convention.

Two greps enforce the whole rule, and belong in T-004 and T-015:

```bash
# (1) No non-type import reaches into @/dimensions except contract.
grep -rn "from ['\"]@/dimensions/" client/src --include=*.ts --include=*.tsx \
  | grep -v "^client/src/dimensions/" \
  | grep -v "@/dimensions/contract" \
  | grep -v "import type"
# must return nothing

# (2) Exactly one dynamic import, in exactly one file.
grep -rn "import(" client/src --include=*.ts --include=*.tsx | grep dimensions
# must return exactly one line, in client/src/pages/Dimensions.tsx
```

A single careless `import { SceneState } from "@/dimensions/state/types"` without
`import type` is all it takes to pull three.js into the entry chunk and add
~159.73 kB gzip to every page on the site. That is the failure this rule exists
to catch, and it is why the check is mechanical.

### 9.4 Sub-splits — three chunks, not one

| Chunk | Contains | Loaded when | Third-party gzip |
|---|---|---|---|
| `vendor-three` + `DimensionsStage` | three, GLTFLoader, OrbitControls, projector, store, 3D + 4D + 7D | on entering `/dimensions` | **159.73 kB** |
| `vendor-physics` | cannon-es + the 5D sandbox | first time the 5D panel is opened | **25.16 kB** |
| `vendor-collab` | realtime-js, postgrest-js, the transport adapter | when the user clicks **Join the shared stage** (§6.3) | **22.36 kB** |

Third-party total for the chosen stack: **207.26 kB gzip**, of which only 159.73 kB
loads on route entry. The rejected stack (R3F + drei + rapier + supabase-js) totals
**1431.30 kB gzip** — **6.9×** (Verified — arithmetic on §0).

7D needs no chunk of its own: raw three has WebXR built in (§1.1).

### 9.5 `manualChunks` — five lines in `vite.config.ts`, for testability

T-015 requires the 3D, physics, XR and transport payloads each be "shown to live
in non-entry chunks, by filename". Default splitting gives hashed names derived
from module paths; naming the vendor groups explicitly makes those assertions
robust:

```ts
build: {
  outDir: path.resolve(import.meta.dirname, "dist/public"),
  emptyOutDir: true,
  rollupOptions: {
    output: {
      manualChunks(id) {
        if (id.includes("node_modules/three")) return "vendor-three";
        if (id.includes("node_modules/cannon-es")) return "vendor-physics";
        if (id.includes("node_modules/@supabase")) return "vendor-collab";
      },
    },
  },
},
```

Chunk filenames then begin `vendor-three-`, `vendor-physics-`, `vendor-collab-`,
which every `page.on("request")` filter in T-004, T-013 and T-015 can match on
prefix.

**Footgun, stated because it is the usual mistake:** do **not** add a catch-all
`if (id.includes("node_modules")) return "vendor"`. That creates one shared vendor
chunk that the entry imports, which every route then loads — the opposite of the
goal. Only the three groups above, all of which are reachable solely from the lazy
graph, may be named.

### 9.6 The entry-chunk budget

T-004 and T-015 cap the entry chunk at **≤ 270 kB gzip** against a **257.08 kB**
baseline. Headroom: **12.92 kB gzip**.

What this feature adds to the entry chunk (**Inferred** — these are estimates from
comparable source sizes in this repo, not measurements; T-015 measures the truth):

| Addition | Est. gzip |
|---|---|
| `pages/Dimensions.tsx` route shell + degradation panels | ~2 kB |
| `dimensions/contract.ts` | <0.5 kB |
| T-013 Home teaser + AGL card | ~1.5 kB |
| T-014 level badge + filter on Products | ~0.8 kB |
| Navigation entry, `lazy`/`Suspense` | ~0 (React 19 already present) |
| **Total** | **~5 kB** |

That fits, with margin — **provided §9.3 holds.** `framer-motion` and
`lucide-react` are already in the entry chunk, so the new page reusing them costs
nothing extra.

### 9.7 The Home teaser without the 3D payload (T-013)

T-013 requires the teaser on `/` to name all five levels and to issue **zero**
requests for the 3D chunk. The teaser is therefore **static markup only**:

- Five cards, one per level, with a CSS-transform depth motif — no WebGL, no
  canvas.
- One inline SVG isometric wireframe, a few hundred bytes, part of the HTML.
- **The copy does not overstate what it is.** The CTA reads *"Open the live 3D–7D
  stage"* — it points at the live thing. It never says "3D preview", because a
  static SVG is not a preview of a 3D scene, and calling it one is precisely the
  small lie this feature exists to avoid.
- **No `rel="prefetch"` or `rel="modulepreload"` for the 3D chunk on `/`.** Vite
  does not emit preload links for lazy chunks automatically, and adding one by
  hand would break T-013's zero-request criterion. If warm-up is wanted later, it
  belongs on the `/dimensions` route shell, after that route has loaded — never on
  `/`.

Routes that must never request the three chunks: `/`, `/products`,
`/products/:slug`, `/agl` (and `/american-group-llc`, which resolves to the same
component — Verified at `client/src/App.tsx:24-25`).

---

## 10. Decision D-HOOK — the scene test hook

T-005 … T-012 assert against a hook that must be specified before any of them can
be written.

### 10.1 Name and shape

Global name: **`window.__AGL_DIMENSIONS__`**.

```ts
// client/src/dimensions/state/testHook.ts
export interface DimensionsTestHook {
  /** false until the first frame has rendered. Tests await this. */
  readonly ready: boolean;
  /** The authoritative store snapshot (§5.2). */
  getState(): SceneState;
  /** From three's renderer.info. null before the first frame. */
  getRenderStats(): { frame: number; calls: number; triangles: number; programs: number } | null;
  getCamera(): { position: Vec3; target: Vec3; distance: number };
  /** null until the 5D physics chunk has loaded. */
  getPhysics(): { steps: number; bodies: Record<string, { position: Vec3; velocity: Vec3 }> } | null;
  getTransport(): {
    status: TransportStatus; actorCount: number;
    actors: readonly ActorId[]; opsApplied: number; opsRejected: number;
  };
  getXR(): {
    state: XrUiState; supported: { vr: boolean; ar: boolean } | null;
    sessionMode: "immersive-ar" | "immersive-vr" | null; xrFrames: number;
  };
  getLiveData(): {
    source: string; status: "idle" | "loading" | "ok" | "error";
    fetchedAt: number | null; value: unknown; error: string | null;
  };
}
```

### 10.2 When it is populated

Assigned synchronously in `DimensionsStage`'s mount effect, before the first
frame, with `ready === false`. `ready` flips true after the first successful
render. Deleted on unmount, so a test that navigates away sees it disappear.

`getPhysics()` and the transport counters return `null` / zeros until their lazy
chunks load — the hook reflects what has actually loaded rather than pretending.

### 10.3 It is present in production builds, unconditionally

**Decision, and it is a deliberate one.** The hook is **not** gated behind
`import.meta.env.DEV`.

- `VERIFY.md` forbids a UI PASS on code inspection, and T-015 measures the
  production bundle. A hook that vanished in production would mean every
  acceptance test verified an artifact that is not the one deployed.
- It discloses nothing not already client-side: scene geometry the visitor is
  looking at, transport status shown in the UI, and XR state shown in the UI. It
  contains **no key, no token and no credential** — the anon key lives in the
  transport module and is never surfaced through the hook.
- It is read-only. Every method is a getter; there is no setter, so it is not a
  new input surface.
- Cost is roughly 1 kB, in the lazy chunk, not the entry chunk.

T-016 should confirm the "no credential" property rather than take it from this
document.

---

## 11. The `DimensionLevel` contract

`client/src/dimensions/contract.ts` — **zero imports**, which is what makes it
safe for the entry chunk (§9.3).

```ts
export const DIMENSION_LEVELS = ["3D", "4D", "5D", "6D", "7D"] as const;
export type DimensionLevel = (typeof DIMENSION_LEVELS)[number];

export interface DimensionLevelMeta {
  level: DimensionLevel;
  short: string;    // "Spatial model"
  label: string;    // "3D — Spatial model and navigation"
  summary: string;
}

export const DIMENSION_LEVEL_META: Readonly<Record<DimensionLevel, DimensionLevelMeta>>;

/** A product's HIGHEST verified dimensional capability.
 *  undefined means UNKNOWN. It never means "none" and never means "3D". */
export type ProductDimensionLevel = DimensionLevel | undefined;
```

Single owning file: `client/src/dimensions/contract.ts`. T-005 … T-014 import the
type from there and from nowhere else.

### 11.1 The rules that discharge T-014's fabrication risk

1. The dataset field is **`dimensionLevel?: DimensionLevel`** — optional, with no
   default anywhere in the type, the renderer, or the loader.
2. **`undefined` renders nothing.** No badge, no "—", no "3D" fallback. A product
   whose level is unknown looks exactly like a product from before this feature.
3. **`generateFallbackProduct` (`client/src/pages/ProductDetail.tsx:171-186`) must
   never set it.** Checkable: `grep -n "dimensionLevel" client/src/pages/ProductDetail.tsx`
   shows it only inside `productDatabase` entries, never inside the generator
   body. This matters because 49 of the 58 listed products currently render a
   *generated* detail page, and a capability claim attached to that generator
   would put an invented technical assertion on 49 pages.
4. The value is a **claim about a real product** and requires a source. Until OQ-3
   names one, the correct number of products carrying the field is **zero**, and
   T-014 stays blocked. This contract does not force a choice and does not supply
   a default that could be mistaken for data.

### 11.2 What this forecloses — stated, per the brief

**It forecloses one plausible OQ-3 answer: that a product carries *several* levels
at once** (e.g. "3D and 5D but not 4D"). `DimensionLevel | undefined` models a
single highest level.

This is deliberate — `QUALITY.md` forbids designing for unstated requirements —
and the widening is small and localised if the user's answer needs it:

```ts
export type ProductDimensionLevels = readonly DimensionLevel[] | undefined;
```

Three call sites change: the dataset field, the badge renderer (one badge → a
badge group), and T-014's filter predicate (`=== level` → `.includes(level)`). No
other part of this architecture depends on the cardinality.

Not foreclosed: where the mapping comes from (a Supabase column, a JSON file, a
hand-maintained TS record) — nothing here binds the source. Nor is it foreclosed
that only a handful of products ever carry a level; that is the expected outcome
of an honest answer to OQ-3.

---

## 12. Directory layout

```
client/src/dimensions/
  contract.ts                  ZERO imports. DimensionLevel. Entry-chunk-safe.
  DimensionsStage.tsx          THE lazy entry point (default export).
  state/
    types.ts                   SceneState, SceneObject, ObjectId, ActorId, Vec3, Quat
    store.ts                   useSyncExternalStore store; getSnapshot; batched commit
    compose.ts                 composeScene() — the fixed 5-step pipeline (§5.3)
    testHook.ts                window.__AGL_DIMENSIONS__ install / uninstall
  model/
    process.ts                 ProcessModel, StageDescriptor + the authored model
    timeline.ts                timelineAt(model, t) — PURE. No random, no clocks.
  render/
    Renderer.ts                WebGLRenderer lifecycle; renderer.info; context loss
    projector.ts               SceneState → Object3D. THE ONLY MUTATION SITE.
    camera.ts                  OrbitControls + the keyboard camera (§8.2)
    loop.ts                    invalidation-driven; setAnimationLoop (XR-aware)
  physics/
    sandbox.ts                 cannon-es world; fixedStep; forward-only; Reset
  live/
    source.ts                  LiveDataSource + zod schemas (the trust boundary)
    useLiveData.ts
  ai/
    types.ts                   ScenarioSolver + SolverDisclosure (§4) — seam only
  transport/
    types.ts                   CollaborationTransport. ZERO vendor imports.
    index.ts                   createTransport() — THE SWAP POINT
    supabaseTransport.ts       the ONLY file importing @supabase/*
    nullTransport.ts           { kind: "unconfigured" }
    loopbackTransport.ts       BroadcastChannel — dev + unit fixture only
    merge.ts                   LWW register (§6.4). Pure.
  xr/
    detect.ts                  probeXR(); the XrUiState machine (§7)
    session.ts                 requestSession / renderer.xr.setSession / end
  a11y/
    SceneOutline.tsx           the parallel DOM control tree (§8.2)
    LiveRegion.tsx             one aria-live="polite" region

client/src/pages/Dimensions.tsx    route shell. STATIC. contract.ts + the lazy().
client/public/models/<name>.glb    runtime fetch (T-005 stubs it to 500)
client/public/models/<name>.usdz   AR Quick Look (T-012 curl -I ⇒ 200)
```

This follows the repo's existing layout — feature code under `client/src/`, pages
under `client/src/pages/`, the `@/` alias — rather than introducing a new
convention. `shared/` is not used: nothing here is shared with `server/`, and
`server/` is not deployed (Verified — `deploy.yml` rsyncs `dist/public/` only).

---

## 13. Environment variables

| Variable | Purpose | Where |
|---|---|---|
| `VITE_SUPABASE_URL` | Realtime + PostgREST base URL | `deploy.yml:52-59` `env:` block |
| `VITE_SUPABASE_ANON_KEY` | Anon key. Public by design; safe only because of T-009's RLS. | same |

Both absent ⇒ `createTransport()` returns `nullTransport` and the UI reports
`unconfigured`. **Absence degrades honestly; it never breaks the page and never
shows a fake peer.**

`.env.example` gains both with empty values (T-002 creates that file; T-017's
fourth criterion checks the list matches).

**Never `VITE_`-prefixed:** the service-role key. `VITE_*` values are inlined into
the client bundle. T-009 already asserts `grep -r "service_role" client/ dist/public/`
returns nothing.

---

## 14. Deployment impact

**One change, and only one:** `client/public/.htaccess` gains
`AddType model/vnd.usdz+zip .usdz` for AR Quick Look (§7.4). Mirror it into the
repo-root `.htaccess`, which is currently byte-identical (Verified — `diff`).

Everything else ships through the existing rsync unchanged:

- No new host. No new always-on service. (Verified — `deploy.yml` rsyncs
  `dist/public/` only.)
- No `.wasm` MIME or compression changes — **because D-5D-PHYSICS chose cannon-es
  over rapier** (§2.1). Choosing rapier would have required both.
- No CSP change — **Verified**: `grep -rn "Content-Security-Policy" .htaccess client/`
  returns nothing, so no `connect-src` blocks the Supabase WebSocket.
- `Permissions-Policy` (`.htaccess:51`): **may** need `, xr-spatial-tracking=(self)`.
  Inferred that it does not (§7.1); T-012 verifies on real hardware. The
  `blocked-by-policy` UI state exists so a visitor is told the truth either way.

If OQ-1 resolves to the Supabase Edge Function proxy, that adds a
`supabase functions deploy` step outside the rsync (§4) — the only branch in this
architecture that changes the deploy surface.

---

## 15. Open questions this design deliberately does not answer

| OQ | Blocks | The seam left for it |
|---|---|---|
| OQ-1 — what "AI" means in 5D | T-008 | `ScenarioSolver` + `SolverDisclosure` (§4). All three answers implement it. Only the Edge Function answer changes deployment. |
| OQ-2 — what "remote device control" controls | T-011 | Not designed. `TransportStatus` and the honest-unavailable pattern (§7.2) generalise to it. If OQ-2 has no good answer, 6D ships as multi-user + digital twin and remote device control is **NOT RUN with the reason**. |
| OQ-3 — source of truth for per-product level | T-014 | `contract.ts` (§11). Source-agnostic. Forecloses only the multi-level-per-product reading, and §11.2 gives the widening. |
| OQ-4 — Supabase + RLS as the 6D data plane | T-009 | Answered by D-6D-TRANSPORT, **conditional on §3.4's preconditions**, which are unverified. |
| The existing simulated chat widget | — | Out of scope. **Noted:** `client/src/components/AIChatWidget.tsx` is mounted globally at `client/src/App.tsx:49`, so it renders on `/dimensions` too. A page whose contract is "never claim a capability that is not active", sharing a viewport with a regex engine presented as an AI assistant, is a coherence problem for T-018's honesty audit. Not this design's to fix; flagged so it is not discovered at the verdict. |

---

## 16. Summary of decisions

| ID | Decision | Strongest reason |
|---|---|---|
| **D-3D-RUNTIME** | raw `three@0.185.1` + `OrbitControls` + `GLTFLoader`. No R3F, no drei, no `@react-three/xr`. | `@react-three/fiber@9.7.0` contains **zero** occurrences of `xr` (Verified), while `three` delegates `setAnimationLoop` to `xr` at `WebGLRenderer.js:1584` (Verified). 7D is a requirement, not an extra. |
| **D-5D-PHYSICS** | `cannon-es@0.20.0`, main thread, `fixedStep()`. | 25.16 kB vs rapier's 1083.72 kB gzip — **43.1×** (Verified). Staleness (last release 2022-08-12, Verified) accepted with named controls; owner Security/T-016. |
| **D-6D-TRANSPORT** | Supabase Realtime + PostgREST via `realtime-js` + `postgrest-js`, behind `CollaborationTransport`. | A WebSocket host has nowhere to run — deployment is `rsync dist/public/` to shared hosting (Verified, `deploy.yml:76-81`). |
| **D-5D-AI** | **OPEN** — seam decided (`ScenarioSolver` + `SolverDisclosure`), policy left to the user. | OQ-1 is the user's call; the three options differ in deployment surface. Disclosure is enforced by the type, not by copy review. |
| **D-7D-DETECT** | 4-step probe; 11 enumerated UI states; a rejected `isSessionSupported` maps to `blocked-by-policy`, never to "unsupported". | `.htaccess:51` sets a `Permissions-Policy`, so "blocked by policy" is a live possibility that must not be reported as a browser deficiency. |
| **D-SPLIT** | One lazy entry, `@/dimensions/DimensionsStage`; three vendor chunks; a grep-enforced import rule. | One missing `import type` pulls 159.73 kB gzip (Verified) onto every page. Mechanical checks, not convention. |
| **D-STATE** | Plain serializable store; scene graph is a derived projection; `projector.ts` is the only mutation site. | 4D purity, 6D serialization, 7D reuse and GPU-free tests all fail if state lives in `Object3D`. |
| **D-HOOK** | `window.__AGL_DIMENSIONS__`, read-only, present in production. | `VERIFY.md` forbids a UI PASS on inspection; a dev-only hook would verify an artifact that is not the deployed one. |
| **D-A11Y** | Parallel DOM control tree; invalidation-driven loop; reduced motion stops autoplay and ambient render. | A WebGL canvas is opaque to assistive technology; `QUALITY.md:46` forbids ignoring that. |

---

## 17. What is NOT verified in this document

Per `VERIFY.md`, absence is a result, and this list is not dropped.

1. **Supabase Realtime is enabled** for project `smvvjivvlprjhzhoizym`. I have no
   anon key. A 401 proves the host exists and routes `/realtime/v1/`; it proves
   nothing more. T-009 must establish it (§3.4).
2. **Concurrent-connection and message-rate limits** on the project's plan.
   Unknown. §6.3's opt-in join is partly a hedge against this.
3. **`Permissions-Policy` at `.htaccess:51` does not block WebXR.** Inferred from
   the spec's default allowlist, not measured — I have no XR device. T-012
   verifies; §7.2's `blocked-by-policy` state covers the other outcome.
4. **Stock Apache lacks a `.usdz` MIME type.** Inferred. Verified only that this
   repo's `.htaccess` declares no `AddType` at all.
5. **The entry-chunk additions in §9.6 (~5 kB gzip).** Estimates from comparable
   source files, not measurements. T-015 measures the real figure.
6. **Final chunk sizes.** §0's figures are probe measurements of representative
   code, not of the code that will ship. Decision-grade for choosing between
   libraries; not a prediction.
7. **`pnpm audit` on the proposed dependencies.** Not run — adding dependencies is
   T-005/T-007/T-009's work, and T-016 owns the audit.
8. **Nothing in this document has been executed as code.** It is a design. Every
   acceptance criterion referenced remains unproven until its own task runs.
