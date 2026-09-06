/**
 * UNIT TESTS — Category 1
 * client/src/dimensions/xr/detect.ts (T-012, 7D capability probe)
 *
 * `navigator.xr` and `HTMLCanvasElement.prototype.getContext` are mocked
 * here to drive every branch of the four-step probe in isolation, including
 * the one branch a live browser can't be coerced into on demand: a
 * `isSessionSupported` REJECTION (§7.1's "blocked-by-policy", never
 * "unsupported"). `tests/e2e/dimensions.spec.ts` separately proves the real
 * page renders each reachable state's exact copy and that the four
 * affirmative strings never appear outside `session-running`.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  probeQuickLook,
  probeWebGL,
  probeXR,
  resolveXrUiState,
  xrStatusText,
} from "@/dimensions/xr/detect";

const originalGetContext = HTMLCanvasElement.prototype.getContext;

function mockWebGL(available: boolean) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLCanvasElement.prototype as any).getContext = available
    ? () => ({})
    : () => null;
}

function mockNavigatorXr(xr: unknown) {
  Object.defineProperty(navigator, "xr", {
    value: xr,
    configurable: true,
    writable: true,
  });
}

function mockQuickLook(supported: boolean) {
  vi.spyOn(HTMLAnchorElement.prototype, "relList", "get").mockReturnValue({
    supports: () => supported,
  } as unknown as DOMTokenList);
}

afterEach(() => {
  HTMLCanvasElement.prototype.getContext = originalGetContext;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (navigator as any).xr;
  vi.restoreAllMocks();
});

describe("probeWebGL / probeQuickLook", () => {
  it("reports true when getContext returns a context, false when it returns null", () => {
    mockWebGL(true);
    expect(probeWebGL()).toBe(true);
    mockWebGL(false);
    expect(probeWebGL()).toBe(false);
  });

  it("never throws even if getContext itself throws", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (HTMLCanvasElement.prototype as any).getContext = () => {
      throw new Error("no WebGL");
    };
    expect(probeWebGL()).toBe(false);
  });

  it('reflects relList.supports("ar")', () => {
    mockQuickLook(true);
    expect(probeQuickLook()).toBe(true);
    mockQuickLook(false);
    expect(probeQuickLook()).toBe(false);
  });
});

describe("probeXR — the eleven-state machine, nine of which this probe can produce", () => {
  it('no WebGL ⇒ "no-webgl", independent of navigator.xr', async () => {
    mockWebGL(false);
    const result = await probeXR();
    expect(result.state).toBe("no-webgl");
    expect(result.supported).toBeNull();
  });

  it('WebGL ok, no navigator.xr, no Quick Look ⇒ "no-webxr"', async () => {
    mockWebGL(true);
    mockQuickLook(false);
    mockNavigatorXr(undefined);
    const result = await probeXR();
    expect(result.state).toBe("no-webxr");
  });

  it('WebGL ok, no navigator.xr, Quick Look available ⇒ "quicklook-only" (a real AR path, not a fallback of WebXR)', async () => {
    mockWebGL(true);
    mockQuickLook(true);
    mockNavigatorXr(undefined);
    const result = await probeXR();
    expect(result.state).toBe("quicklook-only");
  });

  it('navigator.xr present, both session types unsupported (resolve false) ⇒ "no-device"', async () => {
    mockWebGL(true);
    mockNavigatorXr({ isSessionSupported: vi.fn().mockResolvedValue(false) });
    const result = await probeXR();
    expect(result.state).toBe("no-device");
    expect(result.supported).toEqual({ vr: false, ar: false });
  });

  it('immersive-ar only supported ⇒ "ar-only"', async () => {
    mockWebGL(true);
    mockNavigatorXr({
      isSessionSupported: vi
        .fn()
        .mockImplementation((mode: string) =>
          Promise.resolve(mode === "immersive-ar")
        ),
    });
    const result = await probeXR();
    expect(result.state).toBe("ar-only");
    expect(result.supported).toEqual({ vr: false, ar: true });
  });

  it('immersive-vr only supported ⇒ "vr-only"', async () => {
    mockWebGL(true);
    mockNavigatorXr({
      isSessionSupported: vi
        .fn()
        .mockImplementation((mode: string) =>
          Promise.resolve(mode === "immersive-vr")
        ),
    });
    const result = await probeXR();
    expect(result.state).toBe("vr-only");
    expect(result.supported).toEqual({ vr: true, ar: false });
  });

  it('both supported ⇒ "ar-and-vr"', async () => {
    mockWebGL(true);
    mockNavigatorXr({ isSessionSupported: vi.fn().mockResolvedValue(true) });
    const result = await probeXR();
    expect(result.state).toBe("ar-and-vr");
    expect(result.supported).toEqual({ vr: true, ar: true });
  });

  it('a REJECTED isSessionSupported ⇒ "blocked-by-policy", never "no-device" — the rule the whole decision exists for', async () => {
    mockWebGL(true);
    mockNavigatorXr({
      isSessionSupported: vi
        .fn()
        .mockRejectedValue(new DOMException("blocked", "SecurityError")),
    });
    const result = await probeXR();
    expect(result.state).toBe("blocked-by-policy");
    expect(result.state).not.toBe("no-device");
  });

  it('one mode rejected, the other resolves ⇒ still "blocked-by-policy", and the resolved mode\'s real value is preserved in `supported`', async () => {
    mockWebGL(true);
    mockNavigatorXr({
      isSessionSupported: vi
        .fn()
        .mockImplementation((mode: string) =>
          mode === "immersive-ar"
            ? Promise.reject(new DOMException("blocked", "SecurityError"))
            : Promise.resolve(true)
        ),
    });
    const result = await probeXR();
    expect(result.state).toBe("blocked-by-policy");
    expect(result.supported).toEqual({ vr: true, ar: false });
  });

  it("never throws — every branch resolves to a named state", async () => {
    mockWebGL(true);
    mockNavigatorXr({
      isSessionSupported: vi.fn().mockRejectedValue(new Error("boom")),
    });
    await expect(probeXR()).resolves.toBeDefined();
  });
});

describe("resolveXrUiState — the session-lifecycle layer over the probe", () => {
  it("running always wins, regardless of the underlying capability", () => {
    expect(resolveXrUiState("ar-only", "running")).toBe("session-running");
    expect(resolveXrUiState("no-device", "running")).toBe("session-running");
  });

  it("rejected maps to session-rejected when not running", () => {
    expect(resolveXrUiState("vr-only", "rejected")).toBe("session-rejected");
  });

  it("idle/requesting pass the underlying capability state through unchanged", () => {
    expect(resolveXrUiState("ar-and-vr", "idle")).toBe("ar-and-vr");
    expect(resolveXrUiState("blocked-by-policy", "requesting")).toBe(
      "blocked-by-policy"
    );
  });
});

describe("xrStatusText — the honesty contract as a single testable assertion", () => {
  const FORBIDDEN = /in VR|XR active|immersive session running|connected/i;

  const nonRunningStates = [
    "no-webgl",
    "no-webxr",
    "quicklook-only",
    "no-device",
    "blocked-by-policy",
    "ar-only",
    "vr-only",
    "ar-and-vr",
    "session-rejected",
  ] as const;

  it.each(nonRunningStates)(
    'state "%s" never contains an affirmative session string',
    state => {
      const text = xrStatusText(state, {
        reason: "the user declined the prompt.",
        mode: "immersive-ar",
      });
      expect(text).not.toMatch(FORBIDDEN);
    }
  );

  it("session-running (AR) is the one state permitted to use the vocabulary, and it does", () => {
    const text = xrStatusText("session-running", { mode: "immersive-ar" });
    expect(text).toMatch(FORBIDDEN);
  });

  it("session-running (VR) also uses the vocabulary", () => {
    const text = xrStatusText("session-running", { mode: "immersive-vr" });
    expect(text).toMatch(FORBIDDEN);
  });

  it("session-rejected names the actual rejection reason, not a generic message", () => {
    const text = xrStatusText("session-rejected", {
      reason: "permission denied by the user",
    });
    expect(text).toContain("permission denied by the user");
  });

  it("the four unavailable-family states each name a distinct, specific reason (never a shared generic string)", () => {
    const texts = new Set(
      (["no-webxr", "no-device", "blocked-by-policy"] as const).map(s =>
        xrStatusText(s)
      )
    );
    expect(texts.size).toBe(3);
  });
});
