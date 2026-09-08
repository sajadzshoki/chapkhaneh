<script setup lang="ts">
const localePath = useLocalePath()

const points = ['experience', 'quality', 'equipment', 'capacity', 'team'] as const
</script>

<template>
  <section class="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
    <UiPageContainer class="py-16 lg:py-24">
      <div class="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <div class="lg:col-span-6">
          <div class="border border-[var(--color-border)]">
            <img
              src="/photos/facility-exterior.jpg"
              :alt="$t('home.about.imageAlt')"
              width="1408"
              height="768"
              loading="lazy"
              class="aspect-[4/3] w-full object-cover"
            >
          </div>
        </div>

        <div class="lg:col-span-6">
          <UiSectionHeader
            :eyebrow="$t('home.about.eyebrow')"
            :title="$t('home.about.title')"
            :description="$t('home.about.description')"
          />

          <ul class="mt-8 space-y-4">
            <li
              v-for="point in points"
              :key="point"
              class="flex items-start gap-3 text-sm leading-7 text-[var(--color-foreground-soft)]"
            >
              <UIcon
                name="i-lucide-check"
                class="mt-1.5 size-4 shrink-0 text-[var(--color-primary)]"
                aria-hidden="true"
              />
              <span>{{ $t(`home.about.points.${point}`) }}</span>
            </li>
          </ul>

          <UButton
            :to="localePath('/about')"
            color="neutral"
            variant="outline"
            size="lg"
            class="mt-8"
          >
            {{ $t('home.about.cta') }}
          </UButton>
        </div>
      </div>
    </UiPageContainer>
  </section>
</template>
