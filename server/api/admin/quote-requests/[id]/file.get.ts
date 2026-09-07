import { createReadStream, existsSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import { adminGetQuoteFile } from '../../../../repositories/admin.repository'
import { uuidSchema, validateParam } from '../../../../utils/validation'

/**
 * Streams a customer's uploaded file to the admin.
 *
 * The stored path never reaches the browser: the client only ever links to
 * this route by request id. The resolved path is also confined to the upload
 * directory, so a tampered database value cannot be used to read arbitrary
 * files off the server.
 */
const UPLOAD_ROOT = resolve(process.cwd(), 'storage/uploads')

export default defineEventHandler(async (event) => {
  const id = validateParam(getRouterParam(event, 'id'), uuidSchema, 'id')
  const record = await adminGetQuoteFile(id)

  if (!record.fileUrl) {
    throw createError({ statusCode: 404, statusMessage: 'No file attached' })
  }

  const absolute = resolve(UPLOAD_ROOT, basename(record.fileUrl))

  if (!absolute.startsWith(UPLOAD_ROOT + '/') || !existsSync(absolute)) {
    throw createError({ statusCode: 404, statusMessage: 'File not available' })
  }

  const downloadName = record.fileName || basename(absolute)
  setHeader(event, 'Content-Type', 'application/octet-stream')
  setHeader(
    event,
    'Content-Disposition',
    `attachment; filename*=UTF-8''${encodeURIComponent(downloadName)}`,
  )

  return sendStream(event, createReadStream(absolute))
})
