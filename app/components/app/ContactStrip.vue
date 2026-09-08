<script setup lang="ts">
/** Small phone + email row used in the header utility bar. */
const { site, localized } = useSite()
</script>

<template>
  <div class="flex items-center gap-6">
    <a
      v-if="site.contact.phones[0]"
      :href="`tel:${site.contact.phones[0]}`"
      class="inline-flex items-center gap-2 transition-colors hover:text-[var(--color-primary)]"
    >
      <UIcon name="i-lucide-phone" class="size-3.5" aria-hidden="true" />
      <span class="tabular">{{ site.contact.phones[0] }}</span>
    </a>
    <a
      :href="`mailto:${site.contact.email}`"
      class="inline-flex items-center gap-2 transition-colors hover:text-[var(--color-primary)]"
    >
      <UIcon name="i-lucide-mail" class="size-3.5" aria-hidden="true" />
      <span>{{ site.contact.email }}</span>
    </a>
    <span class="inline-flex items-center gap-2">
      <UIcon name="i-lucide-map-pin" class="size-3.5" aria-hidden="true" />
      <span>{{ localized(site.contact.city) }}</span>
    </span>
  </div>
</template>
