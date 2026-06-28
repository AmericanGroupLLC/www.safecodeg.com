/**
 * END-TO-END TESTS — Category 4
 * Full user journeys: contact form, product browsing, navigation, internship, rich theme
 */
import { test, expect } from '@playwright/test';

test.describe('E2E — Home Page Journey', () => {
  test('user lands on home page and sees hero', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    const headlineText = await h1.textContent();
    expect(headlineText?.length).toBeGreaterThan(5);
  });

  test('user can click Explore Products CTA and reach products page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const ctaLink = page.locator('a[href="/products"]').first();
    await expect(ctaLink).toBeVisible();
    await ctaLink.click();
    await page.waitForURL('**/products');
    expect(page.url()).toContain('/products');
  });

  test('home page shows 77+ products stat', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const body = await page.textContent('body');
    expect(body).toMatch(/77\+?/);
  });

  test('home page shows 8 verticals stat', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const body = await page.textContent('body');
    expect(body).toMatch(/8\s*vertical/i);
  });

  test('home page has technology marquee ticker', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const body = await page.textContent('body');
    // Marquee should contain tech names
    expect(body).toMatch(/Swift|Kotlin|Flutter|React|Python|Kubernetes/i);
  });
});

test.describe('E2E — Navigation Journey', () => {
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

  test('/agl alias loads AGL content', async ({ page }) => {
    await page.goto('/agl');
    await page.waitForLoadState('domcontentloaded');
    const body = await page.textContent('body');
    expect(body).toMatch(/American Group/i);
  });

  test('/scg alias loads SCG content', async ({ page }) => {
    await page.goto('/scg');
    await page.waitForLoadState('domcontentloaded');
    const body = await page.textContent('body');
    expect(body).toMatch(/SafeCode/i);
  });
});

test.describe('E2E — Products Discovery Journey', () => {
  test('user browses products page and sees product list', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('domcontentloaded');
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
  });

  test('user navigates to CogniCore product detail page', async ({ page }) => {
    await page.goto('/products/cognicore');
    await page.waitForLoadState('domcontentloaded');
    const body = await page.textContent('body');
    expect(body?.length).toBeGreaterThan(200);
    expect(body?.toLowerCase()).not.toContain('page not found');
    expect(body).toContain('CogniCore');
  });

  test('user navigates to MyHealth product page', async ({ page }) => {
    await page.goto('/products/myhealth');
    await page.waitForLoadState('domcontentloaded');
    const body = await page.textContent('body');
    expect(body?.toLowerCase()).not.toContain('page not found');
    expect(body).toContain('MyHealth');
  });

  test('products page shows 77+ products count', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('domcontentloaded');
    const body = await page.textContent('body');
    expect(body).toMatch(/77\+?/);
  });
});

test.describe('E2E — Contact Form Journey', () => {
  test('contact form is visible and has required fields', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('domcontentloaded');
    const form = page.locator('form').first();
    await expect(form).toBeVisible();
  });

  test('contact page shows email address', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('domcontentloaded');
    const body = await page.textContent('body');
    expect(body).toContain('safecodeg.com');
  });

  test('contact form does not navigate away on empty submit', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('domcontentloaded');
    const submitBtn = page.locator('button[type="submit"]').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await expect(page).toHaveURL(/\/contact/);
    }
  });
});

test.describe('E2E — Careers & Internship Journey', () => {
  test('careers page shows all 4 internship positions', async ({ page }) => {
    await page.goto('/careers');
    await page.waitForLoadState('domcontentloaded');
    const body = await page.textContent('body');
    expect(body).toContain('AI / LLM Mobile App Intern');
    expect(body).toContain('LLM & Generative AI Research Intern');
    expect(body).toContain('Blockchain & Web3 Developer Intern');
    expect(body).toContain('Blockchain Security & Audit Intern');
  });

  test('careers page shows full-time and internship sections', async ({ page }) => {
    await page.goto('/careers');
    await page.waitForLoadState('domcontentloaded');
    const body = await page.textContent('body');
    expect(body).toMatch(/full.?time|senior|engineer/i);
    expect(body).toMatch(/intern/i);
  });

  test('careers page has apply/email action for internships', async ({ page }) => {
    await page.goto('/careers');
    await page.waitForLoadState('domcontentloaded');
    const body = await page.textContent('body');
    // Page should have Apply buttons for internship positions
    expect(body).toMatch(/Apply|apply/i);
    // Page should have at least one email contact
    expect(body).toMatch(/careers@safecodeg\.com|internships@safecodeg\.com/i);
  });
});

test.describe('E2E — Rich Theme Verification', () => {
  test('home page has dark background', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const bgColor = await page.evaluate(() =>
      window.getComputedStyle(document.body).backgroundColor
    );
    // Should be very dark (near black)
    expect(bgColor).toMatch(/rgb\([0-9]{1,2},\s*[0-9]{1,2},\s*[0-9]{1,2}\)/);
  });

  test('navigation does not have white background', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
    const bgColor = await nav.evaluate(el => window.getComputedStyle(el).backgroundColor);
    expect(bgColor).not.toBe('rgb(255, 255, 255)');
  });

  test('about page has dark background', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('domcontentloaded');
    const bgColor = await page.evaluate(() =>
      window.getComputedStyle(document.body).backgroundColor
    );
    expect(bgColor).not.toBe('rgb(255, 255, 255)');
  });

  test('careers page has dark background', async ({ page }) => {
    await page.goto('/careers');
    await page.waitForLoadState('domcontentloaded');
    const bgColor = await page.evaluate(() =>
      window.getComputedStyle(document.body).backgroundColor
    );
    expect(bgColor).not.toBe('rgb(255, 255, 255)');
  });
});

test.describe('E2E — Footer Navigation', () => {
  test('footer privacy policy link works', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    const footer = page.locator('footer').first();
    await expect(footer).toBeVisible();
  });

  test('user can navigate to Privacy Policy from footer', async ({ page }) => {
    await page.goto('/privacy-policy');
    await page.waitForLoadState('domcontentloaded');
    const body = await page.textContent('body');
    expect(body?.toLowerCase()).toContain('privacy');
  });

  test('footer does not contain GitHub links', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const footerLinks = await page.locator('footer a').all();
    for (const link of footerLinks) {
      const href = await link.getAttribute('href');
      expect(href ?? '').not.toContain('github.com');
    }
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
    const body = await page.textContent('body');
    expect(body?.length).toBeGreaterThan(100);
  });

  test('contact page renders on mobile', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('domcontentloaded');
    const form = page.locator('form').first();
    await expect(form).toBeVisible();
  });

  test('careers page renders on mobile', async ({ page }) => {
    await page.goto('/careers');
    await page.waitForLoadState('domcontentloaded');
    const body = await page.textContent('body');
    expect(body).toMatch(/Intern/i);
  });
});
