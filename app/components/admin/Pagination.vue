<script setup lang="ts">
/** Range summary plus prev/next, shown only when the list exceeds one page. */
const props = defineProps<{
  page: number
  perPage: number
  total: number
  showingLabel: string
  previousLabel: string
  nextLabel: string
}>()

const emit = defineEmits<{ 'update:page': [value: number] }>()

const pages = computed(() => Math.max(1, Math.ceil(props.total / props.perPage)))
const isFirst = computed(() => props.page <= 1)
const isLast = computed(() => props.page >= pages.value)
</script>

<template>
  <div
    v-if="total > perPage"
    class="mt-4 flex flex-wrap items-center justify-between gap-3"
  >
    <p class="text-sm text-[var(--color-muted)]">
      {{ showingLabel }}
    </p>
    <div class="flex items-center gap-2">
      <UButton
        color="neutral"
        variant="outline"
        size="sm"
        icon="i-lucide-chevron-right"
        class="flip-x"
        :disabled="isFirst"
        @click="emit('update:page', page - 1)"
      >
        {{ previousLabel }}
      </UButton>
      <UButton
        color="neutral"
        variant="outline"
        size="sm"
        trailing-icon="i-lucide-chevron-left"
        :ui="{ trailingIcon: 'flip-x' }"
        :disabled="isLast"
        @click="emit('update:page', page + 1)"
      >
        {{ nextLabel }}
      </UButton>
    </div>
  </div>
</template>
