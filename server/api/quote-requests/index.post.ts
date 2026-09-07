import { createQuoteRequest, quoteRequestSchema } from '../../services/quote.service'
import { readValidatedBodyOrThrow } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  const input = await readValidatedBodyOrThrow(event, quoteRequestSchema)
  const result = await createQuoteRequest(input)

  setResponseStatus(event, 201)
  return { ok: true, id: result.id }
})
