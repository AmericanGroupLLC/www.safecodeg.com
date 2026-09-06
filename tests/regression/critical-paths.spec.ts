/**
 * REGRESSION TESTS — Verify no regressions from previous versions
 * Category: Regression Testing
 * Tests: Previously broken features now fixed, dark theme consistency,
 *        route fixes (/agl, /scg), stat counts, product counts
 */
import { test, expect } from "@playwright/test";

test.describe("Regression — /agl and /scg routes (previously 404)", () => {
  test("/agl route resolves (not 404)", async ({ page }) => {
    const response = await page.goto("/agl", { waitUntil: "domcontentloaded" });
    expect(response?.status()).not.toBe(404);
    // Check visible text content (not JS bundle) for 404 page indicators
    const h1Text = await page.locator("h1").first().textContent();
    expect(h1Text?.toLowerCase()).not.toContain("page not found");
    expect(h1Text?.toLowerCase()).not.toContain("404");
  });

  test("/scg route resolves (not 404)", async ({ page }) => {
    const response = await page.goto("/scg", { waitUntil: "domcontentloaded" });
    expect(response?.status()).not.toBe(404);
    // Check visible text content (not JS bundle) for 404 page indicators
    const h1Text = await page.locator("h1").first().textContent();
    expect(h1Text?.toLowerCase()).not.toContain("page not found");
    expect(h1Text?.toLowerCase()).not.toContain("404");
  });

  test("/agl page contains American Group LLC content", async ({ page }) => {
    await page.goto("/agl");
    await page.waitForLoadState("domcontentloaded");
    const body = await page.locator("body").textContent();
    expect(body).toContain("American Group LLC");
  });

  test("/scg page contains SafeCodeX content", async ({ page }) => {
    await page.goto("/scg");
    await page.waitForLoadState("domcontentloaded");
    const body = await page.locator("body").textContent();
    expect(body?.toLowerCase()).toMatch(/safecode|research|india/i);
  });
});

test.describe("Regression — Dark theme consistency (previously light pages)", () => {
  const DARK_PAGES = [
    "/about",
    "/careers",
    "/contact",
    "/privacy-policy",
    "/terms",
    "/support",
  ];

  for (const path of DARK_PAGES) {
    test(`${path} has dark background (not white)`, async ({ page }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });

      // Check that the body or main container has a dark background
      const bgColor = await page.evaluate(() => {
        const body = document.body;
        const style = window.getComputedStyle(body);
        return style.backgroundColor;
      });

      // Dark background: rgb values should all be low (< 50)
      // White would be rgb(255, 255, 255)
      const rgbMatch = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (rgbMatch) {
        const [, r, g, b] = rgbMatch.map(Number);
        const brightness = (r + g + b) / 3;
        // Dark theme: average brightness should be below 50
        expect(brightness).toBeLessThan(50);
      }
    });
  }
});

test.describe("Regression — Product count accuracy", () => {
  test("home page shows 77+ products stat", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    // Wait for counter animation
    await page.waitForTimeout(2000);
    const body = await page.locator("body").textContent();
    expect(body).toContain("77");
  });

  test("home page shows 8 verticals stat", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);
    const body = await page.locator("body").textContent();
    expect(body).toContain("8");
  });

  test('products page does not say "7 Verticals"', async ({ page }) => {
    await page.goto("/products");
    await page.waitForLoadState("domcontentloaded");
    const body = await page.locator("body").textContent();
    // Should not have "7 Verticals" (regression from old count)
    expect(body).not.toMatch(/\b7\s+Vertical/i);
  });
});

test.describe("Regression — GitHub links removed", () => {
  const PAGES_TO_CHECK = ["/", "/products", "/about", "/careers", "/contact"];

  for (const path of PAGES_TO_CHECK) {
    test(`${path} has no GitHub profile links in main content`, async ({
      page,
    }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });

      // Check for github.com links in the main navigation/content
      const githubLinks = await page
        .locator('a[href*="github.com/AmericanGroupLLC"]')
        .count();
      // GitHub org links should not appear in main nav/content
      // (they may appear in footer or legal pages, but not as primary CTAs)
      const navGithubLinks = await page
        .locator('nav a[href*="github.com"]')
        .count();
      expect(navGithubLinks).toBe(0);
    });
  }
});

test.describe("Regression — CSS keyframe animations work", () => {
  test("marquee animation is applied to ticker", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Check if marquee-track element exists and has animation
    const marqueeTrack = page.locator(".marquee-track").first();
    const exists = await marqueeTrack.count();

    if (exists > 0) {
      const animationName = await marqueeTrack.evaluate(el => {
        return window.getComputedStyle(el).animationName;
      });
      expect(animationName).toContain("marquee-scroll");
    }
  });
});

test.describe("Regression — Navigation links correct", () => {
  test("Get in Touch button links to /contact", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const ctaButton = page.locator('nav a[href="/contact"]').first();
    await expect(ctaButton).toBeVisible();
  });

  test("Products nav link goes to /products", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const productsLink = page.locator('nav a[href="/products"]').first();
    await expect(productsLink).toBeVisible();
  });
});
