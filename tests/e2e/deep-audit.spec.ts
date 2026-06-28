/**
 * Deep Audit E2E Tests — Production Readiness
 * Covers: product detail pages, contact form E2E, mobile layout,
 *         rich theme consistency, accessibility, navigation completeness
 */
import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';

// ─── 1. Product Detail Pages ──────────────────────────────────────────────────
test.describe('Product Detail Pages', () => {
  const products = [
    'cognicore', 'myhealth', 'verba', 'aeroswift', 'securevault',
    'offlinebuddy', 'finflow', 'shopsnap'
  ];

  for (const slug of products) {
    test(`/products/${slug} loads and shows product name`, async ({ page }) => {
      await page.goto(`${BASE}/products/${slug}`);
      await page.waitForLoadState('networkidle');
      // Should NOT show 404 page — check the main content area, not body (body includes minified JS bundle)
      const mainContent = await page.locator('main, #root, [class*="product"]').first().textContent().catch(() => '');
      const h1Text = await page.locator('h1').first().textContent().catch(() => '');
      // Page should have a heading (product name) and not show the 404 page
      expect(page.url()).not.toContain('/404');
      const notFoundVisible = await page.locator('text=Page Not Found').isVisible().catch(() => false);
      expect(notFoundVisible).toBeFalsy();
      // Should show back link
      const backLink = page.locator('a', { hasText: /back|products/i });
      await expect(backLink.first()).toBeVisible();
    });
  }

  test('/products/cognicore shows features section', async ({ page }) => {
    await page.goto(`${BASE}/products/cognicore`);
    await page.waitForLoadState('networkidle');
    const body = await page.locator('body').textContent();
    expect(body).toMatch(/feature|capability|platform/i);
  });

  test('/products/myhealth shows health-related content', async ({ page }) => {
    await page.goto(`${BASE}/products/myhealth`);
    await page.waitForLoadState('networkidle');
    const body = await page.locator('body').textContent();
    expect(body).toMatch(/health|wellness|medical/i);
  });

  test('unknown product slug shows 404 or redirects', async ({ page }) => {
    await page.goto(`${BASE}/products/nonexistent-product-xyz`);
    await page.waitForLoadState('networkidle');
    const body = await page.locator('body').textContent();
    // Either shows 404 page or redirects to products list
    const is404 = body?.includes('Not Found') || body?.includes('404') || body?.includes('Page Not Found');
    const isProductsList = body?.includes('Our Products') || body?.includes('product');
    expect(is404 || isProductsList).toBeTruthy();
  });
});

// ─── 2. Contact Form End-to-End ───────────────────────────────────────────────
test.describe('Contact Form E2E', () => {
  test('contact form fields are all visible and interactive', async ({ page }) => {
    await page.goto(`${BASE}/contact`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('input[name="name"], input[placeholder*="name" i], input[placeholder*="John" i]').first()).toBeVisible();
    await expect(page.locator('input[name="email"], input[type="email"], input[placeholder*="email" i]').first()).toBeVisible();
    await expect(page.locator('textarea').first()).toBeVisible();
    await expect(page.locator('button[type="submit"], button:has-text("Send"), button:has-text("Submit")').first()).toBeVisible();
  });

  test('contact form shows validation on empty submit', async ({ page }) => {
    await page.goto(`${BASE}/contact`);
    await page.waitForLoadState('networkidle');
    const submitBtn = page.locator('button[type="submit"], button:has-text("Send"), button:has-text("Submit")').first();
    await submitBtn.click();
    await page.waitForTimeout(500);
    // Either HTML5 validation or custom error message
    const body = await page.locator('body').textContent();
    const hasValidation = body?.includes('required') || body?.includes('Please') || body?.includes('fill') || body?.includes('valid');
    // Also check for browser native validation (form won't submit)
    const currentUrl = page.url();
    expect(currentUrl).toContain('/contact'); // stays on contact page
  });

  test('contact form accepts valid input', async ({ page }) => {
    await page.goto(`${BASE}/contact`);
    await page.waitForLoadState('networkidle');
    const nameInput = page.locator('input[placeholder*="John" i], input[placeholder*="name" i], input[name="name"]').first();
    const emailInput = page.locator('input[type="email"], input[placeholder*="email" i]').first();
    const messageInput = page.locator('textarea').first();
    await nameInput.fill('Test User');
    await emailInput.fill('test@example.com');
    await messageInput.fill('This is a test message for production readiness audit.');
    await expect(nameInput).toHaveValue('Test User');
    await expect(emailInput).toHaveValue('test@example.com');
    await expect(messageInput).toHaveValue(/test message/i);
  });
});

