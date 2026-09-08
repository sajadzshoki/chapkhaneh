<script setup lang="ts">
import type { EquipmentDto } from '~/composables/useContent'

/**
 * Equipment card.
 *  - `default` — full spec list (equipment page)
 *  - `compact` — manufacturer, model and description only (homepage / about)
 */
withDefaults(defineProps<{
  item: EquipmentDto
  variant?: 'default' | 'compact'
  /** Optional destination; when set the whole card becomes clickable. */
  to?: string
}>(), { variant: 'default' })

const { L } = useLocalizedContent()
</script>

<template>
  <article
    class="relative flex h-full flex-col border border-[var(--color-border)] bg-[var(--color-surface)] p-6 lg:p-7"
    :class="to ? 'transition-colors duration-200 hover:border-[var(--color-primary)]' : ''"
  >
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)]">
          {{ item.manufacturer }}
        </p>
        <h3 class="mt-1.5 text-lg font-bold text-[var(--color-foreground)]">
          <NuxtLink v-if="to" :to="to" class="after:absolute after:inset-0 after:content-['']">
            {{ L(item.title) }}
          </NuxtLink>
          <template v-else>{{ L(item.title) }}</template>
        </h3>
        <p class="mt-1 text-sm text-[var(--color-muted)]">
          {{ $t('equipment.model') }}: <span class="tabular">{{ item.name }}</span>
        </p>
      </div>
      <span class="shrink-0 border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-2 py-1 text-xs font-semibold text-[var(--color-foreground-soft)]">
        {{ $t(`equipment.types.${item.type}`) }}
      </span>
    </div>

    <p class="mt-4 flex-1 text-sm leading-7 text-[var(--color-muted)]">
      {{ L(item.description) }}
    </p>

    <template v-if="variant === 'default'">
      <h4 class="mt-6 text-xs font-bold uppercase tracking-widest text-[var(--color-muted)]">
        {{ $t('equipment.capabilities') }}
      </h4>
      <dl class="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 border-t border-[var(--color-border)] pt-4 text-sm sm:grid-cols-2">
        <div
          v-for="spec in item.specs"
          :key="L(spec.label)"
          class="flex items-baseline justify-between gap-3"
        >
          <dt class="text-[var(--color-muted)]">
            {{ L(spec.label) }}
          </dt>
          <dd class="text-end font-semibold text-[var(--color-foreground)] tabular">
            {{ L(spec.value) }}
          </dd>
        </div>
      </dl>
    </template>

    <p
      v-else
      class="mt-5 border-t border-[var(--color-border)] pt-4 text-xs text-[var(--color-muted)] tabular"
    >
      {{ $t('equipment.installedYear') }}: {{ item.installedYear }}
    </p>
  </article>
</template>
