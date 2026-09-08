<script setup lang="ts">
const items = [
  { key: 'quality', icon: 'i-lucide-target' },
  { key: 'capacity', icon: 'i-lucide-factory' },
  { key: 'integrated', icon: 'i-lucide-workflow' },
  { key: 'onTime', icon: 'i-lucide-calendar-check' },
] as const
</script>

<template>
  <section class="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
    <UiPageContainer class="py-16 lg:py-24">
      <div class="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        <div class="lg:col-span-5">
          <UiSectionHeader
            :eyebrow="$t('home.why.eyebrow')"
            :title="$t('home.why.title')"
            :description="$t('home.why.description')"
          />
          <div class="mt-8 border border-[var(--color-border)]">
            <img
              src="/photos/quality-control.jpg"
              :alt="$t('home.why.items.quality.title')"
              width="1024"
              height="683"
              loading="lazy"
              class="aspect-[3/2] w-full object-cover"
            >
          </div>
        </div>

        <ul class="grid grid-cols-1 gap-px self-start bg-[var(--color-border)] sm:grid-cols-2 lg:col-span-7">
          <li
            v-for="item in items"
            :key="item.key"
            class="bg-[var(--color-surface)] p-7"
          >
            <UIcon :name="item.icon" class="size-6 text-[var(--color-primary)]" aria-hidden="true" />
            <h3 class="mt-4 font-bold text-[var(--color-foreground)]">
              {{ $t(`home.why.items.${item.key}.title`) }}
            </h3>
            <p class="mt-2 text-sm leading-7 text-[var(--color-muted)]">
              {{ $t(`home.why.items.${item.key}.description`) }}
            </p>
          </li>
        </ul>
      </div>
    </UiPageContainer>
  </section>
</template>
