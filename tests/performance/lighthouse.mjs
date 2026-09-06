/**
 * PERFORMANCE TESTS — bundle budgets + Lighthouse
 * Category: Performance Testing (test matrix #7)
 *
 * Gates on four things, in cost order — the cheapest and most deterministic
 * first, so a byte regression is reported in under a second rather than after
 * three browser runs:
 *
 *   1. MEASURABILITY   every page must actually produce a Lighthouse result.
 *   2. BUNDLE BYTES    every budgeted group at or under its ceiling.
 *   3. ROUTE ISOLATION no non-/dimensions route may request a lazy chunk.
 *   4. CORE WEB VITALS FCP / LCP / SI against recorded baselines, CLS against
 *                      Google's absolute threshold. TBT is reported, not gated —
 *                      budget.json says why, with the spread that justifies it.
 *
 * Every number, and the derivation behind it, is in `budget.json`.
 *
 * WHY THIS MEASURES A DIFFERENT SERVER THAN `npm start`
 * -----------------------------------------------------
 * Production is Apache serving `dist/public` as static files with
 * `mod_deflate` — `.github/workflows/deploy.yml:87-91` rsyncs that directory
 * and nothing else, so the Express app in `dist/index.js` is never deployed.
 * Measuring against Express measured the wrong server, uncompressed. Paired
 * runs on 2026-09-06, identical build, identical Lighthouse profile:
 *
 *              total transfer      FCP (median of 3)   LCP (median of 3)
 *   Express      1,929,039 B            8,352 ms           11,844 ms
 *   Apache-like  1,125,838 B            3,844 ms            7,824 ms
 *                    -41.6%              -54.0%              -34.0%
 *
 * `scripts/serve-static.mjs` is that Apache-like server, with its compression
 * calibrated against the live host. It is started by
 * `scripts/with-server.mjs` when WITH_SERVER_MODE=static.
 *
 * WHY THE PROFILE IS PINNED
 * -------------------------
 * The previous settings block set `formFactor: 'desktop'` and a desktop
 * `screenEmulation` but left `throttling` and `emulatedUserAgent` at
 * Lighthouse's defaults, which are mobile — verified by reading
 * `node_modules/lighthouse/core/config/constants.js`. The result was a
 * desktop viewport with a Moto G Power user agent on a slow-4G link at 4x CPU
 * slowdown: not any real device, and not reproducible reasoning. The profile
 * below is internally coherent and stated in full in `budget.json`.
 *
 * Usage:
 *   node tests/performance/lighthouse.mjs             # gate (PERF_RUNS=1)
 *   PERF_RUNS=5 node tests/performance/lighthouse.mjs --record
 *                                                     # re-record the baseline
 */
import lighthouse from "lighthouse";
import { launch } from "chrome-launcher";
import { writeFileSync, mkdirSync, mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import { execSync } from "child_process";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import {
  BUDGET_PATH,
  LAZY_CHUNK_PREFIXES,
  checkBundleBudget,
  loadBudget,
  measureBundle,
} from "./bundle-budget.mjs";

const OUT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../../test-results");
const BASE_URL = process.env.AUDIT_BASE_URL ?? "http://localhost:3000";
const RECORD = process.argv.includes("--record");
const RUNS = Math.max(1, Number(process.env.PERF_RUNS ?? (RECORD ? 5 : 1)));

const budget = loadBudget();
const PAGES = budget.pages;

const SCREEN = {
  mobile: { mobile: true, width: 412, height: 823, deviceScaleFactor: 1.75, disabled: false },
  desktop: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false },
};

function lighthouseSettings() {
  const p = budget.profile;
  return {
    throttlingMethod: "simulate",
    formFactor: p.formFactor,
    screenEmulation: SCREEN[p.formFactor],
    throttling: p.throttling,
  };
}

