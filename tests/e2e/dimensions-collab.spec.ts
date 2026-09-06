/**
 * END-TO-END TESTS — T-010 (6D multi-user collaboration + digital twin) and
 * T-011 (6D remote session control)
 *
 * Acceptance criteria are TASKS.md's, adapted where OQ-2 (resolved: 6D
 * "remote device control" is genuinely a second BROWSER SESSION, never a
 * physical device) changed the literal wording. Uses
 * `window.__AGL_DIMENSIONS__` (D-HOOK) wherever a claim needs scene-state
 * evidence a DOM assertion alone cannot give.
 *
 * **No Supabase anon key exists in this repo** (Verified — no `.env` file;
 * `.env.example` ships both `VITE_SUPABASE_*` empty). Two consequences:
 *
 * 1. The DEFAULT build under test here is genuinely `unconfigured` — not
 *    simulated. The "T-010/T-011 — unconfigured" describe block below
 *    exercises the real, shipped `nullTransport` path with no test seam at
 *    all.
 * 2. Cross-BROWSER synchronisation (`browser.newContext()` twice) is
 *    architecturally NOT RUN — no anon key means no live Supabase channel
 *    to join across that boundary, and `BroadcastChannel` does not cross it
 *    either (§6.7). The command that would prove it, once a key exists:
 *
 *      VITE_SUPABASE_URL=<url> VITE_SUPABASE_ANON_KEY=<key> \
 *        PW_PORT=4001 npx playwright test tests/e2e/dimensions-collab.spec.ts
 *
 *    with a second `browser.newContext()` added to the "two-page" describe
 *    block below in place of `context.newPage()`.
 *
 * What IS run here, genuinely: two-PAGE synchronisation in one browser
 * CONTEXT (`context.newPage()` twice — real, separate documents, real
 * rendered UI, real screenshots), which `BroadcastChannel` **does** cross.
 * Since `transport/loopbackTransport.ts` is documented as reachable from
 * nowhere but itself and its own unit test (enforced by a grep over
 * `client/src` for the literal string "loopbackTransport" — a dynamic
 * import would still match it), this spec does not import it. Instead it
 * injects an equivalent, self-contained `CollaborationTransport`
 * implementation via `page.addInitScript`, assigned to
 * `window.__AGL_DIMENSIONS_TEST_TRANSPORT__` — a seam `useCollaboration.ts`
 * checks for and is otherwise never defined in a real build (see that
 * file's header for the full reasoning).
 */
import { test, expect, type Page, type BrowserContext } from '@playwright/test';

interface TransportSnapshot {
  status: { kind: string; reason?: string; since?: number; attempt?: number; lastError?: string };
  actorCount: number;
  actors: string[];
  opsApplied: number;
  opsRejected: number;
}

async function waitForHookReady(page: Page) {
  await page.waitForFunction(() => (window as unknown as { __AGL_DIMENSIONS__?: { ready: boolean } }).__AGL_DIMENSIONS__?.ready === true, undefined, {
    timeout: 20_000,
  });
}

async function getTransportSnapshot(page: Page): Promise<TransportSnapshot> {
  return page.evaluate(
    () => (window as unknown as { __AGL_DIMENSIONS__: { getTransport(): TransportSnapshot } }).__AGL_DIMENSIONS__.getTransport(),
  );
}

/**
 * A minimal, self-contained `CollaborationTransport` (client/src/dimensions/
 * transport/types.ts) built from `BroadcastChannel` + `localStorage` —
 * structurally the same mechanism `loopbackTransport.ts` already implements
 * and already has its own dedicated, exhaustive unit tests for (validation,
 * rate limiting, both included). This function is serialised into the page
 * by `page.addInitScript`, so it must be self-contained (no closures over
 * this file's scope, no imports).
 */
