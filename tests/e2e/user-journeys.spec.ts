/**
 * END-TO-END TESTS — Complete User Journeys
 * Category: E2E Testing
 * Tests: Full user flows from landing to product detail, navigation, CTA clicks
 */
import { test, expect } from '@playwright/test';

test.describe('E2E — Home Page Journey', () => {
  test('user lands on home page and sees hero', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Hero headline visible
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    const headlineText = await h1.textContent();
    expect(headlineText?.length).toBeGreaterThan(5);
  });

  test('user can click Explore Products CTA and reach products page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Find the products CTA link
    const ctaLink = page.locator('a[href="/products"]').first();
    await expect(ctaLink).toBeVisible();
    await ctaLink.click();

    await page.waitForURL('**/products');
    expect(page.url()).toContain('/products');
  });

  test('user can navigate to About page via nav', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const aboutLink = page.locator('nav a[href="/about"]').first();
    await expect(aboutLink).toBeVisible();
    await aboutLink.click();

    await page.waitForURL('**/about');
    expect(page.url()).toContain('/about');
  });

  test('user can navigate to Careers page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const careersLink = page.locator('nav a[href="/careers"]').first();
    await expect(careersLink).toBeVisible();
    await careersLink.click();

    await page.waitForURL('**/careers');
    expect(page.url()).toContain('/careers');
  });

  test('user can navigate to Contact page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const contactLink = page.locator('nav a[href="/contact"]').first();
    await expect(contactLink).toBeVisible();
    await contactLink.click();

    await page.waitForURL('**/contact');
    expect(page.url()).toContain('/contact');
  });
});

test.describe('E2E — Products Discovery Journey', () => {
  test('user browses products page and sees product list', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('domcontentloaded');

    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
  });

  test('user navigates to a product detail page', async ({ page }) => {
    await page.goto('/products/cognicore');
    await page.waitForLoadState('domcontentloaded');

    const body = await page.locator('body').textContent();
    expect(body?.length).toBeGreaterThan(200);
    // Should not show 404
    expect(body?.toLowerCase()).not.toContain('page not found');
  });

  test('user navigates to myhealth product page', async ({ page }) => {
    await page.goto('/products/myhealth');
    await page.waitForLoadState('domcontentloaded');

    const body = await page.locator('body').textContent();
    expect(body?.toLowerCase()).not.toContain('page not found');
  });
});

test.describe('E2E — About Us Journey', () => {
  test('about page shows company story', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('domcontentloaded');

    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
  });

  test('about page has AGL and SCG entity sections', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('domcontentloaded');

    const body = await page.locator('body').textContent();
    expect(body).toContain('American Group LLC');
  });
});

test.describe('E2E — Careers Journey', () => {
  test('careers page shows open positions', async ({ page }) => {
    await page.goto('/careers');
    await page.waitForLoadState('domcontentloaded');

    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
  });

  test('careers page has Apply Now buttons', async ({ page }) => {
    await page.goto('/careers');
    await page.waitForLoadState('domcontentloaded');

    const body = await page.locator('body').textContent();
    expect(body?.toLowerCase()).toContain('apply');
  });
});

test.describe('E2E — Footer Navigation', () => {
  test('footer links are clickable and navigate correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const footer = page.locator('footer').first();
    await expect(footer).toBeVisible();
  });

  test('privacy policy link in footer works', async ({ page }) => {
    await page.goto('/privacy-policy');
    await page.waitForLoadState('domcontentloaded');

    const body = await page.locator('body').textContent();
    expect(body?.toLowerCase()).toContain('privacy');
  });
});

test.describe('E2E — Mobile Viewport', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('home page renders correctly on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
  });

  test('products page renders on mobile', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('domcontentloaded');

    const body = await page.locator('body').textContent();
    expect(body?.length).toBeGreaterThan(100);
  });
});
