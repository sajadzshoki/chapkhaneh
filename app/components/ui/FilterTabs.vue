<script setup lang="ts">
/** Simple, keyboard-navigable filter bar used on listing pages. */
export interface FilterOption { value: string, label: string }

defineProps<{ options: FilterOption[] }>()
const model = defineModel<string>({ required: true })
</script>

<template>
  <div class="flex flex-wrap gap-2" role="group">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="border px-4 py-2 text-sm font-semibold transition-colors"
      :class="model === option.value
        ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
        : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground-soft)] hover:border-[var(--color-border-strong)]'"
      :aria-pressed="model === option.value"
      @click="model = option.value"
    >
      {{ option.label }}
    </button>
  </div>
</template>
