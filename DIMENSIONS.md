# The Dimensional Capability Stack (3D–7D)

A `/dimensions` page, plus teasers on `/` and `/agl`, presenting a single WebGL
scene through five progressively richer capability levels — 3D through 7D.
The full design record, with every measurement and rejected alternative, is
`ARCHITECTURE-DIMENSIONS.md`. This document says what actually ships, in the
terms a visitor or a developer needs, and nothing more.

**The rule this whole feature is built around:** a level is only described as
working if a passing, runnable check proves it. Where that isn't true yet,
the page says so, in the UI itself, not just in this file.

## Where it lives

| Surface       | What it shows                                                                                    |
| ------------- | ------------------------------------------------------------------------------------------------ |
| `/dimensions` | The full stack — all five levels, one scene                                                      |
| `/` (Home)    | A teaser section naming all five levels, linking to `/dimensions`                                |
| `/agl`        | The "Spatial & Industry SaaS" vertical, expanded with a level ladder and a link to `/dimensions` |

The 3D runtime is **not** loaded on `/`, `/products`, `/products/:slug` or
`/agl` — those routes never request the `three.js` bundle. It is loaded only
when `/dimensions` itself is opened.

## Single source of truth for status

Every surface above renders its level badges from one file:
**`client/src/dimensions/contract.ts`** (`DIMENSION_AVAILABILITY`), read
through `client/src/lib/dimensionsAvailability.ts`. There is exactly one
place this ever gets updated, and the wording below is copied from it
verbatim — not paraphrased — because the caveat text _is_ the honesty
mechanism: a `"partial"` status cannot be rendered without one.

| Level  | Status      | What it actually is                                                                                                                                                                                                                                                                                                                              |
| ------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **3D** | **Live**    | A real WebGL scene with a sourced 3D model, orbitable by pointer or keyboard.                                                                                                                                                                                                                                                                    |
| **4D** | **Live**    | A named process simulation, scrubbed deterministically over time.                                                                                                                                                                                                                                                                                |
| **5D** | **Partial** | "Object selection, the physics sandbox and the live weather feed are real and working. The AI capability this level also describes has not been built yet."                                                                                                                                                                                      |
| **6D** | **Partial** | "Multi-user sync, presence, the digital twin and remote session control are real and verified across two pages in one browser (no Supabase project key exists in this build). Genuine sync across two separate browsers has not been verified — this build has no shared-session configuration, so it runs stand-alone for every visitor today." |
| **7D** | **Partial** | "The capability probe, every degradation state and the AR Quick Look path are real and verified. Actually starting an immersive VR or AR session has not yet been observed on real XR hardware."                                                                                                                                                 |

`"Partial"` is a deliberate third state, distinct from a live/dead boolean —
see the header comment of `dimensionsAvailability.ts` for why a boolean
already drifted wrong once on this exact feature (5D and 7D disagreed
between two hand-typed lists on the same site before this file existed).

## 3D — Spatial model and navigation (Live)

- **Runtime:** `three@0.185.1`, used directly (no React renderer). `OrbitControls`
  and `GLTFLoader` from `three/examples/jsm/`. Why raw `three` and not
  `@react-three/fiber`: `ARCHITECTURE-DIMENSIONS.md` §1 — the short version is
  that R3F has no WebXR support at all, and 7D needs it.
- **Model:** `client/public/models/toycar.glb` ("Toy Car"), Khronos Group
  `glTF-Sample-Assets`, **CC0-1.0** (public domain). Licence and provenance in
  `client/public/models/toycar.LICENSE.txt`.
- **Navigation:** drag/wheel with the pointer, or fully by keyboard —
  arrows orbit, `+`/`-`/PageUp/PageDown dolly, `Home` resets. Keyboard and
  pointer drive the same camera state.
- **Loading and failure states** both render — a stubbed 500 on the model
  request shows a stated error, never a silent blank canvas.

## 4D — Time, animation, lifecycle and process simulation (Live)

- The simulated process is a **"Product Delivery Pipeline"**: Warehouse →
  Loading → Transit → Delivered (`client/src/dimensions/model/process.ts`).
