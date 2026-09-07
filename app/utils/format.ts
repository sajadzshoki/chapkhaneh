import type { LocaleCode } from '~~/shared/types'

/**
 * Format an integer with locale-appropriate digits and grouping.
 * Persian gets Persian digits and the Persian thousands separator.
 */
export function formatNumber(value: number, locale: LocaleCode): string {
  return new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US').format(value)
}

/**
 * Convert Persian/Arabic-Indic digits in a string to ASCII digits.
 * Persian users routinely type ۰۹۱۲… into phone and quantity fields, so input
 * is normalised before validation and storage.
 */
export function toAsciiDigits(input: string): string {
  return input
    .replace(/[\u06F0-\u06F9]/g, d => String(d.charCodeAt(0) - 0x06F0))
    .replace(/[\u0660-\u0669]/g, d => String(d.charCodeAt(0) - 0x0660))
}