async function runOnce(url) {
  // Chrome's user-data dir is pinned to a real Linux temp directory that this
  // function creates and removes. Left to chrome-launcher's own choice under
  // WSL it resolves $LOCALAPPDATA and creates a literal
  // `C:\Users\...\lighthouse.<pid>` directory in the repo root — one per run,
  // never cleaned up. That had already accumulated 110 directories and 503 MB
  // by the time this was measured (`du -sh`), which is why .gitignore carries
  // a `C:*` rule for it.
  const userDataDir = mkdtempSync(join(tmpdir(), "agl-lighthouse-"));

  // chromePath is pinned to the Chromium Playwright already installs. Left to
  // its own discovery under WSL, chrome-launcher finds the Windows chrome.exe
  // over interop, which starts but is unreachable on the Linux side — every
  // page then failed with ECONNREFUSED on its debug port.
  const chrome = await launch({
    chromePath: process.env.CHROME_PATH,
    userDataDir,
    chromeFlags: ["--headless", "--no-sandbox", "--disable-gpu"],
  });
  try {
    const { lhr } = await lighthouse(url, {
      port: chrome.port,
      output: "json",
      logLevel: "error",
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
      settings: lighthouseSettings(),
    });
    // A page that failed to load does NOT throw. Lighthouse returns a normal
    // report carrying a runtimeError and NaN metrics, and `NaN > ceiling` is
    // false, so every threshold silently "passes". Verified by pointing this
    // script at a dead port: it reported "gate PASSED" for three pages that
    // never loaded. Both guards below exist because of that run.
    if (lhr.runtimeError && lhr.runtimeError.code !== "NO_ERROR") {
      throw new Error(`Lighthouse runtimeError ${lhr.runtimeError.code}: ${lhr.runtimeError.message}`);
    }
    const a = lhr.audits;
    const num = id => Math.round(a[id]?.numericValue ?? NaN);
    for (const id of ["first-contentful-paint", "largest-contentful-paint", "speed-index", "total-blocking-time"]) {
      if (!Number.isFinite(num(id))) {
        throw new Error(`Lighthouse produced no numeric value for "${id}" — the page did not load measurably`);
      }
    }
    return {
      scores: {
        performance: Math.round(lhr.categories.performance.score * 100),
        accessibility: Math.round(lhr.categories.accessibility.score * 100),
        "best-practices": Math.round(lhr.categories["best-practices"].score * 100),
        seo: Math.round(lhr.categories.seo.score * 100),
      },
      metrics: {
        fcp: num("first-contentful-paint"),
        lcp: num("largest-contentful-paint"),
        si: num("speed-index"),
        tbt: num("total-blocking-time"),
        cls: +(a["cumulative-layout-shift"]?.numericValue ?? 0).toFixed(4),
      },
      benchmarkIndex: lhr.environment.benchmarkIndex,
      requests: (a["network-requests"]?.details?.items ?? []).map(i => ({
        url: i.url,
        transferSize: i.transferSize ?? 0,
        resourceType: i.resourceType ?? "",
      })),
    };
  } finally {
    await chrome.kill();
    rmSync(userDataDir, { recursive: true, force: true });
  }
}

const median = xs => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : Math.round((s[s.length / 2 - 1] + s[s.length / 2]) / 2);
};

async function measurePage(page) {
  const url = `${BASE_URL}${page.path}`;
  const runs = [];
  for (let i = 0; i < RUNS; i++) runs.push(await runOnce(url));

  const metricNames = Object.keys(runs[0].metrics);
  const metrics = Object.fromEntries(metricNames.map(m => [m, median(runs.map(r => r.metrics[m]))]));
  const spread = Object.fromEntries(
    metricNames.map(m => {
      const vs = runs.map(r => r.metrics[m]);
      return [m, { min: Math.min(...vs), max: Math.max(...vs) }];
    })
  );
  return {
    name: page.name,
    path: page.path,
    url,
    runs: RUNS,
    scores: Object.fromEntries(
      Object.keys(runs[0].scores).map(k => [k, median(runs.map(r => r.scores[k]))])
    ),
    metrics,
    spread,
    benchmarkIndex: median(runs.map(r => r.benchmarkIndex)),
    // Route isolation is a property of the request list, not of timing, so the
    // first run is as authoritative as the median.
    lazyChunksRequested: runs[0].requests
      .map(r => r.url)
      .filter(u => LAZY_CHUNK_PREFIXES.some(p => u.includes(`/assets/${p}`))),
    transferTotal: runs[0].requests.reduce((n, r) => n + r.transferSize, 0),
    requests: runs[0].requests,
  };
}