function installFakeTransport() {
  const CHANNEL_NAME = 'e2e-dimensions-collab-channel';
  const STORAGE_KEY = 'e2e-dimensions-collab-snapshot';

  function makeTransport() {
    let status: { kind: string; [key: string]: unknown } = { kind: 'idle' };
    let channel: BroadcastChannel | null = null;
    let selfActorId: string | null = null;
    const peers = new Map<string, unknown>();
    const opListeners = new Set<(op: unknown) => void>();
    const presenceListeners = new Set<(actors: unknown[]) => void>();
    const statusListeners = new Set<(status: unknown) => void>();

    function setStatus(next: typeof status) {
      status = next;
      statusListeners.forEach((cb) => cb(status));
    }
    function notifyPresence() {
      const list = Array.from(peers.values());
      presenceListeners.forEach((cb) => cb(list));
    }
    function handleMessage(event: MessageEvent) {
      const msg = event.data as { kind?: string; op?: unknown; presence?: { actorId: string }; actorId?: string };
      if (!msg || typeof msg !== 'object') return;
      if (msg.kind === 'op') {
        opListeners.forEach((cb) => cb(msg.op));
        return;
      }
      if (msg.kind === 'presence-announce' && msg.presence) {
        peers.set(msg.presence.actorId, msg.presence);
        notifyPresence();
        return;
      }
      if (msg.kind === 'presence-leave' && msg.actorId) {
        peers.delete(msg.actorId);
        notifyPresence();
        return;
      }
      if (msg.kind === 'presence-request') {
        if (selfActorId && peers.has(selfActorId) && channel) {
          channel.postMessage({ kind: 'presence-announce', presence: peers.get(selfActorId) });
        }
      }
    }

    function announceLeave() {
      if (channel && selfActorId) {
        channel.postMessage({ kind: 'presence-leave', actorId: selfActorId });
      }
    }
    window.addEventListener('pagehide', announceLeave);

    return {
      get status() {
        return status;
      },
      async join(roomId: string, self: { actorId: string; displayName: string; colorHex: string }) {
        setStatus({ kind: 'connecting' });
        selfActorId = self.actorId;
        const presence = { actorId: self.actorId, displayName: self.displayName, colorHex: self.colorHex, joinedAt: Date.now(), lastSeenAt: Date.now() };
        peers.set(self.actorId, presence);
        channel = new BroadcastChannel(CHANNEL_NAME);
        channel.onmessage = handleMessage;
        channel.postMessage({ kind: 'presence-announce', presence });
        channel.postMessage({ kind: 'presence-request' });
        setStatus({ kind: 'connected', since: Date.now() });
        notifyPresence();
      },
      async leave() {
        announceLeave();
        channel?.close();
        channel = null;
        peers.clear();
        setStatus({ kind: 'idle' });
      },
      async publish(op: unknown) {
        channel?.postMessage({ kind: 'op', op });
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

  (window as unknown as { __AGL_DIMENSIONS_TEST_TRANSPORT__: () => unknown }).__AGL_DIMENSIONS_TEST_TRANSPORT__ = makeTransport;
}

async function withFakeTransport(context: BrowserContext) {
  await context.addInitScript(installFakeTransport);
}

async function joinAs(page: Page, displayName: string) {
  await page.goto('/dimensions');
  await waitForHookReady(page);
  await page.getByTestId('collab-display-name').fill(displayName);
  await page.getByTestId('collab-join').click();
  await expect(page.getByTestId('collab-participant-count')).toBeVisible({ timeout: 10_000 });
}

// ── T-010/T-011 — the real, unconfigured default build (no anon key) ────────

test.describe('T-010/T-011 — unconfigured build (genuinely, no test seam, no anon key exists)', () => {
  test('T-018 F-4: no sandbox notice and no join control is offered — there is nothing for the notice to honestly describe', async ({ page }) => {
    await page.goto('/dimensions');
    await waitForHookReady(page);
    // Previously this notice rendered unconditionally, including here, where
    // no join control exists at all — pointing a visitor at a control that
    // was not on the page. It must not render in this state.
    await expect(page.getByTestId('collab-sandbox-notice')).toHaveCount(0);
    await expect(page.getByTestId('collab-status')).toContainText(/not available in this build/i);
    await expect(page.getByTestId('collab-join')).toHaveCount(0);
  });

  test('T-018 F-4: sandbox-notice wording ("public sandbox", "anyone who joins can move") does not leak anywhere on the page in this state', async ({ page }) => {
    await page.goto('/dimensions');
    await waitForHookReady(page);
    const body = await page.locator('body').innerText();
    expect(body).not.toMatch(/public sandbox/i);
    expect(body).not.toMatch(/anyone who joins can move/i);
  });

  test('T-018 F-4: remote session control states the honest unconfigured reason, not a pointer at a join control that does not exist', async ({ page }) => {
    await page.goto('/dimensions');
    await waitForHookReady(page);
    await expect(page.getByTestId('remote-control-status')).toContainText(/not available in this build/i);
    await expect(page.getByTestId('remote-control-status')).not.toContainText(/join the shared stage above/i);
    await expect(page.getByTestId('remote-control-role-controller')).toHaveCount(0);
  });

  test('"no peer, no claim": the strings "connected", "device ready" and "online" do not appear anywhere in the DOM in this state', async ({
    page,
  }) => {
    await page.goto('/dimensions');
    await waitForHookReady(page);
    const body = await page.locator('body').innerText();
    expect(body).not.toMatch(/\bconnected\b/i);
    expect(body).not.toMatch(/device ready/i);
    expect(body).not.toMatch(/\bonline\b/i);
  });

  test('the test hook reports the real transport status honestly: unconfigured, zero actors, zero ops', async ({ page }) => {
    await page.goto('/dimensions');
    await waitForHookReady(page);
    const snapshot = await getTransportSnapshot(page);
    expect(snapshot.status.kind).toBe('unconfigured');
    expect(snapshot.actorCount).toBe(0);
    expect(snapshot.opsApplied).toBe(0);
    expect(snapshot.opsRejected).toBe(0);
  });

  test('screenshot: the 6D panels in their honest unconfigured state', async ({ page }) => {
    await page.goto('/dimensions');
    await waitForHookReady(page);
    // No sandbox notice renders here (F-4) — scroll to the honest status
    // line instead, which is what this state actually shows.
    await page.getByTestId('collab-status').scrollIntoViewIfNeeded();
    await page.screenshot({ path: '../test-results/t010-unconfigured.png', fullPage: false });
  });
});

// ── T-016 S-9 — the literal "before join() is reachable" case ───────────────

test.describe('T-016 S-9 — configured but not yet joined (the Join button IS present and clickable)', () => {
  test('the sandbox notice is already visible when the page loads — before the Join button is ever clicked, not after', async ({
    context,
  }) => {
    await withFakeTransport(context);
    const page = await context.newPage();
    await page.goto('/dimensions');
    await waitForHookReady(page);

    // Configured (fake transport present) and NOT yet joined: the join
    // control genuinely IS reachable here — this is the exact state S-9
    // requires the notice to already be visible in.
    await expect(page.getByTestId('collab-join')).toBeVisible();
    await expect(page.getByTestId('collab-participant-count')).toHaveCount(0); // not joined yet
    await expect(page.getByTestId('collab-sandbox-notice')).toBeVisible();
    await expect(page.getByTestId('collab-sandbox-notice')).toContainText(/public sandbox/i);
    await expect(page.getByTestId('collab-sandbox-notice')).toContainText(/anyone who joins can move/i);

    await page.close();
  });
});

// ── T-010 — genuine two-PAGE synchronisation, one browser context ───────────

test.describe('T-010 — two-page synchronisation, presence, digital twin, disconnection (loopback proof — see file header)', () => {
  test('two real pages synchronise: page A moves the shared platform; within 2000ms page B\'s hook reports it at the same position', async ({
    context,
  }) => {
    await withFakeTransport(context);
    const pageA = await context.newPage();
    const pageB = await context.newPage();

    await joinAs(pageA, 'Alice');
    await joinAs(pageB, 'Bob');

    await expect(pageA.getByTestId('collab-participant-count')).toContainText('2');
    await expect(pageB.getByTestId('collab-participant-count')).toContainText('2');

    const before = await pageA.evaluate(
      () => (window as unknown as { __AGL_DIMENSIONS__: { getState(): { objects: Record<string, { position: { x: number } }> } } }).__AGL_DIMENSIONS__.getState().objects.platform.position.x,
    );
    await pageA.getByTestId('collab-move-right').click();

    await expect
      .poll(
        async () =>
          pageB.evaluate(
            () =>
              (window as unknown as { __AGL_DIMENSIONS__: { getState(): { objects: Record<string, { position: { x: number } }> } } }).__AGL_DIMENSIONS__.getState().objects.platform
                .position.x,
          ),
        { timeout: 2_000 },
      )
      .not.toBe(before);

    const [xA, xB] = await Promise.all([
      pageA.evaluate(() => (window as unknown as { __AGL_DIMENSIONS__: { getState(): { objects: Record<string, { position: { x: number } }> } } }).__AGL_DIMENSIONS__.getState().objects.platform.position.x),
      pageB.evaluate(() => (window as unknown as { __AGL_DIMENSIONS__: { getState(): { objects: Record<string, { position: { x: number } }> } } }).__AGL_DIMENSIONS__.getState().objects.platform.position.x),
    ]);
    expect(xB).toBeCloseTo(xA, 2);

    await pageA.screenshot({ path: '../test-results/t010-two-page-a.png' });
    await pageB.screenshot({ path: '../test-results/t010-two-page-b.png' });

    // T-016 S-9: the sandbox notice claims anyone who joins can "reset it" —
    // prove Reset is a real, exercised control, not just a claim: it moves
    // the object back and, like any other 6D op, page B sees it too.
    await pageA.getByTestId('collab-reset').click();
    await expect
      .poll(async () => pageB.evaluate(() => (window as unknown as { __AGL_DIMENSIONS__: { getState(): { objects: Record<string, { position: { x: number } }> } } }).__AGL_DIMENSIONS__.getState().objects.platform.position.x), { timeout: 2_000 })
      .toBeCloseTo(before, 2);

    await pageA.close();
    await pageB.close();
  });

  test('presence is real: two pages each report 2 participants; closing page B brings page A back to 1', async ({ context }) => {
    await withFakeTransport(context);
    const pageA = await context.newPage();
    const pageB = await context.newPage();

    await joinAs(pageA, 'Alice');
    await joinAs(pageB, 'Bob');
    await expect(pageA.getByTestId('collab-participant-count')).toContainText('2');
    await expect(pageB.getByTestId('collab-participant-count')).toContainText('2');

    await pageB.close(); // no explicit "Leave" click — a real tab close, exactly as the AC states

    await expect(pageA.getByTestId('collab-participant-count')).toContainText('1', { timeout: 5_000 });
    await pageA.close();
  });

  test('presence is not simulated: with the transport blocked before join, the participant count never shows a phantom peer', async ({
    page,
  }) => {
    // No fake transport installed, no anon key exists — this is the real
    // build. `join()` is unreachable in "unconfigured" (no button renders),
    // so there is nothing to simulate a peer with — confirmed here rather
    // than assumed.
    await page.goto('/dimensions');
    await waitForHookReady(page);
    await page.waitForTimeout(1_500); // give any (nonexistent) timer/interval a chance to fire
    const snapshot = await getTransportSnapshot(page);
    expect(snapshot.actorCount).toBe(0);
    await expect(page.getByTestId('collab-participant-count')).toHaveCount(0);
  });

  test('digital twin: a third page, opened after the first two left, reads the position the first left it at', async ({ context }) => {
    await withFakeTransport(context);
    const pageA = await context.newPage();
    const pageB = await context.newPage();

    await joinAs(pageA, 'Alice');
    await joinAs(pageB, 'Bob');
    await expect(pageA.getByTestId('collab-participant-count')).toContainText('2');

    await pageA.getByTestId('collab-move-forward').click();
    await pageA.getByTestId('collab-move-forward').click();
    const leftAt = await pageA.evaluate(
      () => (window as unknown as { __AGL_DIMENSIONS__: { getState(): { objects: Record<string, { position: { z: number } }> } } }).__AGL_DIMENSIONS__.getState().objects.platform.position.z,
    );

    await pageA.getByTestId('collab-leave').click();
    await pageB.getByTestId('collab-leave').click();
    await pageA.close();
    await pageB.close();

    const pageC = await context.newPage();
    await joinAs(pageC, 'Carol');

    await expect
      .poll(async () =>
        pageC.evaluate(
          () => (window as unknown as { __AGL_DIMENSIONS__: { getState(): { objects: Record<string, { position: { z: number } }> } } }).__AGL_DIMENSIONS__.getState().objects.platform.position.z,
        ),
      )
      .toBeCloseTo(leftAt, 2);

    await pageC.close();
  });

  test('disconnection is honest: leaving clears this page\'s OWN presented peer list rather than leaving it looking current', async ({
    context,
  }) => {
    // The general "a status change away from connected clears the peer
    // list" wiring behaviour is unit-tested directly and more precisely
    // against a fully-controllable mock transport in
    // tests/unit/dimensions-collab-hook.test.tsx ("disconnection is
    // honest") — this build has no real network layer to sever for a
    // genuine e2e equivalent (no anon key). What IS e2e-provable here: this
    // page's own view of "who else is present" is never left stale after
    // it leaves — clicking Leave immediately drops its own participant
    // count display rather than continuing to show the room it just left.
    await withFakeTransport(context);
    const pageA = await context.newPage();
    const pageB = await context.newPage();
    await joinAs(pageA, 'Alice');
    await joinAs(pageB, 'Bob');
    await expect(pageA.getByTestId('collab-participant-count')).toContainText('2');

    await pageA.getByTestId('collab-leave').click();
    await expect(pageA.getByTestId('collab-participant-count')).toHaveCount(0);
    await expect(pageA.getByTestId('collab-join')).toBeVisible();

    await expect(pageB.getByTestId('collab-participant-count')).toContainText('1', { timeout: 5_000 });
    await pageA.close();
    await pageB.close();
  });
});

// ── T-011 — remote session control ───────────────────────────────────────────

test.describe('T-011 — remote session control (browser-session-as-remote-endpoint)', () => {
  test('with only one session joined, the controller role reports no session is available and offers no command controls', async ({
    context,
  }) => {
    await withFakeTransport(context);
    const page = await context.newPage();
    await joinAs(page, 'Alice');
    await page.getByTestId('remote-control-role-controller').check();
    await expect(page.getByTestId('remote-control-no-peer')).toBeVisible();
    await expect(page.getByTestId('remote-control-send-left')).toHaveCount(0);
    const body = await page.locator('body').innerText();
    expect(body).not.toMatch(/device ready/i);
    await page.close();
  });

  test('a command sent by the controller is applied and reported back by the controlled session — genuinely, over the wire', async ({
    context,
  }) => {
    await withFakeTransport(context);
    const controller = await context.newPage();
    const controlled = await context.newPage();

    await joinAs(controller, 'Alice');
    await joinAs(controlled, 'Bob');
    await expect(controller.getByTestId('collab-participant-count')).toContainText('2');

    await controller.getByTestId('remote-control-role-controller').check();
    await controlled.getByTestId('remote-control-role-controlled').check();

    await controller.getByTestId('remote-control-send-right').click();

    await expect(controller.getByTestId('remote-control-command-status')).toContainText(/reported back by Bob/i, {
      timeout: 5_000,
    });
    await expect(controlled.getByTestId('remote-control-received')).toContainText(/received and applied a move command from Alice/i, {
      timeout: 5_000,
    });

    await controller.screenshot({ path: '../test-results/t011-controller-confirmed.png' });
    await controlled.screenshot({ path: '../test-results/t011-controlled-received.png' });

    await controller.close();
    await controlled.close();
  });

  test('with nobody set to receive, a sent command reports "no response" honestly rather than a fabricated success', async ({
    context,
  }) => {
    await withFakeTransport(context);
    const controller = await context.newPage();
    const bystander = await context.newPage(); // joined, but role stays "none"

    await joinAs(controller, 'Alice');
    await joinAs(bystander, 'Bob');
    await expect(controller.getByTestId('collab-participant-count')).toContainText('2');

    await controller.getByTestId('remote-control-role-controller').check();
    await controller.getByTestId('remote-control-send-left').click();

    await expect(controller.getByTestId('remote-control-command-status')).toContainText(/no report received/i, { timeout: 6_000 });

    await controller.close();
    await bystander.close();
  });
});

// ── Accessibility (keyboard focus order, accessible names) ──────────────────

test.describe('T-010/T-011 — accessibility', () => {
  test('the join form and, once joined, participant badges and move controls are keyboard-reachable with non-empty accessible names', async ({
    context,
  }) => {
    await withFakeTransport(context);
    const page = await context.newPage();
    await page.goto('/dimensions');
    await waitForHookReady(page);

    const nameInput = page.getByTestId('collab-display-name');
    await expect(nameInput).toBeVisible();
    await nameInput.focus();
    await expect(nameInput).toBeFocused();

    const joinButton = page.getByTestId('collab-join');
    await expect(joinButton).toHaveAccessibleName(/join the shared stage/i);

    await joinButton.click();
    await expect(page.getByTestId('collab-participant-count')).toBeVisible();

    const actorButton = page.getByTestId('collab-actor').first();
    await expect(actorButton).toBeVisible();
    const accessibleName = await actorButton.getAttribute('aria-label');
    expect(accessibleName).toMatch(/participant:/i);
    await actorButton.focus();
    await expect(actorButton).toBeFocused();

    for (const testId of ['collab-move-left', 'collab-move-right', 'collab-move-forward', 'collab-move-back', 'collab-reset']) {
      const control = page.getByTestId(testId);
      const name = await control.getAttribute('aria-label');
      expect(name && name.length).toBeGreaterThan(0);
    }

    await page.close();
  });

  test('Tab order through the 6D section reaches every control in visual order, with no element skipped or trapped', async ({
    context,
  }) => {
    await withFakeTransport(context);
    const page = await context.newPage();
    await joinAs(page, 'Alice');
    await page.getByTestId('remote-control-role-controller').check();

    // Start from the last known element before the 6D section (the physics
    // panel's "Reset" button, already covered by T-005/T-007's own a11y
    // tests) and Tab forward, recording each focused element's test id (or
    // tag+role when it has none) until we reach the 7D section's own first
    // control — proving the 6D controls sit in one continuous, sensible
    // tab sequence rather than being skipped or looped.
    await page.getByTestId('physics-reset').focus();

    const order: string[] = [];
    for (let i = 0; i < 25; i++) {
      await page.keyboard.press('Tab');
      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el) return null;
        return el.getAttribute('data-testid') || `${el.tagName}[${el.getAttribute('aria-label') ?? el.getAttribute('name') ?? ''}]`;
      });
      if (info) order.push(info);
      if (info === 'xr-enter-ar' || info === 'xr-enter-vr' || /XRPanel|Enter AR|Enter VR/.test(info ?? '')) break;
    }

    // Every 6D control this task added must appear, in this relative order:
    // join/leave region -> actor badges -> move nudges -> the remote-control
    // role radio group. A native `<input type="radio">` group is ONE Tab
    // stop, landing on whichever option is currently checked ("controller",
    // checked above) — "none"/"controlled" are reached by arrow keys within
    // the group, per standard radio-group keyboard semantics, not by
    // further Tabs. Expecting all three as separate Tab stops would be
    // testing for non-standard (and less accessible) behaviour.
    const expectedInOrder = [
      'collab-leave',
      'collab-actor',
      'collab-move-left',
      'collab-move-right',
      'collab-move-forward',
      'collab-move-back',
      'collab-reset',
      'remote-control-role-controller',
    ];
    const indices = expectedInOrder.map((id) => order.indexOf(id));
    if (!indices.every((idx) => idx !== -1)) console.log('TAB ORDER CAPTURED:', order);
    expect(indices.every((idx) => idx !== -1)).toBe(true);
    for (let i = 1; i < indices.length; i++) {
      expect(indices[i]).toBeGreaterThan(indices[i - 1]);
    }

    await page.close();
  });
});

// ── Responsive: no horizontal scroll ─────────────────────────────────────────

test.describe('T-010/T-011 — breakpoints, no horizontal scroll', () => {
  for (const width of [640, 768, 1024]) {
    test(`/dimensions at ${width}px, joined with both panels expanded, has no horizontal page scroll`, async ({ context }) => {
      await withFakeTransport(context);
      const page = await context.newPage();
      await page.setViewportSize({ width, height: 1000 });
      await joinAs(page, 'Alice');
      await page.getByTestId('remote-control-role-controller').check();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: `../test-results/t010-collab-${width}.png`, fullPage: true });
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
      await page.close();
    });
  }
});
