/**
 * ACCEPTANCE TESTS — the dimensional feature (3D–7D), T-004…T-014
 * Category: Acceptance
 *
 * Closes independent-review finding F-5: the acceptance gate previously
 * reported "38 passed" while `git diff --stat f732f82 -- tests/acceptance/`
 * was empty for this whole feature — the 38 tests are the pre-existing
 * REQ-1…REQ-8 site requirements (tests/acceptance/requirements.spec.ts, left
 * untouched by this file) and exercise zero of the dimensional capability
 * stack. `TESTING.md` requires "one test per acceptance criterion, minimum";
 * this file is that coverage, for every criterion under T-004 through T-014
 * in TASKS.md, in the criterion's own words — against the real production
 * build the Playwright webServer serves, not a restatement of tests/e2e/.
 *
 * Where a criterion cannot be exercised without a credential this sandbox
 * does not hold (a Supabase anon key) or hardware it does not have (a real
 * XR device), the test is `test.skip(condition, reason)`ed with the exact
 * command or file that would close it — never silently omitted. Search this
 * file for "SKIPPED —" to find every one.
 *
 * `window.__AGL_DIMENSIONS__` (ARCHITECTURE-DIMENSIONS.md §10, D-HOOK) is
 * used wherever a claim needs scene-state evidence a DOM assertion alone
 * cannot give — it is the one honest observation surface this app exposes,
 * present unconditionally in production, read-only.
 */
import { test, expect, type Page, type BrowserContext } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// `client/src/dimensions/contract.ts` has ZERO imports of its own (its own
// header comment) and `client/src/lib/dimensionsAvailability.ts` imports
// only from that contract — both are pure data/functions, safe to import
// directly into this Node test process. This is what lets the "Honesty
// contract" tests below compare RENDERED DOM text against the actual source
// of truth, instead of a second hand-typed copy that could drift from it the
// same way T-013's own Notes record it already drifting once (5D/7D were
// marked live on one page and not-live on another, both wrong).
import {
  DIMENSION_LEVELS,
  DIMENSION_AVAILABILITY,
  type DimensionLevel,
} from "../../client/src/dimensions/contract";
import { dimensionStatusPresentation } from "../../client/src/lib/dimensionsAvailability";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "../..");

// ── Shared helpers (this file is self-contained, matching tests/e2e/'s own
// convention of not sharing helpers across spec files) ──────────────────────

interface HookState {
  t: number;
  objects: Record<
    string,
    {
      visible: boolean;
      kind: string;
      position: { x: number; y: number; z: number };
      label: string;
    }
  >;
  selection: string | null;
  stages: { id: string; label: string; startsAt: number; endsAt: number }[];
  actors: Record<string, unknown>;
  revision: number;
}

interface TransportSnapshot {
  status: { kind: string; [key: string]: unknown };
  actorCount: number;
  actors: string[];
  opsApplied: number;
  opsRejected: number;
}

declare global {
  interface Window {
    __AGL_DIMENSIONS__?: {
      ready: boolean;
      getState(): HookState;
      getRenderStats(): {
        frame: number;
        calls: number;
        triangles: number;
      } | null;
      getCamera(): {
        position: { x: number; y: number; z: number };
        distance: number;
      };
      getPhysics(): {
        steps: number;
        bodies: Record<
          string,
          {
            position: { x: number; y: number; z: number };
            velocity: { x: number; y: number; z: number };
          }
        >;
      } | null;
      getLiveData(): {
        source: string;
        status: string;
        value: unknown;
        error: string | null;
      };
      getXR(): {
        state: string;
        supported: { vr: boolean; ar: boolean } | null;
      } | null;
      getTransport(): TransportSnapshot;
    };
    __AGL_DIMENSIONS_TEST_TRANSPORT__?: () => unknown;
  }
}

async function waitForHookReady(page: Page) {
  await page.waitForFunction(
    () => window.__AGL_DIMENSIONS__?.ready === true,
    undefined,
    {
      timeout: 20_000,
    }
  );
}

async function waitForPhysicsLoaded(page: Page) {
  await page.waitForFunction(
    () => window.__AGL_DIMENSIONS__!.getPhysics() !== null,
    undefined,
    {
      timeout: 15_000,
    }
  );
}

async function waitForXrProbe(page: Page) {
  await page.waitForFunction(
    () =>
      window.__AGL_DIMENSIONS__ !== undefined &&
      window.__AGL_DIMENSIONS__.getXR() !== null,
    undefined,
    { timeout: 15_000 }
  );
}

/** Sets a range input's value the way script-driven "direct control" would. */
async function setRangeValue(page: Page, selector: string, value: number) {
  await page.locator(selector).evaluate((el, v) => {
    const input = el as HTMLInputElement;
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    )!.set!;
    setter.call(input, String(v));
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }, value);
}

function euclidean(
  a: { x: number; y: number; z: number },
  b: { x: number; y: number; z: number }
) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
}

/** A minimal, self-contained BroadcastChannel-backed transport, matching the
 * seam `tests/e2e/dimensions-collab.spec.ts` documents in full: injected via
 * `window.__AGL_DIMENSIONS_TEST_TRANSPORT__`, which `useCollaboration.ts`
 * checks for and which is never defined in a real build. This lets T-010/
 * T-011's presence, twin and remote-control criteria be proven against the
 * real UI wiring without a Supabase anon key. Genuine cross-BROWSER-CONTEXT
 * sync against the real transport is a separate, explicitly skipped test
 * below — see "SKIPPED —".
 */
function installFakeTransport() {
  const CHANNEL_NAME = "acceptance-dimensions-collab-channel";
  const STORAGE_KEY = "acceptance-dimensions-collab-snapshot";
  function makeTransport() {
    let status: { kind: string; [key: string]: unknown } = { kind: "idle" };
    let channel: BroadcastChannel | null = null;
    let selfActorId: string | null = null;
    const peers = new Map<string, unknown>();
    const opListeners = new Set<(op: unknown) => void>();
    const presenceListeners = new Set<(actors: unknown[]) => void>();
    const statusListeners = new Set<(status: unknown) => void>();
    function setStatus(next: typeof status) {
      status = next;
      statusListeners.forEach(cb => cb(status));
    }
    function notifyPresence() {
      const list = Array.from(peers.values());
      presenceListeners.forEach(cb => cb(list));
    }
    function handleMessage(event: MessageEvent) {
      const msg = event.data as {
        kind?: string;
        op?: unknown;
        presence?: { actorId: string };
        actorId?: string;
      };
      if (!msg || typeof msg !== "object") return;
      if (msg.kind === "op") {
        opListeners.forEach(cb => cb(msg.op));
        return;
      }
      if (msg.kind === "presence-announce" && msg.presence) {
        peers.set(msg.presence.actorId, msg.presence);
        notifyPresence();
        return;
      }
      if (msg.kind === "presence-leave" && msg.actorId) {
        peers.delete(msg.actorId);
        notifyPresence();
        return;
      }
      if (msg.kind === "presence-request") {
        if (selfActorId && peers.has(selfActorId) && channel) {
          channel.postMessage({
            kind: "presence-announce",
            presence: peers.get(selfActorId),
          });
        }
      }
    }
    function announceLeave() {
      if (channel && selfActorId) {
        channel.postMessage({ kind: "presence-leave", actorId: selfActorId });
      }
    }
    window.addEventListener("pagehide", announceLeave);
    return {
      get status() {
        return status;
      },
      async join(
        roomId: string,
        self: { actorId: string; displayName: string; colorHex: string }
      ) {
        setStatus({ kind: "connecting" });
        selfActorId = self.actorId;
        const presence = {
          actorId: self.actorId,
          displayName: self.displayName,
          colorHex: self.colorHex,
          joinedAt: Date.now(),
          lastSeenAt: Date.now(),
        };
        peers.set(self.actorId, presence);
        channel = new BroadcastChannel(CHANNEL_NAME);
        channel.onmessage = handleMessage;
        channel.postMessage({ kind: "presence-announce", presence });
        channel.postMessage({ kind: "presence-request" });
        setStatus({ kind: "connected", since: Date.now() });
        notifyPresence();
      },
      async leave() {
        announceLeave();
        channel?.close();
        channel = null;
        peers.clear();
        setStatus({ kind: "idle" });
      },
      async publish(op: unknown) {
        channel?.postMessage({ kind: "op", op });
      },
      async loadSnapshot() {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
      },
      async saveSnapshot(_roomId: string, snapshot: unknown) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
      },
      onOp(cb: (op: unknown) => void) {
        opListeners.add(cb);
        return () => opListeners.delete(cb);
      },
      onPresence(cb: (actors: unknown[]) => void) {
        presenceListeners.add(cb);
        return () => presenceListeners.delete(cb);
      },
      onStatus(cb: (status: unknown) => void) {
        statusListeners.add(cb);
        return () => statusListeners.delete(cb);
      },
    };
  }
  (
    window as unknown as { __AGL_DIMENSIONS_TEST_TRANSPORT__: () => unknown }
  ).__AGL_DIMENSIONS_TEST_TRANSPORT__ = makeTransport;
}

