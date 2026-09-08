<script setup lang="ts">
const { site, localized } = useSite()

const steps = ['inquiry', 'quote', 'prepress'] as const
</script>

<template>
  <div class="sticky top-28 space-y-6">
    <div class="border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-6">
      <h2 class="text-lg font-bold text-[var(--color-foreground)]">
        {{ $t('home.process.title') }}
      </h2>
      <ol class="mt-5 space-y-5">
        <li v-for="(step, index) in steps" :key="step" class="flex gap-4">
          <span
            class="flex size-7 shrink-0 items-center justify-center border border-[var(--color-border-strong)] text-xs font-bold text-[var(--color-foreground-soft)] tabular"
            aria-hidden="true"
          >
            {{ index + 1 }}
          </span>
          <div>
            <p class="text-sm font-bold text-[var(--color-foreground)]">
              {{ $t(`home.process.steps.${step}.title`) }}
            </p>
            <p class="mt-1 text-xs leading-6 text-[var(--color-muted)]">
              {{ $t(`home.process.steps.${step}.description`) }}
            </p>
          </div>
        </li>
      </ol>
    </div>

    <div class="border border-[var(--color-border)] p-6">
      <h2 class="text-sm font-bold text-[var(--color-foreground)]">
        {{ $t('common.callUs') }}
      </h2>
      <p v-for="phone in site.contact.phones" :key="phone" class="mt-2">
        <a :href="`tel:${phone}`" class="font-bold text-[var(--color-primary)] tabular">{{ phone }}</a>
      </p>
      <p class="mt-4 text-xs leading-6 text-[var(--color-muted)]">
        {{ localized(site.workingHours[0]!.days) }} · {{ localized(site.workingHours[0]!.hours) }}
      </p>
    </div>
  </div>
</template>