- Scrubbing is deterministic: setting `t` directly and reaching the same `t`
  through 60 quantised keyboard steps produce byte-identical scene state.
  Time is quantised to 1/120 s on every write and is never accumulated
  (`t = tAtPlay + elapsed`, never `t += dt`).
- Playback advances over wall-clock time when not paused; pause actually
  stops it.
- Under `prefers-reduced-motion: reduce`, autoplay does not start and the
  timeline stays fully operable by direct control.

## 5D — Interaction, physics and live data (Partial)

**Real and working:**

- **Selection** — clicking a rendered object selects it by raycast, not by
  screen-region guesswork; clicking empty space clears the selection.
- **Physics** — `cannon-es@0.20.0`, stepped on the main thread with
  `world.fixedStep()`. A real simulation: gravity is monotonic, collisions
  produce measurable velocity changes, and a user-applied impulse of two
  different magnitudes produces two different resting positions (i.e. it is
  not a scripted animation).
- **Live data** — a genuine third-party HTTPS feed, **Open-Meteo**
  (`api.open-meteo.com`), for AGL's Santa Clara, CA office coordinates. No API
  key; a public, keyless, CORS-open endpoint, called directly from the
  browser (`client/src/dimensions/live/source.ts`). The host is named in the
  UI so a visitor can check the source, and a failed request or dropped
  connection shows a stated error rather than a frozen stale value.

**Not built:** the AI capability this level also names. Building it needs one
of three things this repo cannot supply on its own: a hosted LLM behind a
Supabase Edge Function (needs an Anthropic API key nobody has provided yet),
an in-browser model, or a client-side deterministic solver. The seam for all
three (`ScenarioSolver` / `SolverDisclosure`, `ARCHITECTURE-DIMENSIONS.md`
§4) is designed but **no implementation of any of the three exists in this
repo** — there is no solver, model, or Edge Function code under
`client/src/dimensions/` or `supabase/`. Until one is built, no AI claim
appears in the 5D panel.

## 6D — Multi-user collaboration and a digital twin (Partial)

- **Transport:** Supabase Realtime (presence + broadcast) plus PostgREST for
  the durable twin, reached only through a `CollaborationTransport` interface
  (`client/src/dimensions/transport/index.ts`) — the only two Supabase
  client libraries used are `@supabase/realtime-js` and
  `@supabase/postgrest-js`, not the full `@supabase/supabase-js`.
- **Presence, edits, and the twin** are last-writer-wins per object
  (higher `seq` wins; ties break deterministically on `actorId`), validated
  end-to-end (a peer's payload is `zod`-parsed before anything in it is
  trusted — Realtime Authorization gates who may join a channel, never what
  a joined peer may send).
- **Remote session control** — the "remote device control" the design brief
  originally asked about has no real device to control, so it is genuinely
  implemented as **browser-session-as-remote-endpoint**: one browser session
  drives another over the same transport channel. This is labelled "remote
  session control" everywhere in the UI, deliberately never "device control".
- **What has not been verified:** genuine synchronisation across two
  independent browser contexts against the live Supabase project. This
  build has no Supabase project key configured (`VITE_SUPABASE_URL` /
  `VITE_SUPABASE_ANON_KEY` are unset in every environment this was built in),
  so `createTransport()` resolves to the null transport and the 6D stage
  runs stand-alone — presence, edits and the twin have been proven across
  **two pages in one browser** (a loopback transport standing in for the
  wire), not across `browser.newContext()` instances hitting the real
  Supabase Realtime service. That is the one thing between "partial" and
  "live" for this level, and it is blocked purely on a credential, not on
  unwritten code.
- **Security note:** the Supabase project is deliberately a **public
  sandbox** for this feature — anyone holding the (necessarily public) anon
  key may read, create or overwrite the shared stage's state. There is no
  private data behind it. Row-count is bounded server-side (see
  `supabase/migrations/0002_*`), and every peer payload is schema-validated
  client-side before it touches rendering or physics.

