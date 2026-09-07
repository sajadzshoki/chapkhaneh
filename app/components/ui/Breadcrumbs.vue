<script setup lang="ts">
/**
 * Derives the trail from the current route. Every segment must have a matching
 * `nav.<segment>` translation; unknown segments fall back to the page title.
 */
const props = defineProps<{ currentLabel?: string }>()

const route = useRoute()
const { t, te } = useI18n()
const localePath = useLocalePath()

interface Crumb { label: string, to?: string }

const crumbs = computed<Crumb[]>(() => {
  // Strip the locale prefix so segments map to translation keys.
  const stripped = route.path.replace(/^\/(en|fa)(?=\/|$)/, '')
  const segments = stripped.split('/').filter(Boolean)

  const items: Crumb[] = [{ label: t('nav.home'), to: localePath('/') }]

  segments.forEach((segment, index) => {
    const isLast = index === segments.length - 1
    const key = `nav.${segment}`
    const label = te(key) ? t(key) : (isLast && props.currentLabel ? props.currentLabel : segment)
    items.push({
      label,
      to: isLast ? undefined : localePath(`/${segments.slice(0, index + 1).join('/')}`),
    })
  })

  return items
})
</script>

<template>
  <nav :aria-label="$t('nav.breadcrumb')">
    <ol class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[var(--color-muted)]">
      <li
        v-for="(crumb, index) in crumbs"
        :key="index"
        class="flex items-center gap-x-2"
      >
        <NuxtLink
          v-if="crumb.to"
          :to="crumb.to"
          class="rounded-sm transition-colors hover:text-[var(--color-primary)]"
        >
          {{ crumb.label }}
        </NuxtLink>
        <span
          v-else
          class="font-semibold text-[var(--color-foreground-soft)]"
          aria-current="page"
        >
          {{ crumb.label }}
        </span>

        <UIcon
          v-if="index < crumbs.length - 1"
          name="i-lucide-chevron-right"
          class="size-4 shrink-0 opacity-60 flip-x"
          aria-hidden="true"
        />
      </li>
    </ol>
  </nav>
</template>
