<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
}>()

const emit = defineEmits<{ retry: [] }>()
</script>

<template>
  <div
    class="flex flex-col items-center justify-center border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-16 text-center"
    role="alert"
  >
    <UIcon name="i-lucide-triangle-alert" class="size-8 text-[var(--color-danger)]" aria-hidden="true" />
    <h3 class="mt-4 font-bold text-[var(--color-foreground)]">
      {{ title ?? $t('states.errorTitle') }}
    </h3>
    <p class="mt-2 max-w-md text-sm text-[var(--color-muted)]">
      {{ description ?? $t('states.errorDescription') }}
    </p>
    <UButton class="mt-5" variant="outline" color="neutral" @click="emit('retry')">
      {{ $t('states.retry') }}
    </UButton>
  </div>
</template>
