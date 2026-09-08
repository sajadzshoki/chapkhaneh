<script setup lang="ts">
/** Constrains page content to the site's max width with consistent gutters. */
withDefaults(defineProps<{
  /** `wide` for full-bleed-ish sections, `narrow` for prose. */
  size?: 'narrow' | 'default' | 'wide'
  as?: string
}>(), { size: 'default', as: 'div' })
</script>

<template>
  <component
    :is="as"
    class="mx-auto w-full px-5 sm:px-6 lg:px-8"
    :class="{
      'max-w-3xl': size === 'narrow',
      'max-w-[1280px]': size === 'default',
      'max-w-[1520px]': size === 'wide',
    }"
  >
    <slot />
  </component>
</template>
