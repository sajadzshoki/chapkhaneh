<script setup lang="ts">
/**
 * Brand lockup = replaceable mark asset + company name from site settings.
 * Keeping the name as text (rather than baking it into the SVG) means the
 * logo reads correctly in both Persian and English with no extra asset.
 */
withDefaults(defineProps<{
  variant?: 'full' | 'mark'
  inverted?: boolean
}>(), { variant: 'full', inverted: false })

const { site, companyName, tagline } = useSite()
const localePath = useLocalePath()
</script>

<template>
  <NuxtLink
    :to="localePath('/')"
    class="inline-flex items-center gap-3"
    :aria-label="companyName"
  >
    <img
      :src="site.brand.mark"
      alt=""
      aria-hidden="true"
      width="40"
      height="40"
      class="size-10 shrink-0"
    >
    <span v-if="variant === 'full'" class="flex flex-col leading-none">
      <span
        class="text-lg font-extrabold tracking-tight"
        :class="inverted ? 'text-white' : 'text-[var(--color-foreground)]'"
      >
        {{ companyName }}
      </span>
      <span
        class="mt-1 text-[11px] font-medium"
        :class="inverted ? 'text-white/60' : 'text-[var(--color-muted)]'"
      >
        {{ tagline }}
      </span>
    </span>
  </NuxtLink>
</template>
