<script setup lang="ts">
const { mainNav } = useNavigation()
const localePath = useLocalePath()
const route = useRoute()

const mobileOpen = ref(false)

// Close the mobile drawer on navigation.
watch(() => route.fullPath, () => { mobileOpen.value = false })

const isActive = (to: string) => {
  const target = localePath(to)
  return to === '/' ? route.path === target : route.path.startsWith(target)
}
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
    <!-- Utility bar: contact shortcuts, hidden on small screens -->
    <div class="hidden border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] lg:block">
      <UiPageContainer class="flex h-10 items-center justify-between text-xs text-[var(--color-muted)]">
        <AppContactStrip />
        <AppLanguageSwitcher class="!border-0 !px-0" />
      </UiPageContainer>
    </div>

    <UiPageContainer class="flex h-[76px] items-center justify-between gap-6">
      <AppLogo />

      <nav
        class="hidden items-center gap-1 xl:flex"
        :aria-label="$t('nav.mainNavigation')"
      >
        <NuxtLink
          v-for="item in mainNav"
          :key="item.to"
          :to="localePath(item.to)"
          class="relative px-3 py-2 text-sm font-semibold transition-colors"
          :class="isActive(item.to)
            ? 'text-[var(--color-primary)]'
            : 'text-[var(--color-foreground-soft)] hover:text-[var(--color-primary)]'"
          :aria-current="isActive(item.to) ? 'page' : undefined"
        >
          {{ $t(item.key) }}
          <span
            v-if="isActive(item.to)"
            class="absolute inset-x-3 -bottom-[1px] h-0.5 bg-[var(--color-primary)]"
            aria-hidden="true"
          />
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-3">
        <UButton
          :to="localePath('/quote')"
          color="primary"
          size="md"
          class="hidden sm:inline-flex"
        >
          {{ $t('nav.quote') }}
        </UButton>

        <button
          type="button"
          class="inline-flex size-10 items-center justify-center border border-[var(--color-border)] text-[var(--color-foreground)] xl:hidden"
          :aria-label="mobileOpen ? $t('nav.closeMenu') : $t('nav.openMenu')"
          :aria-expanded="mobileOpen"
          aria-controls="mobile-navigation"
          @click="mobileOpen = !mobileOpen"
        >
          <UIcon :name="mobileOpen ? 'i-lucide-x' : 'i-lucide-menu'" class="size-5" aria-hidden="true" />
        </button>
      </div>
    </UiPageContainer>

    <!-- Mobile / tablet navigation -->
    <div
      v-show="mobileOpen"
      id="mobile-navigation"
      class="border-t border-[var(--color-border)] bg-[var(--color-surface)] xl:hidden"
    >
      <UiPageContainer class="py-4">
        <nav :aria-label="$t('nav.mainNavigation')">
          <ul class="flex flex-col">
            <li v-for="item in mainNav" :key="item.to">
              <NuxtLink
                :to="localePath(item.to)"
                class="block border-b border-[var(--color-border)] py-3 text-sm font-semibold"
                :class="isActive(item.to) ? 'text-[var(--color-primary)]' : 'text-[var(--color-foreground-soft)]'"
                :aria-current="isActive(item.to) ? 'page' : undefined"
              >
                {{ $t(item.key) }}
              </NuxtLink>
            </li>
          </ul>
        </nav>

        <div class="mt-5 flex items-center justify-between gap-3">
          <UButton :to="localePath('/quote')" color="primary" size="md" class="flex-1 justify-center">
            {{ $t('nav.quote') }}
          </UButton>
          <AppLanguageSwitcher />
        </div>
      </UiPageContainer>
    </div>
  </header>
</template>
