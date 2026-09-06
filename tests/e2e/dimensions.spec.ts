/**
 * END-TO-END TESTS — /dimensions (T-004, T-005, T-006, T-007)
 *
 * Acceptance criteria are TASKS.md's, not restated here. Each test names
 * the criterion it proves in its title. Uses `window.__AGL_DIMENSIONS__`
 * (ARCHITECTURE-DIMENSIONS.md §10, D-HOOK) — read-only — wherever a claim
 * needs scene-state evidence a DOM assertion alone cannot give.
 */
import { test, expect, type Page } from "@playwright/test";

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

interface HookState {
  t: number;
  objects: Record<
    string,
    { visible: boolean; kind: string; position: Vec3; label: string }
  >;
  selection: string | null;
  stages: { id: string; label: string; startsAt: number; endsAt: number }[];
  actors: Record<string, unknown>;
  revision: number;
}

interface RenderStats {
  frame: number;
  calls: number;
  triangles: number;
  programs: number;
}

interface CameraSnapshot {
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  distance: number;
}

interface PhysicsSnapshot {
  steps: number;
  bodies: Record<string, { position: Vec3; velocity: Vec3 }>;
}

interface LiveDataSnapshot {
  source: string;
  status: "idle" | "loading" | "ok" | "error";
  fetchedAt: number | null;
  value: unknown;
  error: string | null;
}

type XrUiState =
  | "no-webgl"
  | "no-webxr"
  | "quicklook-only"
  | "no-device"
  | "blocked-by-policy"
  | "ar-only"
  | "vr-only"
  | "ar-and-vr"
  | "session-rejected"
  | "session-running";

interface XrSnapshot {
  state: XrUiState;
  supported: { vr: boolean; ar: boolean } | null;
  sessionMode: "immersive-ar" | "immersive-vr" | null;
  xrFrames: number;
}

declare global {
  interface Window {
    __AGL_DIMENSIONS__?: {
      ready: boolean;
      getState(): HookState;
      getRenderStats(): RenderStats | null;
      getCamera(): CameraSnapshot;
      getPhysics(): PhysicsSnapshot | null;
      getLiveData(): LiveDataSnapshot;
      getXR(): XrSnapshot | null;
    };
  }
}

/**
 * Waits for the async capability probe (`xr/detect.ts`'s `probeXR()`) to
 * resolve at least once. Deliberately checks the hook exists at all, not
 * just `?.getXR() !== null` — optional chaining on a missing hook evaluates
 * to `undefined`, and `undefined !== null` is `true`, so that check alone
 * would resolve immediately even before the hook is installed. Every actual
 * test in this file calls `waitForHookReady` first anyway (which makes that
 * race moot here), but a helper that is only correct when called in a
 * specific order is a latent bug in whoever calls it next.
 */
async function waitForXrProbe(page: Page) {
  await page.waitForFunction(
    () =>
      window.__AGL_DIMENSIONS__ !== undefined &&
      window.__AGL_DIMENSIONS__.getXR() !== null,
    undefined,
    { timeout: 15_000 }
  );
}

async function waitForHookReady(page: Page) {
  await page.waitForFunction(
    () => window.__AGL_DIMENSIONS__?.ready === true,
    undefined,
    { timeout: 20_000 }
  );
}

/** Sets a range input's value the way a script-driven "direct control" would, bypassing React's controlled-value tracking. */
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

// ── T-004 — route, nav entry, lazy boundary, capability gate ────────────────

