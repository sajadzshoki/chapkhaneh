import { siteSettings as fallbackSettings } from '~~/shared/data/site'
import type { SiteSettings } from '~~/shared/types'

export interface SiteSettingsPayload {
  site: SiteSettings
  theme: Record<string, string> | null
}

/**
 * The shared `site-settings` request.
 *
 * Both `useSite()` and the `site-identity` plugin need this payload. Nuxt
 * de-duplicates `useAsyncData` by key, but only when every caller passes an
 * identical handler and options — otherwise it warns and the behaviour depends
 * on which call ran first. Declaring the fetch exactly once here removes that
 * ambiguity, so the settings are fetched a single time per request and shared
 * by every consumer.
 */
export function useSiteSettingsData() {
  return useAsyncData<SiteSettingsPayload>(
    'site-settings',
    () => $fetch<SiteSettingsPayload>('/api/site-settings'),
    { default: () => ({ site: fallbackSettings, theme: null }) },
  )
}
