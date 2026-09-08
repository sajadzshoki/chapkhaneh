import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'
import { eq } from 'drizzle-orm'
import { useDatabase } from '../database/client'
import { adminUsers } from '../database/schema'

/**
 * ---------------------------------------------------------------------------
 * Admin session handling
 * ---------------------------------------------------------------------------
 * A stateless, HMAC-signed session cookie: `base64(payload).base64(signature)`.
 *
 * Chosen over a database session table because there is exactly one admin and
 * no requirement for remote revocation — rotating `NUXT_SESSION_PASSWORD`
 * invalidates every existing session, which is sufficient here.
 *
 * The cookie is httpOnly + sameSite=lax + secure in production, so it is never
 * readable from JavaScript and never lands in localStorage.
 */

const COOKIE_NAME = 'mb_admin_session'
const MAX_AGE_SECONDS = 60 * 60 * 8 // 8 hours

export interface SessionPayload {
  /** Admin user id. */
  sub: string
  email: string
  /** Issued-at, epoch seconds. */
  iat: number
  /** Expiry, epoch seconds. */
  exp: number
  /** Random id, so two sessions issued in the same second still differ. */
  jti: string
}

function secret(): string {
  const value = process.env.NUXT_SESSION_PASSWORD
    ?? (() => {
      try {
        return useRuntimeConfig().sessionPassword as string
      }
      catch {
        return ''
      }
    })()

  if (!value || value.length < 32) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Session secret is not configured',
    })
  }
  return value
}

const b64url = (input: Buffer | string) =>
  Buffer.from(input).toString('base64url')

function sign(data: string): string {
  return createHmac('sha256', secret()).update(data).digest('base64url')
}

export function createSessionToken(user: { id: string, email: string }): string {
  const now = Math.floor(Date.now() / 1000)
  const payload: SessionPayload = {
    sub: user.id,
    email: user.email,
    iat: now,
    exp: now + MAX_AGE_SECONDS,
    jti: randomUUID(),
  }
  const body = b64url(JSON.stringify(payload))
  return `${body}.${sign(body)}`
}

/** Verifies signature and expiry. Returns null for any invalid token. */
export function readSessionToken(token: string | undefined): SessionPayload | null {
  if (!token) return null

  const [body, signature] = token.split('.')
  if (!body || !signature) return null

  const expected = sign(body)
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as SessionPayload
    if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  }
  catch {
    return null
  }
}

export function setSessionCookie(event: H3Event, token: string): void {
  setCookie(event, COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: !import.meta.dev,
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  })
}

export function clearSessionCookie(event: H3Event): void {
  deleteCookie(event, COOKIE_NAME, { path: '/' })
}

export function getAdminSession(event: H3Event): SessionPayload | null {
  return readSessionToken(getCookie(event, COOKIE_NAME))
}

/**
 * Guard for admin API routes. Throws 401 when there is no valid session, and
 * re-checks that the user still exists so a deleted admin cannot keep using a
 * signed cookie until it expires.
 */
export async function requireAdmin(event: H3Event): Promise<{ id: string, email: string }> {
  const session = getAdminSession(event)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  }

  const db = useDatabase()
  const [user] = await db
    .select({ id: adminUsers.id, email: adminUsers.email })
    .from(adminUsers)
    .where(eq(adminUsers.id, session.sub))
    .limit(1)

  if (!user) {
    clearSessionCookie(event)
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  }

  return user
}

export { COOKIE_NAME as SESSION_COOKIE_NAME }
