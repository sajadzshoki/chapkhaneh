<script setup lang="ts">
/** Headline production figures, read from the centralised company profile. */
const { stats } = useSite()
const { L } = useLocalizedContent()
</script>

<template>
  <section class="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
    <UiPageContainer class="py-12 lg:py-14">
      <h2 class="sr-only">{{ $t('home.stats.title') }}</h2>
      <dl class="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-10">
        <UiStatBlock
          v-for="stat in stats"
          :key="stat.id"
          :value="stat.value"
          :suffix="stat.suffix"
          :label="L(stat.label) ?? ''"
        />
      </dl>
    </UiPageContainer>
  </section>
</template>
