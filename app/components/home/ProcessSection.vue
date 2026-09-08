<script setup lang="ts">
const steps = ['inquiry', 'quote', 'prepress', 'production', 'delivery'] as const
</script>

<template>
  <section class="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
    <UiPageContainer class="py-16 lg:py-24">
      <UiSectionHeader
        :eyebrow="$t('home.process.eyebrow')"
        :title="$t('home.process.title')"
        :description="$t('home.process.description')"
      />

      <ol class="mt-12 grid grid-cols-1 gap-px bg-[var(--color-border)] sm:grid-cols-2 lg:grid-cols-5">
        <li
          v-for="(step, index) in steps"
          :key="step"
          class="bg-[var(--color-surface)] p-6"
        >
          <span class="block text-2xl font-extrabold text-[var(--color-border-strong)] tabular">
            {{ String(index + 1).padStart(2, '0') }}
          </span>
          <h3 class="mt-3 font-bold text-[var(--color-foreground)]">
            {{ $t(`home.process.steps.${step}.title`) }}
          </h3>
          <p class="mt-2 text-sm leading-7 text-[var(--color-muted)]">
            {{ $t(`home.process.steps.${step}.description`) }}
          </p>
        </li>
      </ol>
    </UiPageContainer>
  </section>
</template>