function checkTiming(results, calibrationValid) {
  const failures = [];
  const lines = [];
  const t = budget.budgets.timing;

  for (const r of results) {
    const base = budget.baseline.pages[r.name];
    if (!base) {
      failures.push(`No recorded baseline for page "${r.name}" — run with --record`);
      continue;
    }
    for (const [metric, rule] of Object.entries(t)) {
      const got = r.metrics[metric];
      if (!Number.isFinite(got)) {
        // Belt and braces behind runOnce's guard: a comparison against a
        // non-number is always false, which reads as a pass.
        failures.push(`${r.name} ${metric}: no numeric value was measured (${got})`);
        lines.push(`  ${r.name.padEnd(9)} ${metric.padEnd(4)} ${String(got).padStart(7)}  NOT MEASURED  FAIL`);
        continue;
      }
      const ceiling =
        rule.kind === "absolute"
          ? rule.ceiling
          : rule.kind === "relative"
            ? Math.round(base.metrics[metric] * (1 + rule.tolerance))
            : Math.round(base.spread[metric].max * rule.factor);
      const over = got > ceiling;
      const verdict = over ? (calibrationValid ? "FAIL" : "UNKNOWN") : "PASS";
      lines.push(
        `  ${r.name.padEnd(9)} ${metric.padEnd(4)} ${String(got).padStart(7)}  ceiling ${String(ceiling).padStart(7)}  baseline ${String(base.metrics[metric]).padStart(7)}  ${verdict}`
      );
      if (over && calibrationValid) {
        const rulePhrase =
          rule.kind === "absolute"
            ? `absolute ceiling ${rule.ceiling}`
            : rule.kind === "relative"
              ? `baseline median +${Math.round(rule.tolerance * 100)}%`
              : `${rule.factor}x the worst of ${budget.baseline.runsPerPage} baseline runs (${base.spread[metric].max})`;
        failures.push(
          `${r.name} ${metric}: ${got} exceeds the ${ceiling} ceiling — ${rulePhrase}; baseline median ${base.metrics[metric]}. ` +
            `The derivation is in budget.json under budgets.timing.${metric}.`
        );
      }
    }
  }
  return { failures, lines };
}

