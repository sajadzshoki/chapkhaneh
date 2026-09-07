import type { LocaleCode } from './common'

export type QuoteStatus = 'new' | 'in_review' | 'quoted' | 'won' | 'lost'

/** Payload the public quote form submits to `POST /api/quote-requests`. */
export interface QuoteRequestInput {
  fullName: string
  company?: string
  phone: string
  email?: string
  /** Slug of the requested service. */
  serviceSlug: string
  quantity: number
  /** Free-form description of the job (size, paper, colours, finishing...). */
  description: string
  /** Requested delivery date, ISO `YYYY-MM-DD`. */
  neededBy?: string
  locale: LocaleCode
}

/** A stored quote request (admin panel domain object, phase 2+). */
export interface QuoteRequest extends QuoteRequestInput {
  id: string
  status: QuoteStatus
  createdAt: string
  updatedAt: string
  /** Internal note written by a sales operator. */
  internalNote?: string
}
