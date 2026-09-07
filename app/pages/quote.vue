<script setup lang="ts">
import { services } from '~~/shared/data/services'
import type { QuoteRequestInput, LocaleCode } from '~~/shared/types'
import { isValidEmail, isValidPhone } from '~/utils/validation'
import { toAsciiDigits } from '~/utils/format'

const { t, locale } = useI18n()
const { L } = useLocalizedContent()
const quoteStore = useQuoteStore()

const form = reactive({
  fullName: '',
  company: '',
  phone: '',
  email: '',
  serviceSlug: quoteStore.preselectedService ?? '',
  quantity: '',
  neededBy: '',
  description: '',
})

const errors = reactive<Record<string, string>>({})

const serviceOptions = computed(() =>
  services
    .slice()
    .sort((a, b) => a.order - b.order)
    .map(s => ({ value: s.slug, label: L(s.title) ?? s.slug })),
)

function validate(): boolean {
  for (const key of Object.keys(errors)) delete errors[key]

  if (!form.fullName.trim()) errors.fullName = t('quote.validation.fullNameRequired')
  if (!form.phone.trim()) errors.phone = t('quote.validation.phoneRequired')
  else if (!isValidPhone(form.phone)) errors.phone = t('quote.validation.phoneInvalid')
  if (form.email.trim() && !isValidEmail(form.email)) errors.email = t('quote.validation.emailInvalid')
  if (!form.serviceSlug) errors.serviceSlug = t('quote.validation.serviceRequired')

  const quantity = Number(toAsciiDigits(form.quantity))
  if (!Number.isFinite(quantity) || quantity <= 0) errors.quantity = t('quote.validation.quantityInvalid')

  if (!form.description.trim()) errors.description = t('quote.validation.descriptionRequired')
  else if (form.description.trim().length < 20) errors.description = t('quote.validation.descriptionTooShort')

  return Object.keys(errors).length === 0
}

async function onSubmit() {
  if (!validate()) return

  const payload: QuoteRequestInput = {
    fullName: form.fullName.trim(),
    company: form.company.trim() || undefined,
    phone: toAsciiDigits(form.phone).trim(),
    email: form.email.trim() || undefined,
    serviceSlug: form.serviceSlug,
    quantity: Number(toAsciiDigits(form.quantity)),
    description: form.description.trim(),
    neededBy: form.neededBy || undefined,
    locale: locale.value as LocaleCode,
  }

  const ok = await quoteStore.submit(payload)
  if (ok) {
    Object.assign(form, {
      fullName: '', company: '', phone: '', email: '',
      serviceSlug: '', quantity: '', neededBy: '', description: '',
    })
  }
}

onBeforeUnmount(() => quoteStore.reset())

useHead({ title: () => t('quote.title') })
useSeoMeta({ description: () => t('quote.description') })
</script>