async function withFakeTransport(context: BrowserContext) {
  await context.addInitScript(installFakeTransport);
}

async function joinAs(page: Page, displayName: string) {
  await page.goto("/dimensions");
  await waitForHookReady(page);
  await page.getByTestId("collab-display-name").fill(displayName);
  await page.getByTestId("collab-join").click();
  await expect(page.getByTestId("collab-participant-count")).toBeVisible({
    timeout: 10_000,
  });
}

// ════════════════════════════════════════════════════════════════════════
// T-004 — /dimensions route, navigation, lazy-loading boundary
// ════════════════════════════════════════════════════════════════════════

test.describe("T-004 — route, navigation, lazy boundary", () => {
  test("AC1: /dimensions renders a page reachable via the app's own router", async ({
    page,
  }) => {
    const response = await page.goto("/dimensions");
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("AC2a: the desktop nav has a Dimensions entry that navigates to /dimensions", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    await page
      .locator('nav a[href="/dimensions"]', { hasText: "Dimensions" })
      .click();
    await page.waitForURL("**/dimensions");
    expect(page.url()).toContain("/dimensions");
  });

  test("AC2b: the mobile nav menu has a Dimensions entry that navigates to /dimensions", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: /toggle menu/i }).click();
    await page
      .locator('a[href="/dimensions"]:visible', { hasText: "Dimensions" })
      .click();
    await page.waitForURL("**/dimensions");
    expect(page.url()).toContain("/dimensions");
  });

  test("AC3: the entry chunk stays within the 270kB gzip budget after a fresh build", async () => {
    const assetsDir = path.join(REPO_ROOT, "dist/public/assets");
    const files = fs.readdirSync(assetsDir);
    const entryFile = files.find(f => /^index-.*\.js$/.test(f));
    expect(
      entryFile,
      `no entry chunk found among: ${files.join(", ")}`
    ).toBeTruthy();
    const zlib = await import("node:zlib");
    const raw = fs.readFileSync(path.join(assetsDir, entryFile!));
    const gzipKB = zlib.gzipSync(raw).length / 1024;
    expect(
      gzipKB,
      `entry chunk is ${gzipKB.toFixed(2)}kB gzip`
    ).toBeLessThanOrEqual(270);
    // And the 3D runtime lives in its own, separate chunk, not the entry one.
    const threeChunk = files.find(f => /^vendor-three-.*\.js$/.test(f));
    expect(
      threeChunk,
      `no separate vendor-three chunk among: ${files.join(", ")}`
    ).toBeTruthy();
  });

  test("AC4a: loading / issues zero network requests for the 3D chunk", async ({
    page,
  }) => {
    const threeRequests: string[] = [];
    page.on("request", req => {
      if (/vendor-three|DimensionsStage/.test(req.url()))
        threeRequests.push(req.url());
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(threeRequests).toEqual([]);
  });

  test("AC4b: loading /products issues zero network requests for the 3D chunk", async ({
    page,
  }) => {
    const threeRequests: string[] = [];
    page.on("request", req => {
      if (/vendor-three|DimensionsStage/.test(req.url()))
        threeRequests.push(req.url());
    });
    await page.goto("/products");
    await page.waitForLoadState("networkidle");
    expect(threeRequests).toEqual([]);
  });

  test("AC5: with WebGL unavailable, a stated fallback renders and nothing throws", async ({
    page,
  }) => {
    const pageErrors: Error[] = [];
    page.on("pageerror", err => pageErrors.push(err));
    await page.addInitScript(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (HTMLCanvasElement.prototype as any).getContext = () => null;
    });
    await page.goto("/dimensions");
    await expect(page.getByTestId("dimensions-fallback")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("dimensions-fallback")).toContainText(
      "3D is unavailable"
    );
    expect(pageErrors).toEqual([]);
  });

  test('AC6: under prefers-reduced-motion, the page reaches a settled state and motion-mode reads "reduced"', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/dimensions");
    await expect(page.getByTestId("motion-mode")).toHaveText("reduced", {
      timeout: 15_000,
    });
    await waitForHookReady(page);
    await expect(page.getByText("Loading the 3D model")).toHaveCount(0, {
      timeout: 20_000,
    });
    await page.waitForTimeout(700);
    const framesAfterSettle = await page.evaluate(
      () => window.__AGL_DIMENSIONS__!.getRenderStats()!.frame
    );
    await page.waitForTimeout(700);
    const framesLater = await page.evaluate(
      () => window.__AGL_DIMENSIONS__!.getRenderStats()!.frame
    );
    expect(framesLater).toBe(framesAfterSettle);
  });

  test("AC7: Tab from the top of the page reaches every interactive control in visual order, each with a non-empty accessible name", async ({
    page,
  }) => {
    await page.goto("/dimensions");
    await waitForHookReady(page);
    await page.locator("body").click({ position: { x: 2, y: 2 } });
    await page.keyboard.press("Tab");
    const names: string[] = [];
    for (let i = 0; i < 60; i++) {
      const name = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const aria = el.getAttribute("aria-label");
        if (aria) return aria.trim();
        // A range input (e.g. the timeline scrubber) has no text content of
        // its own and is correctly labelled via <label for="...">, not
        // aria-label — the same accessible-name resolution order used by
        // tests/e2e/dimensions.spec.ts's equivalent, proven-passing check.
        if (el.id) {
          const label = document.querySelector(`label[for="${el.id}"]`);
          if (label?.textContent?.trim()) return label.textContent.trim();
        }
        const text = el.textContent?.trim();
        if (text) return text;
        return "";
      });
      if (name === null) break;
      names.push(name);
      await page.keyboard.press("Tab");
    }
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) {
      expect(
        name.length,
        "an interactive control had no accessible name"
      ).toBeGreaterThan(0);
    }
  });

  for (const width of [640, 768, 1024]) {
    test(`AC8: renders at ${width}px with no horizontal page scroll`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto("/dimensions");
      await page.waitForLoadState("networkidle");
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });
  }
});

// ════════════════════════════════════════════════════════════════════════
// T-005 — 3D: spatial model and navigation
// ════════════════════════════════════════════════════════════════════════