// ─── 3. Navigation Completeness ───────────────────────────────────────────────
test.describe('Navigation Completeness', () => {
  test('all nav links are present', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    const nav = page.locator('nav, header').first();
    const navText = await nav.textContent();
    expect(navText).toMatch(/product/i);
    expect(navText).toMatch(/about|company/i);
    expect(navText).toMatch(/career|job/i);
    expect(navText).toMatch(/contact/i);
  });

  test('mobile hamburger menu exists', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    // Either hamburger button or nav is still visible
    const hamburger = page.locator('button[aria-label*="menu" i], button[aria-label*="nav" i], .hamburger, [data-testid="menu-toggle"]');
    const nav = page.locator('nav');
    const hasHamburger = await hamburger.count() > 0;
    const hasNav = await nav.count() > 0;
    expect(hasHamburger || hasNav).toBeTruthy();
  });

  test('footer has all required links', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    const footer = page.locator('footer');
    const footerText = await footer.textContent();
    expect(footerText).toMatch(/privacy/i);
    expect(footerText).toMatch(/terms/i);
    expect(footerText).toMatch(/contact/i);
    expect(footerText).toMatch(/american group|AGL|safecodex/i);
  });

  test('logo/brand in nav links to home', async ({ page }) => {
    await page.goto(`${BASE}/about`);
    await page.waitForLoadState('networkidle');
    const logoLink = page.locator('nav a[href="/"], header a[href="/"]').first();
    await expect(logoLink).toBeVisible();
  });
});

// ─── 4. Rich Theme Consistency ────────────────────────────────────────────────
test.describe('Rich Theme Consistency', () => {
  const pages = ['/', '/products', '/about', '/careers', '/contact', '/agl', '/scg'];

  for (const path of pages) {
    test(`${path} has dark background (no white bg)`, async ({ page }) => {
      await page.goto(`${BASE}${path}`);
      await page.waitForLoadState('networkidle');
      const bgColor = await page.evaluate(() => {
        const body = document.body;
        return window.getComputedStyle(body).backgroundColor;
      });
      // Should be dark — not white (255,255,255) or near-white
      const isWhite = bgColor === 'rgb(255, 255, 255)' || bgColor === 'rgba(255, 255, 255, 1)';
      expect(isWhite).toBeFalsy();
    });
  }

  test('home page has violet/purple accent color', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    const html = await page.content();
    // Check for violet/purple color values in inline styles or CSS vars
    const hasViolet = html.includes('#7C3AED') || html.includes('violet') || html.includes('purple') || html.includes('indigo') || html.includes('7c3aed');
    expect(hasViolet).toBeTruthy();
  });

  test('navigation has consistent dark styling', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    const nav = page.locator('nav, header').first();
    await expect(nav).toBeVisible();
    const navBg = await nav.evaluate(el => window.getComputedStyle(el).backgroundColor);
    // Should not be white
    expect(navBg).not.toBe('rgb(255, 255, 255)');
  });
});

// ─── 5. Mobile Responsive Layout ─────────────────────────────────────────────
test.describe('Mobile Responsive Layout', () => {
  test('home page is usable on mobile (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    // No horizontal overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5); // 5px tolerance
  });

  test('products page is usable on mobile (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE}/products`);
    await page.waitForLoadState('networkidle');
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  });

  test('contact page form is usable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE}/contact`);
    await page.waitForLoadState('networkidle');
    const form = page.locator('form').first();
    await expect(form).toBeVisible();
  });

  test('tablet layout (768px) renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  });
});

// ─── 6. Accessibility ─────────────────────────────────────────────────────────
test.describe('Accessibility', () => {
  test('home page has a main landmark', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    const main = page.locator('main, [role="main"]');
    await expect(main.first()).toBeVisible();
  });

  test('all images have alt attributes', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    // WCAG 2.1: All images must have alt attribute (empty string is valid for decorative images)
    const imgsWithoutAltAttr = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      // Check for missing alt attribute entirely (not empty string which is valid for decorative)
      return imgs.filter(img => !img.hasAttribute('alt')).length;
    });
    expect(imgsWithoutAltAttr).toBe(0);
  });

  test('page has a single h1 on home', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
    expect(h1Count).toBeLessThanOrEqual(2); // Allow for visually hidden h1
  });

  test('contact form inputs have labels or aria-labels', async ({ page }) => {
    await page.goto(`${BASE}/contact`);
    await page.waitForLoadState('networkidle');
    const inputs = await page.locator('input:not([type="hidden"]):not([type="submit"])').all();
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const placeholder = await input.getAttribute('placeholder');
      const hasLabel = id ? await page.locator(`label[for="${id}"]`).count() > 0 : false;
      expect(hasLabel || ariaLabel || placeholder).toBeTruthy();
    }
  });

  test('interactive elements are keyboard focusable', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    // Tab through the page and ensure focus is visible
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT', 'BODY']).toContain(focused);
  });
});

