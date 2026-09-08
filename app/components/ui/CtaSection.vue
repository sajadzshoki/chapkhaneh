<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  description?: string
  primaryLabel: string
  primaryTo: string
  secondaryLabel?: string
  secondaryTo?: string
  variant?: 'solid' | 'muted'
}>(), { variant: 'solid' })
</script>

<template>
  <section
    :class="variant === 'solid'
      ? 'bg-[var(--color-secondary)] text-white'
      : 'border-y border-[var(--color-border)] bg-[var(--color-surface-muted)]'"
  >
    <UiPageContainer class="py-14 lg:py-16">
      <div class="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
        <div class="max-w-2xl">
          <h2
            class="text-2xl font-extrabold tracking-tight lg:text-3xl"
            :class="variant === 'solid' ? 'text-white' : 'text-[var(--color-foreground)]'"
          >
            {{ title }}
          </h2>
          <p
            v-if="description"
            class="mt-3 text-base leading-8"
            :class="variant === 'solid' ? 'text-white/75' : 'text-[var(--color-muted)]'"
          >
            {{ description }}
          </p>
        </div>

        <div class="flex shrink-0 flex-wrap items-center gap-3">
          <UButton
            :to="primaryTo"
            size="lg"
            :color="variant === 'solid' ? 'neutral' : 'primary'"
            :variant="variant === 'solid' ? 'solid' : 'solid'"
            :class="variant === 'solid' ? 'bg-white text-[var(--color-secondary)] hover:bg-white/90' : ''"
          >
            {{ primaryLabel }}
          </UButton>
          <UButton
            v-if="secondaryLabel && secondaryTo"
            :to="secondaryTo"
            size="lg"
            variant="outline"
            :color="variant === 'solid' ? 'neutral' : 'primary'"
            :class="variant === 'solid' ? 'border-white/40 text-white hover:bg-white/10' : ''"
          >
            {{ secondaryLabel }}
          </UButton>
        </div>
      </div>
    </UiPageContainer>
  </section>
</template>
