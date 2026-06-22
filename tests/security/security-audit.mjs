/**
 * SECURITY TESTS — HTTP Headers, XSS, CSP, Content Audit
 * Category: Security Testing
 * Tests: Security headers, XSS vectors, sensitive data exposure,
 *        mixed content, external link safety, CSP audit
 */
import { writeFileSync } from 'fs';

const BASE_URL = 'https://3000-i753378jthktwfw3nn2q0-fd1d198d.us1.manus.computer';

const PAGES_TO_TEST = ['/', '/products', '/about', '/contact', '/privacy-policy'];

// ── Security header checks ────────────────────────────────────────────────────
async function checkSecurityHeaders(url) {
  const res = await fetch(url);
  const headers = Object.fromEntries(res.headers.entries());

  const checks = [
    {
      name: 'X-Content-Type-Options',
      present: !!headers['x-content-type-options'],
      value: headers['x-content-type-options'] || 'MISSING',
      severity: 'medium',
      recommendation: 'Add: X-Content-Type-Options: nosniff',
    },
    {
      name: 'X-Frame-Options',
      present: !!headers['x-frame-options'] || !!headers['content-security-policy']?.includes('frame-ancestors'),
      value: headers['x-frame-options'] || (headers['content-security-policy'] ? 'via CSP' : 'MISSING'),
      severity: 'medium',
      recommendation: 'Add: X-Frame-Options: DENY or CSP frame-ancestors',
    },
    {
      name: 'Strict-Transport-Security (HSTS)',
      present: !!headers['strict-transport-security'],
      value: headers['strict-transport-security'] || 'MISSING',
      severity: 'high',
      recommendation: 'Add: Strict-Transport-Security: max-age=31536000; includeSubDomains',
    },
    {
      name: 'Content-Security-Policy',
      present: !!headers['content-security-policy'],
      value: headers['content-security-policy'] ? 'Present' : 'MISSING',
      severity: 'high',
      recommendation: 'Add Content-Security-Policy header to prevent XSS',
    },
    {
      name: 'Referrer-Policy',
      present: !!headers['referrer-policy'],
      value: headers['referrer-policy'] || 'MISSING',
      severity: 'low',
      recommendation: 'Add: Referrer-Policy: strict-origin-when-cross-origin',
    },
    {
      name: 'Permissions-Policy',
      present: !!headers['permissions-policy'],
      value: headers['permissions-policy'] || 'MISSING',
      severity: 'low',
      recommendation: 'Add Permissions-Policy to restrict browser features',
    },
    {
      name: 'X-XSS-Protection (legacy)',
      present: !!headers['x-xss-protection'],
      value: headers['x-xss-protection'] || 'MISSING (use CSP instead)',
      severity: 'info',
      recommendation: 'Modern browsers use CSP; this header is legacy',
    },
  ];

  return { url, status: res.status, checks };
}

