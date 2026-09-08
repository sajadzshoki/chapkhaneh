<script setup lang="ts">
const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const available = computed(() =>
  (locales.value as { code: string, name?: string }[]).map(l => ({
    code: l.code,
    name: l.name ?? l.code,
    to: switchLocalePath(l.code as 'fa' | 'en'),
  })),
)

const other = computed(() => available.value.find(l => l.code !== locale.value))
</script>

<template>
  <NuxtLink
    v-if="other"
    :to="other.to"
    class="inline-flex items-center gap-2 border border-[var(--color-border)] px-3 py-2 text-sm font-semibold text-[var(--color-foreground-soft)] transition-colors hover:border-[var(--color-border-strong)] hover:text-[var(--color-foreground)]"
    :aria-label="$t('common.changeLanguage')"
    :hreflang="other.code"
  >
    <UIcon name="i-lucide-globe" class="size-4" aria-hidden="true" />
    <span>{{ other.name }}</span>
  </NuxtLink>
</template>
