import { createHash, randomUUID } from 'node:crypto'
import { mkdir, unlink, writeFile } from 'node:fs/promises'
import { extname, resolve, sep } from 'node:path'

/**
 * ---------------------------------------------------------------------------
 * Quote attachment storage
 * ---------------------------------------------------------------------------
 * Single source of truth for everything about customer uploads: where they
 * live, how large they may be, which formats are accepted, how a stored name
 * is generated, and how a stored name is resolved back to a path safely.
 *
 * Nothing here is duplicated elsewhere — the form, the API, the download route
 * and the docs all read these constants, so raising the size limit or adding a
 * format is a one-line change.
 *
 * Design decisions:
 *  - Files are written OUTSIDE `public/`, so Nitro can never serve them
 *    statically. The only way to read one back is the authenticated admin
 *    download route.
 *  - The customer's filename is never used on disk. It is metadata only,
 *    shown in the admin panel; the stored name is a generated UUID.
 *  - Both the extension and the file's magic bytes are checked, because an
 *    extension is just a claim made by the client.
 */

/** Maximum accepted attachment size, in bytes. Configurable via env. */
export const MAX_QUOTE_FILE_SIZE = Number(
  process.env.MAX_QUOTE_FILE_SIZE || 15 * 1024 * 1024,
)

/** Human-readable limit for messages and the docs, e.g. "15 MB". */
export const MAX_QUOTE_FILE_SIZE_LABEL =
  `${Math.round(MAX_QUOTE_FILE_SIZE / (1024 * 1024))} MB`

interface AllowedType {
  /** Canonical MIME type stored alongside the file. */
  mime: string
  /** Accepted file extensions, lowercase, including the dot. */
  extensions: string[]
  /**
   * Leading bytes identifying the format. `undefined` means the format has no
   * reliable signature and is accepted on extension alone.
   */
  signatures?: number[][]
}

/**
 * Formats a printing customer realistically sends. Deliberately conservative:
 * documents and images that a prepress operator can actually open, plus ZIP
 * for multi-file artwork. No executables, archives that auto-run, or scripts.
 */
const ALLOWED_TYPES: AllowedType[] = [
  {
    mime: 'application/pdf',
    extensions: ['.pdf'],
    signatures: [[0x25, 0x50, 0x44, 0x46]], // %PDF
  },
  {
    mime: 'image/jpeg',
    extensions: ['.jpg', '.jpeg'],
    signatures: [[0xFF, 0xD8, 0xFF]],
  },
  {
    mime: 'image/png',
    extensions: ['.png'],
    signatures: [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
  },
  {
    mime: 'image/webp',
    extensions: ['.webp'],
    // RIFF....WEBP — the size field sits between, so this is checked specially.
    signatures: [[0x52, 0x49, 0x46, 0x46]],
  },
  {
    mime: 'image/tiff',
    extensions: ['.tif', '.tiff'],
    signatures: [[0x49, 0x49, 0x2A, 0x00], [0x4D, 0x4D, 0x00, 0x2A]],
  },
  {
    mime: 'application/zip',
    extensions: ['.zip'],
    // PK.. — also covers the ZIP-based office formats below.
    signatures: [[0x50, 0x4B, 0x03, 0x04], [0x50, 0x4B, 0x05, 0x06]],
  },
]

/** `accept` attribute for the file input, derived from the same table. */
export const ACCEPTED_FILE_ACCEPT_ATTR = ALLOWED_TYPES
  .flatMap(type => type.extensions)
  .join(',')

/** Comma-separated extension list for user-facing messages, e.g. "PDF, JPG". */
export const ACCEPTED_FILE_LABEL = ALLOWED_TYPES
  .flatMap(type => type.extensions)
  .map(ext => ext.slice(1).toUpperCase())
  .filter((value, index, all) => all.indexOf(value) === index)
  .join(', ')

export type UploadRejection =
  | 'FILE_TOO_LARGE'
  | 'UNSUPPORTED_TYPE'
  | 'CONTENT_MISMATCH'
  | 'EMPTY_FILE'

export interface StoredUpload {
  /** Generated name on disk. This is what the database stores. */
  storedName: string
  /** The customer's original filename, sanitised for display. */
  originalName: string
  size: number
  mimeType: string
}

/** Where attachments are written. Outside `public/` by design. */
export function uploadRoot(): string {
  return resolve(
    process.cwd(),
    process.env.QUOTE_UPLOAD_DIR || 'storage/uploads/quote-requests',
  )
}

/**
 * Strips any directory component and control characters from a client-supplied
 * filename. Used for the *display* name only — never for the path on disk.
 */
function sanitiseOriginalName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? 'file'
  // eslint-disable-next-line no-control-regex
  return base.replace(/[\u0000-\u001F\u007F]/g, '').slice(0, 180) || 'file'
}