async function main() {
  console.log(`\nPerformance gate — profile "${budget.profile.name}", ${RUNS} run(s) per page, target ${BASE_URL}\n`);

  // ---- 2. Bundle bytes (no browser needed; fails fastest) -----------------
  const bundle = measureBundle();
  const bundleCheck = checkBundleBudget(bundle, budget);
  console.log(bundleCheck.lines.join("\n"));
  console.log("");

  // ---- 1. Measurability + 4. Vitals --------------------------------------
  const results = [];
  const unmeasured = [];
  for (const page of PAGES) {
    process.stdout.write(`  measuring ${page.name} (${BASE_URL}${page.path}) ... `);
    try {
      const r = await measurePage(page);
      results.push(r);
      console.log(
        `perf ${r.scores.performance}  FCP ${r.metrics.fcp}  LCP ${r.metrics.lcp}  ` +
          `TBT ${r.metrics.tbt}  CLS ${r.metrics.cls}  transfer ${(r.transferTotal / 1000).toFixed(1)} kB`
      );
    } catch (err) {
      console.log("ERROR");
      unmeasured.push({ name: page.name, path: page.path, error: err.message });
    }
  }

  // ---- 3. Route isolation -------------------------------------------------
  const isolationFailures = [];
  console.log("\nRoute isolation (lazy chunks must not be requested outside /dimensions):");
  for (const r of results) {
    const ok = r.lazyChunksRequested.length === 0;
    console.log(`  ${r.path.padEnd(12)} ${ok ? "PASS — none requested" : "FAIL — " + r.lazyChunksRequested.join(", ")}`);
    if (!ok) {
      isolationFailures.push(
        `${r.path} requested lazy chunk(s) that must load only on /dimensions: ${r.lazyChunksRequested.join(", ")}`
      );
    }
  }

  // ---- CPU calibration ----------------------------------------------------
  const bi = results.length ? median(results.map(r => r.benchmarkIndex)) : null;
  const band = budget.baseline.benchmarkIndexBand;
  const calibrationValid =
    bi !== null && bi >= band.min && bi <= band.max;
  console.log(
    `\nCPU calibration: benchmarkIndex ${bi} (baseline ${budget.baseline.benchmarkIndex}, ` +
      `valid band ${band.min}-${band.max}) — ${calibrationValid ? "timing budgets ENFORCED" : "timing budgets reported UNKNOWN, not enforced"}`
  );
  if (!calibrationValid) {
    console.log(
      "  This machine is not comparable to the one the timing baseline was recorded on.\n" +
        "  Byte budgets and route isolation still gate; re-record with --record to gate timing here."
    );
  }

  // ---- Timing budgets -----------------------------------------------------
  // A --record run is establishing evidence, not gating against it: comparing
  // a fresh measurement to the baseline it is about to become is circular.
  // A gating run with no baseline is a different matter — the timing gate
  // cannot do its job, and silently skipping it would leave a vacuous check
  // reporting success, which is the exact failure this whole script exists to
  // have stopped doing.
  console.log("\nCore Web Vitals vs budget:");
  let timing = { failures: [], lines: [] };
  if (RECORD) {
    console.log("  (skipped — this is a --record run; the baseline is being written, not tested against)");
  } else if (!budget.baseline.pages) {
    timing.failures.push(
      "No timing baseline recorded in tests/performance/budget.json. " +
        "Run `PERF_RUNS=5 npm run test:performance -- --record` first; a timing gate with no baseline is not a check."
    );
    console.log("  (none — no baseline recorded)");
  } else if (results.length) {
    timing = checkTiming(results, calibrationValid);
    console.log(timing.lines.join("\n"));
  }

  // ---- Record / report ----------------------------------------------------
  const report = {
    recordedAt: new Date().toISOString(),
    commit: (() => {
      try { return execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim(); }
      catch { return "unknown"; }
    })(),
    profile: budget.profile,
    baseUrl: BASE_URL,
    runsPerPage: RUNS,
    benchmarkIndex: bi,
    bundle: { entryScript: bundle.entryScript, entryStylesheet: bundle.entryStylesheet, groups: bundle.groups, chunks: bundle.chunks },
    pages: results,
    unmeasured,
  };
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(resolve(OUT_DIR, "lighthouse-results.json"), JSON.stringify(report, null, 2));
  console.log("\nResults written to test-results/lighthouse-results.json");

  if (RECORD) {
    const next = JSON.parse(JSON.stringify(budget));
    next.baseline.recordedAt = report.recordedAt;
    next.baseline.commit = report.commit;
    next.baseline.runsPerPage = RUNS;
    next.baseline.benchmarkIndex = bi;
    next.baseline.benchmarkIndexBand = { min: Math.round(bi * 0.7), max: Math.round(bi * 1.6) };
    next.baseline.bundle = Object.fromEntries(
      Object.entries(bundle.groups).map(([k, v]) => [k, v])
    );
    next.baseline.pages = Object.fromEntries(
      results.map(r => [r.name, { path: r.path, metrics: r.metrics, spread: r.spread, scores: r.scores, transferTotal: r.transferTotal }])
    );
    writeFileSync(BUDGET_PATH, JSON.stringify(next, null, 2) + "\n");
    console.log(`Baseline re-recorded into ${BUDGET_PATH} (${RUNS} runs per page, median).`);
    console.log("Ceilings were NOT changed — a baseline is evidence, a ceiling is a decision.");
  }

  // ---- Verdict ------------------------------------------------------------
  const failures = [
    ...unmeasured.map(u => `${u.name} (${u.path}) could not be measured: ${u.error}`),
    ...bundleCheck.failures,
    ...isolationFailures,
    ...timing.failures,
  ];

  console.log("");
  if (failures.length > 0) {
    console.error(`Performance gate FAILED — ${failures.length} budget violation(s):`);
    for (const f of failures) console.error(`  - ${f}`);
    console.error("");
    console.error("A ceiling is a decision, not a measurement. If a violation is intended,");
    console.error("change tests/performance/budget.json and record why in TASKS.md Decisions.");
    process.exit(1);
  }
  console.log("Performance gate PASSED — measurability, bundle bytes, route isolation, Core Web Vitals.");
  process.exit(0);
}

main().catch(err => {
  // Exit non-zero: a thrown audit is a failed audit. Swallowing this made the
  // script report success after crashing.
  console.error(err);
  process.exit(1);
});
