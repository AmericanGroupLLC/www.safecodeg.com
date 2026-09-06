/**
 * UNIT TEST — T-018 rejection, F-3
 * client/src/pages/AGL.tsx "Spatial & Industry SaaS" vertical description
 *
 * Before this fix, the prose read: "...built on a dimensional capability
 * stack — 3D spatial models through 7D immersive AR/VR — that runs live on
 * this site, level by level," attributing this site's own 3D–7D demo stack
 * to the six named products (SpaceForge AR, MedSpatial, RealityLayer,
 * IndustrialAR, CasinoOS, UrbanMesh) in sentence form. None of those
 * products carries a `dimensionLevel` anywhere in the real product data —
 * T-014 deliberately refused to badge any product for exactly this reason
 * (see tests/unit/dimension-level-products.test.tsx, OQ-3) — so the prose
 * made the same fabricated claim the badge system was built to avoid.
 */
import { describe, it, expect } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import AGLPage from "@/pages/AGL";

describe('AGL "Spatial & Industry SaaS" vertical does not attribute this site\'s demo stack to its products', () => {
  it('does not claim the products are "built on a dimensional capability stack"', () => {
    render(<AGLPage />);
    const body = document.body.textContent ?? "";
    expect(body).not.toMatch(/built on a dimensional capability stack/i);
  });

  it("describes the stack as this site's own, separate from the products' architecture", () => {
    render(<AGLPage />);
    const body = document.body.textContent ?? "";
    expect(body).toMatch(/this site separately runs its own/i);
    expect(body).toMatch(/not a claim about these products/i);
  });
});
