/**
 * UNIT TEST — T-018 rejection, F-2
 * client/src/pages/Dimensions.tsx hero headline
 *
 * Before this fix, the largest type on the page read "3D–7D. Genuinely
 * working." while the capability matrix directly beneath it shows PARTIAL
 * for three of five levels (5D, 6D, 7D — client/src/dimensions/contract.ts
 * DIMENSION_AVAILABILITY). A scanning visitor reads the headline, not the
 * badges underneath it, so the headline's overstatement is the honesty
 * defect, independent of the (already-honest) subhead and matrix.
 */
import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import DimensionsPage from "@/pages/Dimensions";
import { DIMENSION_AVAILABILITY } from "@/dimensions/contract";

describe("/dimensions hero headline does not overstate what the matrix below it shows", () => {
  it('does not claim every level is "genuinely working"', () => {
    render(<DimensionsPage />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).not.toMatch(/genuinely working/i);
  });

  it('sanity: the restraint is warranted — the real availability data has at least one "partial" level, not all "live"', () => {
    const partialLevels = Object.values(DIMENSION_AVAILABILITY).filter(
      a => a.status === "partial"
    );
    expect(partialLevels.length).toBeGreaterThan(0);
  });
});
