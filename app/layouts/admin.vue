<script setup lang="ts">
/**
 * Admin shell — deliberately separate from the public `default` layout so the
 * marketing site's header, footer and chrome are untouched.
 *
 * The panel is bilingual like the rest of the product: the operator is a
 * Persian-speaking printing company, so Persian is the default and the whole
 * shell mirrors to RTL with it. Because the admin routes are excluded from i18n
 * URL routing (no `/en/admin` duplicates), the language is switched in place
 * and remembered, rather than by navigating to a prefixed route.
 */
const { user, logout } = useAdminAuth()
const route = useRoute()
const { t, locale, locales } = useI18n()
const { adminLocale, setAdminLocale } = useAdminLocale()

const dir = computed(() => (adminLocale.value === 'fa' ? 'rtl' : 'ltr'))

const nav = computed(() => [
  { key: 'dashboard', to: '/admin', icon: 'i-lucide-layout-dashboard' },
  { key: 'services', to: '/admin/services', icon: 'i-lucide-printer' },
  { key: 'pricing', to: '/admin/pricing', icon: 'i-lucide-credit-card' },
  { key: 'equipment', to: '/admin/equipment', icon: 'i-lucide-factory' },
  { key: 'portfolio', to: '/admin/portfolio', icon: 'i-lucide-gallery-vertical-end' },
  { key: 'faqs', to: '/admin/faqs', icon: 'i-lucide-message-circle' },
  { key: 'quoteRequests', to: '/admin/quote-requests', icon: 'i-lucide-inbox' },
  { key: 'settings', to: '/admin/settings', icon: 'i-lucide-settings' },
].map(item => ({ ...item, label: t(`admin.nav.${item.key}`) })))

/** Exact match for the index route, prefix match for the rest. */
function isActive(to: string): boolean {
  return to === '/admin' ? route.path === '/admin' : route.path.startsWith(to)
}

const pageTitle = computed(() => nav.value.find(item => isActive(item.to))?.label ?? t('admin.title'))

const languageOptions = computed(() =>
  locales.value.map(item => ({
    value: typeof item === 'string' ? item : item.code,
    label: typeof item === 'string' ? item : item.name ?? item.code,
  })),
)

const selectedLocale = computed({
  get: () => adminLocale.value,
  set: (value: string) => setAdminLocale(value),
})

const loggingOut = ref(false)

async function onLogout() {
  loggingOut.value = true
  try {
    await logout()
    await navigateTo('/admin/login')
  }
  finally {
    loggingOut.value = false
  }
}

// The admin routes sit outside i18n routing, so the document direction has to
// be driven from here instead of `useLocaleHead`.
useHead(() => ({
  htmlAttrs: { lang: locale.value, dir: dir.value },
}))
</script>

<template>
  <div
    :dir="dir"
    class="flex min-h-screen bg-[var(--color-surface-muted)] text-[var(--color-foreground)]"
  >
    <!-- Sidebar -->
    <aside class="hidden w-60 shrink-0 flex-col border-e border-[var(--color-border)] bg-[var(--color-secondary)] lg:flex">
      <div class="flex h-16 items-center gap-2.5 border-b border-white/10 px-5">
        <img src="/brand/mark.svg" alt="" aria-hidden="true" width="28" height="28" class="size-7">
        <span class="text-sm font-bold text-white">{{ t('admin.brand') }}</span>
      </div>

      <nav class="flex-1 overflow-y-auto p-3" :aria-label="t('admin.sections')">
        <ul class="space-y-0.5">
          <li v-for="item in nav" :key="item.to">
            <NuxtLink
              :to="item.to"
              class="flex items-center gap-2.5 rounded-[var(--radius-sm)] px-3 py-2 text-sm transition-colors"
              :class="isActive(item.to)
                ? 'bg-white/12 font-semibold text-white'
                : 'text-white/65 hover:bg-white/6 hover:text-white'"
              :aria-current="isActive(item.to) ? 'page' : undefined"
            >
              <UIcon :name="item.icon" class="size-4 shrink-0" aria-hidden="true" />
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <div class="border-t border-white/10 p-3">
        <NuxtLink
          to="/"
          class="flex items-center gap-2.5 rounded-[var(--radius-sm)] px-3 py-2 text-sm text-white/65 transition-colors hover:bg-white/6 hover:text-white"
        >
          <UIcon name="i-lucide-external-link" class="size-4" aria-hidden="true" />
          {{ t('admin.viewSite') }}
        </NuxtLink>
      </div>
    </aside>

    <div class="flex min-w-0 flex-1 flex-col">
      <!-- Header -->
      <header class="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-5 lg:px-8">
        <h1 class="truncate text-base font-bold">
          {{ pageTitle }}
        </h1>

        <div class="flex items-center gap-3">
          <USelect
            v-model="selectedLocale"
            :items="languageOptions"
            value-key="value"
            size="sm"
            icon="i-lucide-languages"
            :aria-label="t('admin.language')"
            class="w-32"
          />
          <span v-if="user" class="hidden text-sm text-[var(--color-muted)] xl:inline">
            {{ user.email }}
          </span>
          <UButton
            color="neutral"
            variant="outline"
            size="sm"
            icon="i-lucide-log-out"
            :loading="loggingOut"
            @click="onLogout"
          >
            {{ t('admin.logout') }}
          </UButton>
        </div>
      </header>

      <!-- Mobile nav: the sidebar is desktop-only, so keep sections reachable. -->
      <nav
        class="flex gap-1 overflow-x-auto border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 lg:hidden"
        :aria-label="t('admin.sections')"
      >
        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="whitespace-nowrap rounded-[var(--radius-sm)] px-3 py-1.5 text-sm"
          :class="isActive(item.to)
            ? 'bg-[var(--color-primary)] font-semibold text-white'
            : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-muted)]'"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <main id="main-content" class="flex-1 p-5 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>
