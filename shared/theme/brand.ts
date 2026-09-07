/**
 * ---------------------------------------------------------------------------
 * SINGLE SOURCE OF TRUTH FOR THE BRAND THEME
 * ---------------------------------------------------------------------------
 * Change `brandTheme.colors.primary` (or secondary / accent) here and the whole
 * website updates: UnoCSS shortcuts, Nuxt UI components and every raw CSS
 * variable consumer.
 *
 * How it flows:
 *   brand.ts  ->  useThemeTokens() -> injected CSS variables on <html>
 *             ->  uno.config.ts    -> `text-primary-600`, `bg-accent-500`, ...
 *
 * In a later phase the admin panel will persist an override of `ThemeSettings`
 * in PostgreSQL; `useThemeTokens()` already merges an override on top of these
 * defaults, so no component needs to change.
 */

export interface ColorScale {
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900: string
  950: string
}

/** Semantic tokens exposed to components as CSS variables. */
export interface SemanticTokens {
  primary: string
  'primary-hover': string
  'primary-contrast': string
  secondary: string
  'secondary-hover': string
  accent: string
  'accent-hover': string
  background: string
  surface: string
  'surface-muted': string
  foreground: string
  'foreground-soft': string
  muted: string
  border: string
  'border-strong': string
  success: string
  warning: string
  danger: string
}

/** Deep industrial blue — trust, engineering, print heritage. */
const primaryScale: ColorScale = {
  50: '#eef5fb',
  100: '#d6e6f5',
  200: '#adcdea',
  300: '#7cadda',
  400: '#4a89c5',
  500: '#2a6ba9',
  600: '#0f4c81',
  700: '#0d3f6b',
  800: '#0b3356',
  900: '#092842',
  950: '#05192a',
}

/** Graphite / slate — industrial machinery, ink, steel. */
const secondaryScale: ColorScale = {
  50: '#f6f7f8',
  100: '#eaecef',
  200: '#d3d8dd',
  300: '#b0b9c2',
  400: '#8794a1',
  500: '#697787',
  600: '#4f5c6b',
  700: '#3d4753',
  800: '#2f3740',
  900: '#22282f',
  950: '#14181d',
}

/** Copper / press-amber — highlights, numbers, accents. Used sparingly. */
const accentScale: ColorScale = {
  50: '#fdf6ec',
  100: '#f9e7cb',
  200: '#f2cd94',
  300: '#e9ae57',
  400: '#dd9130',
  500: '#c4761f',
  600: '#a35b18',
  700: '#82471a',
  800: '#6a391a',
  900: '#5a3019',
  950: '#33180a',
}

/** Colors object handed to UnoCSS so `bg-primary-600` etc. resolve. */
export const unoColors = {
  primary: primaryScale,
  secondary: secondaryScale,
  accent: accentScale,
}

export const brandTheme = {
  /** Full scales — consumed by Nuxt UI / UnoCSS utilities. */
  scales: unoColors,
  unoColors,

  /** Flat semantic tokens — emitted as `--color-*` CSS variables. */
  colors: {
    'primary': primaryScale[600],
    'primary-hover': primaryScale[700],
    'primary-contrast': '#ffffff',
    'secondary': secondaryScale[800],
    'secondary-hover': secondaryScale[900],
    'accent': accentScale[600],
    'accent-hover': accentScale[700],
    'background': '#ffffff',
    'surface': '#ffffff',
    'surface-muted': '#f6f7f9',
    'foreground': '#14181d',
    'foreground-soft': '#3d4753',
    'muted': '#697787',
    'border': '#e2e6ea',
    'border-strong': '#c9d0d7',
    'success': '#1a7f4b',
    'warning': '#b26b00',
    'danger': '#b3261e',
  } satisfies SemanticTokens,

  /** Radii / elevation kept deliberately restrained (no childish rounding). */
  radius: {
    sm: '2px',
    md: '4px',
    lg: '6px',
  },

  fonts: {
    fa: '"Vazirmatn", "IRANSans", Tahoma, sans-serif',
    en: '"Inter", "Segoe UI", Arial, sans-serif',
  },
} as const

export type BrandTheme = typeof brandTheme
