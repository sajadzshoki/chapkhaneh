import { siteSettings, companyStats } from '~~/shared/data/site'
import type { Localized, LocaleCode } from '~~/shared/types'

/**
 * Access to centralised company information.
 * Components must read brand/contact data from here — never hardcode it.
 */
export function useSite() {
  const { locale } = useI18n()
  const currentLocale = computed(() => locale.value as LocaleCode)

  /** Resolve a `Localized<T>` value for the active locale. */
  const t = <T>(value: Localized<T>): T => value[currentLocale.value] ?? value.fa

  return {
    site: siteSettings,
    stats: companyStats,
    locale: currentLocale,
    localized: t,
    companyName: computed(() => t(siteSettings.companyName)),
    tagline: computed(() => t(siteSettings.tagline)),
    primaryPhone: computed(() => siteSettings.contact.phones[0] ?? ''),
  }
}
