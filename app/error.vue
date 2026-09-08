<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const localePath = useLocalePath()
const { t } = useI18n()

const isNotFound = computed(() => props.error.statusCode === 404)

useHead({ title: () => (isNotFound.value ? t('states.notFoundTitle') : t('states.errorTitle')) })
</script>

<template>
  <NuxtLayout>
    <UiPageContainer class="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p class="text-6xl font-extrabold text-[var(--color-border-strong)] tabular">
        {{ error.statusCode }}
      </p>
      <h1 class="mt-5 text-2xl font-extrabold tracking-tight text-[var(--color-foreground)] lg:text-3xl">
        {{ isNotFound ? $t('states.notFoundTitle') : $t('states.errorTitle') }}
      </h1>
      <p class="mt-3 max-w-md text-[var(--color-muted)]">
        {{ isNotFound ? $t('states.notFoundDescription') : $t('states.errorDescription') }}
      </p>
      <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
        <UButton color="primary" size="lg" @click="clearError({ redirect: localePath('/') })">
          {{ $t('states.backHome') }}
        </UButton>
        <UButton :to="localePath('/contact')" color="neutral" variant="outline" size="lg">
          {{ $t('common.contactUs') }}
        </UButton>
      </div>
    </UiPageContainer>
  </NuxtLayout>
</template>
