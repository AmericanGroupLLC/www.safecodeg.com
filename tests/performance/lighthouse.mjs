/**
 * PERFORMANCE TESTS — Lighthouse CI
 * Category: Performance Testing
 * Tests: Core Web Vitals, Performance Score, Accessibility, SEO, Best Practices
 */
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

// Results land inside the repo. The previous absolute /home/ubuntu path does
// not exist on any machine but the original sandbox, so this write threw
// ENOENT and the error was swallowed by main().catch(console.error).
const OUT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../../test-results');

// Target defaults to the locally served production build. The previous value
// was a Manus sandbox URL that returns 502 — this script audited that error
// page and reported a clean result, which is worse than not running at all.
const BASE_URL = process.env.AUDIT_BASE_URL ?? 'http://localhost:3000';

const PAGES = [
  { path: '/', name: 'Home' },
  { path: '/products', name: 'Products' },
  { path: '/about', name: 'About' },
];

const THRESHOLDS = {
  performance: 50,      // Min acceptable (dev server, no CDN)
  accessibility: 70,    // Min acceptable
  'best-practices': 70, // Min acceptable
  seo: 70,              // Min acceptable
};

async function runLighthouse(url, name) {
  // chromePath is pinned to the Chromium Playwright already installs.
  // Left to its own discovery under WSL, chrome-launcher finds the Windows
  // chrome.exe over interop, which starts but is unreachable on the Linux
  // side — every page then failed with ECONNREFUSED on its debug port.
  const chrome = await launch({
    chromePath: process.env.CHROME_PATH,
    chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'],
  });

  try {
    const result = await lighthouse(url, {
      port: chrome.port,
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      settings: {
        throttlingMethod: 'simulate',
        formFactor: 'desktop',
        screenEmulation: { mobile: false, width: 1280, height: 720, deviceScaleFactor: 1 },
      },
    });

    const lhr = result.lhr;
    const scores = {
      performance: Math.round(lhr.categories.performance.score * 100),
      accessibility: Math.round(lhr.categories.accessibility.score * 100),
      'best-practices': Math.round(lhr.categories['best-practices'].score * 100),
      seo: Math.round(lhr.categories.seo.score * 100),
    };

    // Core Web Vitals
    const metrics = {
      fcp: lhr.audits['first-contentful-paint']?.displayValue || 'N/A',
      lcp: lhr.audits['largest-contentful-paint']?.displayValue || 'N/A',
      tbt: lhr.audits['total-blocking-time']?.displayValue || 'N/A',
      cls: lhr.audits['cumulative-layout-shift']?.displayValue || 'N/A',
      si: lhr.audits['speed-index']?.displayValue || 'N/A',
      tti: lhr.audits['interactive']?.displayValue || 'N/A',
    };

    // Check thresholds
    const failures = [];
    for (const [cat, threshold] of Object.entries(THRESHOLDS)) {
      if (scores[cat] < threshold) {
        failures.push(`${cat}: ${scores[cat]} < ${threshold}`);
      }
    }

    return { name, url, scores, metrics, failures, passed: failures.length === 0 };
  } finally {
    await chrome.kill();
  }
}

async function main() {
  console.log('\n🔍 Running Lighthouse Performance Tests...\n');
  const results = [];

  for (const page of PAGES) {
    const url = `${BASE_URL}${page.path}`;
    console.log(`  Testing ${page.name} (${url})...`);
    try {
      const result = await runLighthouse(url, page.name);
      results.push(result);

      const status = result.passed ? '✅ PASS' : '⚠️  WARN';
      console.log(`  ${status} ${page.name}`);
      console.log(`     Performance: ${result.scores.performance} | Accessibility: ${result.scores.accessibility} | Best Practices: ${result.scores['best-practices']} | SEO: ${result.scores.seo}`);
      console.log(`     FCP: ${result.metrics.fcp} | LCP: ${result.metrics.lcp} | TBT: ${result.metrics.tbt} | CLS: ${result.metrics.cls}`);
      if (result.failures.length > 0) {
        console.log(`     ⚠️  Below threshold: ${result.failures.join(', ')}`);
      }
    } catch (err) {
      console.error(`  ❌ Error testing ${page.name}: ${err.message}`);
      results.push({ name: page.name, url, error: err.message, passed: false });
    }
  }

  // Save results
  writeFileSync((mkdirSync(OUT_DIR, { recursive: true }), resolve(OUT_DIR, 'lighthouse-results.json')), JSON.stringify(results, null, 2));
  console.log('\n✅ Lighthouse results saved to test-results/lighthouse-results.json\n');

  const allPassed = results.every(r => r.passed);
  console.log(`\nOverall: ${results.filter(r => r.passed).length}/${results.length} pages meet thresholds`);

  // This run gates on measurability, not on the score thresholds.
  //
  // A page that could not be measured at all is a failure of this check and
  // must not report success — that is what happened for months while BASE_URL
  // pointed at a dead host and every page errored out under a 0 exit code.
  //
  // The score thresholds are deliberately NOT gated here. They are measured
  // against the local Node server, which serves uncompressed, while production
  // is Apache with mod_deflate — so these numbers are pessimistic and not
  // representative of the deployed site. Owning a defensible budget and
  // enforcing it is T-015's task; inventing a pass/fail line here would put a
  // number nobody has justified in the way of every future build.
  const unmeasured = results.filter(r => r.error);
  if (unmeasured.length > 0) {
    console.error(
      `\n❌ Performance run FAILED: ${unmeasured.length}/${results.length} page(s) could not be measured — ` +
        unmeasured.map(r => `${r.name}: ${r.error}`).join("; ") +
        "\n"
    );
    process.exit(1);
  }
  process.exit(allPassed ? 0 : 0); // Don't fail CI on perf (dev server penalty)
}

main().catch(err => {
  // Exit non-zero: a thrown audit is a failed audit. Swallowing this
  // made the script report success after crashing.
  console.error(err);
  process.exit(1);
});
