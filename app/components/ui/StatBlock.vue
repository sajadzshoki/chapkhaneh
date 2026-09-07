<script setup lang="ts">
import { formatNumber } from '~/utils/format'

defineProps<{
  value: number
  suffix?: string
  label: string
}>()

const { locale } = useLocalizedContent()
</script>

<template>
  <div class="border-s-2 border-[var(--color-accent)] ps-5">
    <p class="text-3xl font-extrabold tracking-tight text-[var(--color-foreground)] lg:text-4xl tabular">
      {{ formatNumber(value, locale) }}<span v-if="suffix">{{ suffix }}</span>
    </p>
    <p class="mt-2 text-sm text-[var(--color-muted)]">
      {{ label }}
    </p>
  </div>
</template>
