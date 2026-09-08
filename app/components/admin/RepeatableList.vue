<script setup lang="ts">
/**
 * Add / remove / reorder for the nested collections (service features,
 * equipment specs, gallery images, project details).
 *
 * Only the chrome lives here; the caller renders each entry's fields in the
 * default slot, so one component covers every nested collection in the panel.
 */
defineProps<{
  /** The bound array — mutated in place by the buttons. */
  items: unknown[]
  addLabel: string
  removeLabel: string
  upLabel: string
  downLabel: string
  emptyLabel?: string
  /** Prevents unbounded growth; matches the server-side array limits. */
  max?: number
}>()

const emit = defineEmits<{ add: [], remove: [index: number], move: [index: number, to: number] }>()
</script>

<template>
  <div class="space-y-3">
    <p v-if="!items.length && emptyLabel" class="text-sm text-[var(--color-muted)]">
      {{ emptyLabel }}
    </p>

    <div
      v-for="(item, index) in items"
      :key="index"
      class="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3"
    >
      <div class="mb-2 flex items-center justify-between gap-2">
        <span class="text-xs font-medium text-[var(--color-muted)]">{{ index + 1 }}</span>
        <div class="flex items-center gap-1">
          <UButton
            color="neutral" variant="ghost" size="xs" square icon="i-lucide-arrow-up"
            :aria-label="upLabel" :title="upLabel" :disabled="index === 0"
            @click="emit('move', index, index - 1)"
          />
          <UButton
            color="neutral" variant="ghost" size="xs" square icon="i-lucide-arrow-down"
            :aria-label="downLabel" :title="downLabel" :disabled="index === items.length - 1"
            @click="emit('move', index, index + 1)"
          />
          <UButton
            color="danger" variant="ghost" size="xs" square icon="i-lucide-trash-2"
            :aria-label="removeLabel" :title="removeLabel"
            @click="emit('remove', index)"
          />
        </div>
      </div>

      <div class="grid gap-3 sm:grid-cols-2">
        <slot :item="item" :index="index" />
      </div>
    </div>

    <UButton
      color="neutral"
      variant="outline"
      size="sm"
      icon="i-lucide-plus"
      :disabled="max !== undefined && items.length >= max"
      @click="emit('add')"
    >
      {{ addLabel }}
    </UButton>
  </div>
</template>
