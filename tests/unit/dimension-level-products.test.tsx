/**
 * UNIT TESTS — T-014 per-product dimensional capability level
 * Category: Unit Testing
 *
 * OQ-3 (TASKS.md Decisions, 2026-09-05): a product's `dimensionLevel` is set
 * ONLY where evidence of the specific capability in `DIMENSION_LEVEL_META`
 * already exists in this repository. This suite asserts the mechanism
 * (filtering rule, badge rendering, contrast) works correctly, and — the
 * negative case that matters most — that NOTHING in today's real product
 * data carries a level, so no product renders a badge it hasn't earned.
 */
import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import {
  products,
  matchesDimensionLevel,
  availableDimensionLevels,
  DimensionBadge as ProductsDimensionBadge,
} from "@/pages/Products";
import {
  productDatabase,
  generateFallbackProduct,
  DimensionBadge as DetailDimensionBadge,
} from "@/pages/ProductDetail";
import {
  DIMENSION_LEVELS,
  DIMENSION_LEVEL_META,
  type DimensionLevel,
} from "@/dimensions/contract";

// ── WCAG contrast helpers (same formula used to design the badge colors) ──────
function srgbToLin(c: number) {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}
function relLum([r, g, b]: number[]) {
  return 0.2126 * srgbToLin(r) + 0.7152 * srgbToLin(g) + 0.0722 * srgbToLin(b);
}
function contrastRatio(rgb1: number[], rgb2: number[]) {
  const L1 = relLum(rgb1);
  const L2 = relLum(rgb2);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}
function parseRgb(css: string): number[] {
  const m = css.match(/rgba?\(([^)]+)\)/);
  if (!m) throw new Error(`Could not parse color: ${css}`);
  return m[1]
    .split(",")
    .slice(0, 3)
    .map(n => parseFloat(n.trim()));
}
function blend(fg: number[], alpha: number, bg: number[]) {
  return fg.map((c, i) => alpha * c + (1 - alpha) * bg[i]);
}
function parseRgba(css: string): { rgb: number[]; alpha: number } {
  const m = css.match(/rgba?\(([^)]+)\)/);
  if (!m) throw new Error(`Could not parse color: ${css}`);
  const parts = m[1].split(",").map(n => parseFloat(n.trim()));
  return { rgb: parts.slice(0, 3), alpha: parts.length > 3 ? parts[3] : 1 };
}

// Real page background colors this badge is composited over (read from the
// pages' own root elements — Products.tsx: style={{ background: "#030408" }},
// ProductDetail.tsx: className="... bg-[#070B14] ...").
const PRODUCTS_PAGE_BG = [0x03, 0x04, 0x08];
const DETAIL_PAGE_BG = [0x07, 0x0b, 0x14];

// ── Pure filtering rule ─────────────────────────────────────────────────────
describe("matchesDimensionLevel (the real predicate Products.tsx filters with)", () => {
  const withLevel = (level?: DimensionLevel) => ({ dimensionLevel: level });

  it('"All" matches every product regardless of level', () => {
    expect(matchesDimensionLevel(withLevel("3D"), "All")).toBe(true);
    expect(matchesDimensionLevel(withLevel(undefined), "All")).toBe(true);
  });

  it("a specific level matches only products carrying exactly that level", () => {
    expect(matchesDimensionLevel(withLevel("3D"), "3D")).toBe(true);
    expect(matchesDimensionLevel(withLevel("4D"), "3D")).toBe(false);
  });

  it("a product with no level never matches a specific level filter", () => {
    for (const level of DIMENSION_LEVELS) {
      expect(matchesDimensionLevel(withLevel(undefined), level)).toBe(false);
    }
  });

  it("filtering a fixture list by a level returns exactly the subset carrying it", () => {
    const fixture = [
      { slug: "a", dimensionLevel: "3D" as DimensionLevel },
      { slug: "b", dimensionLevel: undefined },
      { slug: "c", dimensionLevel: "7D" as DimensionLevel },
      { slug: "d", dimensionLevel: "3D" as DimensionLevel },
    ];
    const filtered3D = fixture.filter(p => matchesDimensionLevel(p, "3D"));
    expect(filtered3D.map(p => p.slug)).toEqual(["a", "d"]);
    const filteredAll = fixture.filter(p => matchesDimensionLevel(p, "All"));
    expect(filteredAll).toHaveLength(4);
  });
});

