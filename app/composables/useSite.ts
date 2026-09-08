import { siteSettings as fallbackSettings, companyStats } from '~~/shared/data/site'
import type { Localized, LocaleCode, SiteSettings } from '~~/shared/types'

/**
 * Access to centralised company information.
 * Components must read brand/contact data from here — never hardcode it.
 *
 * The values come from the `site_settings` table via `/api/site-settings`.
 * `shared/data/site.ts` remains as the seed source and as a typed fallback for
 * the brief moment before the request resolves (and if the row is missing), so
 * the header/footer never render blank.
 */
export function useSite() {
  const { locale } = useI18n()
  const currentLocale = computed(() => locale.value as LocaleCode)

  // Declared once in `useSiteSettingsData` so every consumer shares a single
  // request instead of racing on differing useAsyncData options.
  const { data } = useSiteSettingsData()

  const site = computed<SiteSettings>(() => data.value?.site ?? fallbackSettings)

  /** Resolve a `Localized<T>` value for the active locale. */
  const t = <T>(value: Localized<T>): T => value[currentLocale.value] ?? value.fa

  return {
    site,
    theme: computed(() => data.value?.theme ?? null),
    stats: companyStats,
    locale: currentLocale,
    localized: t,
    companyName: computed(() => t(site.value.companyName)),
    tagline: computed(() => t(site.value.tagline)),
    primaryPhone: computed(() => site.value.contact.phones[0] ?? ''),
  }
}
