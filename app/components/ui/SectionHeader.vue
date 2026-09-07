<script setup lang="ts">
withDefaults(defineProps<{
  eyebrow?: string
  title: string
  description?: string
  align?: 'start' | 'center'
  /** Heading level, so section headers never break the document outline. */
  level?: 2 | 3
}>(), { align: 'start', level: 2 })
</script>

<template>
  <div
    class="max-w-3xl"
    :class="align === 'center' ? 'mx-auto text-center' : ''"
  >
    <p
      v-if="eyebrow"
      class="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-accent)]"
    >
      {{ eyebrow }}
    </p>

    <component
      :is="level === 2 ? 'h2' : 'h3'"
      class="text-2xl font-extrabold tracking-tight text-[var(--color-foreground)] lg:text-3xl"
    >
      {{ title }}
    </component>

    <p
      v-if="description"
      class="mt-4 text-base leading-8 text-[var(--color-muted)] lg:text-lg"
    >
      {{ description }}
    </p>

    <slot />
  </div>
</template>
