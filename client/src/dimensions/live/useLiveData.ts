/**
 * Live-data hook — client/src/dimensions/live/useLiveData.ts
 *
 * Owns the fetch lifecycle for the 5D live-data feed (`./source.ts`). On an
 * error, `value` is set back to `null` — T-007's "live data failure path"
 * criterion requires that a stale value never keeps rendering as if it were
 * current, so the error state has nothing left to show a number next to.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchLiveWeather, LIVE_DATA_HOST, type LiveWeather } from "./source";

export type LiveDataStatus = "idle" | "loading" | "ok" | "error";

interface LiveDataState {
  status: LiveDataStatus;
  value: LiveWeather | null;
  error: string | null;
  fetchedAt: number | null;
}

export interface UseLiveDataResult extends LiveDataState {
  /** The upstream host, named so the UI can render it — T-007: "the upstream host is named in the UI so a visitor can check the source." */
  source: string;
  /** Explicit re-fetch — also what T-007's "value updates when a second response arrives" test drives. */
  refresh: () => void;
}

export function useLiveData(): UseLiveDataResult {
  const [state, setState] = useState<LiveDataState>({
    status: "idle",
    value: null,
    error: null,
    fetchedAt: null,
  });
  const abortRef = useRef<AbortController | null>(null);

  const refresh = useCallback(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState(current => ({ ...current, status: "loading" }));

    fetchLiveWeather(controller.signal).then(
      value => {
        if (controller.signal.aborted) return;
        setState({ status: "ok", value, error: null, fetchedAt: Date.now() });
      },
      (error: unknown) => {
        if (controller.signal.aborted) return;
        const message =
          error instanceof Error
            ? error.message
            : "This feed is currently unavailable.";
        // `value: null` — an error never leaves the previous number on screen.
        setState({
          status: "error",
          value: null,
          error: message,
          fetchedAt: null,
        });
      }
    );
  }, []);

  useEffect(() => {
    refresh();
    return () => abortRef.current?.abort();
    // Mount-once: `refresh` is stable (empty dep array of its own `useCallback`).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ...state, source: LIVE_DATA_HOST, refresh };
}
