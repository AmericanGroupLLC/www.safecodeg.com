/**
 * Contact Router Tests
 * Validates input validation, success path, and error handling
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock fetch for Supabase calls and notification service
const mockFetch = vi.fn();
global.fetch = mockFetch;

function createTestContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

const validInput = {
  name: "Jane Doe",
  email: "jane@example.com",
  company: "Acme Corp",
  subject: "Product Demo Request",
  message:
    "We would like to schedule a demo of CogniCore AI for our enterprise team.",
};

describe("contact.submit", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("returns success when Supabase insert and notification both succeed", async () => {
    // Mock Supabase insert
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: "test-uuid-1234", ...validInput, status: "new" },
        ],
      })
      // Mock notification service
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
        text: async () => "",
      });

    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.contact.submit(validInput);

    expect(result.success).toBe(true);
    expect(result.message).toContain("contact@safecodeg.com");
    expect(result.submissionId).toBe("test-uuid-1234");
  });

  it("still returns success even if notification service fails", async () => {
    // Mock Supabase insert succeeds
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: "test-uuid-5678", ...validInput, status: "new" },
        ],
      })
      // Mock notification service fails
      .mockRejectedValueOnce(new Error("Notification service unavailable"));

    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.contact.submit(validInput);

    expect(result.success).toBe(true);
    expect(result.submissionId).toBe("test-uuid-5678");
  });

  it("still returns success even if Supabase insert fails (graceful degradation)", async () => {
    // Mock Supabase insert fails
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => "Internal Server Error",
      })
      // Mock notification service succeeds
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
        text: async () => "",
      });

    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.contact.submit(validInput);

    // Should still succeed (graceful degradation)
    expect(result.success).toBe(true);
    expect(result.submissionId).toBeUndefined();
  });

  it("rejects submissions with a name that is too short", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.contact.submit({ ...validInput, name: "J" })
    ).rejects.toThrow();
  });

  it("rejects submissions with an invalid email", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.contact.submit({ ...validInput, email: "not-an-email" })
    ).rejects.toThrow();
  });

  it("rejects submissions with a message that is too short", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.contact.submit({ ...validInput, message: "Short" })
    ).rejects.toThrow();
  });

  it("accepts submissions without a company (optional field)", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: "test-uuid-no-company",
            name: validInput.name,
            email: validInput.email,
            subject: validInput.subject,
            message: validInput.message,
            status: "new",
          },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
        text: async () => "",
      });

    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    const { company: _company, ...inputWithoutCompany } = validInput;
    const result = await caller.contact.submit(inputWithoutCompany);

    expect(result.success).toBe(true);
  });
});