/** Checks the leading bytes against the signatures for a declared type. */
function matchesSignature(buffer: Buffer, type: AllowedType): boolean {
  if (!type.signatures) return true

  const matched = type.signatures.some(signature =>
    signature.every((byte, index) => buffer[index] === byte),
  )
  if (!matched) return false

  // WEBP shares the RIFF container with other formats, so confirm the tag.
  if (type.mime === 'image/webp') {
    return buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  }
  return true
}

/**
 * Validates a candidate attachment.
 *
 * Returns the resolved MIME type on success, or a rejection reason the caller
 * maps to a translated message. The client's `Content-Type` header is treated
 * as a hint only: acceptance is decided by extension *and* magic bytes.
 */
export function validateUpload(
  filename: string,
  data: Buffer,
): { ok: true, mimeType: string } | { ok: false, reason: UploadRejection } {
  if (!data.length) return { ok: false, reason: 'EMPTY_FILE' }
  if (data.length > MAX_QUOTE_FILE_SIZE) return { ok: false, reason: 'FILE_TOO_LARGE' }

  const extension = extname(sanitiseOriginalName(filename)).toLowerCase()
  if (!extension) return { ok: false, reason: 'UNSUPPORTED_TYPE' }

  const type = ALLOWED_TYPES.find(candidate => candidate.extensions.includes(extension))
  if (!type) return { ok: false, reason: 'UNSUPPORTED_TYPE' }

  if (!matchesSignature(data, type)) return { ok: false, reason: 'CONTENT_MISMATCH' }

  return { ok: true, mimeType: type.mime }
}

/**
 * Writes a validated attachment under a generated name.
 *
 * The stored name is a UUID plus the validated extension, so a hostile
 * filename cannot influence the path, collide with an existing file, or carry
 * a second extension.
 */
export async function storeUpload(
  filename: string,
  data: Buffer,
  mimeType: string,
): Promise<StoredUpload> {
  const originalName = sanitiseOriginalName(filename)
  const extension = extname(originalName).toLowerCase()
  const storedName = `${randomUUID()}${extension}`

  const directory = uploadRoot()
  await mkdir(directory, { recursive: true })
  await writeFile(resolve(directory, storedName), data, { mode: 0o640 })

  return { storedName, originalName, size: data.length, mimeType }
}

/** Best-effort removal, used to avoid orphaned files when a write-then-insert fails. */
export async function removeUpload(storedName: string): Promise<void> {
  const path = resolveStoredPath(storedName)
  if (!path) return
  await unlink(path).catch(() => {})
}

/**
 * Resolves a stored name to an absolute path, or `null` if it escapes the
 * upload directory.
 *
 * This is the single guard against path traversal. It does not attempt to
 * strip `../` sequences — string cleaning is easy to defeat with encoding or
 * unusual separators. Instead the name is resolved and the *result* is
 * required to sit directly inside the upload root, which holds regardless of
 * how the input was encoded.
 */
export function resolveStoredPath(storedName: string): string | null {
  if (!storedName || typeof storedName !== 'string') return null

  // A stored name is always a flat generated filename. Anything containing a
  // separator, a null byte or a parent reference is malformed by definition.
  if (/[\\/]|\0/.test(storedName) || storedName === '.' || storedName === '..') {
    return null
  }

  const root = uploadRoot()
  const candidate = resolve(root, storedName)

  // The resolved path must be a direct child of the root.
  if (!candidate.startsWith(root + sep)) return null
  if (candidate.slice(root.length + 1).includes(sep)) return null

  return candidate
}

/**
 * Fingerprint used to spot an identical resubmission.
 *
 * Covers the fields a customer would repeat on a double submit; a genuinely
 * new enquiry differs in at least one of them.
 */
export function submissionFingerprint(parts: {
  phone: string
  serviceSlug: string
  description: string
}): string {
  return createHash('sha256')
    .update(`${parts.phone}|${parts.serviceSlug}|${parts.description}`)
    .digest('hex')
}
