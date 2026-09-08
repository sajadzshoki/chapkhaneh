<script setup lang="ts">
/**
 * The trailing actions cell: reorder, optional toggles, edit and delete.
 *
 * Reordering uses explicit up/down buttons rather than drag-and-drop — it is
 * keyboard accessible, works on touch, and is far easier to explain to a
 * non-technical operator.
 */
defineProps<{
  editLabel: string
  deleteLabel: string
  upLabel: string
  downLabel: string
  disableUp?: boolean
  disableDown?: boolean
  busy?: boolean
  /** Hide reorder controls on lists that are not manually ordered. */
  hideReorder?: boolean
}>()

const emit = defineEmits<{ edit: [], remove: [], up: [], down: [] }>()
</script>

<template>
  <div class="flex items-center justify-end gap-1">
    <slot />

    <template v-if="!hideReorder">
      <UButton
        color="neutral"
        variant="ghost"
        size="xs"
        icon="i-lucide-arrow-up"
        square
        :aria-label="upLabel"
        :title="upLabel"
        :disabled="disableUp || busy"
        @click="emit('up')"
      />
      <UButton
        color="neutral"
        variant="ghost"
        size="xs"
        icon="i-lucide-arrow-down"
        square
        :aria-label="downLabel"
        :title="downLabel"
        :disabled="disableDown || busy"
        @click="emit('down')"
      />
    </template>

    <UButton
      color="neutral"
      variant="ghost"
      size="xs"
      icon="i-lucide-pencil"
      square
      :aria-label="editLabel"
      :title="editLabel"
      :disabled="busy"
      @click="emit('edit')"
    />
    <UButton
      color="danger"
      variant="ghost"
      size="xs"
      icon="i-lucide-trash-2"
      square
      :aria-label="deleteLabel"
      :title="deleteLabel"
      :disabled="busy"
      @click="emit('remove')"
    />
  </div>
</template>
