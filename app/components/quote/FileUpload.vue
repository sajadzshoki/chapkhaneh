<script setup lang="ts">
/**
 * Attachment picker for the quote form.
 *
 * A styled label wrapping a real `<input type="file">` rather than a custom
 * widget: it stays keyboard operable and screen-reader friendly for free, and
 * still supports drag-and-drop for the customers who expect it.
 */
const props = defineProps<{
  id: string
  modelValue: File | null
  /** Translated message from the parent's validation, if any. */
  error?: string
  disabled?: boolean
}>()

const emit = defineEmits<{ 'update:modelValue': [value: File | null] }>()

const { t, locale } = useI18n()
const input = ref<HTMLInputElement | null>(null)
const dragging = ref(false)

const sizeLabel = computed(() =>
  props.modelValue ? formatFileSize(props.modelValue.size, locale.value) : '')

/** Derived from the shared constant so the limit is stated in exactly one place. */
const maxLabel = computed(() => formatFileSize(MAX_UPLOAD_BYTES, locale.value))
const hint = computed(() =>
  t('quote.form.fileHint', { formats: ACCEPTED_LABEL, size: maxLabel.value }))

function select(files: FileList | null) {
  emit('update:modelValue', files?.[0] ?? null)
}

function onDrop(event: DragEvent) {
  dragging.value = false
  if (props.disabled) return
  select(event.dataTransfer?.files ?? null)
}

function clear() {
  emit('update:modelValue', null)
  // Reset the native input so re-picking the same file still fires `change`.
  if (input.value) input.value.value = ''
}
</script>

<template>
  <div>
    <!-- Selected state -->
    <div
      v-if="modelValue"
      class="flex items-center gap-3 border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
    >
      <UIcon
        name="i-lucide-paperclip"
        class="size-5 shrink-0 text-[var(--color-primary)]"
        aria-hidden="true"
      />
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-semibold text-[var(--color-foreground)]" dir="ltr">
          {{ modelValue.name }}
        </p>
        <p class="mt-0.5 text-xs text-[var(--color-muted)]">
          {{ sizeLabel }}
        </p>
      </div>
      <UButton
        color="neutral"
        variant="ghost"
        size="sm"
        icon="i-lucide-x"
        :aria-label="t('quote.form.fileRemove')"
        :disabled="disabled"
        @click="clear"
      />
    </div>

    <!-- Empty state -->
    <label
      v-else
      :for="id"
      class="flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed p-6 text-center transition-colors"
      :class="[
        dragging
          ? 'border-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_5%,transparent)]'
          : 'border-[var(--color-border-strong)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]',
        disabled ? 'pointer-events-none opacity-60' : '',
      ]"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <UIcon name="i-lucide-upload" class="size-6 text-[var(--color-muted)]" aria-hidden="true" />
      <span class="text-sm font-semibold text-[var(--color-foreground)]">
        {{ t('quote.form.fileCta') }}
      </span>
      <span class="text-xs text-[var(--color-muted)]">
        {{ hint }}
      </span>
    </label>

    <!-- The real control: visually hidden, never display:none, so it stays
         reachable by keyboard and assistive technology. -->
    <input
      :id="id"
      ref="input"
      type="file"
      class="sr-only"
      :accept="ACCEPT_ATTR"
      :disabled="disabled"
      :aria-invalid="Boolean(error)"
      :aria-describedby="error ? `${id}-error` : `${id}-hint`"
      @change="select(($event.target as HTMLInputElement).files)"
    >

    <p v-if="error" :id="`${id}-error`" class="mt-2 text-xs text-[var(--color-danger)]" role="alert">
      {{ error }}
    </p>
    <p v-else :id="`${id}-hint`" class="sr-only">
      {{ hint }}
    </p>
  </div>
</template>
