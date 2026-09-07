import type { LocaleCode } from './common'

/**
 * Lifecycle of a quote request, matching the `quote_requests.status` check
 * constraint in the database. Raw values are never shown to customers or
 * operators — the admin UI resolves them through `admin.quotes.status.*`.
 */
export const QUOTE_STATUSES = ['NEW', 'REVIEWING', 'CONTACTED', 'COMPLETED'] as const

export type QuoteStatus = typeof QUOTE_STATUSES[number]

/** Payload the public quote form submits to `POST /api/quote-requests`. */
export interface QuoteRequestInput {
  fullName: string
  company?: string
  phone: string
  email?: string
  /** Slug of the requested service. Must reference an active service. */
  serviceSlug: string
  /** Optional: many enquiries start before the customer has settled on a run length. */
  quantity?: number | null
  /** Free-form description of the job (size, paper, colours, finishing...). */
  description: string
  /** Requested delivery date, ISO `YYYY-MM-DD`. */
  neededBy?: string
  locale: LocaleCode
}

/**
 * Metadata about an attached file. The physical storage path is deliberately
 * absent: it never leaves the server, and admins reach the file through the
 * authenticated download route by request id.
 */
export interface QuoteAttachment {
  /** Original filename as uploaded, shown in the admin only. */
  fileName: string
  fileSize: number
  fileMimeType: string
}

/** A stored quote request (admin domain object). */
export interface QuoteRequest extends QuoteRequestInput {
  id: string
  status: QuoteStatus
  createdAt: string
  updatedAt: string
  /** Internal note written by a sales operator. Never exposed publicly. */
  internalNote?: string
  attachment?: QuoteAttachment
}
