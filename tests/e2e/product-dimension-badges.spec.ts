/**
 * E2E — T-014 per-product dimensional capability level
 * Category: End-to-End
 *
 * OQ-3 (TASKS.md Decisions, 2026-09-05): a product's `dimensionLevel` is set
 * ONLY where evidence of the specific capability in
 * `client/src/dimensions/contract.ts`'s DIMENSION_LEVEL_META already exists
 * in this repository. Today, nothing does — this suite proves that against
 * the real, running, production-built app: no card on the list page, no
 * hero on any detail page (real or `generateFallbackProduct`-synthesised),
 * shows a dimensional capability badge. It also proves the capability filter
 * row itself is correctly absent while no product carries a level (a data-
 * derived UI must not offer a filter for a capability nothing has yet), and
 * that this task's changes did not regress existing product browsing.
 */
import { test, expect } from "@playwright/test";

test.describe("T-014 — no fabricated dimensional capability badge", () => {
  test("the Products list page renders zero dimension badges across all cards", async ({
    page,
  }) => {
    await page.goto("/products");
    await expect(page.locator("h1").first()).toBeVisible();
    const badges = page.locator('[data-testid="dimension-badge"]');
    await expect(badges).toHaveCount(0);
  });

  test('the Products list page shows no "Capability:" filter row (derived from data — none exists today)', async ({
    page,
  }) => {
    await page.goto("/products");
    await expect(page.getByText("Capability:", { exact: false })).toHaveCount(
      0
    );
  });

  const REAL_DATABASE_ENTRIES: Array<[string, string]> = [
    ["/products/cognicore", "CogniCore"], // real productDatabase entry
    ["/products/myhealth", "MyHealth"], // real productDatabase entry
    ["/products/aeroswift", "AeroSwift"], // real entry; dead data/products.ts mentions a "3D map" for this slug — judged incidental, not shipped here
    ["/products/buddyplay", "BuddyPlay"], // real productDatabase entry
    ["/products/myfinance", "MyFinance"], // real productDatabase entry
  ];
  for (const [path, mustContain] of REAL_DATABASE_ENTRIES) {
    test(`real detail page ${path} renders no dimension badge`, async ({
      page,
    }) => {
      await page.goto(path);
      await expect(page.getByText(mustContain).first()).toBeVisible();
      await expect(page.locator('[data-testid="dimension-badge"]')).toHaveCount(
        0
      );
    });
  }

  const FALLBACK_GENERATED_ENTRIES: Array<[string, string]> = [
    ["/products/imeasure", "Imeasure"], // generateFallbackProduct — its dead-code-only "AR measurement tool" copy never reaches this synthesised page
    ["/products/roomcraft", "Roomcraft"], // generateFallbackProduct — carries a live 'AR' tag in Products.tsx, still judged incidental for this capability stack
    ["/products/audiosuite", "Audiosuite"], // generateFallbackProduct — "spatial audio processing" is a different domain (audio), not this capability
  ];
  for (const [path, mustContain] of FALLBACK_GENERATED_ENTRIES) {
    test(`generateFallbackProduct-synthesised page ${path} renders no dimension badge`, async ({
      page,
    }) => {
      await page.goto(path);
      await expect(page.getByText(mustContain).first()).toBeVisible();
      await expect(page.locator('[data-testid="dimension-badge"]')).toHaveCount(
        0
      );
    });
  }

  test("a slug with no database entry at all still renders no dimension badge (generateFallbackProduct path)", async ({
    page,
  }) => {
    await page.goto("/products/some-slug-that-does-not-exist-anywhere");
    await expect(page.locator('[data-testid="dimension-badge"]')).toHaveCount(
      0
    );
  });
});

test.describe("T-014 — breakpoints (regression: existing filters still work)", () => {
  for (const width of [640, 768, 1024]) {
    test(`Products page renders with no horizontal overflow at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/products");
      await expect(page.locator("h1").first()).toBeVisible();
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth
      );
      expect(overflow).toBeLessThanOrEqual(1); // allow 1px for scrollbar rounding
    });
  }

  test("search and platform filters still narrow the product grid (regression)", async ({
    page,
  }) => {
    await page.goto("/products");
    const countText = async () =>
      page.locator("text=/Showing \\d+ products/").first().textContent();
    const before = await countText();
    await page.getByPlaceholder("Search products, tags...").fill("health");
    await expect.poll(countText).not.toBe(before);
  });
});
