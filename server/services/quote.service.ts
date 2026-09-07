import { z } from 'zod'
import { useDatabase } from '../database/client'
import { quoteRequests } from '../database/schema'
import type { QuoteRequestInput } from '~~/shared/types'

/** Server-side contract for the public quote form. */
export const quoteRequestSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  company: z.string().trim().max(160).optional(),
  phone: z.string().trim().min(8).max(20),
  email: z.string().trim().email().max(160).optional(),
  serviceSlug: z.string().trim().min(2).max(80),
  quantity: z.number().int().positive().max(10_000_000),
  description: z.string().trim().min(20).max(4000),
  neededBy: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  locale: z.enum(['fa', 'en']).default('fa'),
})

export interface CreateQuoteResult {
  id: string
  persisted: boolean
}

/**
 * Persists a quote request.
 *
 * If no database is configured (phase 1 default), the request is logged and a
 * synthetic id is returned so the public form still works end to end.
 */
export async function createQuoteRequest(input: QuoteRequestInput): Promise<CreateQuoteResult> {
  const db = useDatabase()

  if (!db) {
    console.info('[quote] received (no database configured):', {
      service: input.serviceSlug,
      quantity: input.quantity,
      phone: input.phone,
    })
    return { id: `local-${Date.now()}`, persisted: false }
  }

  const [row] = await db
    .insert(quoteRequests)
    .values({
      fullName: input.fullName,
      company: input.company,
      phone: input.phone,
      email: input.email,
      serviceSlug: input.serviceSlug,
      quantity: input.quantity,
      description: input.description,
      neededBy: input.neededBy,
      locale: input.locale,
    })
    .returning({ id: quoteRequests.id })

  return { id: row!.id, persisted: true }
}
