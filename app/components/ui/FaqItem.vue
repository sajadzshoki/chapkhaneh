<script setup lang="ts">
/** Accessible disclosure built on native <details> — keyboard-friendly by default. */
defineProps<{
  question: string
  answer: string
}>()
</script>

<template>
  <details class="group border-b border-[var(--color-border)] last:border-b-0">
    <summary
      class="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-start font-bold text-[var(--color-foreground)] transition-colors hover:text-[var(--color-primary)] [&::-webkit-details-marker]:hidden"
    >
      <span>{{ question }}</span>
      <UIcon
        name="i-lucide-plus"
        class="size-5 shrink-0 text-[var(--color-muted)] transition-transform duration-200 group-open:rotate-45"
        aria-hidden="true"
      />
    </summary>
    <div class="pb-6 text-sm leading-8 text-[var(--color-muted)]">
      {{ answer }}
    </div>
  </details>
</template>
