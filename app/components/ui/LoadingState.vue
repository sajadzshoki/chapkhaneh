<script setup lang="ts">
defineProps<{ title?: string }>()
</script>

<template>
  <div
    class="flex flex-col items-center justify-center px-6 py-16 text-center"
    role="status"
    aria-live="polite"
  >
    <UIcon name="i-lucide-loader-circle" class="size-7 animate-spin text-[var(--color-primary)]" aria-hidden="true" />
    <p class="mt-4 text-sm text-[var(--color-muted)]">
      {{ title ?? $t('states.loadingTitle') }}
    </p>
  </div>
</template>
