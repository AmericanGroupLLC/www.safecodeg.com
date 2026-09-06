/**
 * UNIT TESTS — chat widget contact-form delivery honesty
 * client/src/components/AIChatWidget.tsx
 *
 * Before this fix: confirming the reviewed message at the `form_done` stage
 * ran `handleForm`'s synchronous "yes" branch, which unconditionally
 * rendered "Done! ✅ Your message has been sent to the AGL team. They'll
 * reach out to you at ${email} within 1 business day." — with NO network
 * call anywhere in the file (`grep -nE "fetch\(|trpc\.|axios|XMLHttpRequest|
 * web3forms"` over the pre-fix file returns no matches). Every visitor who
 * confirmed sending a message was given a specific, false delivery
 * confirmation while their inquiry was silently discarded.
 *
 * The fix reuses client/src/pages/Contact.tsx's own working pattern: POST to
 * https://api.web3forms.com/submit with the same WEB3FORMS_KEY, read
 * `data.success`, and only then report success — otherwise throw and show an
 * honest failure with a route that works (contact@safecodeg.com, /contact).
 *
 * Each test below fails against the pre-fix copy (no fetch call is ever
 * made; success renders unconditionally and instantly; a failed/rejected
 * request still claims success) and passes against the corrected version.
 * Real timers are used (RESPONSE_DELAY_MS is a flat 500ms — see
 * ai-chat-widget-honesty.test.tsx for why), so no fake-timer/async race.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import AIChatWidget from '@/components/AIChatWidget';

// jsdom does not implement scrollIntoView; AIChatWidget calls it on every
// new message to keep the transcript pinned to the bottom.
Element.prototype.scrollIntoView = vi.fn();

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const TIMEOUT = 3000;

/** Opens the widget and drives the scripted form flow up to (not including)
 * the final "yes"/"no" confirmation, so each test only has to mock `fetch`
 * and send the confirmation itself. */
async function openWidgetAndReachReview() {
  render(<AIChatWidget />);
  fireEvent.click(screen.getByRole('button', { name: /chat with sophia/i }));
  await screen.findByText(/what can i help you with today/i, {}, { timeout: TIMEOUT });

  const input = () => screen.getByPlaceholderText(/message sophia/i);
  const sendBtn = () => screen.getByRole('button', { name: /^send$/i });
  const say = (text: string) => {
    fireEvent.change(input(), { target: { value: text } });
    fireEvent.click(sendBtn());
  };

  say('send a message');
  await screen.findByText(/first — what's your name/i, {}, { timeout: TIMEOUT });

  say('Jane Visitor');
  await screen.findByText(/what's your email address/i, {}, { timeout: TIMEOUT });

  say('jane@example.com');
  await screen.findByText(/what company or organization/i, {}, { timeout: TIMEOUT });

  say('Acme Inc');
  await screen.findByText(/what's your message or question/i, {}, { timeout: TIMEOUT });

  say('I would like a product demo, please get back to me');
  await screen.findByText(/shall i send this to the agl team/i, {}, { timeout: TIMEOUT });
}

describe('AIChatWidget — confirming the form actually submits it, and only reports what happened', () => {
  it('POSTs to Web3Forms with the same shape Contact.tsx uses, and reports success only once data.success is confirmed', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await openWidgetAndReachReview();
    fireEvent.change(screen.getByPlaceholderText(/message sophia/i), { target: { value: 'yes' } });
    fireEvent.click(screen.getByRole('button', { name: /^send$/i }));

    const successLine = await screen.findByText(/has been sent to the agl team/i, {}, { timeout: TIMEOUT });
    const bubbleText = successLine.parentElement?.textContent ?? '';
    expect(bubbleText).toMatch(/jane@example\.com/);
    // Consistent with Contact.tsx's own SLA wording ("1–2 business days"),
    // not a tighter, invented promise.
    expect(bubbleText).toMatch(/1[–-]2 business days/);
    expect(bubbleText).not.toMatch(/within 1 business day\b/);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('https://api.web3forms.com/submit');
    expect(options.method).toBe('POST');
    const body = JSON.parse(options.body);
    expect(body.access_key).toBe('97f985ce-75d3-47e8-b941-3e85db2e7395');
    expect(body.name).toBe('Jane Visitor');
    expect(body.email).toBe('jane@example.com');
    expect(body.company).toBe('Acme Inc');
    expect(body.message).toContain('product demo');
    expect(body.botcheck).toBe('');
  });

  it('a request Web3Forms itself rejects (data.success: false) produces an honest failure message with a working alternative route, never a success claim', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: false, message: 'Invalid access key' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await openWidgetAndReachReview();
    fireEvent.change(screen.getByPlaceholderText(/message sophia/i), { target: { value: 'yes' } });
    fireEvent.click(screen.getByRole('button', { name: /^send$/i }));

    await screen.findByText(/contact@safecodeg\.com/i, {}, { timeout: TIMEOUT });
    expect(screen.queryByText(/has been sent to the agl team/i)).toBeNull();
    expect(screen.queryByText(/done! ✅/i)).toBeNull();

    const contactLink = await screen.findByRole('link', { name: /visit contact page/i });
    expect(contactLink.getAttribute('href')).toBe('/contact');
  });

  it('a rejected fetch (network failure) also produces the honest failure message, never a success claim', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    vi.stubGlobal('fetch', mockFetch);

    await openWidgetAndReachReview();
    fireEvent.change(screen.getByPlaceholderText(/message sophia/i), { target: { value: 'yes' } });
    fireEvent.click(screen.getByRole('button', { name: /^send$/i }));

    await screen.findByText(/contact@safecodeg\.com/i, {}, { timeout: TIMEOUT });
    expect(screen.queryByText(/has been sent to the agl team/i)).toBeNull();
    expect(screen.queryByText(/done! ✅/i)).toBeNull();
  });

  it('while the request is in flight, no success message appears yet and the input is disabled', async () => {
    let resolveFetch: (v: unknown) => void = () => {};
    const pending = new Promise((resolve) => {
      resolveFetch = resolve;
    });
    const mockFetch = vi.fn().mockReturnValue(pending);
    vi.stubGlobal('fetch', mockFetch);

    await openWidgetAndReachReview();
    fireEvent.change(screen.getByPlaceholderText(/message sophia/i), { target: { value: 'yes' } });
    fireEvent.click(screen.getByRole('button', { name: /^send$/i }));

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
    // The request is still pending — nothing has confirmed delivery yet.
    expect(screen.queryByText(/has been sent to the agl team/i)).toBeNull();
    expect(screen.getByPlaceholderText(/message sophia|sending/i)).toBeDisabled();

    resolveFetch({ ok: true, json: async () => ({ success: true }) });
    await screen.findByText(/has been sent to the agl team/i, {}, { timeout: TIMEOUT });
  });
});
