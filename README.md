# safecodeg.com — American Group LLC

The marketing site for American Group LLC (AGL), built as a Vite + React 19
single-page app with a small Express/tRPC backend. The backend is compiled
but **not deployed** — production serves the static `dist/public/` build
only (see `DEPLOYMENT.md`).

This document covers local setup, running the app, and running the test
gate. For the `/dimensions` capability stack (3D–7D), see `DIMENSIONS.md`.
For the full architecture record behind that feature, see
`ARCHITECTURE-DIMENSIONS.md`.

## Prerequisites

- **Node.js 22+** (CI pins Node 22 exactly — `.github/workflows/deploy.yml`)
- **pnpm** (the workflow installs pnpm 10 via `pnpm/action-setup`)

## Setup

```bash
pnpm install
cp .env.example .env
```

Fill in `.env` only if you need the features that use those values locally
— every value in `.env.example` has a safe, honest default when left empty
(see the table below). Never commit `.env`.

## Environment variables

| Variable                 | Used by                                                                                           | If empty                                                                                                           |
| ------------------------ | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `SUPABASE_URL`           | `server/contactRouter.ts` — saves contact-form submissions                                        | The contact form's server route fails loudly rather than sending a request with `undefined` in the header          |
| `SUPABASE_SERVICE_KEY`   | Same. **Service-role key — server-side only, never `VITE_`-prefixed.**                            | Same                                                                                                               |
| `VITE_SUPABASE_URL`      | The 6D "shared stage" collaboration feature (`DIMENSIONS.md`)                                     | The client's `createTransport()` returns a null transport; the 6D stage reports "unconfigured" instead of breaking |
| `VITE_SUPABASE_ANON_KEY` | Same. Public-by-design once bundled — safety rests on the RLS policies in `supabase/migrations/`. | Same                                                                                                               |

`.github/workflows/deploy.yml` also injects a handful of other `VITE_*`
values at build time (`VITE_APP_ID`, `VITE_APP_TITLE`,
`VITE_ANALYTICS_ENDPOINT`, etc.) that predate this feature and are not part
of `.env.example`; they all have safe empty-string defaults in CI.

## Running the app locally

```bash
pnpm run dev      # tsx watch on the Express server, Vite dev middleware
pnpm run build    # vite build (client) + esbuild (server) → dist/
pnpm run start    # serve the production build: NODE_ENV=production node dist/index.js
pnpm run check    # tsc --noEmit
```

`pnpm run build` and `pnpm run start` are also what Playwright's `webServer`
runs for the E2E-family suites below — see the warning before you run more
than one test category at a time.

## Running the test gate

Every category has its own `npm run test:*` script. Each Playwright- or
build-backed category runs on its **own port** by default, overridable via an
environment variable — this avoids _port_ collisions between suites, but
read the warning below before assuming that means they are safe to run at
the same time:

| Script             | Framework                                                                                                                    | Port variable | Default port |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------- | ------------- | ------------ |
| `test:unit`        | Vitest (`tests/unit`)                                                                                                        | —             | —            |
| `test:integration` | Vitest (`tests/integration`)                                                                                                 | —             | —            |
| `test:functional`  | Vitest (`tests/functional`, `server`)                                                                                        | —             | —            |
| `test:e2e`         | Playwright (`tests/e2e`)                                                                                                     | `PW_PORT`     | 3101         |
| `test:acceptance`  | Playwright (`tests/acceptance`)                                                                                              | `PW_PORT`     | 3102         |
| `test:smoke`       | Playwright (`tests/smoke`)                                                                                                   | `PW_PORT`     | 3103         |
| `test:regression`  | Playwright (`tests/regression`)                                                                                              | `PW_PORT`     | 3104         |
| `test:security`    | Node script (`tests/security/security-audit.mjs`) against a locally served production build                                  | `AUDIT_PORT`  | 3105         |
| `test:performance` | Node script (`tests/performance/lighthouse.mjs`) against a locally served production build                                   | `PERF_PORT`   | 3106         |
| `test:ui`          | Placeholder — prints a NOT-RUN notice and exits 0; category 10 (UI/UX) has no automated suite in this repo, per `TESTING.md` | —             | —            |

Run the whole vitest-backed set (safe, no build involved) with:

```bash
pnpm exec vitest run
```

As of this writing that runs **26 test files, 364 tests passed, 3 skipped**.

### ⚠️ Do not run test categories concurrently

Six of the ten categories rebuild the app before running anything:
`test:e2e`, `test:acceptance`, `test:smoke` and `test:regression` each
launch Playwright's own `webServer`, which runs **`npm run build && npm run
start`**; `test:security` and `test:performance` each go through
`scripts/with-server.mjs`, which likewise runs `npm run build` before
serving the result. `vite.config.ts` hardcodes `outDir: 'dist/public'` with
`emptyOutDir: true` — every one of those builds empties and rewrites the
same directory.

**Two of those six running at once will corrupt each other's build.** This
has already produced spurious failures three times on this project: one run
showed 38 unrelated E2E failures and a `tsc` error that had already been
fixed, purely because a second build finished mid-run and rewrote `dist/`
out from under the first suite's server. Retried in isolation, the same code
was clean.

**Rule:** run one build-triggering category at a time. If you need
isolation from another person's or agent's run, override the port
(`PW_PORT=3301 pnpm run test:e2e`, `AUDIT_PORT=3305 pnpm run test:security`,
`PERF_PORT=3306 pnpm run test:performance`), but that only prevents _port_
collisions — it does **not** prevent two builds racing into the same
`dist/` directory. The only real fix for that is not building concurrently:
finish one build-triggering script before starting another.

`test:unit`, `test:integration` and `test:functional` are plain Vitest runs
with no build step and no server — safe to run alongside anything else,
including a build-triggering suite.

## Deploying

See `DEPLOYMENT.md` — including three outstanding hazards on the live site
that a passing test gate does not resolve, and what the `/dimensions`
feature specifically added to the deploy story.
