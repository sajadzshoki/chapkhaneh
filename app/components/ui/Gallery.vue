<script setup lang="ts">
import type { ImageAsset } from '~~/shared/types'

/**
 * Simple, dependency-free project gallery: one large frame plus a thumbnail
 * strip. Deliberately not a modal lightbox — a corporate portfolio reads better
 * inline, and it avoids a focus-trap implementation for no real benefit.
 */
const props = defineProps<{ images: ImageAsset[] }>()

const { L } = useLocalizedContent()
const activeIndex = ref(0)

// Guard against the active index dangling if the image list ever changes.
watch(() => props.images.length, (length) => {
  if (activeIndex.value >= length) activeIndex.value = 0
})

const active = computed(() => props.images[activeIndex.value])

function select(index: number) {
  activeIndex.value = index
}

/** Arrow-key navigation across the thumbnail strip. */
function onKeydown(event: KeyboardEvent, index: number) {
  const last = props.images.length - 1
  let next: number | null = null

  if (event.key === 'ArrowRight') next = index === last ? 0 : index + 1
  else if (event.key === 'ArrowLeft') next = index === 0 ? last : index - 1
  else if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = last
  if (next === null) return

  event.preventDefault()
  activeIndex.value = next
  const strip = event.currentTarget as HTMLElement
  const buttons = strip.parentElement?.querySelectorAll<HTMLElement>('[data-thumb]')
  buttons?.[next]?.focus()
}
</script>

<template>
  <div v-if="images.length">
    <figure class="border border-[var(--color-border)] bg-[var(--color-surface-muted)]">
      <img
        v-if="active"
        :src="active.src"
        :alt="L(active.alt) ?? ''"
        :width="active.width ?? 800"
        :height="active.height ?? 600"
        class="aspect-[4/3] w-full object-cover"
      >
      <figcaption
        v-if="images.length > 1"
        class="border-t border-[var(--color-border)] px-4 py-2 text-xs text-[var(--color-muted)] tabular"
      >
        {{ $t('portfolio.imageCounter', { current: activeIndex + 1, total: images.length }) }}
      </figcaption>
    </figure>

    <div
      v-if="images.length > 1"
      class="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5"
      role="group"
      :aria-label="$t('portfolio.gallery')"
    >
      <button
        v-for="(image, index) in images"
        :key="image.src"
        data-thumb
        type="button"
        class="border transition-colors"
        :class="index === activeIndex
          ? 'border-[var(--color-primary)]'
          : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]'"
        :aria-current="index === activeIndex ? 'true' : undefined"
        :aria-label="`${$t('portfolio.viewImage')} — ${L(image.alt) ?? ''}`"
        @click="select(index)"
        @keydown="onKeydown($event, index)"
      >
        <img
          :src="image.src"
          alt=""
          aria-hidden="true"
          loading="lazy"
          width="200"
          height="150"
          class="aspect-[4/3] w-full object-cover"
        >
      </button>
    </div>
  </div>
</template>
