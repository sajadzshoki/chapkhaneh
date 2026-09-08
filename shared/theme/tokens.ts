import { brandTheme } from './brand'
import type { SemanticTokens } from './brand'
import { darken, lighten, mix, normalizeHex, readableOn } from './colors'

/**
 * ---------------------------------------------------------------------------
 * Runtime theme tokens
 * ---------------------------------------------------------------------------
 * The administrator edits **eight** colours. Components consume **nineteen**
 * CSS variables. This module is the single place that bridges the two.
 *
 * Deriving the extra tokens (hover states, soft foreground, strong border,
 * muted surface) rather than exposing them in the admin is a deliberate
 * trade-off: a printing company owner should pick a brand colour, not tune a
 * hover shade. It also guarantees the derived values stay visually consistent
 * with whatever base colour they choose.
 *
 * Used by both the server (to emit CSS) and the admin preview, so what the
 * admin sees before saving is produced by exactly the same code as production.
 */

/** The colours an administrator can actually edit. */
export interface EditableTheme {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  foreground: string
  muted: string
  border: string
}

export const EDITABLE_THEME_KEYS = [
  'primary', 'secondary', 'accent', 'background',
  'surface', 'foreground', 'muted', 'border',
] as const

/** The compile-time brand palette, as an editable-theme object. */
export const defaultEditableTheme: EditableTheme = {
  primary: brandTheme.colors.primary,
  secondary: brandTheme.colors.secondary,
  accent: brandTheme.colors.accent,
  background: brandTheme.colors.background,
  surface: brandTheme.colors.surface,
  foreground: brandTheme.colors.foreground,
  muted: brandTheme.colors.muted,
  border: brandTheme.colors.border,
}

/**
 * Coerces arbitrary input into a valid `EditableTheme`.
 *
 * Any value that is not a plain 6-digit hex falls back to the brand default,
 * so a malformed database row degrades to the default palette instead of
 * emitting broken — or hostile — CSS.
 */
export function sanitizeTheme(
  input: Partial<Record<keyof EditableTheme, unknown>> | Record<string, unknown> | null | undefined,
): EditableTheme {
  const result = { ...defaultEditableTheme }
  if (!input) return result

  const source = input as Record<string, unknown>
  for (const key of EDITABLE_THEME_KEYS) {
    const clean = normalizeHex(source[key])
    if (clean) result[key] = clean
  }
  return result
}

/**
 * Expands the eight editable colours into the full semantic token set.
 *
 * Success / warning / danger are intentionally *not* themeable: they carry
 * meaning ("this failed") rather than brand identity, and letting an owner
 * set danger to green would be actively harmful.
 */
export function deriveTokens(theme: EditableTheme): SemanticTokens {
  const dark = theme.foreground

  /**
   * Returns the hand-tuned brand value when the administrator has not moved
   * the colour this token is derived from, otherwise the computed one.
   *
   * The curated values carry small hue adjustments a linear mix cannot
   * reproduce, and the seeded demo brand has to look pixel-identical to how it
   * looked before the theme became editable. Once a colour *is* changed, the
   * derived value is the only sensible option.
   */
  const keep = <K extends keyof SemanticTokens>(
    token: K,
    source: keyof EditableTheme,
    computed: string,
  ): string => (theme[source] === defaultEditableTheme[source]
    ? brandTheme.colors[token]
    : computed)

  return {
    'primary': theme.primary,
    'primary-hover': keep('primary-hover', 'primary', darken(theme.primary, 0.15)),
    // Guarantees legible button text whatever primary the owner picks.
    'primary-contrast': readableOn(theme.primary),

    'secondary': theme.secondary,
    'secondary-hover': keep('secondary-hover', 'secondary', darken(theme.secondary, 0.15)),

    'accent': theme.accent,
    'accent-hover': keep('accent-hover', 'accent', darken(theme.accent, 0.15)),

    'background': theme.background,
    'surface': theme.surface,
    // A faint tint of the foreground: stays neutral on white, and still reads
    // as "slightly recessed" if the owner picks a tinted background.
    'surface-muted': keep('surface-muted', 'surface', mix(theme.surface, dark, 0.04)),

    'foreground': theme.foreground,
    'foreground-soft': keep('foreground-soft', 'foreground', mix(theme.foreground, theme.muted, 0.55)),
    'muted': theme.muted,

    'border': theme.border,
    'border-strong': keep('border-strong', 'border', darken(theme.border, 0.12)),

    // Status colours are fixed by meaning, not by brand.
    'success': brandTheme.colors.success,
    'warning': brandTheme.colors.warning,
    'danger': brandTheme.colors.danger,
  }
}

