import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { useDatabase } from '../database/client'
import { quoteRequests, services } from '../database/schema'
import { slugSchema } from '../utils/validation'

/** Server-side contract for the public quote form. */
export const quoteRequestSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  company: z.string().trim().max(160).optional(),
  phone: z.string().trim().min(8).max(20),
  email: z.string().trim().toLowerCase().email().max(160).optional().or(z.literal('')),
  serviceSlug: slugSchema,
  quantity: z.number().int().positive().max(10_000_000),
  description: z.string().trim().min(20).max(4000),
  neededBy: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  locale: z.enum(['fa', 'en']).default('fa'),
})

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>

export interface CreateQuoteResult {
  id: string
}

/**
 * Persists a quote request, resolving the service slug to its database id.
 *
 * Throws 422 for an unknown service so the client gets an actionable message
 * rather than a foreign-key error.
 */
export async function createQuoteRequest(input: QuoteRequestInput): Promise<CreateQuoteResult> {
  const db = useDatabase()

  const [service] = await db
    .select({ id: services.id })
    .from(services)
    .where(eq(services.slug, input.serviceSlug))
    .limit(1)

  if (!service) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Validation failed',
      data: { issues: { serviceSlug: ['Unknown service'] } },
    })
  }

  const [row] = await db
    .insert(quoteRequests)
    .values({
      fullName: input.fullName,
      company: input.company || null,
      phone: input.phone,
      email: input.email || null,
      serviceId: service.id,
      quantity: input.quantity,
      description: input.description,
      neededBy: input.neededBy || null,
      locale: input.locale,
      status: 'NEW',
    })
    .returning({ id: quoteRequests.id })

  return { id: row!.id }
}
