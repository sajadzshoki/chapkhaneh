import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { adminGetQuoteFile } from '../../../../repositories/admin.repository'
import { resolveStoredPath } from '../../../../utils/uploads'
import { uuidSchema, validateParam } from '../../../../utils/validation'

/**
 * Streams a customer's attachment to an authenticated admin.
 *
 * Security model:
 *  - Authentication is enforced centrally by `server/middleware/admin-guard.ts`
 *    for every `/api/admin/*` route, so this handler cannot be reached
 *    anonymously and does not repeat the check.
 *  - The client addresses the file by **request id only**. The storage name is
 *    never sent to the browser and cannot be supplied by the caller, so there
 *    is no attacker-controlled path component at all.
 *  - The name read from the database is still resolved through
 *    `resolveStoredPath`, which confirms the result sits directly inside the
 *    upload directory. That guards against a tampered or legacy row and is a
 *    containment check, not string cleaning.
 *  - Attachments live outside `public/`, so they are never statically served.
 */
export default defineEventHandler(async (event) => {
  const id = validateParam(getRouterParam(event, 'id'), uuidSchema, 'id')
  const record = await adminGetQuoteFile(id)

  if (!record.fileUrl) {
    throw createError({ statusCode: 404, statusMessage: 'No file attached' })
  }

  const absolute = resolveStoredPath(record.fileUrl)
  if (!absolute) {
    // The stored value is not a plain name inside the upload root.
    throw createError({ statusCode: 400, statusMessage: 'Invalid file reference' })
  }

  const info = await stat(absolute).catch(() => null)
  if (!info?.isFile()) {
    throw createError({ statusCode: 404, statusMessage: 'File not available' })
  }

  const downloadName = record.fileName || 'attachment'

  // `attachment` plus nosniff: the browser saves the file rather than
  // rendering it, so an uploaded SVG or HTML payload cannot execute in our
  // origin. The filename is RFC 5987 encoded to survive Persian characters.
  setResponseHeaders(event, {
    'content-type': record.fileMimeType || 'application/octet-stream',
    'content-length': info.size,
    'content-disposition': `attachment; filename*=UTF-8''${encodeURIComponent(downloadName)}`,
    'x-content-type-options': 'nosniff',
    'cache-control': 'private, no-store',
  })

  return sendStream(event, createReadStream(absolute))
})
