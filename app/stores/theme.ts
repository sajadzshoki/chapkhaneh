import { defineStore } from 'pinia'
import { brandTheme } from '~~/shared/theme/brand'
import type { SemanticTokens } from '~~/shared/theme/brand'
import type { ThemeSettings } from '~~/shared/types'

/**
 * Theme store.
 *
 * State management is genuinely useful here: the theme is global, mutable at
 * runtime (the future admin panel will change brand colours) and read by the
 * plugin that writes CSS variables.
 */
export const useThemeStore = defineStore('theme', () => {
  /** Admin-provided overrides on top of the compile-time brand defaults. */
  const overrides = ref<Partial<ThemeSettings>>({})

  const tokens = computed<SemanticTokens>(() => ({
    ...brandTheme.colors,
    ...(overrides.value.primary ? { primary: overrides.value.primary } : {}),
    ...(overrides.value.secondary ? { secondary: overrides.value.secondary } : {}),
    ...(overrides.value.accent ? { accent: overrides.value.accent } : {}),
  }))

  /** `--color-*` variable map applied to the document root. */
  const cssVariables = computed<Record<string, string>>(() =>
    Object.fromEntries(Object.entries(tokens.value).map(([k, v]) => [`--color-${k}`, v])),
  )

  function applyOverrides(next: Partial<ThemeSettings>) {
    overrides.value = { ...overrides.value, ...next }
  }

  function reset() {
    overrides.value = {}
  }

  return { overrides, tokens, cssVariables, applyOverrides, reset }
})
