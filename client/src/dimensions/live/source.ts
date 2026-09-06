/**
 * The 5D live-data source — client/src/dimensions/live/source.ts
 *
 * TASKS.md T-007's constraint: "prefer a keyless public HTTPS endpoint with
 * permissive CORS, because a keyed API cannot be called from a static bundle
 * without exposing the key, and a CORS proxy would be a new deploy target."
 *
 * Chosen endpoint: **Open-Meteo** (`api.open-meteo.com`), for the coordinates
 * of AGL's Santa Clara, California office (`client/src/pages/Contact.tsx:19`
 * — a real, named location, not an arbitrary one). Verified this session:
 *
 *   curl -s -D - -o /dev/null -H "Origin: https://www.safecodeg.com" \
 *     "https://api.open-meteo.com/v1/forecast?latitude=37.3541&longitude=-121.9552&current_weather=true"
 *
 * returned `HTTP/1.1 200 OK` with `access-control-allow-origin: *`. No API
 * key is required or sent — this is a genuinely keyless, HTTPS, CORS-open
 * public weather API, callable directly from the static bundle.
 */

import { z } from "zod";

export const LIVE_DATA_HOST = "api.open-meteo.com";

// AGL's Santa Clara, California office (client/src/pages/Contact.tsx:19).
const LATITUDE = 37.3541;
const LONGITUDE = -121.9552;

export const LIVE_DATA_URL =
  `https://${LIVE_DATA_HOST}/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}` +
  `&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph`;

/**
 * The trust boundary for this feed: this is an untrusted third-party HTTP
 * response, parsed with `zod` before anything in it is trusted — the same
 * discipline ARCHITECTURE-DIMENSIONS.md §6.5 requires of 6D peer payloads,
 * applied here to a different untrusted source.
 */
const weatherResponseSchema = z.object({
  current_weather: z.object({
    temperature: z.number(),
    windspeed: z.number(),
    winddirection: z.number(),
    time: z.string(),
  }),
});

export interface LiveWeather {
  temperatureF: number;
  windspeedMph: number;
  observedAt: string;
}

/** Every failure path names `LIVE_DATA_HOST` in the thrown message — the UI renders that message verbatim, never a stale value in its place. */
export async function fetchLiveWeather(
  signal?: AbortSignal
): Promise<LiveWeather> {
  let response: Response;
  try {
    response = await fetch(LIVE_DATA_URL, { signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError")
      throw error;
    const message = error instanceof Error ? error.message : "a network error";
    throw new Error(`Could not reach ${LIVE_DATA_HOST}: ${message}.`);
  }

  if (!response.ok) {
    throw new Error(
      `${LIVE_DATA_HOST} responded with HTTP ${response.status}.`
    );
  }

  const json: unknown = await response.json();
  const parsed = weatherResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error(
      `${LIVE_DATA_HOST} returned a response this page could not understand.`
    );
  }

  const { temperature, windspeed, time } = parsed.data.current_weather;
  return {
    temperatureF: temperature,
    windspeedMph: windspeed,
    observedAt: time,
  };
}