## 7D — Immersive AR and VR, with honest degradation (Partial)

- **Capability probe** (`client/src/dimensions/xr/detect.ts`): WebGL context
  → `navigator.xr` → `isSessionSupported('immersive-vr')` and
  `('immersive-ar')`, probed independently, each wrapped so a rejection
  (e.g. blocked by the page's `Permissions-Policy`) is never reported as
  "your browser doesn't support this" — that would be a false statement
  about the visitor's device.
- **Ten enumerated states**, each truthful, each covered by its own test:
  `no-webgl`, `no-webxr`, `quicklook-only`, `no-device`, `blocked-by-policy`,
  `ar-only`, `vr-only`, `ar-and-vr`, `session-rejected`, `session-running` —
  plus the transition back to the pre-session state when a session ends
  (eleven rows in the full state table, `ARCHITECTURE-DIMENSIONS.md` §7.2).
  The affirmative strings — "in VR", "XR active", "immersive session
  running", "connected" — appear in the DOM **only** in `session-running`
  and nowhere else.
- **iOS AR Quick Look** — where WebXR is absent but Quick Look is available,
  the page offers a real `<a rel="ar">` link to a real, verified USDZ asset:
  `client/public/models/astronaut.usdz` ("Astronaut", Google `<model-viewer>`
  shared-assets, **CC-BY 2.0**, licence in
  `client/public/models/astronaut.LICENSE.txt`). This is a genuine, separate
  model from the toy car scene — Quick Look opens Apple's own AR viewer on
  it, presented by name, not as a consolation for missing WebXR.
- **Not verified:** an actual immersive `XRSession` starting has never been
  observed, because no XR-capable hardware (a VR headset, or an
  Android/Chrome device for `immersive-ar`) has been available to test
  against. Every degradation state above **has** been exercised and
  screenshotted; the one row that has not is `session-running` itself. That
  gap closes the moment this is tested on real XR hardware — no code change
  is anticipated.
- **iOS Safari never reaches WebXR at all** (Apple ships no WebXR API), so
  Quick Look is the real, permanent AR path on iOS, not a fallback pending a
  future WebXR release.

## Per-product dimensional capability

Products can optionally carry a `dimensionLevel` field (the same
`DimensionLevel` type as above), shown as a badge on the products list and
detail pages, and filterable on the list.

**Zero of the site's products currently carry a badge**, by design, not by
omission. The rule: a level is assigned only where the product's own
description already states it — inventing one would be a fabricated
technical claim on a commercial page. A re-check of every product data
source found four candidates whose copy mentions "3D", "AR" or "spatial"
(audiosuite, aeroswift, imeasure, roomcraft); all four were excluded because
they describe a **separately shipped native mobile app** (ARKit/ARCore),
not this site's three.js/WebXR/cannon-es/Supabase stack — the words are
similar, the technology is not the technology this page's badges describe.
The mechanism (field, badge rendering, list filter, contrast, keyboard
reachability) is built and tested; the dataset assigning it to real products
is, honestly, empty today. `generateFallbackProduct`
(`client/src/pages/ProductDetail.tsx`) — the function that synthesises a
detail page for the 49 of 58 listed products with no hand-written detail
entry — is explicitly never allowed to emit a level.

## The scene test hook

`window.__AGL_DIMENSIONS__` is a read-only object present on `/dimensions` in
production builds (not stripped from production — the acceptance tests for
every level above assert against the deployed artifact, not a dev-only
build). It carries no key, token, or credential. Shape:

```ts
interface DimensionsTestHook {
  readonly ready: boolean; // false until the first frame has rendered
  getState(): SceneState;
  getRenderStats(): RenderStats | null;
  getCamera(): CameraSnapshot;
  getPhysics(): PhysicsSnapshot | null; // null until the physics chunk has loaded and run once
  getLiveData(): DimensionsLiveDataSnapshot; // source, status, fetchedAt, value, error
  getXR(): DimensionsXrSnapshot | null; // null until the async capability probe resolves once
  getTransport(): DimensionsTransportSnapshot;
}
```

Example — read the current camera position and selection from a browser
console on `/dimensions`, after the page has settled:

```js
const hook = window.__AGL_DIMENSIONS__;
hook.ready; // true once the first frame has rendered
hook.getState().selection; // the selected object id, or null
hook.getCamera(); // { position: {x,y,z}, target: {x,y,z}, distance }
```

## Environment variables this feature adds

Only two, both already wired into `.github/workflows/deploy.yml`'s existing
build-time `env:` block (no new deploy target — see `DEPLOYMENT.md`):

| Variable                 | Purpose                                                                                                                             | If unset                                                        |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `VITE_SUPABASE_URL`      | 6D Realtime + PostgREST base URL                                                                                                    | `createTransport()` returns the null transport                  |
| `VITE_SUPABASE_ANON_KEY` | Anon key for the same project. Public by design once bundled — safety rests entirely on the RLS policies in `supabase/migrations/`. | Same — the 6D stage reports "unconfigured" and runs stand-alone |

Both are already declared, with empty defaults, in `.env.example`. Neither
value is required for the site to build or for 3D/4D/5D to work — 6D
degrades to its "partial, stand-alone" state honestly rather than breaking.

No environment variable exists yet for the 5D AI capability, because no AI
engine is built. When one is, it will be documented here, not before.

## What is deliberately NOT claimed, and why

| Capability                                             | Status           | Reason                                                                                                                                                                                              |
| ------------------------------------------------------ | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5D AI (solver / hosted LLM / on-device model)          | **Not built**    | No implementation exists in this repo (`ScenarioSolver`/`SolverDisclosure` seam is designed, unimplemented). Needs, at minimum, an Anthropic API key nobody has supplied for the hosted-LLM option. |
| 6D sync across two real browsers via Supabase          | **Unproven**     | No `VITE_SUPABASE_*` credential has ever been configured in an environment this was tested from. Proven only across two pages in one browser via a loopback transport.                              |
| 7D immersive session actually starting                 | **Unproven**     | No XR-capable hardware has been available to test on. Every other 7D state is proven.                                                                                                               |
| A dimensional capability badge on any specific product | **Not assigned** | No product's existing copy defensibly claims this site's specific 3D/WebXR/physics/Supabase stack; assigning one anyway would be a fabricated technical claim.                                      |

None of the four rows above are missing code paths — the UI for each
already renders its honest, named "not available yet" state rather than
omitting the feature or claiming it works.

## Further reading

- `ARCHITECTURE-DIMENSIONS.md` — full design record: every technology
  decision, the alternatives rejected and why, exact bundle-size
  measurements, and everything the design explicitly could not verify.
- `TASKS.md` — the task-by-task acceptance criteria and their evidence, and
  the Decisions table recording durable choices (including the open
  security items below).
- `DEPLOYMENT.md` — what this feature changed about deploying the site, and
  the deploy hazards that predate it but must be resolved before the next push.

## Open security item

A Supabase **service-role** key (used by `server/contactRouter.ts` for the
contact form, unrelated to the 6D anon key above) was committed in source
between commit `0c7ef2e` and commit `f9a1160` — **13 commits reachable from
the current `main`** carry it in `server/contactRouter.ts`'s tracked
content. The literal is no longer present in the working tree
(`grep -n "eyJ" server/contactRouter.ts` returns nothing today), but removing
it from the current tree does not remove it from history: it remains
readable in every one of those 13 commits, in any clone, fork, or cached
GitHub object. **Rotating the key in the Supabase dashboard is the only
control that actually closes this** — this has not been confirmed done, and
per this project's own rule (`TASKS.md`, T-016), a claim of "rotated"
requires evidence from whoever holds the dashboard, not an inference from
the source tree. If this project's Supabase instance is still on legacy JWT
keys rather than the newer key format, rotating `service_role` from that
dashboard screen **may also roll the `anon` key** used by 6D above — check
before rotating, and be ready to update the corresponding GitHub secret
(`VITE_SUPABASE_ANON_KEY`) in the same action.
