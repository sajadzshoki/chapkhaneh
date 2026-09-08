<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  description?: string
  icon?: string
}>(), { icon: 'i-lucide-inbox' })
</script>

<template>
  <div class="flex flex-col items-center justify-center border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-muted)] px-6 py-16 text-center">
    <UIcon :name="icon" class="size-8 text-[var(--color-muted)]" aria-hidden="true" />
    <h3 class="mt-4 font-bold text-[var(--color-foreground)]">
      {{ title ?? $t('states.emptyTitle') }}
    </h3>
    <p class="mt-2 max-w-md text-sm text-[var(--color-muted)]">
      {{ description ?? $t('states.emptyDescription') }}
    </p>
    <div class="mt-5">
      <slot />
    </div>
  </div>
</template>