// ── The negative case that matters most: no fabricated badge today ─────────
describe("Current product data carries no dimensional capability claim (OQ-3)", () => {
  it("no entry in the 58-product Products.tsx list has a dimensionLevel set", () => {
    const withLevel = products.filter(p => p.dimensionLevel !== undefined);
    expect(withLevel).toEqual([]);
  });

  it("availableDimensionLevels (derived from data) is empty, so the list page renders no capability filter row today", () => {
    expect(availableDimensionLevels).toEqual([]);
  });

  it("none of the 9 real ProductDetail entries has a dimensionLevel set", () => {
    const withLevel = Object.values(productDatabase).filter(
      p => p.dimensionLevel !== undefined
    );
    expect(withLevel).toEqual([]);
  });

  it("generateFallbackProduct — which synthesises 49 of 58 detail pages — never sets dimensionLevel, for any slug", () => {
    for (const slug of [
      "imeasure",
      "roomcraft",
      "audiosuite",
      "some-unknown-product-xyz",
    ]) {
      const generated = generateFallbackProduct(slug);
      expect(generated.dimensionLevel).toBeUndefined();
      expect("dimensionLevel" in generated).toBe(false);
    }
  });

  it("slugs whose own marketing copy mentioned AR/3D/spatial words (aeroswift, imeasure, roomcraft, audiosuite) still carry no level — the mentions were judged incidental, not genuine evidence of this capability stack", () => {
    const flagged = ["aeroswift", "imeasure", "roomcraft", "audiosuite"];
    for (const slug of flagged) {
      const listEntry = products.find(p => p.slug === slug);
      expect(listEntry?.dimensionLevel).toBeUndefined();
      const detailEntry = productDatabase[slug]; // aeroswift is real; imeasure/roomcraft/audiosuite fall back
      if (detailEntry) expect(detailEntry.dimensionLevel).toBeUndefined();
    }
  });
});

// ── Badge rendering, accessible name, and contrast — for both pages' badge ──
describe.each([
  ["Products.tsx", ProductsDimensionBadge],
  ["ProductDetail.tsx", DetailDimensionBadge],
])("DimensionBadge (%s)", (_pageName, Badge) => {
  it.each(DIMENSION_LEVELS)(
    "renders the short label and a descriptive accessible name for level %s",
    level => {
      const meta = DIMENSION_LEVEL_META[level];
      render(<Badge level={level} />);
      const badge = screen.getByLabelText(
        `Dimensional capability: ${meta.label}`
      );
      expect(badge.textContent).toBe(meta.short);
      expect(badge.getAttribute("title")).toBe(meta.summary);
    }
  );

  it("meets WCAG AA text contrast (>= 4.5:1) against both page backgrounds", () => {
    render(<Badge level="3D" />);
    const badge = screen.getByLabelText(/Dimensional capability:/);
    const style = badge.getAttribute("style") || "";
    const bgMatch = style.match(/background:\s*([^;]+);/);
    const colorMatch = style.match(/color:\s*([^;]+);/);
    expect(bgMatch).toBeTruthy();
    expect(colorMatch).toBeTruthy();
    const { rgb: fillRgb, alpha: fillAlpha } = parseRgba(bgMatch![1]);
    const textRgb = parseRgb(
      colorMatch![1].startsWith("#")
        ? hexToRgbCss(colorMatch![1])
        : colorMatch![1]
    );

    for (const pageBg of [PRODUCTS_PAGE_BG, DETAIL_PAGE_BG]) {
      const compositedFill = blend(fillRgb, fillAlpha, pageBg);
      const ratio = contrastRatio(textRgb, compositedFill);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("meets WCAG 1.4.11 non-text contrast (>= 3:1) for the badge border against both page backgrounds", () => {
    render(<Badge level="3D" />);
    const badge = screen.getByLabelText(/Dimensional capability:/);
    const style = badge.getAttribute("style") || "";
    const borderMatch = style.match(/border-color:\s*([^;]+);/);
    expect(borderMatch).toBeTruthy();
    const { rgb: borderRgb, alpha: borderAlpha } = parseRgba(borderMatch![1]);

    for (const pageBg of [PRODUCTS_PAGE_BG, DETAIL_PAGE_BG]) {
      const compositedBorder = blend(borderRgb, borderAlpha, pageBg);
      const ratio = contrastRatio(compositedBorder, pageBg);
      expect(ratio).toBeGreaterThanOrEqual(3);
    }
  });
});

function hexToRgbCss(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgb(${r}, ${g}, ${b})`;
}