test.describe("T-004 — /dimensions route and lazy boundary", () => {
  test("renders the page at /dimensions", async ({ page }) => {
    const response = await page.goto("/dimensions");
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator("h1")).toContainText("7D");
  });

  test("desktop nav has a Dimensions entry that navigates to /dimensions", async ({
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

  test("mobile nav menu has a Dimensions entry that navigates to /dimensions", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: /toggle menu/i }).click();
    // The desktop nav's link stays in the DOM (Tailwind `hidden lg:flex`), so
    // scope to the one actually visible at this mobile viewport.
    await page
      .locator('a[href="/dimensions"]:visible', { hasText: "Dimensions" })
      .click();
    await page.waitForURL("**/dimensions");
    expect(page.url()).toContain("/dimensions");
  });

  test("/ issues zero requests for the 3D vendor chunk", async ({ page }) => {
    const threeRequests: string[] = [];
    page.on("request", req => {
      if (/vendor-three|DimensionsStage/.test(req.url()))
        threeRequests.push(req.url());
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(threeRequests).toEqual([]);
  });

  test("/products issues zero requests for the 3D vendor chunk", async ({
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

  test("with WebGL unavailable, a fallback renders and nothing throws", async ({
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

  test('under prefers-reduced-motion, motion-mode reads "reduced" and the frame count settles', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/dimensions");
    // A generous timeout here, matching this project's own actionTimeout —
    // this assertion runs immediately after navigation, so it is the one
    // most exposed to a slow initial load under a busy CI/dev machine.
    await expect(page.getByTestId("motion-mode")).toHaveText("reduced", {
      timeout: 15_000,
    });

    await waitForHookReady(page);
    // The 3D model finishing its runtime fetch is itself a legitimate,
    // one-time invalidation (§5.7) — wait for it to resolve first so the
    // settle window below measures true idle behaviour, not a race against
    // that async completion.
    await expect(page.getByText("Loading the 3D model")).toHaveCount(0, {
      timeout: 20_000,
    });

    await page.waitForTimeout(700); // > the 500ms settle window with no input
    const framesAfterSettle = await page.evaluate(
      () => window.__AGL_DIMENSIONS__!.getRenderStats()!.frame
    );
    await page.waitForTimeout(700);
    const framesLater = await page.evaluate(
      () => window.__AGL_DIMENSIONS__!.getRenderStats()!.frame
    );
    expect(framesLater).toBe(framesAfterSettle);
  });

  test("Tab from the top of the page reaches interactive controls with non-empty accessible names", async ({
    page,
  }) => {
    await page.goto("/dimensions");
    await waitForHookReady(page);
    await page.locator("body").click({ position: { x: 2, y: 2 } }); // ensure focus starts at the document, not mid-page
    await page.keyboard.press("Tab"); // consume the initial focus landing outside any assertion

    const names: string[] = [];
    for (let i = 0; i < 60; i++) {
      const name = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const aria = el.getAttribute("aria-label");
        if (aria) return aria.trim();
        if (el.id) {
          const label = document.querySelector(`label[for="${el.id}"]`);
          if (label?.textContent?.trim()) return label.textContent.trim();
        }
        const text = el.textContent?.trim();
        if (text) return text;
        return "";
      });
      if (name === null) break; // focus left the document (reached the end)
      names.push(name);
      await page.keyboard.press("Tab");
    }

    expect(names.length).toBeGreaterThan(0);
    for (const name of names) {
      expect(
        name.length,
        `an interactive control on /dimensions had no accessible name`
      ).toBeGreaterThan(0);
    }
  });

  for (const width of [640, 768, 1024]) {
    test(`renders with no horizontal scroll at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto("/dimensions");
      await page.waitForLoadState("networkidle");
      await page.screenshot({
        path: `../test-results/dimensions-${width}.png`,
        fullPage: true,
      });
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // +1px rounding tolerance
    });
  }
});

// ── T-005 — 3D: spatial model and navigation ─────────────────────────────────

test.describe("T-005 — 3D spatial model and navigation", () => {
  test("a real WebGL context is available", async ({ page }) => {
    await page.goto("/dimensions");
    const hasWebGL = await page.evaluate(() => {
      const canvas = document.createElement("canvas");
      return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
    });
    expect(hasWebGL).toBe(true);
  });

  test("the scene renders real geometry: triangles > 0 and draw calls > 0", async ({
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

  test("a pointer drag across the canvas changes the camera position", async ({
    page,
  }) => {
    await page.goto("/dimensions");
    await waitForHookReady(page);
    const canvas = page.locator("canvas");
    await canvas.scrollIntoViewIfNeeded(); // the canvas sits below the fold at the default viewport height
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

  test("a wheel event changes the camera distance", async ({ page }) => {
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

  test("keyboard controls orbit and dolly the camera by the same kind of position delta", async ({
    page,
  }) => {
    // Reduced motion disables OrbitControls' damping (§8.1: "discrete steps,
    // no easing"), so each keypress's effect is applied in full immediately
    // rather than eased in gradually over several frames — which is what
    // makes an exact "Home returns to the pre-interaction position" check
    // meaningful right after a rapid sequence of keypresses.
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

    const distanceBefore = await page.evaluate(
      () => window.__AGL_DIMENSIONS__!.getCamera().distance
    );
    for (let i = 0; i < 5; i++) await page.keyboard.press("PageUp");
    const distanceAfter = await page.evaluate(
      () => window.__AGL_DIMENSIONS__!.getCamera().distance
    );
    expect(Math.abs(distanceAfter - distanceBefore)).toBeGreaterThan(0.05);

    await page.keyboard.press("Home");
    const afterHome = await page.evaluate(
      () => window.__AGL_DIMENSIONS__!.getCamera().position
    );
    expect(euclidean(afterHome, before)).toBeLessThan(0.01);
  });

  test('a named, sourced model asset is fetched at runtime and reaches "ready"', async ({
    page,
  }) => {
    const modelResponse = page.waitForResponse(res =>
      res.url().includes("/models/toycar.glb")
    );
    await page.goto("/dimensions");
    const res = await modelResponse;
    expect(res.status()).toBe(200);
    await expect(page.getByText("Loading the 3D model")).toHaveCount(0, {
      timeout: 20_000,
    });
    await waitForHookReady(page);
    const state = await page.evaluate(() =>
      window.__AGL_DIMENSIONS__!.getState()
    );
    const toycarObjects = Object.values(state.objects).filter(
      o => o.kind === "toycar"
    );
    expect(toycarObjects.length).toBeGreaterThan(0);
  });

  test("with the model request stubbed to a 500, a stated error renders and nothing throws", async ({
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

// ── T-006 — 4D: time, animation, lifecycle, process simulation ──────────────

test.describe("T-006 — 4D time and process simulation", () => {
  test("setting the scrubber updates the hook's reported t to the same value", async ({
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

  test("different t values show different visible object sets, and returning restores the first set", async ({
    page,
  }) => {
    await page.goto("/dimensions");
    await waitForHookReady(page);

    async function visibleIdsAt(t: number): Promise<string[]> {
      await setRangeValue(page, "#dimensions-scrubber", t);
      await page.waitForTimeout(50);
      return page.evaluate(() => {
        const state = window.__AGL_DIMENSIONS__!.getState();
        return Object.entries(state.objects)
          .filter(([, o]) => o.visible)
          .map(([id]) => id)
          .sort();
      });
    }

    const atLoading = await visibleIdsAt(5); // "Loading" stage window
    const atTransit = await visibleIdsAt(9); // "Transit" stage window
    expect(atTransit).not.toEqual(atLoading);

    const backToLoading = await visibleIdsAt(5);
    expect(backToLoading).toEqual(atLoading);
  });

  test("t = 0.5 reached via a slider set and via 60 quantised keyboard steps is byte-identical", async ({
    page,
  }) => {
    await page.goto("/dimensions");
    await waitForHookReady(page);

    await setRangeValue(page, "#dimensions-scrubber", 0.5);
    await page.waitForTimeout(50);
    const viaDirectControl = await page.evaluate(() => {
      const { revision: _revision, ...rest } =
        window.__AGL_DIMENSIONS__!.getState();
      return rest;
    });

    await setRangeValue(page, "#dimensions-scrubber", 0); // back to the lattice origin
    await page.waitForTimeout(50);
    await page.locator("#dimensions-scrubber").focus();
    for (let i = 0; i < 60; i++) await page.keyboard.press("ArrowRight"); // 60 * (1/120) = 0.5
    await page.waitForTimeout(50);
    const viaKeyboardSteps = await page.evaluate(() => {
      const { revision: _revision, ...rest } =
        window.__AGL_DIMENSIONS__!.getState();
      return rest;
    });

    expect(viaKeyboardSteps).toEqual(viaDirectControl);
  });

  test("play advances t over wall-clock time; pause freezes it", async ({
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

  test("the lifecycle is named in the UI and rendered stage labels match the model data", async ({
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

  test("under reduced motion, autoplay does not start and the timeline stays operable by direct control", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/dimensions");
    await waitForHookReady(page);

    const initialT = await page.evaluate(
      () => window.__AGL_DIMENSIONS__!.getState().t
    );
    expect(initialT).toBe(0);
    await page.waitForTimeout(1200);
    const tAfterWaiting = await page.evaluate(
      () => window.__AGL_DIMENSIONS__!.getState().t
    );
    expect(tAfterWaiting).toBe(0); // no autoplay: t never moved on its own

    await setRangeValue(page, "#dimensions-scrubber", 2);
    await page.waitForTimeout(50);
    const tAfterDirectControl = await page.evaluate(
      () => window.__AGL_DIMENSIONS__!.getState().t
    );
    expect(tAfterDirectControl).toBeCloseTo(2, 5);
  });
});

// ── T-007 — 5D: interaction, physics, and live data ─────────────────────────

/** Waits until the physics chunk has loaded (first "Run simulation" click resolves the dynamic import). */
async function waitForPhysicsLoaded(page: Page) {
  await page.waitForFunction(
    () => window.__AGL_DIMENSIONS__!.getPhysics() !== null,
    undefined,
    { timeout: 15_000 }
  );
}

test.describe("T-007 — 5D interaction: raycast selection and the parallel DOM control tree", () => {
  test("clicking a rendered object selects it via raycast, matching the object under the click point", async ({
    page,
  }) => {
    await page.goto("/dimensions");
    await waitForHookReady(page);
    const canvas = page.locator("canvas");
    await canvas.scrollIntoViewIfNeeded();
    const box = (await canvas.boundingBox())!;

    // (0.5, 0.65) reliably lands on the "Loading platform" object at this
    // scene's default camera framing (model/process.ts's platform spans
    // most of the visible ground plane) — verified interactively against
    // the running app before this coordinate was hardcoded here.
    await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.65);
    await page.waitForTimeout(100);
    const selection = await page.evaluate(
      () => window.__AGL_DIMENSIONS__!.getState().selection
    );
    expect(selection).toBe("platform");
    await expect(page.getByTestId("dimensions-selection")).toContainText(
      "Selected: Loading platform"
    );

    // The parallel DOM control tree reflects the same selection state.
    const outlineButton = page
      .getByTestId("dimensions-outline-item")
      .filter({ hasText: "Loading platform" });
    await expect(outlineButton).toHaveAttribute("aria-pressed", "true");
  });

  test("clicking empty space (no geometry under the click point) clears the selection", async ({
    page,
  }) => {
    await page.goto("/dimensions");
    await waitForHookReady(page);
    const canvas = page.locator("canvas");
    await canvas.scrollIntoViewIfNeeded();
    const box = (await canvas.boundingBox())!;

    await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.65); // select platform
    await page.waitForTimeout(100);
    expect(
      await page.evaluate(() => window.__AGL_DIMENSIONS__!.getState().selection)
    ).toBe("platform");

    // (0.5, 0.15) is above the platform's screen extent at this camera
    // framing — background, no geometry.
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

  test("selecting from the scene outline writes the same selection state a raycast would", async ({
    page,
  }) => {
    await page.goto("/dimensions");
    await waitForHookReady(page);
    const button = page
      .getByTestId("dimensions-outline-item")
      .filter({ hasText: "Loading platform" });
    await expect(button).toHaveAttribute("aria-pressed", "false");

    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    const selection = await page.evaluate(
      () => window.__AGL_DIMENSIONS__!.getState().selection
    );
    expect(selection).toBe("platform");

    // Clicking the same (already-selected) button again clears it.
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "false");
    expect(
      await page.evaluate(() => window.__AGL_DIMENSIONS__!.getState().selection)
    ).toBeNull();
  });
});

test.describe("T-007 — 5D physics: a real cannon-es simulation", () => {
  test('the physics chunk is a separate lazy chunk, not requested until "Run simulation" is clicked', async ({
    page,
  }) => {
    const physicsRequests: string[] = [];
    page.on("request", req => {
      if (/vendor-physics/.test(req.url())) physicsRequests.push(req.url());
    });
    await page.goto("/dimensions");
    await waitForHookReady(page);
    await page.waitForLoadState("networkidle");
    expect(physicsRequests).toEqual([]); // not loaded on route entry

    await page.getByTestId("physics-run").click();
    await waitForPhysicsLoaded(page);
    expect(physicsRequests.length).toBeGreaterThan(0); // loaded once Run is clicked
  });

  test("gravity produces a monotonically decreasing y across at least 30 consecutive hook reads, and a bounce reverses the velocity sign", async ({
    page,
  }) => {
    await page.goto("/dimensions");
    await waitForHookReady(page);
    await page.getByTestId("physics-run").click();
    await waitForPhysicsLoaded(page);

    // Sampled entirely inside the page (via requestAnimationFrame) so the
    // result isn't polluted by Node↔browser round-trip jitter.
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
      } else {
        current = 1;
      }
    }
    expect(longestFall).toBeGreaterThanOrEqual(30);

    const bounced = samples.some(
      (s, i) => i > 0 && samples[i - 1].vy < -0.05 && s.vy > 0.05
    );
    expect(bounced).toBe(true);
  });

  test("physics is not scripted: two different impulse magnitudes produce two different resting positions", async ({
    page,
  }) => {
    await page.goto("/dimensions");
    await waitForHookReady(page);

    async function restingXAfterImpulse(magnitude: number): Promise<number> {
      await page.getByTestId("physics-reset").click();
      await page.getByTestId("physics-run").click();
      await waitForPhysicsLoaded(page);
      await page.waitForTimeout(1_000); // let it fall and bounce once first
      await setRangeValue(
        page,
        '[data-testid="physics-impulse-slider"]',
        magnitude
      );
      await page.getByTestId("physics-impulse-apply").click();
      await page.waitForTimeout(3_000); // let friction/damping settle it
      return page.evaluate(
        () => window.__AGL_DIMENSIONS__!.getPhysics()!.bodies.ball.position.x
      );
    }

    const low = await restingXAfterImpulse(1);
    const high = await restingXAfterImpulse(4);
    expect(Math.abs(high - low)).toBeGreaterThan(0.1);
  });

  test("scenario controls change simulation inputs and the outcome changes measurably in the hook state (getState, not just getPhysics)", async ({
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

    const scenarioA = await restingXInState(-3);
    const scenarioB = await restingXInState(3);
    expect(Math.abs(scenarioB - scenarioA)).toBeGreaterThan(0.1);
  });

  test("Reset returns the ball to its starting state and re-enables the 4D timeline scrubber", async ({
    page,
  }) => {
    await page.goto("/dimensions");
    await waitForHookReady(page);

    const scrubber = page.locator("#dimensions-scrubber");
    await expect(scrubber).toBeEnabled();

    // physics/constants.ts's PHYSICS_START_POSITION — asserted against the
    // authored constant, not a value captured moments after Run, because
    // the sandbox may already have taken its first fixed step (a real,
    // tiny, non-zero fall) by the time `getPhysics()` first resolves.
    const authoredStart = { x: -4.5, y: 4, z: 1.2 };

    await page.getByTestId("physics-run").click();
    await waitForPhysicsLoaded(page);
    await expect(scrubber).toBeDisabled();
    await expect(
      page.getByTestId("dimensions-physics-timeline-note")
    ).toContainText("runs forward only");

    await page.waitForTimeout(1_500); // let it fall away from its start position
    const midFallPosition = await page.evaluate(
      () => window.__AGL_DIMENSIONS__!.getPhysics()!.bodies.ball.position
    );
    expect(midFallPosition.y).not.toBeCloseTo(authoredStart.y, 1);

    await page.getByTestId("physics-reset").click();
    const afterReset = await page.evaluate(
      () => window.__AGL_DIMENSIONS__!.getPhysics()!.bodies.ball.position
    );
    expect(afterReset).toEqual(authoredStart);
    await expect(scrubber).toBeEnabled();
    await expect(
      page.getByTestId("dimensions-physics-timeline-note")
    ).toHaveCount(0);
  });
});

test.describe("T-007 — 5D live data: a real external endpoint over HTTPS", () => {
  test("fetches from a real external endpoint and renders a value parsed from the intercepted response body", async ({
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
      { timeout: 15_000 }
    );
  });

  test("the upstream host is named in the UI, and the rendered value updates when a second, different response arrives", async ({
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

  test("with the endpoint stubbed to a 500, a stated error naming the source renders and no stale value is shown", async ({
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

  test("with the endpoint aborted (network failure), a stated error naming the source renders and no stale value is shown", async ({
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

  test("a value shown, then a failure, replaces it entirely — a stale value is never left displayed as current", async ({
    page,
  }) => {
    await page.goto("/dimensions");
    await expect(page.getByTestId("live-data-value")).toBeVisible({
      timeout: 15_000,
    });

    await page.route("**/v1/forecast**", route =>
      route.fulfill({ status: 500, body: "stubbed failure" })
    );
    await page.getByTestId("live-data-refresh").click();
    await expect(page.getByTestId("live-data-error")).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByTestId("live-data-value")).toHaveCount(0);
  });
});

// ── T-012 — 7D: AR/VR/MR with honest capability degradation ────────────────
//
// The four affirmative strings the whole honesty contract turns on — see
// ARCHITECTURE-DIMENSIONS.md §7.2's closing paragraph, quoted verbatim in
// this project's dispatch for T-012. Checked against the WHOLE page body,
// not just [data-testid="xr-status"], because a stray mention anywhere else
// on the page would be exactly as dishonest.
const XR_FORBIDDEN_STRINGS =
  /in VR|XR active|immersive session running|connected/i;

test.describe("T-012 — 7D: WebXR capability probe and honest degradation", () => {
  test('the real, unstubbed browser genuinely has no XR device — the hook reports "no-device" and the page says so, naming the actual reason', async ({
    page,
  }) => {
    // No addInitScript stub here at all: this Chromium build does expose a
    // real `navigator.xr` (Verified — the probe below is not simulated), and
    // reports both session types unsupported because this CI/dev machine
    // genuinely has no XR runtime. This is the majority real-world case
    // T-012's Notes describe, caught without faking anything.
    await page.goto("/dimensions");
    await waitForHookReady(page);
    await waitForXrProbe(page);

    const hasNavigatorXr = await page.evaluate(
      () => typeof navigator.xr !== "undefined"
    );
    expect(hasNavigatorXr).toBe(true);

    const xr = await page.evaluate(() => window.__AGL_DIMENSIONS__!.getXR());
    expect(xr?.state).toBe("no-device");
    expect(xr?.supported).toEqual({ vr: false, ar: false });

    await expect(page.getByTestId("xr-status")).toHaveText(
      /no immersive vr or ar device was detected/i
    );
    await expect(page.getByTestId("xr-enter-ar")).toHaveCount(0);
    await expect(page.getByTestId("xr-enter-vr")).toHaveCount(0);
    const bodyText = (await page.locator("body").innerText()) ?? "";
    expect(bodyText).not.toMatch(XR_FORBIDDEN_STRINGS);
  });

  test("with navigator.xr deleted, the page renders the unavailable state and no affirmative session string appears anywhere in the DOM", async ({
    page,
  }) => {
    const pageErrors: Error[] = [];
    page.on("pageerror", err => pageErrors.push(err));
    await page.addInitScript(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    const xr = await page.evaluate(() => window.__AGL_DIMENSIONS__!.getXR());
    expect(xr?.state === "no-webxr" || xr?.state === "quicklook-only").toBe(
      true
    ); // this Chromium has no Quick Look, so "no-webxr" in practice
    expect(xr?.sessionMode).toBeNull();

    const bodyText = (await page.locator("body").innerText()) ?? "";
    expect(bodyText).not.toMatch(XR_FORBIDDEN_STRINGS);
    expect(pageErrors).toEqual([]);
  });

  test('with navigator.xr both session types stubbed unsupported, the hook and the DOM both report "no-device"', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Object.defineProperty(navigator, "xr", {
        value: { isSessionSupported: () => Promise.resolve(false) },
        configurable: true,
      });
    });
    await page.goto("/dimensions");
    await waitForHookReady(page);
    await waitForXrProbe(page);

    const xr = await page.evaluate(() => window.__AGL_DIMENSIONS__!.getXR());
    expect(xr).toEqual({
      state: "no-device",
      supported: { vr: false, ar: false },
      sessionMode: null,
      xrFrames: 0,
    });
    await expect(page.getByTestId("xr-status")).toHaveText(
      /no immersive vr or ar device was detected/i
    );
  });

  test('with only immersive-ar reported supported, "ar-only" renders: Enter AR is offered, Enter VR is not', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Object.defineProperty(navigator, "xr", {
        value: {
          isSessionSupported: (mode: string) =>
            Promise.resolve(mode === "immersive-ar"),
        },
        configurable: true,
      });
    });
    await page.goto("/dimensions");
    await waitForHookReady(page);
    await waitForXrProbe(page);

    const xr = await page.evaluate(() => window.__AGL_DIMENSIONS__!.getXR());
    expect(xr?.state).toBe("ar-only");
    await expect(page.getByTestId("xr-status")).toHaveText(
      /immersive ar is available/i
    );
    await expect(page.getByTestId("xr-enter-ar")).toBeVisible();
    await expect(page.getByTestId("xr-enter-vr")).toHaveCount(0);
  });

  test('with only immersive-vr reported supported, "vr-only" renders: Enter VR is offered, Enter AR is not', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Object.defineProperty(navigator, "xr", {
        value: {
          isSessionSupported: (mode: string) =>
            Promise.resolve(mode === "immersive-vr"),
        },
        configurable: true,
      });
    });
    await page.goto("/dimensions");
    await waitForHookReady(page);
    await waitForXrProbe(page);

    const xr = await page.evaluate(() => window.__AGL_DIMENSIONS__!.getXR());
    expect(xr?.state).toBe("vr-only");
    await expect(page.getByTestId("xr-status")).toHaveText(
      /immersive vr is available/i
    );
    await expect(page.getByTestId("xr-enter-vr")).toBeVisible();
    await expect(page.getByTestId("xr-enter-ar")).toHaveCount(0);
  });

  test('with both session types reported supported, "ar-and-vr" renders both controls, both keyboard-reachable with accessible names', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Object.defineProperty(navigator, "xr", {
        value: { isSessionSupported: () => Promise.resolve(true) },
        configurable: true,
      });
    });
    await page.goto("/dimensions");
    await waitForHookReady(page);
    await waitForXrProbe(page);

    const xr = await page.evaluate(() => window.__AGL_DIMENSIONS__!.getXR());
    expect(xr?.state).toBe("ar-and-vr");
    await expect(page.getByTestId("xr-status")).toHaveText(
      /immersive ar and vr are available/i
    );
    await expect(page.getByTestId("xr-enter-ar")).toBeVisible();
    await expect(page.getByTestId("xr-enter-vr")).toBeVisible();

    // Accessible names, not just presence.
    await expect(page.getByTestId("xr-enter-ar")).toHaveAccessibleName(
      /enter immersive ar/i
    );
    await expect(page.getByTestId("xr-enter-vr")).toHaveAccessibleName(
      /enter immersive vr/i
    );
  });

  test('a REJECTED isSessionSupported maps to "blocked-by-policy", never "no-device" — the rule this decision exists for', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Object.defineProperty(navigator, "xr", {
        value: {
          isSessionSupported: () =>
            Promise.reject(new DOMException("blocked", "SecurityError")),
        },
        configurable: true,
      });
    });
    await page.goto("/dimensions");
    await waitForHookReady(page);
    await waitForXrProbe(page);

    const xr = await page.evaluate(() => window.__AGL_DIMENSIONS__!.getXR());
    expect(xr?.state).toBe("blocked-by-policy");
    await expect(page.getByTestId("xr-status")).toHaveText(
      /blocked by this page's permissions policy/i
    );
    await expect(page.getByTestId("xr-enter-ar")).toHaveCount(0);
    await expect(page.getByTestId("xr-enter-vr")).toHaveCount(0);
    const bodyText = (await page.locator("body").innerText()) ?? "";
    expect(bodyText).not.toMatch(XR_FORBIDDEN_STRINGS);
  });

  test("session start rejected by the browser: the status names the actual rejection reason, and the control is re-enabled, not stuck", async ({
    page,
  }) => {
    const rejectionMessage = "Session request was denied by the user.";
    await page.addInitScript(message => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Object.defineProperty(navigator, "xr", {
        value: {
          isSessionSupported: () => Promise.resolve(true),
          requestSession: () => Promise.reject(new Error(message)),
        },
        configurable: true,
      });
    }, rejectionMessage);
    await page.goto("/dimensions");
    await waitForHookReady(page);
    await waitForXrProbe(page);

    await expect(page.getByTestId("xr-enter-ar")).toBeVisible();
    await page.getByTestId("xr-enter-ar").click();

    await expect(page.getByTestId("xr-status")).toContainText(
      rejectionMessage,
      { timeout: 10_000 }
    );
    const xr = await page.evaluate(() => window.__AGL_DIMENSIONS__!.getXR());
    expect(xr?.state).toBe("session-rejected");

    // "control re-enabled" (§7.2's table) — not hidden, not permanently disabled.
    await expect(page.getByTestId("xr-enter-ar")).toBeVisible();
    await expect(page.getByTestId("xr-enter-ar")).toBeEnabled();

    const bodyText = (await page.locator("body").innerText()) ?? "";
    expect(bodyText).not.toMatch(XR_FORBIDDEN_STRINGS);
  });

  test("the 3D scene remains fully usable while XR is unavailable — XR is additive, never a gate", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Object.defineProperty(navigator, "xr", {
        value: undefined,
        configurable: true,
      });
    });
    await page.goto("/dimensions");
    await waitForHookReady(page);
    await waitForXrProbe(page);

    // The 4D timeline scrubber (a proxy for "the 3D+4D stage is fully
    // interactive") is enabled and usable exactly as it is with XR available.
    const scrubber = page.locator("#dimensions-scrubber");
    await expect(scrubber).toBeEnabled();
    await setRangeValue(page, "#dimensions-scrubber", 5);
    await expect(page.getByTestId("dimensions-time")).toContainText("5.00s");
  });

  test('AR Quick Look: with no navigator.xr but relList reporting AR support (Safari), a real <a rel="ar"> link to a built .usdz is offered', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Object.defineProperty(navigator, "xr", {
        value: undefined,
        configurable: true,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const proto = (window as any).HTMLAnchorElement.prototype;
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

    const xr = await page.evaluate(() => window.__AGL_DIMENSIONS__!.getXR());
    expect(xr?.state).toBe("quicklook-only");
    await expect(page.getByTestId("xr-status")).toHaveText(
      /apple's ar quick look is available/i
    );

    const link = page.getByTestId("xr-quicklook-link");
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("rel", "ar");
    const href = await link.getAttribute("href");
    expect(href).toMatch(/\.usdz$/);

    // The asset is real, not a dead link — fetched through the page's own
    // origin so this proves the same build the browser just rendered.
    const response = await page.request.get(href!);
    expect(response.status()).toBe(200);
  });
});
