/**
 * Client-side mirror of the server's upload rules.
 *
 * These constants intentionally duplicate `server/utils/uploads.ts`, because a
 * browser bundle cannot import server code. The server remains the authority —
 * this exists purely so the customer learns a file is too large or the wrong
 * format before spending time uploading it.
 *
 * Keep the two in sync; the documentation names both files.
 */

/** Must match `MAX_QUOTE_FILE_SIZE` on the server. */
export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024

export const ACCEPTED_EXTENSIONS = [
  '.pdf', '.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff', '.zip',
] as const

/** `accept` attribute for the file input. */
export const ACCEPT_ATTR = ACCEPTED_EXTENSIONS.join(',')

/**
 * "PDF, JPG, PNG…" for help text.
 *
 * Deliberately not derived from `ACCEPTED_EXTENSIONS`: that list carries both
 * spellings of the same format (.jpg/.jpeg, .tif/.tiff) because the `accept`
 * attribute needs them, but showing "JPG, JPEG" to a customer is just noise.
 */
export const ACCEPTED_LABEL = ['PDF', 'JPG', 'PNG', 'WEBP', 'TIFF', 'ZIP'].join(', ')

export type UploadIssue = 'fileTooLarge' | 'fileType' | 'fileEmpty' | null

/** Validates a chosen file. Returns a message key, or null when acceptable. */
export function checkFile(file: File): UploadIssue {
  if (file.size === 0) return 'fileEmpty'
  if (file.size > MAX_UPLOAD_BYTES) return 'fileTooLarge'

  const name = file.name.toLowerCase()
  const allowed = ACCEPTED_EXTENSIONS.some(ext => name.endsWith(ext))

  return allowed ? null : 'fileType'
}

/** Formats a byte count for display, localised digits handled by the caller. */
export function formatFileSize(bytes: number, locale: string): string {
  const units = locale === 'fa'
    ? ['بایت', 'کیلوبایت', 'مگابایت']
    : ['B', 'KB', 'MB']

  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }

  const rounded = unit === 0 ? Math.round(value) : Math.round(value * 10) / 10
  return `${new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US').format(rounded)} ${units[unit]}`
}
