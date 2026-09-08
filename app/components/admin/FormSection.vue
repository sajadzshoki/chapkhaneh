<script setup lang="ts">
/** Heading + two-column grid used to group long forms into readable blocks. */
defineProps<{ title: string, description?: string }>()
</script>

<template>
  <section class="space-y-4">
    <div class="border-b border-[var(--color-border)] pb-2">
      <h3 class="text-sm font-bold text-[var(--color-foreground)]">
        {{ title }}
      </h3>
      <p v-if="description" class="mt-0.5 text-xs text-[var(--color-muted)]">
        {{ description }}
      </p>
    </div>
    <div class="grid gap-4 sm:grid-cols-2">
      <slot />
    </div>
  </section>
</template>
