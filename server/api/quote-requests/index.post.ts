import { createQuoteRequest, quoteRequestSchema } from '../../services/quote.service'
import { enforceRateLimit } from '../../utils/rate-limit'
import {
  MAX_QUOTE_FILE_SIZE,
  storeUpload,
  validateUpload,
  type StoredUpload,
  type UploadRejection,
} from '../../utils/uploads'

/**
 * Public quote submission.
 *
 * Accepts `multipart/form-data` (the form always posts this way, with or
 * without an attachment) and plain JSON, so the endpoint stays usable by any
 * client and existing integrations keep working.
 *
 * Order matters: rate limit, then parse, then validate the file, then validate
 * the fields, and only write to disk once everything else has passed — so a
 * rejected submission never leaves a file behind.
 */

/** Maps a rejection reason to a stable code the client turns into a message. */
const UPLOAD_ERRORS: Record<UploadRejection, string> = {
  FILE_TOO_LARGE: 'fileTooLarge',
  UNSUPPORTED_TYPE: 'fileType',
  CONTENT_MISMATCH: 'fileContent',
  EMPTY_FILE: 'fileEmpty',
}

function uploadError(reason: UploadRejection): never {
  throw createError({
    statusCode: 422,
    statusMessage: 'Validation failed',
    data: { issues: { file: [UPLOAD_ERRORS[reason]] } },
  })
}

export default defineEventHandler(async (event) => {
  // A public endpoint that writes to disk: keep a lid on submission volume.
  enforceRateLimit(event, { name: 'quote-request', limit: 8, windowMs: 10 * 60 * 1000 })

  const contentType = getRequestHeader(event, 'content-type') ?? ''
  let body: Record<string, unknown>
  let pending: { filename: string, data: Buffer, mimeType: string } | undefined

  if (contentType.includes('multipart/form-data')) {
    const parts = await readMultipartFormData(event).catch(() => null)

    if (!parts) {
      throw createError({ statusCode: 400, statusMessage: 'Malformed request' })
    }

    body = {}

    for (const part of parts) {
      if (!part.name) continue

      if (part.name === 'file' && part.filename) {
        // Size is re-checked here as well as in `validateUpload`, so an
        // oversized part is rejected before anything else touches it.
        if (part.data.length > MAX_QUOTE_FILE_SIZE) uploadError('FILE_TOO_LARGE')

        const result = validateUpload(part.filename, part.data)
        if (!result.ok) uploadError(result.reason)

        pending = { filename: part.filename, data: part.data, mimeType: result.mimeType }
        continue
      }

      body[part.name] = part.data.toString('utf8')
    }

    // Multipart values are strings; the schema expects a number or nothing.
    if (typeof body.quantity === 'string') {
      const trimmed = body.quantity.trim()
      body.quantity = trimmed ? Number(trimmed) : null
    }
  }
  else {
    body = (await readBody(event).catch(() => null)) ?? {}
  }

  const parsed = quoteRequestSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Validation failed',
      data: { issues: parsed.error.flatten().fieldErrors },
    })
  }

  // Everything has passed: it is now safe to put the file on disk.
  let upload: StoredUpload | undefined
  if (pending) {
    upload = await storeUpload(pending.filename, pending.data, pending.mimeType)
  }

  const result = await createQuoteRequest(parsed.data, upload)

  setResponseStatus(event, 201)
  return { ok: true, id: result.id, duplicate: result.duplicate }
})
