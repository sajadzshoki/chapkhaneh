<script setup lang="ts">
/**
 * Admin shell — deliberately separate from the public `default` layout so the
 * marketing site's header, footer and RTL chrome are untouched.
 *
 * The admin UI is LTR English: it is an internal tool with one operator, and
 * mixing it into the public bilingual system would add cost with no benefit.
 */
const { user, logout } = useAdminAuth()
const route = useRoute()

const nav = [
  { label: 'Dashboard', to: '/admin', icon: 'i-lucide-layout-dashboard' },
  { label: 'Services', to: '/admin/services', icon: 'i-lucide-printer' },
  { label: 'Pricing', to: '/admin/pricing', icon: 'i-lucide-credit-card' },
  { label: 'Equipment', to: '/admin/equipment', icon: 'i-lucide-factory' },
  { label: 'Portfolio', to: '/admin/portfolio', icon: 'i-lucide-gallery-vertical-end' },
  { label: 'FAQs', to: '/admin/faqs', icon: 'i-lucide-message-circle' },
  { label: 'Quote Requests', to: '/admin/quote-requests', icon: 'i-lucide-inbox' },
  { label: 'Settings', to: '/admin/settings', icon: 'i-lucide-settings' },
]

/** Exact match for the index route, prefix match for the rest. */
function isActive(to: string): boolean {
  return to === '/admin' ? route.path === '/admin' : route.path.startsWith(to)
}

const pageTitle = computed(() =>
  nav.find(item => isActive(item.to))?.label ?? 'Admin',
)

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
</script>

<template>
  <div dir="ltr" class="flex min-h-screen bg-[var(--color-surface-muted)] text-[var(--color-foreground)]">
    <!-- Sidebar -->
    <aside class="hidden w-60 shrink-0 flex-col border-e border-[var(--color-border)] bg-[var(--color-secondary)] lg:flex">
      <div class="flex h-16 items-center gap-2.5 border-b border-white/10 px-5">
        <img src="/brand/mark.svg" alt="" aria-hidden="true" width="28" height="28" class="size-7">
        <span class="text-sm font-bold text-white">Mobin Bartar</span>
      </div>

      <nav class="flex-1 overflow-y-auto p-3" aria-label="Admin sections">
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
          View website
        </NuxtLink>
      </div>
    </aside>

    <div class="flex min-w-0 flex-1 flex-col">
      <!-- Header -->
      <header class="flex h-16 shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-5 lg:px-8">
        <h1 class="text-base font-bold">
          {{ pageTitle }}
        </h1>

        <div class="flex items-center gap-4">
          <span v-if="user" class="hidden text-sm text-[var(--color-muted)] sm:inline">
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
            Log out
          </UButton>
        </div>
      </header>

      <!-- Mobile nav: the sidebar is desktop-only, so keep sections reachable. -->
      <nav class="flex gap-1 overflow-x-auto border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 lg:hidden" aria-label="Admin sections">
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

      <main class="flex-1 p-5 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>
