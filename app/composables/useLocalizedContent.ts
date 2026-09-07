import type { Localized, LocaleCode } from '~~/shared/types'

/**
 * Tiny helper for rendering `Localized<T>` values inside templates:
 *   const { L } = useLocalizedContent()
 *   {{ L(service.title) }}
 */
export function useLocalizedContent() {
  const { locale } = useI18n()

  const L = <T>(value: Localized<T> | undefined): T | undefined => {
    if (!value) return undefined
    return value[locale.value as LocaleCode] ?? value.fa
  }

  return { L, locale: computed(() => locale.value as LocaleCode) }
}
