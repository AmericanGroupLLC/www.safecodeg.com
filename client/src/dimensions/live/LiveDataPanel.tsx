/**
 * Live-data panel — client/src/dimensions/live/LiveDataPanel.tsx
 *
 * Renders the 5D live-data feed. Every state is honest: a loading state, a
 * real value with its source named, or a stated error naming the source —
 * never a fabricated number and never a stale value left on screen after a
 * failure (T-007).
 *
 * Pure presentation: `DimensionsStage.tsx` owns the single `useLiveData()`
 * call and passes its result down, rather than this component calling the
 * hook itself — the hook's status also has to reach `window.__AGL_DIMENSIONS__`
 * (`getLiveData()`), and there must be exactly one fetch lifecycle, not two.
 */

import { RefreshCw } from "lucide-react";
import type { UseLiveDataResult } from "./useLiveData";

export type LiveDataPanelProps = UseLiveDataResult;

export default function LiveDataPanel({ status, value, error, source, fetchedAt, refresh }: LiveDataPanelProps) {
  return (
    <div
      className="rounded-2xl p-5 sm:p-6"
      style={{ background: "rgba(17,19,39,0.5)", border: "1px solid rgba(124,58,237,0.2)" }}
    >
      <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-widest font-mono mb-1" style={{ color: "rgba(167,139,250,0.6)" }}>
            Live data feed
          </div>
          <h3 className="font-bold text-white text-lg" style={{ fontFamily: "Sora, sans-serif" }}>
            Current weather — Santa Clara, CA
          </h3>
        </div>
        <button
          type="button"
          onClick={refresh}
          data-testid="live-data-refresh"
          aria-label="Refresh live weather data"
          disabled={status === "loading"}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
          style={{ color: "rgba(255,255,255,0.8)", border: "1px solid rgba(124,58,237,0.25)" }}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.45)" }} data-testid="live-data-source">
        Fetched live from{" "}
        <a
          href={`https://${source}`}
          target="_blank"
          rel="noreferrer noopener"
          className="underline"
          style={{ color: "rgba(196,181,253,0.9)" }}
        >
          {source}
        </a>{" "}
        — a public, keyless weather API. No invented numbers: if this feed can&apos;t be reached, that is stated below, not covered up.
      </p>

      {status === "loading" && (
        <p role="status" className="text-sm text-slate-400">
          Fetching live weather from {source}…
        </p>
      )}

      {status === "ok" && value && (
        <p data-testid="live-data-value" className="text-2xl font-bold text-white" style={{ fontFamily: "Sora, sans-serif" }}>
          {`${value.temperatureF.toFixed(1)}°F, wind ${value.windspeedMph.toFixed(1)} mph`}
          {fetchedAt !== null && (
            <span className="block text-xs font-normal mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
              Fetched {new Date(fetchedAt).toLocaleTimeString()}
            </span>
          )}
        </p>
      )}

      {status === "error" && (
        <p
          role="alert"
          data-testid="live-data-error"
          className="text-sm px-4 py-3 rounded-xl"
          style={{ background: "rgba(127,29,29,0.35)", border: "1px solid rgba(248,113,113,0.4)", color: "#FCA5A5" }}
        >
          Live weather data from {source} is currently unavailable: {error}
        </p>
      )}
    </div>
  );
}
