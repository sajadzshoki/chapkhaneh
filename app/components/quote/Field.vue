<script setup lang="ts">
/** Label + error wrapper so every control keeps a proper <label for>. */
defineProps<{
  id: string
  label: string
  required?: boolean
  error?: string
}>()
</script>

<template>
  <div>
    <label :for="id" class="mb-2 block text-sm font-semibold text-[var(--color-foreground-soft)]">
      {{ label }}
      <span v-if="required" class="text-[var(--color-danger)]" aria-hidden="true">*</span>
      <span v-else class="font-normal text-[var(--color-muted)]">({{ $t('common.optional') }})</span>
    </label>

    <slot />

    <p
      v-if="error"
      :id="`${id}-error`"
      class="mt-2 text-xs text-[var(--color-danger)]"
      role="alert"
    >
      {{ error }}
    </p>
  </div>
</template>