// ── Content security audit ────────────────────────────────────────────────────
async function auditPageContent(url, pageName) {
  const res = await fetch(url);
  const html = await res.text();

  const findings = [];

  // Check for sensitive data patterns
  const sensitivePatterns = [
    { pattern: /password\s*=\s*["'][^"']+["']/gi, name: 'Hardcoded password', severity: 'critical' },
    { pattern: /api[_-]?key\s*=\s*["'][a-zA-Z0-9_\-]{20,}["']/gi, name: 'Hardcoded API key', severity: 'critical' },
    { pattern: /secret\s*=\s*["'][^"']+["']/gi, name: 'Hardcoded secret', severity: 'critical' },
    { pattern: /private[_-]?key/gi, name: 'Private key reference', severity: 'high' },
    { pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, name: 'Credit card pattern', severity: 'critical' },
    { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, name: 'SSN pattern', severity: 'critical' },
  ];

  for (const { pattern, name, severity } of sensitivePatterns) {
    const matches = html.match(pattern);
    if (matches) {
      findings.push({ type: 'sensitive_data', name, severity, count: matches.length });
    }
  }

  // Check for inline event handlers (XSS risk)
  const inlineHandlers = (html.match(/\bon\w+\s*=\s*["'][^"']*["']/gi) || []).length;
  if (inlineHandlers > 5) {
    findings.push({ type: 'xss_risk', name: 'Inline event handlers', severity: 'low', count: inlineHandlers, note: 'Prefer addEventListener' });
  }

  // Check for eval() usage
  const evalUsage = (html.match(/\beval\s*\(/g) || []).length;
  if (evalUsage > 0) {
    findings.push({ type: 'xss_risk', name: 'eval() usage detected', severity: 'high', count: evalUsage });
  }

  // Check for mixed content (http:// in https page)
  const httpLinks = (html.match(/src\s*=\s*["']http:\/\//gi) || []).length;
  if (httpLinks > 0) {
    findings.push({ type: 'mixed_content', name: 'HTTP resources on HTTPS page', severity: 'medium', count: httpLinks });
  }

  // Check for external scripts
  const externalScripts = (html.match(/<script[^>]+src\s*=\s*["']https?:\/\/(?!cdn\.tailwindcss|fonts\.googleapis|fonts\.gstatic)[^"']+["']/gi) || []).length;
  if (externalScripts > 0) {
    findings.push({ type: 'external_dependency', name: 'External scripts without SRI', severity: 'medium', count: externalScripts });
  }

  // Check for mailto: links (spam risk)
  const mailtoLinks = (html.match(/mailto:/gi) || []).length;

  // Check for tel: links
  const telLinks = (html.match(/tel:/gi) || []).length;

  // Positive checks
  const positives = [];
  if (!html.includes('eval(')) positives.push('No eval() usage');
  if (mailtoLinks > 0) positives.push(`${mailtoLinks} contact email(s) present`);
  if (telLinks > 0) positives.push(`${telLinks} phone number(s) present`);
  if (!html.match(/password\s*=\s*["'][^"']+["']/gi)) positives.push('No hardcoded passwords');
  if (!html.match(/api[_-]?key\s*=\s*["'][a-zA-Z0-9_\-]{20,}["']/gi)) positives.push('No hardcoded API keys');

  return { pageName, url, findings, positives, passed: findings.filter(f => ['critical', 'high'].includes(f.severity)).length === 0 };
}

// ── External link safety check ────────────────────────────────────────────────
async function checkExternalLinks(url) {
  const res = await fetch(url);
  const html = await res.text();

  const externalLinks = [...html.matchAll(/href\s*=\s*["'](https?:\/\/[^"']+)["']/gi)]
    .map(m => m[1])
    .filter(link => !link.includes('3000-i753378jthktwfw3nn2q0'));

  const uniqueLinks = [...new Set(externalLinks)];
  const safeLinks = uniqueLinks.filter(l => l.startsWith('https://'));
  const unsafeLinks = uniqueLinks.filter(l => l.startsWith('http://'));

  return {
    total: uniqueLinks.length,
    https: safeLinks.length,
    http: unsafeLinks.length,
    unsafeLinks,
    passed: unsafeLinks.length === 0,
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🔒 Running Security Audit...\n');

  const results = {
    headers: [],
    content: [],
    links: [],
    summary: { passed: 0, warnings: 0, failed: 0 },
  };

  // 1. Security headers
  console.log('  1. Checking security headers...');
  const headerResult = await checkSecurityHeaders(BASE_URL + '/');
  results.headers = headerResult.checks;
  const missingCritical = headerResult.checks.filter(c => !c.present && ['high', 'critical'].includes(c.severity));
  console.log(`     HTTP Status: ${headerResult.status}`);
  headerResult.checks.forEach(c => {
    const icon = c.present ? '✅' : (c.severity === 'high' ? '⚠️ ' : 'ℹ️ ');
    console.log(`     ${icon} ${c.name}: ${c.value}`);
  });

  // 2. Content security audit
  console.log('\n  2. Auditing page content for security issues...');
  for (const path of PAGES_TO_TEST) {
    const url = BASE_URL + path;
    const result = await auditPageContent(url, path);
    results.content.push(result);
    const icon = result.passed ? '✅' : '⚠️ ';
    console.log(`     ${icon} ${path}: ${result.findings.length} issues, ${result.positives.length} positive checks`);
    if (result.findings.length > 0) {
      result.findings.forEach(f => console.log(`        - [${f.severity.toUpperCase()}] ${f.name}`));
    }
  }

  // 3. External link safety
  console.log('\n  3. Checking external link safety...');
  const linkResult = await checkExternalLinks(BASE_URL + '/');
  results.links = linkResult;
  const linkIcon = linkResult.passed ? '✅' : '⚠️ ';
  console.log(`     ${linkIcon} External links: ${linkResult.total} total, ${linkResult.https} HTTPS, ${linkResult.http} HTTP`);
  if (linkResult.unsafeLinks.length > 0) {
    console.log(`     Unsafe links: ${linkResult.unsafeLinks.join(', ')}`);
  }

  // Summary
  const allContentPassed = results.content.every(r => r.passed);
  const criticalHeadersMissing = missingCritical.length;

  results.summary = {
    headers_missing_critical: criticalHeadersMissing,
    content_passed: allContentPassed,
    links_safe: linkResult.passed,
    overall_status: criticalHeadersMissing === 0 && allContentPassed && linkResult.passed ? 'PASS' : 'WARN',
    note: 'Security headers are typically added at the hosting/CDN layer (Nginx, Cloudflare) — not in the SPA bundle itself.',
  };

  console.log(`\n  Overall Security Status: ${results.summary.overall_status}`);
  console.log(`  Note: ${results.summary.note}`);

  writeFileSync('/home/ubuntu/test-results/security-results.json', JSON.stringify(results, null, 2));
  console.log('\n✅ Security results saved to test-results/security-results.json\n');
}

main().catch(console.error);
