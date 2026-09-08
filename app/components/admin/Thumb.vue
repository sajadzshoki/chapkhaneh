<script setup lang="ts">
/**
 * Small image preview with a graceful fallback.
 *
 * Content images are author-entered paths, so a typo must not render a broken
 * image icon inside the table — it falls back to a neutral placeholder.
 */
defineProps<{ src?: string | null, alt?: string }>()

const failed = ref(false)
</script>

<template>
  <span class="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-muted)]">
    <img
      v-if="src && !failed"
      :src="src"
      :alt="alt ?? ''"
      class="size-full object-cover"
      loading="lazy"
      @error="failed = true"
    >
    <UIcon
      v-else
      name="i-lucide-image"
      class="size-4 text-[var(--color-muted)]"
      aria-hidden="true"
    />
  </span>
</template>