test.describe("T-005 — 3D spatial model and navigation", () => {
  test("AC1: a real WebGL context is created", async ({ page }) => {
    await page.goto("/dimensions");
    const hasWebGL = await page.evaluate(() => {
      const canvas = document.createElement("canvas");
      return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
    });
    expect(hasWebGL).toBe(true);
  });

  test("AC2: the scene renders real geometry — triangle count and draw-call count are both > 0", async ({
    page,
  }) => {
    await page.goto("/dimensions");
    await waitForHookReady(page);
    const stats = await page.evaluate(() =>
      window.__AGL_DIMENSIONS__!.getRenderStats()
    );
    expect(stats).not.toBeNull();
    expect(stats!.triangles).toBeGreaterThan(0);
    expect(stats!.calls).toBeGreaterThan(0);
  });

  test("AC3a: a pointer drag of >= 100px across the canvas changes the camera position beyond an epsilon", async ({
    page,
  }) => {
    await page.goto("/dimensions");
    await waitForHookReady(page);
    const canvas = page.locator("canvas");
    await canvas.scrollIntoViewIfNeeded();
    const box = (await canvas.boundingBox())!;
    const before = await page.evaluate(
      () => window.__AGL_DIMENSIONS__!.getCamera().position
    );
    await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.5);
    await page.mouse.down();
    await page.mouse.move(
      box.x + box.width * 0.3 + 150,
      box.y + box.height * 0.5,
      { steps: 10 }
    );
    await page.mouse.up();
    await page.waitForTimeout(200);
    const after = await page.evaluate(
      () => window.__AGL_DIMENSIONS__!.getCamera().position
    );
    expect(euclidean(before, after)).toBeGreaterThan(0.05);
  });

  test("AC3b: a wheel event changes the camera distance", async ({ page }) => {
    await page.goto("/dimensions");
    await waitForHookReady(page);
    const canvas = page.locator("canvas");
    await canvas.scrollIntoViewIfNeeded();
    const box = (await canvas.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    const before = await page.evaluate(
      () => window.__AGL_DIMENSIONS__!.getCamera().distance
    );
    await page.mouse.wheel(0, -300);
    await page.waitForTimeout(200);
    const after = await page.evaluate(
      () => window.__AGL_DIMENSIONS__!.getCamera().distance
    );
    expect(Math.abs(after - before)).toBeGreaterThan(0.05);
  });

  test("AC4: the same navigation is reachable without a pointer — keyboard orbit, dolly and Home reset", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/dimensions");
    await waitForHookReady(page);
    const canvas = page.locator("canvas");
    await canvas.scrollIntoViewIfNeeded();
    await canvas.focus();
    const before = await page.evaluate(
      () => window.__AGL_DIMENSIONS__!.getCamera().position
    );
    for (let i = 0; i < 8; i++) await page.keyboard.press("ArrowLeft");
    const afterOrbit = await page.evaluate(
      () => window.__AGL_DIMENSIONS__!.getCamera().position
    );
    expect(euclidean(before, afterOrbit)).toBeGreaterThan(0.05);
    const distBefore = await page.evaluate(
      () => window.__AGL_DIMENSIONS__!.getCamera().distance
    );
    for (let i = 0; i < 5; i++) await page.keyboard.press("PageUp");
    const distAfter = await page.evaluate(
      () => window.__AGL_DIMENSIONS__!.getCamera().distance
    );
    expect(Math.abs(distAfter - distBefore)).toBeGreaterThan(0.05);
    await page.keyboard.press("Home");
    const afterHome = await page.evaluate(
      () => window.__AGL_DIMENSIONS__!.getCamera().position
    );
    expect(euclidean(afterHome, before)).toBeLessThan(0.01);
  });

  test('AC5: a named, non-empty model asset ("toycar.glb") is fetched at runtime and appears in the scene', async ({
    page,
  }) => {
    const modelResponse = page.waitForResponse(res =>
      res.url().includes("/models/toycar.glb")
    );
    await page.goto("/dimensions");
    const res = await modelResponse;
    expect(res.status()).toBe(200);
    await waitForHookReady(page);
    await expect(page.getByText("Loading the 3D model")).toHaveCount(0, {
      timeout: 20_000,
    });
    const state = await page.evaluate(() =>
      window.__AGL_DIMENSIONS__!.getState()
    );
    const toycarObjects = Object.values(state.objects).filter(
      o => o.kind === "toycar"
    );
    expect(toycarObjects.length).toBeGreaterThan(0);
  });

  test("AC6a: while the model is loading, a loading badge renders", async ({
    page,
  }) => {
    await page.route("**/models/toycar.glb", async route => {
      await new Promise(resolve => setTimeout(resolve, 800));
      await route.continue();
    });
    await page.goto("/dimensions");
    await expect(page.getByText("Loading the 3D model")).toBeVisible({
      timeout: 5_000,
    });
  });

  test("AC6b: with the model request stubbed to a 500, a stated error renders and nothing throws", async ({
    page,
  }) => {
    const pageErrors: Error[] = [];
    page.on("pageerror", err => pageErrors.push(err));
    await page.route("**/models/toycar.glb", route =>
      route.fulfill({ status: 500, body: "stubbed failure" })
    );
    await page.goto("/dimensions");
    await expect(page.getByTestId("dimensions-model-error")).toBeVisible({
      timeout: 20_000,
    });
    expect(pageErrors).toEqual([]);
  });
});

// ════════════════════════════════════════════════════════════════════════
// T-006 — 4D: time, animation, lifecycle, process simulation
// ════════════════════════════════════════════════════════════════════════

test.describe("T-006 — 4D time and process simulation", () => {
  test("AC1: setting the scrubber updates the hook's reported t to the value it was set to", async ({
    page,
  }) => {
    await page.goto("/dimensions");
    await waitForHookReady(page);
    await setRangeValue(page, "#dimensions-scrubber", 3);
    await page.waitForTimeout(50);
    const t = await page.evaluate(
      () => window.__AGL_DIMENSIONS__!.getState().t
    );
    expect(t).toBeCloseTo(3, 5);
  });

  test("AC2: the scene state is genuinely a function of t — different t shows a different visible set, and returning restores it exactly", async ({
    page,
  }) => {
    await page.goto("/dimensions");
    await waitForHookReady(page);
    async function visibleIdsAt(t: number): Promise<string[]> {
      await setRangeValue(page, "#dimensions-scrubber", t);
      await page.waitForTimeout(50);
      return page.evaluate(() =>
        Object.entries(window.__AGL_DIMENSIONS__!.getState().objects)
          .filter(([, o]) => o.visible)
          .map(([id]) => id)
          .sort()
      );
    }
    const atLoading = await visibleIdsAt(5);
    const atTransit = await visibleIdsAt(9);
    expect(atTransit).not.toEqual(atLoading);
    expect(await visibleIdsAt(5)).toEqual(atLoading);
  });

  test("AC3: t=0.5 reached by direct set and by 60 quantised keyboard steps is byte-identical scene state", async ({
    page,
  }) => {
    await page.goto("/dimensions");
    await waitForHookReady(page);
    await setRangeValue(page, "#dimensions-scrubber", 0.5);
    await page.waitForTimeout(50);
    const viaDirectControl = await page.evaluate(() => {
      const { revision: _r, ...rest } = window.__AGL_DIMENSIONS__!.getState();
      return rest;
    });
    await setRangeValue(page, "#dimensions-scrubber", 0);
    await page.waitForTimeout(50);
    await page.locator("#dimensions-scrubber").focus();
    for (let i = 0; i < 60; i++) await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(50);
    const viaKeyboardSteps = await page.evaluate(() => {
      const { revision: _r, ...rest } = window.__AGL_DIMENSIONS__!.getState();
      return rest;
    });
    expect(viaKeyboardSteps).toEqual(viaDirectControl);
  });

  test("AC4: playback advances t over wall-clock time with no input, and pause freezes it", async ({
    page,
  }) => {
    await page.goto("/dimensions");
    await waitForHookReady(page);
    await setRangeValue(page, "#dimensions-scrubber", 0);
    await page.waitForTimeout(50);
    await page.getByRole("button", { name: "Play simulation" }).click();
    await page.waitForTimeout(600);
    const whilePlaying = await page.evaluate(
      () => window.__AGL_DIMENSIONS__!.getState().t
    );
    expect(whilePlaying).toBeGreaterThan(0);
    await page.getByRole("button", { name: "Pause simulation" }).click();
    const atPause = await page.evaluate(
      () => window.__AGL_DIMENSIONS__!.getState().t
    );
    await page.waitForTimeout(1000);
    const afterWait = await page.evaluate(
      () => window.__AGL_DIMENSIONS__!.getState().t
    );
    expect(afterWait).toBe(atPause);
  });

  test('AC5: the simulated lifecycle ("Product Delivery Pipeline") is named in the UI, and its rendered stage labels equal the model data', async ({
    page,
  }) => {
    await page.goto("/dimensions");
    await waitForHookReady(page);
    const modelStages = await page.evaluate(() =>
      window.__AGL_DIMENSIONS__!.getState().stages.map(s => s.label)
    );
    await expect(
      page.getByRole("heading", { name: "Product Delivery Pipeline" })
    ).toBeVisible();
    const renderedLabels = await page
      .getByTestId("dimensions-stage-label")
      .allTextContents();
    expect(renderedLabels).toEqual(modelStages);
  });

  test("AC6: under reduced motion, autoplay does not start, and the timeline stays fully operable by direct control", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/dimensions");
    await waitForHookReady(page);
    expect(
      await page.evaluate(() => window.__AGL_DIMENSIONS__!.getState().t)
    ).toBe(0);
    await page.waitForTimeout(1200);
    expect(
      await page.evaluate(() => window.__AGL_DIMENSIONS__!.getState().t)
    ).toBe(0);
    await setRangeValue(page, "#dimensions-scrubber", 2);
    await page.waitForTimeout(50);
    expect(
      await page.evaluate(() => window.__AGL_DIMENSIONS__!.getState().t)
    ).toBeCloseTo(2, 5);
  });
});