/**
 * Nuxt UI and UnoCSS utilities resolve `--color-primary-600` and friends, so a
 * runtime theme change must also move those numbered steps — otherwise a
 * `UButton` would keep the seeded blue while the rest of the site re-themed.
 *
 * The ramp is generated from the single base colour rather than stored, which
 * is why the admin only needs to choose one value per palette.
 */
const RAMP: { step: number, mix: number, toward: 'light' | 'dark' }[] = [
  { step: 50, mix: 0.95, toward: 'light' },
  { step: 100, mix: 0.86, toward: 'light' },
  { step: 200, mix: 0.7, toward: 'light' },
  { step: 300, mix: 0.5, toward: 'light' },
  { step: 400, mix: 0.28, toward: 'light' },
  { step: 500, mix: 0.12, toward: 'light' },
  { step: 600, mix: 0, toward: 'light' },
  { step: 700, mix: 0.14, toward: 'dark' },
  { step: 800, mix: 0.28, toward: 'dark' },
  { step: 900, mix: 0.42, toward: 'dark' },
  { step: 950, mix: 0.62, toward: 'dark' },
]

/**
 * Builds `{ '--color-primary-50': '#...', ... }` for one palette.
 *
 * When the base colour is unchanged from the brand default, the curated scale
 * from `brand.ts` is used verbatim. Those steps were hand-tuned (they carry a
 * slight hue shift that a linear mix cannot reproduce), and the demo brand
 * must look pixel-identical to before this phase. Any other colour falls back
 * to the generated ramp, which is close enough and, crucially, works for a
 * palette nobody has hand-tuned.
 */
export function buildScale(name: 'primary' | 'secondary' | 'accent', base: string): Record<string, string> {
  const curated = brandTheme.scales[name]
  const out: Record<string, string> = {}

  if (base === defaultEditableTheme[name]) {
    for (const [step, value] of Object.entries(curated)) {
      out[`--color-${name}-${step}`] = value
    }
    return out
  }

  for (const { step, mix: amount, toward } of RAMP) {
    out[`--color-${name}-${step}`] = toward === 'light'
      ? lighten(base, amount)
      : darken(base, amount)
  }
  return out
}

/**
 * The complete `--color-*` map applied to the document root: semantic tokens
 * plus the three numbered ramps.
 */
export function buildCssVariables(theme: EditableTheme): Record<string, string> {
  const vars: Record<string, string> = {}

  for (const [name, value] of Object.entries(deriveTokens(theme))) {
    vars[`--color-${name}`] = value
  }

  Object.assign(
    vars,
    buildScale('primary', theme.primary),
    buildScale('secondary', theme.secondary),
    buildScale('accent', theme.accent),
  )

  return vars
}

/**
 * Serialises the theme as a `:root { ... }` rule.
 *
 * Safe by construction: every value has already passed `sanitizeTheme`, so it
 * is a literal `#rrggbb`, and the property names come from a fixed internal
 * list rather than from user input.
 */
export function buildThemeCss(theme: EditableTheme): string {
  const declarations = Object.entries(buildCssVariables(theme))
    .map(([name, value]) => `${name}:${value}`)
    .join(';')

  return `:root{${declarations}}`
}
