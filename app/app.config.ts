/**
 * Nuxt UI runtime configuration.
 *
 * `colors.primary` / `colors.neutral` point at the brand palettes declared in
 * the `@theme static` block of `app/assets/css/main.css`. Without this, Nuxt UI
 * falls back to its default green and our tokens would be overridden.
 */
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'primary',
      secondary: 'secondary',
      neutral: 'secondary',
    },
    button: {
      defaultVariants: {
        // Square-ish, corporate buttons rather than pill shapes.
        size: 'md',
      },
    },
  },
})
