import type { H3Event } from 'h3'
import { z } from 'zod'

/**
 * Shared server-side validation helpers.
 *
 * Client-side validation is a convenience only; every write path re-validates
 * here. Failures return 422 with per-field issues the UI can render.
 */

export const emailSchema = z.string().trim().toLowerCase().email().max(160)
export const slugSchema = z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug').max(80)
export const uuidSchema = z.string().uuid('Invalid identifier')
export const quoteStatusSchema = z.enum(['NEW', 'REVIEWING', 'CONTACTED', 'COMPLETED'])
export const priceSchema = z.number().int().nonnegative().max(1_000_000_000)

/** Parses a body against a schema, throwing a 422 with field issues. */
export async function readValidatedBodyOrThrow<T extends z.ZodTypeAny>(
  event: H3Event,
  schema: T,
): Promise<z.infer<T>> {
  const body = await readBody(event).catch(() => null)
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Validation failed',
      data: { issues: parsed.error.flatten().fieldErrors },
    })
  }
  return parsed.data
}

/** Validates a route parameter, throwing 400 when malformed. */
export function validateParam<T extends z.ZodTypeAny>(
  value: string | undefined,
  schema: T,
  name = 'parameter',
): z.infer<T> {
  const parsed = schema.safeParse(value)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: `Invalid ${name}` })
  }
  return parsed.data
}
