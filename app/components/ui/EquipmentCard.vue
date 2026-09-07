<script setup lang="ts">
import type { Equipment } from '~~/shared/types'

defineProps<{ item: Equipment }>()

const { L } = useLocalizedContent()
</script>

<template>
  <article class="flex h-full flex-col border border-[var(--color-border)] bg-[var(--color-surface)] p-6 lg:p-7">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h3 class="text-lg font-bold text-[var(--color-foreground)]">
          {{ L(item.title) }}
        </h3>
        <p class="mt-1 text-sm text-[var(--color-muted)]">
          {{ item.manufacturer }} · {{ item.name }}
        </p>
      </div>
      <span class="shrink-0 border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-2 py-1 text-xs font-semibold text-[var(--color-foreground-soft)]">
        {{ $t(`equipment.types.${item.type}`) }}
      </span>
    </div>

    <p class="mt-4 flex-1 text-sm leading-7 text-[var(--color-muted)]">
      {{ L(item.description) }}
    </p>

    <dl class="mt-5 grid grid-cols-1 gap-x-6 gap-y-2 border-t border-[var(--color-border)] pt-4 text-sm sm:grid-cols-2">
      <div
        v-for="spec in item.specs"
        :key="L(spec.label)"
        class="flex items-baseline justify-between gap-3"
      >
        <dt class="text-[var(--color-muted)]">
          {{ L(spec.label) }}
        </dt>
        <dd class="font-semibold text-[var(--color-foreground)] tabular">
          {{ L(spec.value) }}
        </dd>
      </div>
    </dl>
  </article>
</template>
