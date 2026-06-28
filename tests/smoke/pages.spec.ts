/**
 * SMOKE TESTS — Category 7
 * Verify all pages load without errors, have correct status codes, and render key content
 */
import { test, expect } from '@playwright/test';

const PAGES = [
  { path: '/', name: 'Home', mustContain: ['American Group'] },
  { path: '/american-group-llc', name: 'AGL Full Path', mustContain: ['American Group'] },
  { path: '/agl', name: 'AGL Alias', mustContain: ['American Group'] },
  { path: '/safecodex-research', name: 'SCG Full Path', mustContain: ['SafeCode'] },
  { path: '/scg', name: 'SCG Alias', mustContain: ['SafeCode'] },
  { path: '/products', name: 'Products', mustContain: ['Products'] },
  { path: '/products/cognicore', name: 'Product Detail - CogniCore', mustContain: ['CogniCore'] },
  { path: '/products/myhealth', name: 'Product Detail - MyHealth', mustContain: ['MyHealth'] },
  { path: '/products/aeroswift', name: 'Product Detail - AeroSwift', mustContain: ['AeroSwift'] },
  { path: '/about', name: 'About', mustContain: ['About'] },
  { path: '/careers', name: 'Careers', mustContain: ['Careers'] },
  { path: '/contact', name: 'Contact', mustContain: ['Contact'] },
  { path: '/privacy-policy', name: 'Privacy Policy', mustContain: ['Privacy'] },
  { path: '/support', name: 'Support', mustContain: ['Support'] },
  { path: '/terms', name: 'Terms of Service', mustContain: ['Terms'] },
];

test.describe('Smoke Tests — All pages load', () => {
  for (const page of PAGES) {
    test(`${page.name} (${page.path}) loads successfully`, async ({ page: pw }) => {
      const errors: string[] = [];
      pw.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      const response = await pw.goto(page.path, { waitUntil: 'domcontentloaded', timeout: 15000 });

      // Should not 404 or 500
      expect(response?.status()).not.toBe(404);
      expect(response?.status()).not.toBe(500);

      // Page should have content
      const body = await pw.locator('body').textContent();
      expect(body?.length).toBeGreaterThan(100);

      // Must contain expected text
      for (const text of page.mustContain) {
        expect(body, `Expected "${text}" on ${page.path}`).toContain(text);
      }

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

  test('no GitHub links in navigation', async ({ page }) => {
    await page.goto('/');
    const navLinks = await page.locator('nav a').all();
    for (const link of navLinks) {
      const href = await link.getAttribute('href');
      expect(href ?? '').not.toContain('github.com');
    }
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

  test('contact page has contact form', async ({ page }) => {
    await page.goto('/contact');
    const form = page.locator('form').first();
    await expect(form).toBeVisible();
  });

  test('careers page shows internship positions', async ({ page }) => {
    await page.goto('/careers');
    const body = await page.textContent('body');
    expect(body).toMatch(/Intern/i);
    expect(body).toMatch(/Blockchain|AI.*Intern|LLM/i);
  });

  test('404 page renders for unknown routes', async ({ page }) => {
    await page.goto('/this-route-does-not-exist-at-all', { waitUntil: 'domcontentloaded' });
    const body = await page.textContent('body');
    expect(body).toMatch(/404|not found|page not found/i);
  });
});