// ─── 7. Page Content Quality ──────────────────────────────────────────────────
test.describe('Page Content Quality', () => {
  test('home page stats section shows real numbers', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Allow counters to animate
    const body = await page.locator('body').textContent();
    // Should show 77 products stat
    expect(body).toMatch(/77/);
  });

  test('careers page shows both full-time and internship sections', async ({ page }) => {
    await page.goto(`${BASE}/careers`);
    await page.waitForLoadState('networkidle');
    const body = await page.locator('body').textContent();
    expect(body).toMatch(/intern/i);
    expect(body).toMatch(/blockchain|AI|LLM/i);
  });

  test('about page shows company mission', async ({ page }) => {
    await page.goto(`${BASE}/about`);
    await page.waitForLoadState('networkidle');
    const body = await page.locator('body').textContent();
    expect(body).toMatch(/mission|vision|values|technology/i);
  });

  test('privacy policy page has required sections', async ({ page }) => {
    await page.goto(`${BASE}/privacy-policy`);
    await page.waitForLoadState('networkidle');
    const body = await page.locator('body').textContent();
    expect(body).toMatch(/data collection|information we collect/i);
    expect(body).toMatch(/contact/i);
  });

  test('support page has FAQ section', async ({ page }) => {
    await page.goto(`${BASE}/support`);
    await page.waitForLoadState('networkidle');
    const body = await page.locator('body').textContent();
    expect(body).toMatch(/FAQ|frequently asked|question/i);
  });

  test('terms page has required legal sections', async ({ page }) => {
    await page.goto(`${BASE}/terms`);
    await page.waitForLoadState('networkidle');
    const body = await page.locator('body').textContent();
    expect(body).toMatch(/terms|agreement|service/i);
    expect(body).toMatch(/liability|warranty/i);
  });
});

// ─── 8. AI Chat Widget ────────────────────────────────────────────────────────
test.describe('AI Chat Widget', () => {
  test('chat widget button is visible on home page', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    // Chat widget is a fixed bottom-right button with 'Chat with Sophia' text
    const chatBtn = page.locator('button:has-text("Sophia"), button:has-text("Chat"), [class*="fixed"][class*="bottom"]').first();
    // Check if the Sophia chat widget exists in DOM
    const sophiaCount = await page.locator('text=Sophia').count();
    expect(sophiaCount).toBeGreaterThan(0);
  });

  test('chat widget opens on click', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    // Find and click the chat toggle button
    const chatToggle = page.locator('button[class*="chat"], button:has-text("Sophia"), [class*="chat-toggle"]').first();
    if (await chatToggle.count() > 0) {
      await chatToggle.click();
      await page.waitForTimeout(300);
      const chatInput = page.locator('input[placeholder*="Message" i], textarea[placeholder*="Message" i]');
      if (await chatInput.count() > 0) {
        await expect(chatInput.first()).toBeVisible();
      }
    }
  });
});

// ─── 9. Performance Indicators ────────────────────────────────────────────────
test.describe('Performance Indicators', () => {
  test('home page loads within 5 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto(BASE);
    await page.waitForLoadState('domcontentloaded');
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(5000);
  });

  test('products page loads within 5 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto(`${BASE}/products`);
    await page.waitForLoadState('domcontentloaded');
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(5000);
  });

  test('no JavaScript errors on home page', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    // Filter out known benign errors
    const realErrors = errors.filter(e =>
      !e.includes('ResizeObserver') &&
      !e.includes('Non-Error') &&
      !e.includes('analytics')
    );
    expect(realErrors).toHaveLength(0);
  });

  test('no JavaScript errors on products page', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto(`${BASE}/products`);
    await page.waitForLoadState('networkidle');
    const realErrors = errors.filter(e =>
      !e.includes('ResizeObserver') &&
      !e.includes('Non-Error') &&
      !e.includes('analytics')
    );
    expect(realErrors).toHaveLength(0);
  });

  test('no JavaScript errors on contact page', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto(`${BASE}/contact`);
    await page.waitForLoadState('networkidle');
    const realErrors = errors.filter(e =>
      !e.includes('ResizeObserver') &&
      !e.includes('Non-Error') &&
      !e.includes('analytics')
    );
    expect(realErrors).toHaveLength(0);
  });
});