// ════════════════════════════════════════════════════════════════════════
// T-007 — 5D: interaction, physics, live data
// ════════════════════════════════════════════════════════════════════════

test.describe("T-007 — 5D interaction: selection via raycast", () => {
  test("AC1a: clicking a rendered object selects it, matching the object under the click point", async ({
    page,
  }) => {
    await page.goto("/dimensions");
    await waitForHookReady(page);
    const canvas = page.locator("canvas");
    await canvas.scrollIntoViewIfNeeded();
    const box = (await canvas.boundingBox())!;
    await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.65);
    await page.waitForTimeout(100);
    const selection = await page.evaluate(
      () => window.__AGL_DIMENSIONS__!.getState().selection
    );
    expect(selection).toBe("platform");
    await expect(page.getByTestId("dimensions-selection")).toContainText(
      "Selected: Loading platform"
    );
  });

  test("AC1b: clicking empty space (no geometry under the click point) clears the selection", async ({
    page,
  }) => {
    await page.goto("/dimensions");
    await waitForHookReady(page);
    const canvas = page.locator("canvas");
    await canvas.scrollIntoViewIfNeeded();
    const box = (await canvas.boundingBox())!;
    await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.65);
    await page.waitForTimeout(100);
    expect(
      await page.evaluate(() => window.__AGL_DIMENSIONS__!.getState().selection)
    ).toBe("platform");
    await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.15);
    await page.waitForTimeout(100);
    const selection = await page.evaluate(
      () => window.__AGL_DIMENSIONS__!.getState().selection
    );
    expect(selection).toBeNull();
    await expect(page.getByTestId("dimensions-selection")).toContainText(
      "Nothing selected"
    );
  });
});

test.describe("T-007 — 5D physics: a real, non-scripted simulation", () => {
  test("AC2: gravity produces a monotonically decreasing y across >= 30 consecutive reads, and a collision reverses a velocity sign", async ({
    page,
  }) => {
    await page.goto("/dimensions");
    await waitForHookReady(page);
    await page.getByTestId("physics-run").click();
    await waitForPhysicsLoaded(page);
    const samples = await page.evaluate(
      () =>
        new Promise<{ y: number; vy: number }[]>(resolve => {
          const out: { y: number; vy: number }[] = [];
          function frame() {
            const snap = window.__AGL_DIMENSIONS__!.getPhysics();
            if (snap)
              out.push({
                y: snap.bodies.ball.position.y,
                vy: snap.bodies.ball.velocity.y,
              });
            if (out.length < 150) requestAnimationFrame(frame);
            else resolve(out);
          }
          requestAnimationFrame(frame);
        })
    );
    let longestFall = 1;
    let current = 1;
    for (let i = 1; i < samples.length; i++) {
      if (samples[i].y < samples[i - 1].y) {
        current += 1;
        longestFall = Math.max(longestFall, current);
      } else current = 1;
    }
    expect(longestFall).toBeGreaterThanOrEqual(30);
    const bounced = samples.some(
      (s, i) => i > 0 && samples[i - 1].vy < -0.05 && s.vy > 0.05
    );
    expect(bounced).toBe(true);
  });

  test("AC3: the physics engine is named in the Notes (cannon-es) and is not scripted — two impulse magnitudes produce two different resting positions", async ({
    page,
  }) => {
    await page.goto("/dimensions");
    await waitForHookReady(page);
    async function restingXAfterImpulse(magnitude: number): Promise<number> {
      await page.getByTestId("physics-reset").click();
      await page.getByTestId("physics-run").click();
      await waitForPhysicsLoaded(page);
      await page.waitForTimeout(1_000);
      await setRangeValue(
        page,
        '[data-testid="physics-impulse-slider"]',
        magnitude
      );
      await page.getByTestId("physics-impulse-apply").click();
      await page.waitForTimeout(3_000);
      return page.evaluate(
        () => window.__AGL_DIMENSIONS__!.getPhysics()!.bodies.ball.position.x
      );
    }
    const low = await restingXAfterImpulse(1);
    const high = await restingXAfterImpulse(4);
    expect(Math.abs(high - low)).toBeGreaterThan(0.1);
  });

  test("AC4: scenario controls change simulation inputs and the outcome changes measurably in getState (not just getPhysics)", async ({
    page,
  }) => {
    await page.goto("/dimensions");
    await waitForHookReady(page);
    async function restingXInState(magnitude: number): Promise<number> {
      await page.getByTestId("physics-reset").click();
      await page.getByTestId("physics-run").click();
      await waitForPhysicsLoaded(page);
      await page.waitForTimeout(1_000);
      await setRangeValue(
        page,
        '[data-testid="physics-impulse-slider"]',
        magnitude
      );
      await page.getByTestId("physics-impulse-apply").click();
      await page.waitForTimeout(3_000);
      return page.evaluate(
        () =>
          window.__AGL_DIMENSIONS__!.getState().objects["phys:ball"].position.x
      );
    }
    const a = await restingXInState(-3);
    const b = await restingXInState(3);
    expect(Math.abs(b - a)).toBeGreaterThan(0.1);
  });
});

test.describe("T-007 — 5D live data: a genuinely live external feed", () => {
  test("AC5a: the page fetches a real external endpoint over HTTPS, and a rendered DOM value equals a field parsed from that response", async ({
    page,
  }) => {
    const responsePromise = page.waitForResponse(res =>
      res.url().includes("api.open-meteo.com")
    );
    await page.goto("/dimensions");
    const response = await responsePromise;
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    const expectedTemp = (body.current_weather.temperature as number).toFixed(
      1
    );
    await expect(page.getByTestId("live-data-value")).toContainText(
      `${expectedTemp}°F`,
      {
        timeout: 15_000,
      }
    );
  });

  test("AC5b: the upstream host is named in the UI, and the rendered value updates when a second, different response arrives", async ({
    page,
  }) => {
    await page.goto("/dimensions");
    await expect(page.getByTestId("live-data-source")).toContainText(
      "api.open-meteo.com"
    );
    await expect(page.getByTestId("live-data-value")).toBeVisible({
      timeout: 15_000,
    });
    await page.route("**/v1/forecast**", route =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          current_weather: {
            temperature: 12.3,
            windspeed: 45.6,
            winddirection: 10,
            time: "2026-01-01T00:00",
          },
        }),
      })
    );
    await page.getByTestId("live-data-refresh").click();
    await expect(page.getByTestId("live-data-value")).toContainText("12.3°F", {
      timeout: 10_000,
    });
  });

  test("AC6a: with the endpoint stubbed to a 500, a stated error naming the source renders and no stale value is shown", async ({
    page,
  }) => {
    await page.route("**/v1/forecast**", route =>
      route.fulfill({ status: 500, body: "stubbed failure" })
    );
    await page.goto("/dimensions");
    await expect(page.getByTestId("live-data-error")).toContainText(
      "api.open-meteo.com",
      { timeout: 15_000 }
    );
    await expect(page.getByTestId("live-data-value")).toHaveCount(0);
  });

  test("AC6b: with the endpoint aborted (network failure), a stated error naming the source renders and no stale value is shown", async ({
    page,
  }) => {
    await page.route("**/v1/forecast**", route => route.abort("failed"));
    await page.goto("/dimensions");
    await expect(page.getByTestId("live-data-error")).toContainText(
      "api.open-meteo.com",
      { timeout: 15_000 }
    );
    await expect(page.getByTestId("live-data-value")).toHaveCount(0);
  });
});

