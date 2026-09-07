<script setup lang="ts">
/**
 * Label + control + hint + error, wired to the server's field-issue format.
 *
 * Keeping the error rendering here guarantees every field in the panel reports
 * problems the same way, right under the input the operator must fix.
 */
defineProps<{
  label: string
  hint?: string
  /** Messages returned by the API for this field, if any. */
  errors?: string[]
  required?: boolean
  /** Spans both columns of the parent grid — for textareas and wide inputs. */
  full?: boolean
  /** Forces text direction, so Persian fields stay RTL in the English UI. */
  dir?: 'rtl' | 'ltr'
}>()
</script>

<template>
  <div :class="full ? 'sm:col-span-2' : ''">
    <UFormField
      :label="label"
      :required="required"
      :error="errors?.[0]"
      :help="errors?.length ? undefined : hint"
    >
      <div :dir="dir">
        <slot />
      </div>
    </UFormField>
  </div>
</template>
