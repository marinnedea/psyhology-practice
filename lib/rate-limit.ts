/**
 * Lightweight in-memory sliding-window rate limiter.
 * No external dependencies — uses a Map keyed by identifier (usually IP).
 *
 * Usage:
 *   const limiter = createRateLimiter({ limit: 5, windowMs: 15 * 60 * 1000 });
 *   const result = limiter.check(ip);
 *   if (!result.success) return rateLimitResponse();
 */

interface RateLimiterOptions {
  /** Max requests allowed within the window */
  limit: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number; // Unix ms timestamp when the window resets
}

interface RequestRecord {
  count: number;
  resetAt: number;
}

export function createRateLimiter(options: RateLimiterOptions) {
  const { limit, windowMs } = options;
  const store = new Map<string, RequestRecord>();

  // Periodically purge expired entries to prevent memory leaks
  const purgeInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store) {
      if (record.resetAt <= now) store.delete(key);
    }
  }, windowMs);

  // Allow the interval to be garbage collected when the module unloads
  if (purgeInterval.unref) purgeInterval.unref();

  function check(identifier: string): RateLimitResult {
    const now = Date.now();
    const record = store.get(identifier);

    if (!record || record.resetAt <= now) {
      // New window
      store.set(identifier, { count: 1, resetAt: now + windowMs });
      return { success: true, remaining: limit - 1, resetAt: now + windowMs };
    }

    if (record.count >= limit) {
      return { success: false, remaining: 0, resetAt: record.resetAt };
    }

    record.count += 1;
    return { success: true, remaining: limit - record.count, resetAt: record.resetAt };
  }

  return { check };
}

/** Extract the best available IP from a Next.js Request */
export function getClientIp(req: Request): string {
  const forwarded = (req.headers as Headers).get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return (req.headers as Headers).get("x-real-ip") ?? "unknown";
}

/** Standard 429 response */
export function rateLimitResponse(resetAt?: number) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Retry-After": resetAt
      ? String(Math.ceil((resetAt - Date.now()) / 1000))
      : "60",
  };
  return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
    status: 429,
    headers,
  });
}

// ── Pre-configured limiters for each public endpoint ─────────────

/** Registration: 5 attempts per 15 minutes per IP */
export const registerLimiter = createRateLimiter({ limit: 5, windowMs: 15 * 60 * 1000 });

/** Contact form: 3 submissions per 10 minutes per IP */
export const contactLimiter = createRateLimiter({ limit: 3, windowMs: 10 * 60 * 1000 });

/** Newsletter subscription: 5 per hour per IP */
export const newsletterLimiter = createRateLimiter({ limit: 5, windowMs: 60 * 60 * 1000 });

/** Ticket creation: 10 per hour per IP */
export const ticketLimiter = createRateLimiter({ limit: 10, windowMs: 60 * 60 * 1000 });
