/**
 * UNIT TESTS — Category 1
 * client/src/dimensions/live/source.ts (T-007, 5D live data)
 *
 * `fetch` is mocked here — this proves the parsing/error-wrapping logic in
 * isolation. `tests/e2e/dimensions.spec.ts` separately proves the real
 * network call against the real `api.open-meteo.com` endpoint works and is
 * wired into the page.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchLiveWeather, LIVE_DATA_HOST, LIVE_DATA_URL } from '@/dimensions/live/source';

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

describe('fetchLiveWeather', () => {
  it('is a real, keyless, HTTPS URL with no key/token embedded', () => {
    expect(LIVE_DATA_URL.startsWith('https://')).toBe(true);
    expect(LIVE_DATA_URL).toContain(LIVE_DATA_HOST);
    expect(LIVE_DATA_URL).not.toMatch(/key|token|apikey/i);
  });

  it('parses a genuine Open-Meteo response shape into a typed value', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      jsonResponse({
        current_weather: { temperature: 21.4, windspeed: 8.2, winddirection: 180, time: '2026-01-01T00:00' },
      }),
    );
    const result = await fetchLiveWeather();
    expect(result).toEqual({ temperatureF: 21.4, windspeedMph: 8.2, observedAt: '2026-01-01T00:00' });
  });

  it('throws an error naming the host when the response is a non-2xx status', async () => {
    global.fetch = vi.fn().mockResolvedValue(jsonResponse({}, 500));
    await expect(fetchLiveWeather()).rejects.toThrow(new RegExp(LIVE_DATA_HOST));
  });

  it('throws an error naming the host when the fetch itself rejects (network failure)', async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(fetchLiveWeather()).rejects.toThrow(new RegExp(LIVE_DATA_HOST));
  });

  it('throws when the response body does not match the expected shape (an untrusted boundary — §6.5\'s discipline applied here)', async () => {
    global.fetch = vi.fn().mockResolvedValue(jsonResponse({ unexpected: true }));
    await expect(fetchLiveWeather()).rejects.toThrow(new RegExp(LIVE_DATA_HOST));
  });

  it('re-throws an AbortError untouched so callers can distinguish a deliberate cancel from a real failure', async () => {
    const abortError = new DOMException('The operation was aborted.', 'AbortError');
    global.fetch = vi.fn().mockRejectedValue(abortError);
    await expect(fetchLiveWeather()).rejects.toBe(abortError);
  });
});
