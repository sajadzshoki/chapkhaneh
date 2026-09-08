<script setup lang="ts">
/**
 * Search box plus an arbitrary number of select filters.
 *
 * The search term is debounced so typing does not fire a request per keystroke,
 * while the selects apply immediately — that matches how people use them.
 */
const props = defineProps<{
  search: string
  searchPlaceholder: string
  clearLabel: string
  /** True when at least one filter differs from its default. */
  dirty?: boolean
}>()

const emit = defineEmits<{
  'update:search': [value: string]
  'clear': []
}>()

const localSearch = ref(props.search)
let timer: ReturnType<typeof setTimeout> | undefined

watch(() => props.search, (value) => {
  if (value !== localSearch.value) localSearch.value = value
})

watch(localSearch, (value) => {
  clearTimeout(timer)
  timer = setTimeout(() => emit('update:search', value), 300)
})

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div class="mb-4 flex flex-wrap items-center gap-2">
    <UInput
      v-model="localSearch"
      icon="i-lucide-search"
      :placeholder="searchPlaceholder"
      class="w-full sm:w-64"
    />
    <slot />
    <UButton
      v-if="dirty"
      color="neutral"
      variant="ghost"
      icon="i-lucide-x"
      @click="emit('clear')"
    >
      {{ clearLabel }}
    </UButton>
  </div>
</template>
