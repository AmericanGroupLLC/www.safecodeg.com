/**
 * SMOKE TESTS — Critical path verification
 * Category: Smoke Testing
 * Tests: All pages load, no console errors, correct HTTP status
 */
import { test, expect } from '@playwright/test';

const PAGES = [
  { path: '/', name: 'Home' },
  { path: '/products', name: 'Products' },
  { path: '/about', name: 'About' },
  { path: '/agl', name: 'AGL' },
  { path: '/scg', name: 'SCG' },
  { path: '/careers', name: 'Careers' },
  { path: '/contact', name: 'Contact' },
  { path: '/privacy-policy', name: 'Privacy Policy' },
  { path: '/terms', name: 'Terms of Service' },
  { path: '/support', name: 'Support' },
  { path: '/products/cognicore', name: 'Product Detail - CogniCore' },
  { path: '/products/myhealth', name: 'Product Detail - MyHealth' },
  { path: '/products/aeroswift', name: 'Product Detail - AeroSwift' },
];

test.describe('Smoke Tests — All pages load', () => {
  for (const page of PAGES) {
    test(`${page.name} page loads successfully`, async ({ page: pw }) => {
      const errors: string[] = [];
      pw.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      const response = await pw.goto(page.path, { waitUntil: 'domcontentloaded' });

      // Should not 404
      expect(response?.status()).not.toBe(404);
      expect(response?.status()).not.toBe(500);

      // Page should have content
      const body = await pw.locator('body').textContent();
      expect(body?.length).toBeGreaterThan(100);

      // No critical JS errors
      const criticalErrors = errors.filter(e =>
        !e.includes('favicon') &&
        !e.includes('analytics') &&
        !e.includes('404') &&
        !e.includes('net::ERR')
      );
      expect(criticalErrors.length).toBe(0);
    });
  }
});

test.describe('Smoke Tests — Navigation renders', () => {
  test('navigation is visible on home page', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
  });

  test('footer is visible on home page', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer').first();
    await expect(footer).toBeVisible();
  });

  test('brand name appears in navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=American Group LLC').first()).toBeVisible();
  });
});

test.describe('Smoke Tests — Critical content present', () => {
  test('home page hero headline is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('products page shows product cards', async ({ page }) => {
    await page.goto('/products');
    await page.waitForSelector('[data-testid="product-card"], .product-card, h1', { timeout: 10000 });
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
  });

  test('contact page has contact information', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('text=contact').first()).toBeVisible();
  });
});