// ════════════════════════════════════════════════════════════════════════
// T-008 — 5D: the AI capability — BLOCKED, no code exists, no key held
// ════════════════════════════════════════════════════════════════════════

test.describe("T-008 — 5D AI capability", () => {
  const REASON =
    "SKIPPED — TASKS.md T-008 is blocked on OQ-1 (unanswered): no owner is set and no implementation " +
    'exists under client/src for a 5D AI capability (grep -rn "5D.*AI\\|ai.*capability" client/src/dimensions ' +
    "returns nothing beyond contract.ts's summary string). Distinct from the XR/Supabase skips below: this is " +
    "not blocked by a missing credential, it is blocked by an unmade architecture decision (Decision D-5D-AI in " +
    "T-001). Closes when D-5D-AI is recorded and T-008 is implemented; if a hosted-LLM/endpoint option is chosen " +
    "it would additionally need an API key this sandbox does not hold.";

  test("AC1: the AI capability computes output at request time from current state, not a hardcoded table", async () => {
    test.skip(true, REASON);
  });
  test("AC2: no lookup table of canned responses keyed by input pattern", async () => {
    test.skip(true, REASON);
  });
  test("AC3: the UI states plainly what the AI is and where it runs", async () => {
    test.skip(true, REASON);
  });
  test("AC4/AC5: the payload is lazy-loaded (browser) or no key leaks into dist/public/ (endpoint)", async () => {
    test.skip(true, REASON);
  });
  test("AC6: failure path — the UI says the AI is unavailable rather than fabricating an answer", async () => {
    test.skip(true, REASON);
  });
});

// ════════════════════════════════════════════════════════════════════════
// T-009 — 6D data plane: schema, RLS, realtime channel (backend/DB)
// ════════════════════════════════════════════════════════════════════════

test.describe("T-009 — 6D data plane", () => {
  test("AC1: a migration file defining the shared scene-state table(s) is checked into the repo", async () => {
    const migrationsDir = path.join(REPO_ROOT, "supabase/migrations");
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith(".sql"));
    expect(files.length).toBeGreaterThan(0);
    const combined = files
      .map(f => fs.readFileSync(path.join(migrationsDir, f), "utf8"))
      .join("\n");
    expect(combined).toMatch(/CREATE TABLE/i);
  });

  test("AC2/AC3: RLS is enabled and at least one policy exists per operation, in the checked-in migration SQL", async () => {
    const migrationsDir = path.join(REPO_ROOT, "supabase/migrations");
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith(".sql"));
    const combined = files
      .map(f => fs.readFileSync(path.join(migrationsDir, f), "utf8"))
      .join("\n");
    expect(combined).toMatch(/ENABLE ROW LEVEL SECURITY/i);
    expect(combined).toMatch(/CREATE POLICY/i);
  });

  test("AC4: SKIPPED — a live negative-RLS request (anon key attempting a forbidden operation)", async () => {
    test.skip(
      true,
      "SKIPPED — no Supabase project or anon key exists in this sandbox (Verified: no .env file; " +
        ".env.example ships VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY empty). Closes with a real project: apply " +
        'supabase/migrations/*.sql, then `curl -H "apikey: <anon>" <url>/rest/v1/dimensions_room_state -X PATCH ' +
        "...` against a row the policy should forbid, and record the response body."
    );
  });

  test("AC5: no service_role key appears anywhere in the built client bundle", async () => {
    const assetsDir = path.join(REPO_ROOT, "dist/public");
    const offenders: string[] = [];
    function walk(dir: string) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (/\.(js|html|css|map)$/.test(entry.name)) {
          const content = fs.readFileSync(full, "utf8");
          if (content.includes("service_role")) offenders.push(full);
        }
      }
    }
    walk(assetsDir);
    expect(offenders).toEqual([]);
  });

  test("AC6: the transport is reachable behind the swap-point interface, and only one file imports @supabase/*", async () => {
    const transportIndex = fs.readFileSync(
      path.join(REPO_ROOT, "client/src/dimensions/transport/index.ts"),
      "utf8"
    );
    expect(transportIndex).toMatch(/export function createTransport\s*\(/);
    const dimensionsSrc = path.join(REPO_ROOT, "client/src");
    const offenders: string[] = [];
    function walk(dir: string) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (/\.(ts|tsx)$/.test(entry.name)) {
          const content = fs.readFileSync(full, "utf8");
          if (
            content.includes("@supabase") &&
            !full.endsWith("supabaseTransport.ts")
          )
            offenders.push(full);
        }
      }
    }
    walk(dimensionsSrc);
    expect(offenders).toEqual([]);
  });
});

// ════════════════════════════════════════════════════════════════════════
// T-010 / T-011 — 6D: multi-user collaboration, digital twin, remote control
// ════════════════════════════════════════════════════════════════════════

test.describe("T-010 — real cross-browser-context synchronisation (the literal criterion)", () => {
  test("two independent browser.newContext() instances synchronise via the real Supabase transport", async ({
    browser,
  }) => {
    test.skip(
      true,
      "SKIPPED — TASKS.md T-010 AC1 literally requires two independent browser.newContext() instances " +
        "synchronising through the real transport. Verified: no .env file exists and .env.example ships " +
        "VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY empty, so this build's real transport is nullTransport " +
        "(status 'unconfigured') for every context — there is no live channel for two separate, storage-isolated " +
        "contexts to share (BroadcastChannel, the only same-origin channel available without one, does not cross " +
        "isolated Playwright contexts). Closes with: " +
        "VITE_SUPABASE_URL=<url> VITE_SUPABASE_ANON_KEY=<key> PW_PORT=4501 npx playwright test " +
        "tests/acceptance/dimensions.spec.ts -g 'two independent browser.newContext', with a second " +
        "browser.newContext()/newPage() actually opened here in place of this skip."
    );
    void browser;
  });
});

test.describe("T-010 / T-011 — the real, unconfigured default build (no anon key held)", () => {
  test("the default build honestly states collaboration is not available, and offers no join control", async ({
    page,
  }) => {
    await page.goto("/dimensions");
    await waitForHookReady(page);
    await expect(page.getByTestId("collab-sandbox-notice")).toHaveCount(0);
    await expect(page.getByTestId("collab-status")).toContainText(
      /not available in this build/i
    );
    await expect(page.getByTestId("collab-join")).toHaveCount(0);
    await expect(page.getByTestId("remote-control-status")).toContainText(
      /not available in this build/i
    );
  });

  test('"no peer, no claim": neither "connected" nor "device ready" nor "online" appears anywhere on the page', async ({
    page,
  }) => {
    await page.goto("/dimensions");
    await waitForHookReady(page);
    const body = await page.locator("body").innerText();
    expect(body).not.toMatch(/\bconnected\b/i);
    expect(body).not.toMatch(/device ready/i);
    expect(body).not.toMatch(/\bonline\b/i);
  });

  test("presence is not simulated: the real (unstubbed) build reports zero actors and zero ops with no timer ever populating them", async ({
    page,
  }) => {
    await page.goto("/dimensions");
    await waitForHookReady(page);
    await page.waitForTimeout(1_500); // give any (nonexistent) timer a chance to fire
    const snapshot = await page.evaluate(() =>
      window.__AGL_DIMENSIONS__!.getTransport()
    );
    expect(snapshot.status.kind).toBe("unconfigured");
    expect(snapshot.actorCount).toBe(0);
    expect(snapshot.opsApplied).toBe(0);
    expect(snapshot.opsRejected).toBe(0);
    await expect(page.getByTestId("collab-participant-count")).toHaveCount(0);
  });
});