<template>
  <div>
    <UiPageHero :title="$t('quote.title')" :description="$t('quote.description')" />

    <UiPageContainer class="py-12 lg:py-16">
      <div class="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
        <div class="lg:col-span-8">
          <!-- Success -->
          <div
            v-if="quoteStore.state === 'success'"
            class="border border-[var(--color-success)] bg-[var(--color-surface)] p-8"
            role="status"
          >
            <UIcon name="i-lucide-circle-check" class="size-8 text-[var(--color-success)]" aria-hidden="true" />
            <h2 class="mt-4 text-xl font-bold text-[var(--color-foreground)]">
              {{ $t('quote.success.title') }}
            </h2>
            <p class="mt-2 text-[var(--color-muted)]">
              {{ $t('quote.success.description') }}
            </p>
            <UButton class="mt-6" variant="outline" color="neutral" @click="quoteStore.reset()">
              {{ $t('quote.title') }}
            </UButton>
          </div>

          <form v-else class="space-y-6" novalidate @submit.prevent="onSubmit">
            <div
              v-if="quoteStore.state === 'error'"
              class="border border-[var(--color-danger)] bg-[var(--color-surface)] p-5"
              role="alert"
            >
              <p class="font-bold text-[var(--color-danger)]">{{ $t('quote.error.title') }}</p>
              <p class="mt-1 text-sm text-[var(--color-muted)]">{{ $t('quote.error.description') }}</p>
            </div>

            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <QuoteField id="fullName" :label="$t('quote.form.fullName')" required :error="errors.fullName">
                <input
                  id="fullName"
                  v-model="form.fullName"
                  type="text"
                  autocomplete="name"
                  :placeholder="$t('quote.form.fullNamePlaceholder')"
                  class="form-input"
                  :aria-invalid="!!errors.fullName"
                >
              </QuoteField>

              <QuoteField id="company" :label="$t('quote.form.company')">
                <input
                  id="company"
                  v-model="form.company"
                  type="text"
                  autocomplete="organization"
                  :placeholder="$t('quote.form.companyPlaceholder')"
                  class="form-input"
                >
              </QuoteField>

              <QuoteField id="phone" :label="$t('quote.form.phone')" required :error="errors.phone">
                <input
                  id="phone"
                  v-model="form.phone"
                  type="tel"
                  inputmode="tel"
                  autocomplete="tel"
                  dir="ltr"
                  :placeholder="$t('quote.form.phonePlaceholder')"
                  class="form-input text-start"
                  :aria-invalid="!!errors.phone"
                >
              </QuoteField>

              <QuoteField id="email" :label="$t('quote.form.email')" :error="errors.email">
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  autocomplete="email"
                  dir="ltr"
                  :placeholder="$t('quote.form.emailPlaceholder')"
                  class="form-input text-start"
                  :aria-invalid="!!errors.email"
                >
              </QuoteField>

              <QuoteField id="serviceSlug" :label="$t('quote.form.service')" required :error="errors.serviceSlug">
                <select
                  id="serviceSlug"
                  v-model="form.serviceSlug"
                  class="form-input"
                  :aria-invalid="!!errors.serviceSlug"
                >
                  <option value="" disabled>{{ $t('quote.form.servicePlaceholder') }}</option>
                  <option v-for="option in serviceOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </QuoteField>

              <QuoteField id="quantity" :label="$t('quote.form.quantity')" required :error="errors.quantity">
                <input
                  id="quantity"
                  v-model="form.quantity"
                  type="text"
                  inputmode="numeric"
                  :placeholder="$t('quote.form.quantityPlaceholder')"
                  class="form-input"
                  :aria-invalid="!!errors.quantity"
                >
              </QuoteField>

              <QuoteField id="neededBy" :label="$t('quote.form.neededBy')" class="sm:col-span-2">
                <input
                  id="neededBy"
                  v-model="form.neededBy"
                  type="date"
                  dir="ltr"
                  class="form-input text-start"
                >
              </QuoteField>

              <QuoteField
                id="description"
                :label="$t('quote.form.description')"
                required
                :error="errors.description"
                class="sm:col-span-2"
              >
                <textarea
                  id="description"
                  v-model="form.description"
                  rows="6"
                  :placeholder="$t('quote.form.descriptionPlaceholder')"
                  class="form-input resize-y"
                  :aria-invalid="!!errors.description"
                />
              </QuoteField>
            </div>

            <UButton
              type="submit"
              color="primary"
              size="xl"
              :loading="quoteStore.state === 'submitting'"
              :disabled="quoteStore.state === 'submitting'"
            >
              {{ quoteStore.state === 'submitting' ? $t('quote.form.submitting') : $t('quote.form.submit') }}
            </UButton>
          </form>
        </div>

        <aside class="lg:col-span-4">
          <QuoteSidebar />
        </aside>
      </div>
    </UiPageContainer>
  </div>
</template>

<style scoped>
.form-input {
  width: 100%;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  padding: 0.625rem 0.875rem;
  font-size: 0.9375rem;
  color: var(--color-foreground);
  border-radius: var(--radius-sm);
}
.form-input::placeholder {
  color: var(--color-muted);
  opacity: 0.75;
}
.form-input:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
  border-color: var(--color-primary);
}
.form-input[aria-invalid="true"] {
  border-color: var(--color-danger);
}
</style>
