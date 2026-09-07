<script setup lang="ts">
/**
 * Destructive-action confirmation.
 *
 * Deliberately a real dialog rather than `window.confirm`: it can explain the
 * consequences (cascades, lost history) in the operator's language and match
 * the rest of the panel.
 */
const props = defineProps<{
  open: boolean
  title: string
  /** Main question, e.g. 'Delete the service "Offset printing"?' */
  message: string
  /** Extra consequences, one line each. */
  consequences?: string[]
  confirmLabel: string
  cancelLabel: string
  loading: boolean
}>()

const emit = defineEmits<{ 'update:open': [value: boolean], 'confirm': [] }>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :title="title"
    :dismissible="!loading"
    :ui="{ content: 'sm:max-w-lg' }"
  >
    <template #body>
      <div class="flex items-start gap-3">
        <span class="flex size-9 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-danger)_12%,transparent)]">
          <UIcon name="i-lucide-triangle-alert" class="size-5 text-[var(--color-danger)]" aria-hidden="true" />
        </span>
        <div class="min-w-0 space-y-2">
          <p class="font-medium text-[var(--color-foreground)]">
            {{ message }}
          </p>
          <ul v-if="consequences?.length" class="space-y-1 text-sm text-[var(--color-foreground-soft)]">
            <li v-for="line in consequences" :key="line" class="flex gap-2">
              <span aria-hidden="true">•</span>
              <span>{{ line }}</span>
            </li>
          </ul>
          <slot />
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton color="neutral" variant="outline" :disabled="loading" @click="() => { isOpen = false }">
          {{ cancelLabel }}
        </UButton>
        <UButton color="danger" :loading="loading" :disabled="loading" @click="emit('confirm')">
          {{ confirmLabel }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