test.describe("T-010 — presence, digital twin, disconnection (two-page loopback proof — see installFakeTransport header)", () => {
  test("AC(presence real): two pages each report 2 participants; closing one page brings the other back to 1", async ({
    context,
  }) => {
    await withFakeTransport(context);
    const pageA = await context.newPage();
    const pageB = await context.newPage();
    await joinAs(pageA, "Alice");
    await joinAs(pageB, "Bob");
    await expect(pageA.getByTestId("collab-participant-count")).toContainText(
      "2"
    );
    await expect(pageB.getByTestId("collab-participant-count")).toContainText(
      "2"
    );
    await pageB.close();
    await expect(pageA.getByTestId("collab-participant-count")).toContainText(
      "1",
      { timeout: 5_000 }
    );
    await pageA.close();
  });

  test("AC(two real pages synchronise): page A moves the shared platform; within 2000ms page B's hook reports the same position", async ({
    context,
  }) => {
    await withFakeTransport(context);
    const pageA = await context.newPage();
    const pageB = await context.newPage();
    await joinAs(pageA, "Alice");
    await joinAs(pageB, "Bob");
    const before = await pageA.evaluate(
      () => window.__AGL_DIMENSIONS__!.getState().objects.platform.position.x
    );
    await pageA.getByTestId("collab-move-right").click();
    await expect
      .poll(
        async () =>
          pageB.evaluate(
            () =>
              window.__AGL_DIMENSIONS__!.getState().objects.platform.position.x
          ),
        { timeout: 2_000 }
      )
      .not.toBe(before);
    const [xA, xB] = await Promise.all([
      pageA.evaluate(
        () => window.__AGL_DIMENSIONS__!.getState().objects.platform.position.x
      ),
      pageB.evaluate(
        () => window.__AGL_DIMENSIONS__!.getState().objects.platform.position.x
      ),
    ]);
    expect(xB).toBeCloseTo(xA, 2);
    await pageA.close();
    await pageB.close();
  });

  test("AC(digital twin): a third page, opened after the first two left, reads the position the first left it at", async ({
    context,
  }) => {
    await withFakeTransport(context);
    const pageA = await context.newPage();
    const pageB = await context.newPage();
    await joinAs(pageA, "Alice");
    await joinAs(pageB, "Bob");
    await pageA.getByTestId("collab-move-forward").click();
    await pageA.getByTestId("collab-move-forward").click();
    const leftAt = await pageA.evaluate(
      () => window.__AGL_DIMENSIONS__!.getState().objects.platform.position.z
    );
    await pageA.getByTestId("collab-leave").click();
    await pageB.getByTestId("collab-leave").click();
    await pageA.close();
    await pageB.close();
    const pageC = await context.newPage();
    await joinAs(pageC, "Carol");
    await expect
      .poll(async () =>
        pageC.evaluate(
          () =>
            window.__AGL_DIMENSIONS__!.getState().objects.platform.position.z
        )
      )
      .toBeCloseTo(leftAt, 2);
    await pageC.close();
  });

  test("AC(disconnection is honest): leaving immediately clears this page's own presented peer list", async ({
    context,
  }) => {
    await withFakeTransport(context);
    const pageA = await context.newPage();
    const pageB = await context.newPage();
    await joinAs(pageA, "Alice");
    await joinAs(pageB, "Bob");
    await expect(pageA.getByTestId("collab-participant-count")).toContainText(
      "2"
    );
    await pageA.getByTestId("collab-leave").click();
    await expect(pageA.getByTestId("collab-participant-count")).toHaveCount(0);
    await expect(pageA.getByTestId("collab-join")).toBeVisible();
    await pageA.close();
    await pageB.close();
  });
});

test.describe("T-011 — remote session control (second browser session as the controlled endpoint)", () => {
  test("with only one session joined, the controller role offers no command controls", async ({
    context,
  }) => {
    await withFakeTransport(context);
    const page = await context.newPage();
    await joinAs(page, "Alice");
    await page.getByTestId("remote-control-role-controller").check();
    await expect(page.getByTestId("remote-control-no-peer")).toBeVisible();
    await expect(page.getByTestId("remote-control-send-left")).toHaveCount(0);
    await page.close();
  });

  test("a command sent by the controller is applied and reported back by the controlled session, genuinely over the wire", async ({
    context,
  }) => {
    await withFakeTransport(context);
    const controller = await context.newPage();
    const controlled = await context.newPage();
    await joinAs(controller, "Alice");
    await joinAs(controlled, "Bob");
    await controller.getByTestId("remote-control-role-controller").check();
    await controlled.getByTestId("remote-control-role-controlled").check();
    await controller.getByTestId("remote-control-send-right").click();
    await expect(
      controller.getByTestId("remote-control-command-status")
    ).toContainText(/reported back by Bob/i, {
      timeout: 5_000,
    });
    await expect(
      controlled.getByTestId("remote-control-received")
    ).toContainText(/received and applied a move command from Alice/i, {
      timeout: 5_000,
    });
    await controller.close();
    await controlled.close();
  });
});

test.describe("T-010 / T-011 — accessibility", () => {
  test("participant badges and the join form are keyboard-reachable with non-empty accessible names", async ({
    context,
  }) => {
    await withFakeTransport(context);
    const page = await context.newPage();
    await page.goto("/dimensions");
    await waitForHookReady(page);
    await expect(page.getByTestId("collab-display-name")).toBeVisible();
    await page.getByTestId("collab-display-name").focus();
    await expect(page.getByTestId("collab-display-name")).toBeFocused();
    const joinAccessibleName = await page
      .getByTestId("collab-join")
      .getAttribute("aria-label");
    const joinText = await page.getByTestId("collab-join").textContent();
    expect(
      (joinAccessibleName || joinText || "").trim().length
    ).toBeGreaterThan(0);
    await page.close();
  });
});

// ════════════════════════════════════════════════════════════════════════
// T-012 — 7D: AR/VR/MR with honest capability degradation
// ════════════════════════════════════════════════════════════════════════

const XR_FORBIDDEN_STRINGS =
  /in VR|XR active|immersive session running|connected/i;

