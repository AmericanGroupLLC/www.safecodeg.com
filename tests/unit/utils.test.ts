/**
 * UNIT TESTS — Utility Functions & Data Structures
 * Category: Unit Testing
 * Tests: Pure functions, data integrity, type safety
 */
import { describe, it, expect } from 'vitest';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ── Test: clsx utility ────────────────────────────────────────────────────────
describe('clsx utility', () => {
  it('combines class strings', () => {
    expect(clsx('foo', 'bar')).toBe('foo bar');
  });
  it('handles conditional classes', () => {
    expect(clsx('base', { active: true, disabled: false })).toBe('base active');
  });
  it('handles undefined/null gracefully', () => {
    expect(clsx('base', undefined, null, '')).toBe('base');
  });
  it('handles arrays', () => {
    expect(clsx(['a', 'b'], 'c')).toBe('a b c');
  });
});

// ── Test: tailwind-merge ──────────────────────────────────────────────────────
describe('tailwind-merge utility', () => {
  it('merges conflicting tailwind classes (last wins)', () => {
    const result = twMerge('text-red-500', 'text-blue-500');
    expect(result).toBe('text-blue-500');
  });
  it('keeps non-conflicting classes', () => {
    const result = twMerge('text-lg', 'font-bold');
    expect(result).toContain('text-lg');
    expect(result).toContain('font-bold');
  });
  it('handles padding conflicts', () => {
    const result = twMerge('px-4 py-2', 'px-8');
    expect(result).toContain('px-8');
    expect(result).not.toContain('px-4');
  });
});

// ── Test: Product data structure integrity ────────────────────────────────────
describe('Product data structure', () => {
  const PRODUCTS = [
    { slug: 'cognicore', name: 'CogniCore AI', category: 'Enterprise AI & DevTools', platform: 'Web/API', status: 'Live' },
    { slug: 'myhealth', name: 'MyHealth', category: 'Health & Wellness', platform: 'Android/Wear OS', status: 'Live' },
    { slug: 'aeroswift', name: 'AeroSwift', category: 'Travel & Aviation', platform: 'iOS/Android', status: 'Live' },
    { slug: 'apexmarketwatch', name: 'ApexMarketWatch', category: 'FinTech & E-Commerce', platform: 'iOS/Android', status: 'Live' },
    { slug: 'offlinebuddy', name: 'OfflineBuddy', category: 'Enterprise AI & DevTools', platform: 'Android', status: 'Live' },
    { slug: 'securecore', name: 'SecureCore', category: 'CyberSecurity & Infra', platform: 'Web/API', status: 'Live' },
  ];

  it('all products have required fields', () => {
    PRODUCTS.forEach(p => {
      expect(p.slug).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.category).toBeTruthy();
      expect(p.platform).toBeTruthy();
      expect(p.status).toBeTruthy();
    });
  });

  it('all slugs are lowercase and hyphenated (URL-safe)', () => {
    PRODUCTS.forEach(p => {
      expect(p.slug).toMatch(/^[a-z0-9-]+$/);
    });
  });

  it('all slugs are unique', () => {
    const slugs = PRODUCTS.map(p => p.slug);
    const unique = new Set(slugs);
    expect(unique.size).toBe(slugs.length);
  });

  it('status values are valid enum', () => {
    const validStatuses = ['Live', 'Beta', 'Coming Soon'];
    PRODUCTS.forEach(p => {
      expect(validStatuses).toContain(p.status);
    });
  });
});

// ── Test: Vertical data integrity ─────────────────────────────────────────────
describe('Vertical data integrity', () => {
  const VERTICALS = [
    { title: 'Enterprise AI & DevTools', count: 12 },
    { title: 'Consumer Mobile', count: 18 },
    { title: 'FinTech & E-Commerce', count: 14 },
    { title: 'CyberSecurity & Infra', count: 8 },
    { title: 'Travel & Aviation', count: 6 },
    { title: 'Health & Wellness', count: 10 },
    { title: 'E-Commerce & Deals', count: 5 },
    { title: 'Social & Lifestyle', count: 4 },
  ];

  it('has exactly 8 verticals', () => {
    expect(VERTICALS.length).toBe(8);
  });

  it('total product count across verticals is 77', () => {
    const total = VERTICALS.reduce((sum, v) => sum + v.count, 0);
    expect(total).toBe(77);
  });

  it('all verticals have positive product counts', () => {
    VERTICALS.forEach(v => {
      expect(v.count).toBeGreaterThan(0);
    });
  });

  it('all vertical titles are non-empty strings', () => {
    VERTICALS.forEach(v => {
      expect(typeof v.title).toBe('string');
      expect(v.title.length).toBeGreaterThan(0);
    });
  });
});

// ── Test: URL/route generation ────────────────────────────────────────────────
describe('Route generation', () => {
  const generateProductRoute = (slug: string) => `/products/${slug}`;
  const generateVerticalRoute = (slug: string) => `/products?vertical=${slug}`;

  it('generates correct product route', () => {
    expect(generateProductRoute('cognicore')).toBe('/products/cognicore');
  });

  it('generates correct vertical filter route', () => {
    expect(generateVerticalRoute('enterprise-ai')).toBe('/products?vertical=enterprise-ai');
  });

  it('handles slugs with numbers', () => {
    expect(generateProductRoute('app365')).toBe('/products/app365');
  });
});

// ── Test: String formatting utilities ─────────────────────────────────────────
describe('String formatting', () => {
  const formatCount = (n: number, suffix = '+') => `${n}${suffix}`;
  const truncate = (str: string, max: number) =>
    str.length > max ? str.slice(0, max) + '...' : str;

  it('formats count with suffix', () => {
    expect(formatCount(77)).toBe('77+');
    expect(formatCount(99, '.9%')).toBe('99.9%');
  });

  it('truncates long strings', () => {
    expect(truncate('Hello World', 5)).toBe('Hello...');
    expect(truncate('Hi', 10)).toBe('Hi');
  });

  it('handles empty string truncation', () => {
    expect(truncate('', 5)).toBe('');
  });
});
