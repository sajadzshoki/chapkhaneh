<script setup lang="ts">
/**
 * Title + description + primary action, identical on every management screen.
 * Text arrives via props so this component holds no translatable strings.
 */
defineProps<{
  title: string
  description: string
  /** Label for the primary create button; omitted on read-only screens. */
  actionLabel?: string
  actionIcon?: string
  actionDisabled?: boolean
}>()

const emit = defineEmits<{ action: [] }>()
</script>

<template>
  <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div class="min-w-0">
      <h2 class="text-lg font-bold text-[var(--color-foreground)]">
        {{ title }}
      </h2>
      <p class="mt-1 max-w-2xl text-sm text-[var(--color-muted)]">
        {{ description }}
      </p>
    </div>

    <div class="flex shrink-0 items-center gap-2">
      <slot name="actions" />
      <UButton
        v-if="actionLabel"
        color="primary"
        :icon="actionIcon ?? 'i-lucide-plus'"
        :disabled="actionDisabled"
        @click="emit('action')"
      >
        {{ actionLabel }}
      </UButton>
    </div>
  </div>
</template>