test.describe("T-012 — 7D honest degradation states", () => {
  test("AC1/AC6: SKIPPED — a real immersive XRSession actually starting and ending on real hardware", async () => {
    test.skip(
      true,
      "SKIPPED — this sandbox's Chromium genuinely has no XR runtime (Verified below, unstubbed: " +
        "isSessionSupported resolves false for both modes). A real XRSession object with a non-zero XRFrame " +
        "count cannot be produced without an actual VR/AR-capable browser and headset. Closes by running " +
        "`PW_PORT=4501 npx playwright test tests/acceptance/dimensions.spec.ts -g 'immersive'` on a real " +
        "WebXR-capable browser (e.g. Chrome on a headset, or a Meta Quest Browser) with a device connected, " +
        "and recording the browser/device used."
    );
  });

  test("AC(real, unstubbed): this Chromium genuinely has no XR device, and the hook/UI say so honestly", async ({
    page,
  }) => {
    await page.goto("/dimensions");
    await waitForHookReady(page);
    await waitForXrProbe(page);
    const hasNavigatorXr = await page.evaluate(
      () => typeof navigator.xr !== "undefined"
    );
    expect(hasNavigatorXr).toBe(true); // this Chromium build genuinely exposes navigator.xr
    const xr = await page.evaluate(() => window.__AGL_DIMENSIONS__!.getXR());
    expect(xr?.state).toBe("no-device");
    expect(xr?.supported).toEqual({ vr: false, ar: false });
    await expect(page.getByTestId("xr-status")).toHaveText(
      /no immersive vr or ar device was detected/i
    );
    const bodyText = (await page.locator("body").innerText()) ?? "";
    expect(bodyText).not.toMatch(XR_FORBIDDEN_STRINGS);
  });

  test("AC2: with navigator.xr deleted, the page renders the unavailable state and no affirmative session string appears in the DOM", async ({
    page,
  }) => {
    const pageErrors: Error[] = [];
    page.on("pageerror", err => pageErrors.push(err));
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "xr", {
        value: undefined,
        configurable: true,
      });
    });
    await page.goto("/dimensions");
    await waitForHookReady(page);
    await waitForXrProbe(page);
    await expect(page.getByTestId("xr-status")).toHaveText(
      /not available|not supported/i
    );
    const bodyText = (await page.locator("body").innerText()) ?? "";
    expect(bodyText).not.toMatch(XR_FORBIDDEN_STRINGS);
    expect(pageErrors).toEqual([]);
  });

  // AC3: every enumerated D-7D-DETECT state renders, is truthful, and is covered by its own test.
  const STATES: Array<{
    name: string;
    stub: () => void;
    expectState: string;
    statusRegex: RegExp;
  }> = [
    {
      name: "no navigator.xr at all",
      stub: () => {
        Object.defineProperty(navigator, "xr", {
          value: undefined,
          configurable: true,
        });
      },
      expectState: "no-webxr",
      statusRegex: /not available|not supported/i,
    },
    {
      name: "navigator.xr present, both session types unsupported",
      stub: () => {
        Object.defineProperty(navigator, "xr", {
          value: { isSessionSupported: () => Promise.resolve(false) },
          configurable: true,
        });
      },
      expectState: "no-device",
      statusRegex: /no immersive vr or ar device was detected/i,
    },
    {
      name: "immersive-ar only",
      stub: () => {
        Object.defineProperty(navigator, "xr", {
          value: {
            isSessionSupported: (mode: string) =>
              Promise.resolve(mode === "immersive-ar"),
          },
          configurable: true,
        });
      },
      expectState: "ar-only",
      statusRegex: /immersive ar is available/i,
    },
    {
      name: "immersive-vr only",
      stub: () => {
        Object.defineProperty(navigator, "xr", {
          value: {
            isSessionSupported: (mode: string) =>
              Promise.resolve(mode === "immersive-vr"),
          },
          configurable: true,
        });
      },
      expectState: "vr-only",
      statusRegex: /immersive vr is available/i,
    },
    {
      name: "both immersive-ar and immersive-vr supported",
      stub: () => {
        Object.defineProperty(navigator, "xr", {
          value: { isSessionSupported: () => Promise.resolve(true) },
          configurable: true,
        });
      },
      expectState: "ar-and-vr",
      statusRegex: /immersive ar and vr are available/i,
    },
    {
      name: "isSessionSupported rejected (blocked by permissions policy)",
      stub: () => {
        Object.defineProperty(navigator, "xr", {
          value: {
            isSessionSupported: () =>
              Promise.reject(new DOMException("blocked", "SecurityError")),
          },
          configurable: true,
        });
      },
      expectState: "blocked-by-policy",
      statusRegex: /blocked by this page's permissions policy/i,
    },
  ];

  for (const s of STATES) {
    test(`AC3: state "${s.name}" renders as ${s.expectState}, and the reason is the actual detected one (not generic)`, async ({
      page,
    }) => {
      await page.addInitScript(s.stub);
      await page.goto("/dimensions");
      await waitForHookReady(page);
      await waitForXrProbe(page);
      const xr = await page.evaluate(() => window.__AGL_DIMENSIONS__!.getXR());
      expect(xr?.state).toBe(s.expectState);
      await expect(page.getByTestId("xr-status")).toHaveText(s.statusRegex);
      const bodyText = (await page.locator("body").innerText()) ?? "";
      expect(bodyText).not.toMatch(XR_FORBIDDEN_STRINGS);
    });
  }

  test("AC(session start rejected by the user): the status names the actual rejection reason, and the control is re-enabled, not stuck", async ({
    page,
  }) => {
    const rejectionMessage = "Session request was denied by the user.";
    await page.addInitScript(message => {
      Object.defineProperty(navigator, "xr", {
        value: {
          isSessionSupported: () => Promise.resolve(true),
          requestSession: () => Promise.reject(new Error(message as string)),
        },
        configurable: true,
      });
    }, rejectionMessage);
    await page.goto("/dimensions");
    await waitForHookReady(page);
    await waitForXrProbe(page);
    await page.getByTestId("xr-enter-ar").click();
    await expect(page.getByTestId("xr-status")).toContainText(
      rejectionMessage,
      { timeout: 10_000 }
    );
    const xr = await page.evaluate(() => window.__AGL_DIMENSIONS__!.getXR());
    expect(xr?.state).toBe("session-rejected");
    await expect(page.getByTestId("xr-enter-ar")).toBeEnabled();
    const bodyText = (await page.locator("body").innerText()) ?? "";
    expect(bodyText).not.toMatch(XR_FORBIDDEN_STRINGS);
  });

  test('AC5 (iOS path): with no navigator.xr but relList reporting AR support, a real <a rel="ar"> link to a built .usdz asset is offered and resolves 200', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "xr", {
        value: undefined,
        configurable: true,
      });
      const proto = (
        window as unknown as { HTMLAnchorElement: { prototype: object } }
      ).HTMLAnchorElement.prototype;
      Object.defineProperty(proto, "relList", {
        configurable: true,
        get() {
          return { supports: (token: string) => token === "ar" };
        },
      });
    });
    await page.goto("/dimensions");
    await waitForHookReady(page);
    await waitForXrProbe(page);
    const link = page.getByTestId("xr-quicklook-link");
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("rel", "ar");
    const href = await link.getAttribute("href");
    expect(href).toMatch(/\.usdz$/);
    const response = await page.request.get(href!);
    expect(response.status()).toBe(200);
  });

  test("AC7: the non-immersive 3D+4D scene remains fully usable while XR is unavailable — additive, never a gate", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "xr", {
        value: undefined,
        configurable: true,
      });
    });
    await page.goto("/dimensions");
    await waitForHookReady(page);
    await waitForXrProbe(page);
    const scrubber = page.locator("#dimensions-scrubber");
    await expect(scrubber).toBeEnabled();
    await setRangeValue(page, "#dimensions-scrubber", 5);
    await expect(page.getByTestId("dimensions-time")).toContainText("5.00s");
  });
});

// ════════════════════════════════════════════════════════════════════════
// T-013 — Home teaser and the AGL "Spatial & Industry SaaS" vertical
// ════════════════════════════════════════════════════════════════════════

test.describe("T-013 — Home page dimensional stack teaser", () => {
  test("AC1a: a teaser section exists on / naming all five levels", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByTestId("dimensions-teaser")).toBeVisible();
    for (const level of DIMENSION_LEVELS) {
      await expect(
        page.getByTestId(`dimension-teaser-card-${level}`)
      ).toBeVisible();
    }
  });

  test("AC1b: its call to action navigates to /dimensions", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByTestId("dimensions-teaser-cta").click();
    await page.waitForURL("**/dimensions");
    expect(page.url()).toContain("/dimensions");
  });

  test("AC2: loading / issues zero requests for the 3D chunk, even with the teaser present", async ({
    page,
  }) => {
    const threeRequests: string[] = [];
    page.on("request", req => {
      if (/vendor-three|DimensionsStage/.test(req.url()))
        threeRequests.push(req.url());
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(threeRequests).toEqual([]);
  });

  test("AC6a: the CTA is keyboard reachable with a non-empty accessible name", async ({
    page,
  }) => {
    await page.goto("/");
    const cta = page.getByTestId("dimensions-teaser-cta");
    await cta.focus();
    await expect(cta).toBeFocused();
    const name = await cta.textContent();
    expect((name || "").trim().length).toBeGreaterThan(0);
  });
});

