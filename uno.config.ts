import { defineConfig } from 'unocss'
import { brandTheme } from './shared/theme/brand'

/**
 * UnoCSS here is intentionally scoped to *brand-level* utilities and shortcuts.
 *
 * Nuxt UI v3 already ships the full Tailwind v4 utility engine, so enabling a
 * wind preset here would duplicate thousands of identical rules. Instead we use
 * UnoCSS for the project's own semantic shortcuts (`.section`, `.card-flat`,
 * `.hairline`, ...) which are all built on top of the CSS variables declared in
 * `app/assets/css/tokens.css`.
 */
export default defineConfig({
  theme: {
    colors: brandTheme.unoColors,
  },
  shortcuts: {
    // Layout rhythm
    'section-y': 'py-16 lg:py-24',
    'section-y-sm': 'py-12 lg:py-16',
    // Surfaces
    'hairline': 'border border-[var(--color-border)]',
    'card-flat': 'bg-[var(--color-surface)] hairline rounded-md',
    'card-hover': 'transition-colors duration-200 hover:border-[var(--color-primary)]',
    // Typography
    'title-xl': 'text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--color-foreground)]',
    'title-lg': 'text-2xl lg:text-3xl font-bold tracking-tight text-[var(--color-foreground)]',
    'body-muted': 'text-[var(--color-muted)] leading-8',
    // A11y
    'focus-ring': 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2',
  },
})
