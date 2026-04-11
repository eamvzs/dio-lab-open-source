import { describe, it, expect, beforeEach, vi } from "vitest";

// We need to re-import after clearing the module cache to reset the store
// between tests. Using vi.resetModules() + re-import.
describe("rateLimit", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("allows requests within the limit", async () => {
    const { rateLimit } = await import("../lib/rate-limit");
    expect(rateLimit("key1", 3, 60_000).allowed).toBe(true);
    expect(rateLimit("key1", 3, 60_000).allowed).toBe(true);
    expect(rateLimit("key1", 3, 60_000).allowed).toBe(true);
  });

  it("blocks when limit is exceeded", async () => {
    const { rateLimit } = await import("../lib/rate-limit");
    rateLimit("key2", 2, 60_000);
    rateLimit("key2", 2, 60_000);
    const result = rateLimit("key2", 2, 60_000);
    expect(result.allowed).toBe(false);
  });

  it("treats different keys independently", async () => {
    const { rateLimit } = await import("../lib/rate-limit");
    rateLimit("a", 1, 60_000);
    expect(rateLimit("a", 1, 60_000).allowed).toBe(false);
    expect(rateLimit("b", 1, 60_000).allowed).toBe(true);
  });

  it("resets after window expires", async () => {
    vi.useFakeTimers();
    const { rateLimit } = await import("../lib/rate-limit");
    rateLimit("key3", 1, 1_000);
    expect(rateLimit("key3", 1, 1_000).allowed).toBe(false);
    vi.advanceTimersByTime(1_001);
    expect(rateLimit("key3", 1, 1_000).allowed).toBe(true);
    vi.useRealTimers();
  });
});
