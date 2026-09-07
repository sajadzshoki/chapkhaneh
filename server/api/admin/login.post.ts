import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { useDatabase } from '../../database/client'
import { adminUsers } from '../../database/schema'
import { verifyPassword } from '../../utils/password'
import { createSessionToken, setSessionCookie } from '../../utils/session'
import { readValidatedBodyOrThrow } from '../../utils/validation'

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address').max(160),
  password: z.string().min(1, 'Password is required').max(200),
})

export default defineEventHandler(async (event) => {
  const { email, password } = await readValidatedBodyOrThrow(event, loginSchema)

  const db = useDatabase()
  const [user] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, email))
    .limit(1)

  // Always run a verification so the response time does not reveal whether the
  // email exists. The dummy hash below is a valid scrypt hash of a random value.
  const hash = user?.passwordHash
    ?? 'scrypt$16384$8$1$00000000000000000000000000000000$0000000000000000000000000000000000000000000000000000000000000000'
  const valid = await verifyPassword(password, hash)

  if (!user || !valid) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
  }

  setSessionCookie(event, createSessionToken({ id: user.id, email: user.email }))

  // Never return the password hash.
  return { ok: true, user: { id: user.id, email: user.email } }
})
