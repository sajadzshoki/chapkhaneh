import type { Composer } from 'vue-i18n'

/**
 * Publishes the configured company name into the i18n message tree.
 *
 * Fifteen strings per locale refer to the company by name — "About
 * @:brand.company", the page-title template, the default meta description and
 * so on. They use a vue-i18n *linked message* pointing at `brand.company`,
 * and this plugin overwrites that one key with the value from
 * `site_settings`.
 *
 * Doing it in one place means a new customer renames themselves once, in the
 * admin, and the change reaches every page, title and meta tag. The
 * alternative — passing the name at each of ~30 call sites — would leak a raw
 * placeholder to a visitor the first time someone forgot.
 *
 * The locale files keep the demo brand as their value, so the site still
 * renders correctly if the database is unreachable.
 */
export default defineNuxtPlugin({
  name: 'site-identity',
  dependsOn: ['i18n:plugin'],

  async setup(nuxtApp) {
    // `useI18n()` is only valid inside a component setup; in a plugin the
    // composer is reached through the injected instance.
    const i18n = nuxtApp.$i18n as Composer

    // Shares the single `site-settings` request with `useSite()`.
    const { data } = await useSiteSettingsData()

    /**
     * `mergeLocaleMessage` mutates only this request's i18n instance, so
     * concurrent SSR requests cannot see each other's values.
     */
    watchEffect(() => {
      const names = data.value?.site?.companyName
      if (!names) return

      for (const code of ['fa', 'en'] as const) {
        const name = names[code]
        if (name) i18n.mergeLocaleMessage(code, { brand: { company: name } })
      }
    })
  },
})
