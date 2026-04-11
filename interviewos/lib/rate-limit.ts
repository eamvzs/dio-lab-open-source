// Simple in-memory rate limiter. Works per-process (single instance).
// For multi-instance deployments, replace with Redis-based solution.

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

// Periodically clean up expired entries to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 60_000);

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (entry.count >= limit) {
    return { allowed: false };
  }

  entry.count++;
  return { allowed: true };
}
