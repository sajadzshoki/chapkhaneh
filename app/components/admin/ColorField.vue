<script setup lang="ts">
import { isValidHex, normalizeHex } from '~~/shared/theme/colors'

/**
 * A single brand colour: native swatch picker plus a hex text input.
 *
 * The native `<input type="color">` gives a real picker with no dependency,
 * and the paired text field lets an owner paste a brand hex from a style
 * guide — which is how these values usually arrive.
 */
const props = defineProps<{
  modelValue: string
  label: string
  /** Short explanation of where this colour is used. */
  hint?: string
  invalidMessage: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const id = useId()

/** Local text state so a half-typed hex is not pushed upstream. */
const text = ref(props.modelValue)

watch(() => props.modelValue, (value) => {
  if (value.toLowerCase() !== text.value.toLowerCase()) text.value = value
})

const invalid = computed(() => !isValidHex(text.value))

function commitText(value: string) {
  text.value = value
  const clean = normalizeHex(value)
  // Only a complete, valid colour reaches the form.
  if (clean) emit('update:modelValue', clean)
}

function commitSwatch(value: string) {
  text.value = value
  emit('update:modelValue', value.toLowerCase())
}

/** A visible border keeps a white or very pale swatch from disappearing. */
const swatchValue = computed(() => (isValidHex(text.value) ? text.value : '#ffffff'))
</script>

<template>
  <div>
    <label :for="id" class="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]">
      {{ label }}
    </label>

    <div class="flex items-center gap-2">
      <!-- The colour picker. Labelled for screen readers via aria-label since
           the visible label is bound to the hex input. -->
      <input
        type="color"
        :value="swatchValue"
        :aria-label="label"
        class="size-9 shrink-0 cursor-pointer rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-transparent p-0.5"
        @input="commitSwatch(($event.target as HTMLInputElement).value)"
      >

      <UInput
        :id="id"
        v-model="text"
        dir="ltr"
        spellcheck="false"
        autocomplete="off"
        placeholder="#0f4c81"
        class="flex-1 font-mono"
        :color="invalid ? 'danger' : undefined"
        :aria-invalid="invalid"
        :aria-describedby="invalid ? `${id}-error` : (hint ? `${id}-hint` : undefined)"
        @update:model-value="(value: string | number) => commitText(String(value))"
      />
    </div>

    <p v-if="invalid" :id="`${id}-error`" class="mt-1 text-xs text-[var(--color-danger)]" role="alert">
      {{ invalidMessage }}
    </p>
    <p v-else-if="hint" :id="`${id}-hint`" class="mt-1 text-xs text-[var(--color-muted)]">
      {{ hint }}
    </p>
  </div>
</template>