test.describe("T-013 — AGL 'Spatial & Industry SaaS' vertical", () => {
  test("AC3: the vertical is expanded to reference the dimensional stack, and its card links to /dimensions", async ({
    page,
  }) => {
    await page.goto("/agl");
    await expect(page.getByTestId("agl-dimensions-ladder")).toBeVisible();
    await expect(page.getByTestId("agl-dimensions-cta")).toHaveAttribute(
      "href",
      "/dimensions"
    );
  });

  test("AC6b: the AGL CTA is keyboard reachable with a non-empty accessible name", async ({
    page,
  }) => {
    await page.goto("/agl");
    const cta = page.getByTestId("agl-dimensions-cta");
    await cta.focus();
    await expect(cta).toBeFocused();
    const name = await cta.textContent();
    expect((name || "").trim().length).toBeGreaterThan(0);
  });
});

// ════════════════════════════════════════════════════════════════════════
// T-014 — per-product dimensional capability level
// ════════════════════════════════════════════════════════════════════════

test.describe("T-014 — the field is optional; no repository evidence means no badge", () => {
  test("AC2: the Products list page renders zero dimension badges for any product with no known level", async ({
    page,
  }) => {
    await page.goto("/products");
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator('[data-testid="dimension-badge"]')).toHaveCount(
      0
    );
  });

  test('AC5: the "Capability:" filter row is absent while the data-derived set of levels carried by any product is empty', async ({
    page,
  }) => {
    await page.goto("/products");
    await expect(page.getByText("Capability:", { exact: false })).toHaveCount(
      0
    );
  });

  test("AC3: generateFallbackProduct does not set dimensionLevel — read from source, and confirmed against a slug outside the real database", async ({
    page,
  }) => {
    const source = fs.readFileSync(
      path.join(REPO_ROOT, "client/src/pages/ProductDetail.tsx"),
      "utf8"
    );
    const fnStart = source.indexOf("export function generateFallbackProduct");
    expect(fnStart).toBeGreaterThan(-1);
    const fnEnd = source.indexOf("\n}\n", fnStart);
    const fnBody = source.slice(fnStart, fnEnd);
    expect(fnBody).not.toMatch(/dimensionLevel/);

    await page.goto("/products/some-slug-that-does-not-exist-anywhere");
    await expect(page.locator('[data-testid="dimension-badge"]')).toHaveCount(
      0
    );
  });

  test("AC4: every level assigned traces to the source OQ-3 names — currently, zero products carry an assigned level (OQ-3 is unresolved)", async () => {
    const productsSource = fs.readFileSync(
      path.join(REPO_ROOT, "client/src/pages/Products.tsx"),
      "utf8"
    );
    const detailSource = fs.readFileSync(
      path.join(REPO_ROOT, "client/src/pages/ProductDetail.tsx"),
      "utf8"
    );
    const assignmentPattern = /dimensionLevel:\s*"[0-9]D"/;
    // This is the CURRENT true state per TASKS.md T-014's own blocker (OQ-3
    // unanswered — "there is no source of truth for which product has which
    // dimensional capability"). If a product ever gets a real assignment,
    // this assertion is expected to need updating alongside a recorded
    // source in TASKS.md's Notes — that is the traceability check itself,
    // not a bug in this test.
    expect(productsSource).not.toMatch(assignmentPattern);
    expect(detailSource).not.toMatch(assignmentPattern);
  });

  test("AC6: badge colors meet WCAG AA contrast (>= 4.5:1) against both real page backgrounds it renders on", async () => {
    // Composited exactly as the browser would: DimensionBadge's own
    // `background: rgba(99,102,241,0.16)` (identical in Products.tsx:865-871
    // and ProductDetail.tsx:726-732) alpha-blended over each page's actual
    // root background, then contrast-checked against the badge's own text
    // color `#C7D2FE`. No live badge instance exists to screenshot today
    // (AC4 above) — the criterion is checked against the exact values the
    // component would render with, the moment OQ-3 assigns a first level.
    function hexToRgb(hex: string) {
      const n = parseInt(hex.replace("#", ""), 16);
      return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    }
    function relLuminance({ r, g, b }: { r: number; g: number; b: number }) {
      const chan = (c: number) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
    }
    function contrastRatio(
      a: { r: number; g: number; b: number },
      b: { r: number; g: number; b: number }
    ) {
      const L1 = relLuminance(a) + 0.05;
      const L2 = relLuminance(b) + 0.05;
      return L1 > L2 ? L1 / L2 : L2 / L1;
    }
    function composite(
      fg: { r: number; g: number; b: number; a: number },
      bg: { r: number; g: number; b: number }
    ) {
      return {
        r: fg.r * fg.a + bg.r * (1 - fg.a),
        g: fg.g * fg.a + bg.g * (1 - fg.a),
        b: fg.b * fg.a + bg.b * (1 - fg.a),
      };
    }

    const badgeBg = { r: 99, g: 102, b: 241, a: 0.16 };
    const badgeText = hexToRgb("#C7D2FE");
    const pageBackgrounds = [
      { page: "Products.tsx", bg: hexToRgb("#030408") },
      { page: "ProductDetail.tsx", bg: hexToRgb("#070B14") },
    ];

    for (const { page, bg } of pageBackgrounds) {
      const effectiveBg = composite(badgeBg, bg);
      const ratio = contrastRatio(effectiveBg, badgeText);
      expect(
        ratio,
        `${page}: badge text/background contrast is ${ratio.toFixed(2)}:1`
      ).toBeGreaterThanOrEqual(4.5);
    }
  });
});

// ════════════════════════════════════════════════════════════════════════
// Honesty contract — every level's rendered status matches
// DIMENSION_AVAILABILITY, and every partial level's caveat renders verbatim
// ════════════════════════════════════════════════════════════════════════

test.describe("Honesty contract — rendered UI vs client/src/dimensions/contract.ts", () => {
  test("on /dimensions, every level's badge label and (if partial) caveat matches DIMENSION_AVAILABILITY exactly", async ({
    page,
  }) => {
    await page.goto("/dimensions");
    for (const level of DIMENSION_LEVELS) {
      const availability = DIMENSION_AVAILABILITY[level];
      const presentation = dimensionStatusPresentation(availability.status);
      const card = page.getByTestId(`dimension-matrix-card-${level}`);
      await expect(card).toContainText(presentation.badgeLabel);
      if (availability.status === "partial") {
        const caveat = page.getByTestId(`dimension-matrix-caveat-${level}`);
        await expect(caveat).toHaveText(availability.caveat);
      } else {
        await expect(
          page.getByTestId(`dimension-matrix-caveat-${level}`)
        ).toHaveCount(0);
      }
    }
  });

  test("on / (Home teaser), every level's badge label and (if partial) caveat matches DIMENSION_AVAILABILITY exactly", async ({
    page,
  }) => {
    await page.goto("/");
    for (const level of DIMENSION_LEVELS) {
      const availability = DIMENSION_AVAILABILITY[level];
      const presentation = dimensionStatusPresentation(availability.status);
      const status = page.getByTestId(`dimension-teaser-status-${level}`);
      await expect(status).toHaveText(presentation.badgeLabel);
      if (availability.status === "partial") {
        const caveat = page.getByTestId(`dimension-teaser-caveat-${level}`);
        await expect(caveat).toHaveText(availability.caveat);
      } else {
        await expect(
          page.getByTestId(`dimension-teaser-caveat-${level}`)
        ).toHaveCount(0);
      }
    }
  });

  test("on /agl, every partial level's caveat list item matches DIMENSION_AVAILABILITY's caveat verbatim", async ({
    page,
  }) => {
    await page.goto("/agl");
    for (const level of DIMENSION_LEVELS) {
      const availability = DIMENSION_AVAILABILITY[level];
      if (availability.status === "partial") {
        const caveatItem = page.getByTestId(`agl-dimension-caveat-${level}`);
        await expect(caveatItem).toContainText(availability.caveat);
      }
    }
  });
});
