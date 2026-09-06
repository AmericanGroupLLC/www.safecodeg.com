/**
 * END-TO-END TESTS — T-013: Home teaser and AGL Spatial vertical
 *
 * Acceptance criteria are TASKS.md's (T-013), not restated here. Covers:
 *  - the Home teaser names all five levels and its CTA reaches /dimensions
 *  - the teaser never pulls the 3D chunk on `/` (re-asserts T-004's boundary
 *    after the teaser landed, per D-SPLIT)
 *  - honesty: only the levels this build actually ships (3D, 4D) render as
 *    "Live"; 5D/6D/7D render as not-yet-available, sourced from
 *    client/src/lib/dimensionsAvailability.ts + client/src/dimensions/contract.ts
 *  - the AGL "Spatial & Industry SaaS" vertical's own CTA reaches /dimensions
 *  - keyboard reachability and accessible names for both new CTAs
 *  - no horizontal scroll at 640/768/1024px on either page
 */
import { test, expect } from '@playwright/test';

const ALL_LEVELS = ['3D', '4D', '5D', '6D', '7D'] as const;
const LIVE_LEVELS = ['3D', '4D'];
const NOT_YET_LEVELS = ALL_LEVELS.filter((l) => !LIVE_LEVELS.includes(l));

test.describe('T-013 — Home page dimensional stack teaser', () => {
  test('names all five levels', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('dimensions-teaser')).toBeVisible();
    for (const level of ALL_LEVELS) {
      await expect(page.getByTestId(`dimension-teaser-card-${level}`)).toBeVisible();
    }
  });

  test('marks only the genuinely-shipped levels as Live; the rest as not yet available', async ({ page }) => {
    await page.goto('/');
    for (const level of LIVE_LEVELS) {
      await expect(page.getByTestId(`dimension-teaser-card-${level}`)).toContainText('Live');
      await expect(page.getByTestId(`dimension-teaser-card-${level}`)).not.toContainText('Not yet available');
    }
    for (const level of NOT_YET_LEVELS) {
      await expect(page.getByTestId(`dimension-teaser-card-${level}`)).toContainText('Not yet available');
    }
  });

  test('the CTA reads "Open the live 3D–7D stage", never "3D preview"', async ({ page }) => {
    await page.goto('/');
    const cta = page.getByTestId('dimensions-teaser-cta');
    await expect(cta).toContainText('Open the live 3D');
    await expect(cta).toContainText('stage');
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toMatch(/3D preview/i);
  });

  test('CTA click navigates to /dimensions', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('dimensions-teaser-cta').click();
    await page.waitForURL('**/dimensions');
    expect(page.url()).toContain('/dimensions');
  });

  test('CTA is keyboard reachable, has an accessible name, and Enter activates it', async ({ page }) => {
    await page.goto('/');
    // Robust accessible-name check via role — Playwright computes this per the
    // accessibility tree, not by reading our own textContent back to itself.
    const cta = page.getByRole('link', { name: /open the live 3D.7D stage/i });
    await expect(cta).toBeVisible();
    await cta.focus();
    await expect(cta).toBeFocused();
    await page.keyboard.press('Enter');
    await page.waitForURL('**/dimensions');
  });

  test('/ issues zero requests for the 3D chunk after the teaser lands (re-asserts T-004 D-SPLIT boundary)', async ({ page }) => {
    const threeRequests: string[] = [];
    page.on('request', (req) => {
      if (/vendor-three|DimensionsStage/.test(req.url())) threeRequests.push(req.url());
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(threeRequests).toEqual([]);
  });
});

test.describe('T-013 — AGL Spatial & Industry SaaS vertical', () => {
  test('references the 3D-7D dimensional stack and marks it honestly', async ({ page }) => {
    await page.goto('/agl');
    const ladder = page.getByTestId('agl-dimensions-ladder');
    await expect(ladder).toBeVisible();
    const ladderText = await ladder.innerText();
    for (const level of ALL_LEVELS) {
      expect(ladderText).toContain(level);
    }
    // Exactly the not-yet-live levels are annotated "soon"; the live ones are not.
    expect((ladderText.match(/soon/g) ?? []).length).toBe(NOT_YET_LEVELS.length);
  });

  test('its CTA navigates to /dimensions', async ({ page }) => {
    await page.goto('/agl');
    await page.getByTestId('agl-dimensions-cta').click();
    await page.waitForURL('**/dimensions');
    expect(page.url()).toContain('/dimensions');
  });

  test('its CTA is keyboard reachable with an accessible name', async ({ page }) => {
    await page.goto('/agl');
    const cta = page.getByRole('link', { name: /enter the 3D.7D stage/i });
    await expect(cta).toBeVisible();
    await cta.focus();
    await expect(cta).toBeFocused();
    await page.keyboard.press('Enter');
    await page.waitForURL('**/dimensions');
  });

  test('existing vertical content is unchanged for the other five verticals', async ({ page }) => {
    // Regression guard: this task only touches the Spatial vertical's copy.
    await page.goto('/agl');
    const body = await page.locator('body').innerText();
    expect(body).toContain('Enterprise AI & DevTools');
    expect(body).toContain('Consumer Mobile & Lifestyle');
    expect(body).toContain('FinTech & E-Commerce');
    expect(body).toContain('CyberSecurity & Infra');
    expect(body).toContain('IoT & Hardware');
  });
});

test.describe('T-013 — Breakpoints, no horizontal scroll', () => {
  for (const width of [640, 768, 1024]) {
    test(`/ at ${width}px has no horizontal page scroll`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: `../test-results/t013-home-${width}.png`, fullPage: true });
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });

    test(`/agl at ${width}px has no horizontal page scroll`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto('/agl');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: `../test-results/t013-agl-${width}.png`, fullPage: true });
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      // KNOWN, PRE-EXISTING, UNRELATED-TO-T-013 defect: the AGL "About" section's
      // right-column checklist (client/src/pages/AGL.tsx, motion.div initial={{x:20}})
      // sits below the fold at these viewport heights, so its whileInView animation
      // never triggers and its untriggered CSS transform still contributes to
      // document.documentElement.scrollWidth in Chromium. Verified unrelated: reverting
      // this task's AGL.tsx edits back to the original file reproduces the identical
      // scrollWidth (666/794/1034 px) at all three widths — see T-013's Notes in
      // TASKS.md. Left failing rather than weakened, per VERIFY.md; not fixed here
      // because the fix is a site-wide animation-pattern or global overflow-x guard,
      // outside this task's scope (expanding the Spatial & Industry SaaS vertical).
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });
  }
});
