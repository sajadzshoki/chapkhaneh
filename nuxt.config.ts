// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  future: { compatibilityVersion: 4 },

  modules: [
    '@nuxt/ui',
    '@unocss/nuxt',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
  ],

  css: ['~/assets/css/main.css'],

  // Light theme only for now.
  colorMode: {
    preference: 'light',
    fallback: 'light',
  },

  // Fonts are declared explicitly in `app/assets/css/fonts.css`, so the
  // automatic provider lookup (which requires network access) is disabled.
  fonts: {
    providers: {
      google: false,
      googleicons: false,
      bunny: false,
      fontshare: false,
      fontsource: false,
    },
  },

  // Bundle the Lucide icon set locally so no runtime network fetch is needed.
  icon: {
    provider: 'iconify',
    clientBundle: {
      scan: true,
      sizeLimitKb: 512,
      // Icons chosen at runtime (service/social maps) are not statically
      // scannable, so they are listed explicitly.
      icons: [
          'lucide:arrow-down',
          'lucide:arrow-left',
          'lucide:arrow-up',
          'lucide:book-open',
          'lucide:briefcase',
          'lucide:calendar-check',
          'lucide:check',
          'lucide:chevron-down',
          'lucide:chevron-left',
          'lucide:chevron-right',
          'lucide:chevron-up',
          'lucide:circle-check',
          'lucide:clock',
          'lucide:credit-card',
          'lucide:crosshair',
          'lucide:download',
          'lucide:external-link',
          'lucide:eye',
          'lucide:eye-off',
          'lucide:factory',
          'lucide:file-question',
          'lucide:file-text',
          'lucide:gallery-vertical-end',
          'lucide:globe',
          'lucide:image',
          'lucide:image-off',
          'lucide:inbox',
          'lucide:info',
          'lucide:instagram',
          'lucide:languages',
          'lucide:layout-dashboard',
          'lucide:link',
          'lucide:linkedin',
          'lucide:loader-circle',
          'lucide:log-out',
          'lucide:mail',
          'lucide:map-pin',
          'lucide:menu',
          'lucide:message-circle',
          'lucide:minus',
          'lucide:monitor-cog',
          'lucide:newspaper',
          'lucide:package',
          'lucide:pencil',
          'lucide:phone',
          'lucide:play',
          'lucide:plus',
          'lucide:printer',
          'lucide:scissors',
          'lucide:search',
          'lucide:send',
          'lucide:settings',
          'lucide:shield-check',
          'lucide:star',
          'lucide:star-off',
          'lucide:tag',
          'lucide:target',
          'lucide:trash-2',
          'lucide:trending-up',
          'lucide:triangle-alert',
          'lucide:twitter',
          'lucide:workflow',
          'lucide:x',
        ],
    },
    serverBundle: {
      collections: ['lucide'],
    },
  },

  ui: {
    theme: {
      colors: ['primary', 'secondary', 'accent', 'success', 'warning', 'danger', 'neutral'],
    },
  },

  i18n: {
    baseUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://mobinbartar.example',
    strategy: 'prefix_except_default',
    defaultLocale: 'fa',
    langDir: 'locales',
    locales: [
      { code: 'fa', name: 'فارسی', language: 'fa-IR', dir: 'rtl', file: 'fa.json' },
      { code: 'en', name: 'English', language: 'en-US', dir: 'ltr', file: 'en.json' },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'mb_locale',
      redirectOn: 'root',
      alwaysRedirect: false,
    },
  },

  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL || '',
    /** HMAC key for the admin session cookie. Server-only — never exposed. */
    sessionPassword: process.env.NUXT_SESSION_PASSWORD || '',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://mobinbartar.example',
    },
  },

  typescript: {
    strict: true,
  },

  nitro: {
    compressPublicAssets: true,
    // Guarantees identical, sanitised API error bodies in dev and production.
    errorHandler: '~~/server/error-handler',
  },
})
