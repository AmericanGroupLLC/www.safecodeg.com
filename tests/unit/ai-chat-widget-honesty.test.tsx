/**
 * UNIT TESTS — T-018 rejection, F-1
 * client/src/components/AIChatWidget.tsx
 *
 * "Sophia" is a hardcoded regex response engine — confirmed by
 * `grep -n "fetch\|trpc\|axios\|api\." client/src/components/AIChatWidget.tsx`
 * returning nothing — mounted globally (client/src/App.tsx), including on
 * /dimensions, the one page whose entire contract is never to claim a
 * capability that is not active.
 *
 * Before this fix, everything a visitor saw WITHOUT asking "are you a bot"
 * still asserted a person: the header read "Online · Customer Success,
 * AGL", the footer read "Sophia · Customer Success at American Group LLC",
 * the opening greeting read "I'm Sophia from the AGL team", asking "who are
 * you" got the same human-sounding answer, and the avatar pointed at
 * `/manus-storage/sophia-avatar_9b8b67b1.png`, which 404s in this build (in
 * neither client/public nor dist/public).
 *
 * Each test below fails against that copy and passes against the corrected,
 * disclosed version — reverting the corresponding string in
 * AIChatWidget.tsx reproduces the original failure. Real timers are used
 * throughout (not `vi.useFakeTimers`): the reply delay is now a flat 500ms
 * (`RESPONSE_DELAY_MS`), so `findByText`'s default ~1s polling window is
 * enough to observe it without simulating time — and it sidesteps the real
 * race between React's effect scheduling and a manually-advanced fake clock.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import AIChatWidget from '@/components/AIChatWidget';

// jsdom does not implement scrollIntoView; AIChatWidget calls it on every
// new message to keep the transcript pinned to the bottom. Scoped to this
// file only — not a global jsdom shim in tests/setup.ts.
Element.prototype.scrollIntoView = vi.fn();

afterEach(() => {
  cleanup();
});

function openWidget() {
  const rendered = render(<AIChatWidget />);
  fireEvent.click(screen.getByRole('button', { name: /chat with sophia/i }));
  return rendered;
}

describe('AIChatWidget — default presentation discloses a scripted assistant, unasked', () => {
  it('never renders "Online" as a presence claim anywhere in the widget', () => {
    openWidget();
    expect(screen.queryByText(/\bonline\b/i)).toBeNull();
  });

  it('the header discloses "Automated assistant" rather than a presence claim', () => {
    openWidget();
    expect(screen.getByText(/automated assistant · agl/i)).toBeTruthy();
  });

  it('never claims the job title "Customer Success at American Group LLC" (header or footer)', () => {
    openWidget();
    expect(screen.queryByText(/customer success/i)).toBeNull();
  });

  it('the opening greeting — shown before any question is asked — discloses it is automated, not a live person, and drops the "from the AGL team" framing', async () => {
    openWidget();
    // Reply delay is a flat RESPONSE_DELAY_MS (500ms) — well inside
    // findByText's default wait window. If the old hardcoded 1600ms
    // "feels-human" delay, or the old wording, ever came back, this would
    // fail (timeout, or a text mismatch) rather than silently pass.
    // AIChatWidget's `fmt()` splits each message into one <span> per line, so
    // the matched node is only the last line — read the whole bubble
    // (its parent) to see the full greeting text.
    const lastLine = await screen.findByText(/what can i help you with today/i, {}, { timeout: 3000 });
    const bubbleText = lastLine.parentElement?.textContent ?? '';
    expect(bubbleText).toMatch(/automated assistant/i);
    expect(bubbleText).toMatch(/not a live person/i);
    expect(bubbleText).not.toMatch(/from the agl team/i);
  });

  it('asking "who are you" gets an honest scripted-assistant answer, not a human job title', async () => {
    openWidget();
    await screen.findByText(/what can i help you with today/i, {}, { timeout: 3000 }); // wait for the greeting first
    fireEvent.change(screen.getByPlaceholderText(/message sophia/i), { target: { value: 'who are you' } });
    fireEvent.click(screen.getByRole('button', { name: /^send$/i }));
    const reply = await screen.findByText(/an automated assistant here on the agl site, not a person/i, {}, { timeout: 3000 });
    expect(reply.textContent).not.toMatch(/customer success/i);
  });

  it('renders no <img> avatar — no image asset exists to 404 (Sophia is drawn as an icon, not a photo)', () => {
    const { container } = openWidget();
    expect(container.querySelectorAll('img').length).toBe(0);
    expect(container.innerHTML).not.toMatch(/manus-storage/);
  });
});
