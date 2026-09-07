import { and, eq, gt } from 'drizzle-orm'
import { z } from 'zod'
import { useDatabase } from '../database/client'
import { quoteRequests, services } from '../database/schema'
import { slugSchema } from '../utils/validation'
import { notifyQuoteRequestCreated } from './notification.service'
import { removeUpload, type StoredUpload } from '../utils/uploads'

/**
 * ---------------------------------------------------------------------------
 * Quote request service
 * ---------------------------------------------------------------------------
 * The whole write path for the public quote form: validation contract,
 * service resolution, duplicate suppression, persistence and the notification
 * hand-off. The API route stays a thin wrapper around `createQuoteRequest`.
 */

/**
 * Server-side contract for the public quote form.
 *
 * Required: name, phone, service and description. Everything else is optional
 * — a customer phoning about a reprint should not be blocked by a quantity
 * field they cannot answer yet.
 */
export const quoteRequestSchema = z.object({
  fullName: z.string().trim().min(2, 'Too short').max(120),
  company: z.string().trim().max(160).optional().or(z.literal('')),
  phone: z.string().trim().min(8, 'Too short').max(20),
  email: z.string().trim().toLowerCase().email('Invalid email').max(160).optional().or(z.literal('')),
  serviceSlug: slugSchema,
  quantity: z.number().int().positive().max(10_000_000).optional().nullable(),
  description: z.string().trim().min(20, 'Too short').max(4000),
  neededBy: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date').optional().or(z.literal('')),
  locale: z.enum(['fa', 'en']).default('fa'),
})

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>

export interface CreateQuoteResult {
  id: string
  /** True when an identical request arrived moments ago and was reused. */
  duplicate: boolean
}

/** Window in which an identical resubmission is treated as the same request. */
const DUPLICATE_WINDOW_MS = 2 * 60 * 1000

/**
 * Persists a quote request.
 *
 * Two rules the client cannot be trusted with:
 *
 *  1. The service must exist **and be active**. A hidden or deleted service
 *     must not be quotable, even if the slug is guessed or the page was left
 *     open while an admin deactivated it.
 *  2. An identical request within a short window returns the existing row
 *     rather than inserting a second one, which absorbs double clicks and
 *     network retries without a queue or a token.
 *
 * If persistence fails after a file was written, the file is removed so the
 * upload directory does not accumulate orphans.
 */
export async function createQuoteRequest(
  input: QuoteRequestInput,
  upload?: StoredUpload,
): Promise<CreateQuoteResult> {
  const db = useDatabase()

  const [service] = await db
    .select({ id: services.id, isActive: services.isActive })
    .from(services)
    .where(eq(services.slug, input.serviceSlug))
    .limit(1)

  if (!service || !service.isActive) {
    if (upload) await removeUpload(upload.storedName)
    throw createError({
      statusCode: 422,
      statusMessage: 'Validation failed',
      data: {
        issues: {
          serviceSlug: [service ? 'This service is not available' : 'Unknown service'],
        },
      },
    })
  }

  try {
    const since = new Date(Date.now() - DUPLICATE_WINDOW_MS)
    const [existing] = await db
      .select({ id: quoteRequests.id })
      .from(quoteRequests)
      .where(and(
        eq(quoteRequests.phone, input.phone),
        eq(quoteRequests.serviceId, service.id),
        eq(quoteRequests.description, input.description),
        gt(quoteRequests.createdAt, since),
      ))
      .limit(1)

    if (existing) {
      // A repeat of a request we already stored. Drop the duplicate upload so
      // it does not linger unreferenced, and report the original id.
      if (upload) await removeUpload(upload.storedName)
      return { id: existing.id, duplicate: true }
    }

    const [row] = await db
      .insert(quoteRequests)
      .values({
        fullName: input.fullName,
        company: input.company || null,
        phone: input.phone,
        email: input.email || null,
        serviceId: service.id,
        quantity: input.quantity ?? null,
        description: input.description,
        neededBy: input.neededBy || null,
        fileUrl: upload?.storedName ?? null,
        fileName: upload?.originalName ?? null,
        fileSize: upload?.size ?? null,
        fileMimeType: upload?.mimeType ?? null,
        locale: input.locale,
        status: 'NEW',
      })
      .returning({ id: quoteRequests.id })

    const id = row!.id

    // Fire-and-forget: a notification problem must never fail a request the
    // customer already submitted successfully.
    await notifyQuoteRequestCreated({
      id,
      fullName: input.fullName,
      phone: input.phone,
      serviceSlug: input.serviceSlug,
      hasAttachment: Boolean(upload),
    })

    return { id, duplicate: false }
  }
  catch (error) {
    // The row was not created, so an uploaded file would be unreachable.
    if (upload) await removeUpload(upload.storedName)
    throw error
  }
}
