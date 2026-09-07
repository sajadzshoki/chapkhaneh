<script setup lang="ts">
const localePath = useLocalePath()
const { stats } = useSite()
const { L } = useLocalizedContent()
</script>

<template>
  <section class="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
    <UiPageContainer>
      <div class="grid grid-cols-1 items-center gap-10 py-14 lg:grid-cols-12 lg:gap-14 lg:py-20">
        <div class="lg:col-span-6">
          <p class="mb-5 inline-flex items-center gap-2 border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-1.5 text-xs font-semibold text-[var(--color-foreground-soft)]">
            <span class="size-1.5 bg-[var(--color-accent)]" aria-hidden="true" />
            {{ $t('home.hero.eyebrow') }}
          </p>

          <h1 class="text-3xl font-extrabold leading-[1.35] tracking-tight text-[var(--color-foreground)] lg:text-5xl lg:leading-[1.25]">
            {{ $t('home.hero.title') }}
          </h1>

          <p class="mt-6 max-w-xl text-base leading-8 text-[var(--color-muted)] lg:text-lg">
            {{ $t('home.hero.description') }}
          </p>

          <div class="mt-8 flex flex-wrap items-center gap-3">
            <UButton :to="localePath('/quote')" size="xl" color="primary">
              {{ $t('home.hero.primaryCta') }}
            </UButton>
            <UButton :to="localePath('/services')" size="xl" color="neutral" variant="outline">
              {{ $t('home.hero.secondaryCta') }}
            </UButton>
          </div>
        </div>

        <div class="lg:col-span-6">
          <div class="relative border border-[var(--color-border)]">
            <img
              src="/photos/press-hall.jpg"
              :alt="$t('home.hero.imageAlt')"
              width="1408"
              height="768"
              fetchpriority="high"
              class="aspect-[16/10] w-full object-cover"
            >
          </div>
        </div>
      </div>

      <!-- Key figures strip -->
      <dl class="grid grid-cols-2 gap-8 border-t border-[var(--color-border)] py-10 lg:grid-cols-4 lg:gap-10">
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
