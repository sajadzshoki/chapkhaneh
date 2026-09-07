import { services } from '~~/shared/data/services'
import { createQuoteRequest, quoteRequestSchema } from '../../services/quote.service'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = quoteRequestSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Invalid quote request',
      data: { issues: parsed.error.flatten().fieldErrors },
    })
  }

  if (!services.some(s => s.slug === parsed.data.serviceSlug)) {
    throw createError({ statusCode: 422, statusMessage: 'Unknown service' })
  }

  const result = await createQuoteRequest(parsed.data)

  setResponseStatus(event, 201)
  return { ok: true, id: result.id }
})
