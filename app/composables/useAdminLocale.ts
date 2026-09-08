/**
 * Language switching for the admin panel.
 *
 * The public site changes language by URL prefix, but the admin routes are
 * excluded from i18n routing on purpose (there is no `/en/admin` twin). So the
 * panel switches `i18n.locale` in place and persists the choice in a cookie,
 * which is also read during SSR — the first paint is already in the right
 * language and direction, with no flash.
 */
export function useAdminLocale() {
  const { locale, setLocale } = useI18n()

  const cookie = useCookie<string>('mb_admin_locale', {
    default: () => 'fa',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    path: '/',
  })

  // Apply the stored preference on entry, including on the server.
  if (locale.value !== cookie.value) {
    setLocale(cookie.value as typeof locale.value)
  }

  function setAdminLocale(next: string) {
    cookie.value = next
    setLocale(next as typeof locale.value)
  }

  return {
    adminLocale: computed(() => locale.value),
    setAdminLocale,
  }
}

/**
 * Reads the field matching the *content* language, not the UI language.
 *
 * Admin tables show one column per language where it matters, but summaries
 * (a service title in a dropdown, a category name in a filter) should follow
 * whichever language the operator is working in.
 */
export function useAdminLocalized() {
  const { locale } = useI18n()

  return function pick(fa: string | null | undefined, en: string | null | undefined): string {
    return (locale.value === 'fa' ? fa || en : en || fa) ?? ''
  }
}

/**
 * Formats an integer price for display.
 *
 * Prices are stored as plain integers; formatting is presentation only, so the
 * database never holds a string like "12,500,000 تومان".
 */
export function useAdminFormat() {
  const { locale } = useI18n()

  const numberFormat = computed(() =>
    new Intl.NumberFormat(locale.value === 'fa' ? 'fa-IR' : 'en-US'),
  )

  const dateFormat = computed(() =>
    new Intl.DateTimeFormat(locale.value === 'fa' ? 'fa-IR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
  )

  return {
    formatNumber: (value: number | null | undefined) =>
      value === null || value === undefined ? '—' : numberFormat.value.format(value),

    formatPrice: (value: number | null | undefined, currency: string) => {
      if (value === null || value === undefined) return '—'
      const amount = numberFormat.value.format(value)
      const unit = currency === 'IRR'
        ? (locale.value === 'fa' ? 'ریال' : 'IRR')
        : (locale.value === 'fa' ? 'تومان' : 'Toman')
      return `${amount} ${unit}`
    },

    formatDate: (value: string | Date | null | undefined) => {
      if (!value) return '—'
      const date = typeof value === 'string' ? new Date(value) : value
      return Number.isNaN(date.getTime()) ? '—' : dateFormat.value.format(date)
    },
  }
}
