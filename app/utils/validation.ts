import { toAsciiDigits } from './format'

/** Iranian mobile / landline, tolerant of spaces, dashes and Persian digits. */
export function isValidPhone(value: string): boolean {
  const digits = toAsciiDigits(value).replace(/[\s\-()+]/g, '')
  return /^(0|98)?\d{10}$/.test(digits)
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())
}
