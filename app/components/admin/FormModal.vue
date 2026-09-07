<script setup lang="ts">
/**
 * The single create/edit shell for every entity.
 *
 * It owns only the chrome — title, scrolling body, sticky footer, submit state
 * and the top-level error banner. Each screen supplies its own fields in the
 * default slot, so there is one modal behaviour to learn and one place to fix
 * it, without a bespoke modal per section.
 *
 * Closing while saving is blocked so a half-written request cannot be orphaned.
 */
const props = defineProps<{
  open: boolean
  title: string
  submitLabel: string
  cancelLabel: string
  saving: boolean
  /** Non-field error shown above the form; field errors render inline. */
  errorMessage?: string
  /** Wider modal for the multi-section forms (services, portfolio). */
  wide?: boolean
}>()

const emit = defineEmits<{ 'update:open': [value: boolean], 'submit': [] }>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

function onSubmit() {
  if (props.saving) return
  emit('submit')
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :title="title"
    :dismissible="!saving"
    :ui="{ content: wide ? 'sm:max-w-4xl' : 'sm:max-w-2xl' }"
  >
    <template #body>
      <form :id="`admin-form-${title}`" class="space-y-6" @submit.prevent="onSubmit">
        <UAlert
          v-if="errorMessage"
          color="danger"
          variant="subtle"
          icon="i-lucide-triangle-alert"
          :description="errorMessage"
        />
        <slot />
      </form>
    </template>

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton
          color="neutral"
          variant="outline"
          :disabled="saving"
          @click="() => { isOpen = false }"
        >
          {{ cancelLabel }}
        </UButton>
        <UButton
          color="primary"
          :loading="saving"
          :disabled="saving"
          @click="onSubmit"
        >
          {{ submitLabel }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
