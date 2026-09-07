/**
 * Writes the active theme tokens onto <html> as CSS variables.
 * Runs once at startup and again whenever the admin overrides change, so the
 * whole site re-themes from one place with no component involvement.
 */
export default defineNuxtPlugin(() => {
  const theme = useThemeStore()

  watchEffect(() => {
    const root = document.documentElement
    for (const [name, value] of Object.entries(theme.cssVariables)) {
      root.style.setProperty(name, value)
    }
  })
})
