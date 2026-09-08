/**
 * ---------------------------------------------------------------------------
 * Colour helpers for the runtime theme
 * ---------------------------------------------------------------------------
 * Small, dependency-free utilities shared by the server (which sanitises and
 * expands admin-supplied colours) and the admin UI (which previews them).
 *
 * Everything here is deliberately pure and total: given any input it either
 * returns a valid colour or `null`. Theme values are written by an
 * administrator and then interpolated into a `<style>` block, so a malformed
 * or hostile value must never reach the output.
 */

/** Strict 6-digit hex. Deliberately not accepting 3-digit, `rgb()` or names. */
const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/

/**
 * Returns the normalised lowercase hex, or `null` if the value is not a plain
 * 6-digit hex colour.
 *
 * This is the single gate every theme value passes through. Rejecting anything
 * that is not `#rrggbb` is what makes CSS injection impossible: a value like
 * `red; } body { display:none` cannot survive the pattern.
 */
export function normalizeHex(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return HEX_PATTERN.test(trimmed) ? trimmed.toLowerCase() : null
}

export function isValidHex(value: unknown): boolean {
  return normalizeHex(value) !== null
}

interface Rgb { r: number, g: number, b: number }

function hexToRgb(hex: string): Rgb {
  return {
    r: Number.parseInt(hex.slice(1, 3), 16),
    g: Number.parseInt(hex.slice(3, 5), 16),
    b: Number.parseInt(hex.slice(5, 7), 16),
  }
}

function rgbToHex({ r, g, b }: Rgb): string {
  const channel = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')
  return `#${channel(r)}${channel(g)}${channel(b)}`
}

/** Mixes two colours. `weight` is how much of `to` to apply (0..1). */
export function mix(from: string, to: string, weight: number): string {
  const a = hexToRgb(from)
  const b = hexToRgb(to)
  const w = Math.max(0, Math.min(1, weight))
  return rgbToHex({
    r: a.r + (b.r - a.r) * w,
    g: a.g + (b.g - a.g) * w,
    b: a.b + (b.b - a.b) * w,
  })
}

export const darken = (hex: string, amount: number) => mix(hex, '#000000', amount)
export const lighten = (hex: string, amount: number) => mix(hex, '#ffffff', amount)

/**
 * Relative luminance (WCAG 2.1). Used to decide whether text on a coloured
 * surface should be white or near-black.
 */
export function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex)
  const channel = (v: number) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

/** WCAG contrast ratio between two colours (1..21). */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(a)
  const lb = luminance(b)
  const [light, dark] = la > lb ? [la, lb] : [lb, la]
  return (light + 0.05) / (dark + 0.05)
}

/**
 * Picks white or near-black for text placed on `background`, whichever is more
 * readable. This keeps a button legible even if an administrator chooses a
 * very pale primary colour.
 */
export function readableOn(background: string): string {
  const dark = '#14181d'
  return contrastRatio(background, '#ffffff') >= contrastRatio(background, dark)
    ? '#ffffff'
    : dark
}
