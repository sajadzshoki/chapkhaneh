import type { H3Event } from 'h3'

/**
 * ---------------------------------------------------------------------------
 * In-memory rate limiter
 * ---------------------------------------------------------------------------
 * Minimal abuse protection for public write endpoints. Deliberately not Redis
 * and not a queue: this is a single-deployment site for one printing company,
 * and an in-process counter stops the realistic problem (someone holding down
 * submit, or a script hammering the form with uploads) without new infra.
 *
 * The trade-off is honest: the window resets on restart and would not be
 * shared across multiple instances. If this app is ever scaled horizontally,
 * swap the Map for a shared store — the call sites do not change.
 */

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

/** Drops expired buckets so the map cannot grow without bound. */
function sweep(now: number): void {
  if (buckets.size < 500) return
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}

/**
 * Best-effort client identity.
 *
 * Proxy headers are attacker-controlled in the general case, but this runs
 * behind the site's own reverse proxy and the limiter is a courtesy control,
 * not a security boundary — the real protections are validation and size caps.
 */
function clientKey(event: H3Event): string {
  const forwarded = getRequestHeader(event, 'x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim()
    || getRequestHeader(event, 'x-real-ip')
    || event.node.req.socket.remoteAddress
    || 'unknown'

  return ip
}

export interface RateLimitOptions {
  /** Distinguishes limiters so one endpoint cannot exhaust another's budget. */
  name: string
  limit: number
  windowMs: number
}

/**
 * Consumes one unit of the caller's budget, throwing 429 when exhausted.
 * Sets `Retry-After` so a well-behaved client knows when to come back.
 */
export function enforceRateLimit(event: H3Event, options: RateLimitOptions): void {
  const now = Date.now()
  sweep(now)

  const key = `${options.name}:${clientKey(event)}`
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs })
    return
  }

  bucket.count += 1

  if (bucket.count > options.limit) {
    const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))
    setResponseHeader(event, 'retry-after', retryAfter)
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many requests',
    })
  }
}
