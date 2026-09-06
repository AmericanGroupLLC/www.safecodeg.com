/**
 * /dimensions — client/src/pages/Dimensions.tsx
 *
 * ARCHITECTURE-DIMENSIONS.md §9.2: this file is STATIC — in the entry
 * chunk. It owns navigation, page chrome, the capability matrix, and every
 * honest-degradation panel (the WebGL-unavailable fallback below). The one
 * and only dynamic import of the `DimensionsStage` entry point for this
 * whole feature is the `lazy()` call a few lines down; nothing else in this
 * file reaches into `@/dimensions/*` except `@/dimensions/contract`, which
 * has zero imports of its own and is therefore free to sit in the entry
 * chunk (§9.3, §11).
 *
 * Per §9.3, the first grep that keeps the *entry-chunk* boundary real:
 *   grep -rn "from ['\"]@/dimensions/" client/src --include=*.ts --include=*.tsx \
 *     | grep -v "^client/src/dimensions/" | grep -v "@/dimensions/contract" | grep -v "import type"
 *   → must return nothing.
 *
 * The second grep, `grep -rn "import(" client/src | grep dimensions`, no
 * longer returns exactly one line as §9.3 originally stated — T-007 (the
 * physics chunk, `DimensionsStage.tsx`'s own `import("./physics/sandbox")`)
 * and T-009 (the collab chunk, `transport/index.ts`'s own
 * `import("./supabaseTransport")`) each added one more, both *inside*
 * `client/src/dimensions/`, exactly as §9.4's three-vendor-chunk design
 * intended. What must still hold, and is the sharper check now:
 *   grep -rn 'import(.*DimensionsStage' client/src --include=*.ts --include=*.tsx
 * returns exactly one non-comment line — this file's `lazy()` call — because
 * that is the one crossing point into the lazy-loaded feature from outside it.
 */

import { lazy, Suspense, useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { DIMENSION_LEVELS, DIMENSION_LEVEL_META } from "@/dimensions/contract";
import {
  getDimensionAvailability,
  dimensionStatusPresentation,
  getDimensionCaveat,
} from "@/lib/dimensionsAvailability";

const DimensionsStage = lazy(() => import("@/dimensions/DimensionsStage"));

/**
 * Availability (live / partial / not-built, plus for "partial" a caveat
 * naming exactly what is not yet true) is read from
 * `@/lib/dimensionsAvailability`, which itself reads `DIMENSION_AVAILABILITY`
 * in `@/dimensions/contract` — the single source of truth also read by the
 * Home teaser and the AGL "Spatial & Industry SaaS" vertical. This page used
 * to hand-type its own `LIVE_LEVELS` here, which is exactly how it drifted
 * from `dimensionsAvailability.ts`'s separate list (one said 7D was live,
 * the other said it wasn't, on the same site). There is now exactly one
 * place to update when a level's own acceptance criteria change, and this
 * page, the Home teaser and the AGL vertical all read it.
 */

type WebglState = "checking" | "available" | "unavailable";

function probeWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    return Boolean(gl);
  } catch {
    return false;
  }
}

export default function DimensionsPage() {
  const [webgl, setWebgl] = useState<WebglState>("checking");
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setWebgl(probeWebGL() ? "available" : "unavailable");
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const handleChange = (event: MediaQueryListEvent) =>
      setReducedMotion(event.matches);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return (
    <div style={{ background: "#030408", color: "white", minHeight: "100vh" }}>
      <Navigation />

      <section className="relative pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest mb-8"
            style={{
              background: "rgba(124,58,237,0.1)",
              border: "1px solid rgba(124,58,237,0.3)",
              color: "rgba(196,181,253,0.9)",
            }}
          >
            Dimensional Capability Stack
          </div>

          <h1
            className="font-black text-white mb-6 tracking-tight"
            style={{
              fontFamily: "Sora, sans-serif",
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            }}
          >
            3D–7D.{" "}
            <span
              style={{
                background:
                  "linear-gradient(135deg, #C4B5FD 0%, #7C3AED 40%, #F59E0B 80%, #FCD34D 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Built level by level.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl leading-relaxed mb-8">
            A real WebGL scene with a sourced 3D model, and a deterministic
            time-based process simulation you can scrub, play and pause. Every
            level below either runs for real, on this page, right now — or says
            plainly that it does not yet.
          </p>

          <div className="flex items-center gap-3 mb-10">
            <span
              className="text-xs uppercase tracking-widest font-mono"
              style={{ color: "rgba(167,139,250,0.7)" }}
            >
              Motion
            </span>
            <span
              data-testid="motion-mode"
              className="font-mono text-xs px-2.5 py-1 rounded-full"
              style={{
                background: "rgba(124,58,237,0.12)",
                border: "1px solid rgba(124,58,237,0.25)",
                color: "rgba(255,255,255,0.8)",
              }}
            >
              {reducedMotion ? "reduced" : "full"}
            </span>
          </div>

          {/* ── Capability matrix — honest, not aspirational ────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-14">
            {DIMENSION_LEVELS.map(level => {
              const meta = DIMENSION_LEVEL_META[level];
              const availability = getDimensionAvailability(level);
              const presentation = dimensionStatusPresentation(
                availability.status
              );
              return (
                <div
                  key={level}
                  data-testid={`dimension-matrix-card-${level}`}
                  className="rounded-xl p-4"
                  style={{
                    background: "rgba(17,19,39,0.6)",
                    border: `1px solid ${presentation.borderColor}`,
                  }}
                >
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <span
                      className="font-bold"
                      style={{ fontFamily: "Sora, sans-serif" }}
                    >
                      {level}
                    </span>
                    <span
                      className="text-[9px] uppercase tracking-widest font-mono px-2 py-0.5 rounded-full whitespace-nowrap"
                      style={{
                        background: presentation.badgeBg,
                        color: presentation.badgeText,
                      }}
                    >
                      {presentation.badgeLabel}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">{meta.short}</div>
                  {getDimensionCaveat(level) && (
                    <div
                      data-testid={`dimension-matrix-caveat-${level}`}
                      className="text-[11px] leading-snug mt-2"
                      style={{ color: "rgba(252,211,77,0.75)" }}
                    >
                      {getDimensionCaveat(level)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── The 3D + 4D stage ────────────────────────────────────────── */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid rgba(124,58,237,0.2)" }}
          >
            {webgl === "unavailable" ? (
              <div
                data-testid="dimensions-fallback"
                role="status"
                className="p-10 sm:p-16 text-center"
              >
                <p className="text-lg font-semibold mb-2">3D is unavailable</p>
                <p className="text-slate-400 max-w-md mx-auto">
                  This browser or device did not provide a WebGL context. This
                  page normally shows an interactive 3D scene with a time-based
                  process simulation here.
                </p>
              </div>
            ) : webgl === "checking" ? (
              <div
                role="status"
                className="p-10 sm:p-16 text-center text-slate-500"
              >
                Checking this browser&apos;s 3D support…
              </div>
            ) : (
              <Suspense
                fallback={
                  <div
                    role="status"
                    className="p-10 sm:p-16 text-center text-slate-500"
                  >
                    Loading the 3D stage…
                  </div>
                }
              >
                <DimensionsStage prefersReducedMotion={reducedMotion} />
              </Suspense>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
