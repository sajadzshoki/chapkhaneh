<script setup lang="ts">
import { isValidEmail, isValidPhone } from '~/utils/validation'
import { formatNumber, toAsciiDigits } from '~/utils/format'
import type { LocaleCode } from '~~/shared/types'

/**
 * Public quote request form.
 *
 * A single page rather than a wizard: there are only three short sections, and
 * a printing customer should be able to see the whole enquiry before sending
 * it. Sections group the fields; they are not steps.
 */
const { t, locale } = useI18n()
const { L } = useLocalizedContent()
const localePath = useLocalePath()
const quoteStore = useQuoteStore()

const form = reactive({
  fullName: '',
  company: '',
  phone: '',
  email: '',
  serviceSlug: '',
  quantity: '',
  neededBy: '',
  description: '',
})

const file = ref<File | null>(null)
const errors = reactive<Record<string, string>>({})

const { data: services } = await useServices()

/**
 * Only active services are quotable. The public endpoint already filters on
 * `isActive`, so the options list is inherently correct.
 */
const serviceOptions = computed(() =>
  services.value
    .slice()
    .sort((a, b) => a.order - b.order)
    .map(service => ({ value: service.slug, label: L(service.title) ?? service.slug })),
)

/**
 * Applies the service pre-selected from a service detail page.
 *
 * If that service has since been deactivated or removed it will not be in the
 * options, so the field is left empty and the customer simply picks one —
 * rather than the form silently submitting a slug the server will reject.
 */
watchEffect(() => {
  const preselected = quoteStore.preselectedService
  if (!preselected || form.serviceSlug) return

  if (serviceOptions.value.some(option => option.value === preselected)) {
    form.serviceSlug = preselected
  }
})

const DESCRIPTION_MAX = 4000
const descriptionCount = computed(() => form.description.trim().length)
const counterLabel = computed(() =>
  `${formatNumber(descriptionCount.value, locale.value as LocaleCode)} / ${formatNumber(DESCRIPTION_MAX, locale.value as LocaleCode)}`)

/** Mirrors the server contract: name, phone, service and description only. */
function validate(): boolean {
  for (const key of Object.keys(errors)) delete errors[key]

  if (!form.fullName.trim()) errors.fullName = t('quote.validation.fullNameRequired')
  else if (form.fullName.trim().length < 2) errors.fullName = t('quote.validation.fullNameRequired')

  if (!form.phone.trim()) errors.phone = t('quote.validation.phoneRequired')
  else if (!isValidPhone(form.phone)) errors.phone = t('quote.validation.phoneInvalid')

  if (form.email.trim() && !isValidEmail(form.email)) {
    errors.email = t('quote.validation.emailInvalid')
  }

  if (!form.serviceSlug) errors.serviceSlug = t('quote.validation.serviceRequired')

  // Quantity is optional, but must be a sensible number when supplied.
  const raw = form.quantity.trim()
  if (raw) {
    const quantity = Number(toAsciiDigits(raw))
    if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isInteger(quantity)) {
      errors.quantity = t('quote.validation.quantityInvalid')
    }
  }

  if (!form.description.trim()) errors.description = t('quote.validation.descriptionRequired')
  else if (form.description.trim().length < 20) {
    errors.description = t('quote.validation.descriptionTooShort')
  }
  else if (form.description.trim().length > DESCRIPTION_MAX) {
    errors.description = t('quote.validation.descriptionTooLong')
  }

  if (file.value) {
    const issue = checkFile(file.value)
    if (issue) errors.file = t(`quote.validation.${issue}`)
  }

  return Object.keys(errors).length === 0
}

const submitting = computed(() => quoteStore.state === 'submitting')

/** Maps server field issues onto the same error object the inputs already read. */
function applyServerIssues() {
  const issues = quoteStore.fieldIssues
  const FIELD_KEYS: Record<string, string> = {
    fullName: 'quote.validation.fullNameRequired',
    phone: 'quote.validation.phoneInvalid',
    email: 'quote.validation.emailInvalid',
    serviceSlug: 'quote.validation.serviceUnavailable',
    quantity: 'quote.validation.quantityInvalid',
    description: 'quote.validation.descriptionRequired',
  }

  for (const [field, messages] of Object.entries(issues)) {
    if (field === 'file') {
      // The server returns a stable code, e.g. `fileTooLarge`.
      const code = messages?.[0] ?? 'fileType'
      errors.file = t(`quote.validation.${code}`)
      continue
    }
    if (FIELD_KEYS[field]) errors[field] = t(FIELD_KEYS[field])
  }
}

async function onSubmit() {
  if (submitting.value) return
  if (!validate()) {
    // Move focus to the first problem so the customer is not left guessing.
    await nextTick()
    document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
    return
  }

  const quantity = form.quantity.trim()

  const ok = await quoteStore.submit({
    fullName: form.fullName.trim(),
    company: form.company.trim() || undefined,
    phone: toAsciiDigits(form.phone).trim(),
    email: form.email.trim() || undefined,
    serviceSlug: form.serviceSlug,
    quantity: quantity ? Number(toAsciiDigits(quantity)) : undefined,
    description: form.description.trim(),
    neededBy: form.neededBy || undefined,
    locale: locale.value,
  }, file.value)

  if (!ok) {
    // Values are deliberately preserved so nothing the customer typed is lost.
    applyServerIssues()
    await nextTick()
    document.getElementById('quote-error')?.focus()
  }
}

/** Clears the form for a second enquiry after a successful submission. */
function startAnother() {
  Object.assign(form, {
    fullName: '', company: '', phone: '', email: '',
    serviceSlug: '', quantity: '', neededBy: '', description: '',
  })
  file.value = null
  for (const key of Object.keys(errors)) delete errors[key]
  quoteStore.reset()
}

const errorMessage = computed(() => {
  if (quoteStore.errorCode === 'rateLimited') return t('quote.error.rateLimited')
  if (quoteStore.errorCode === 'validation') return t('quote.error.validation')
  return t('quote.error.description')
})

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
            class="border border-[var(--color-success)] bg-[var(--color-surface)] p-8 lg:p-10"
            role="status"
            aria-live="polite"
          >
            <span
              class="flex size-14 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)]"
            >
              <UIcon
                name="i-lucide-circle-check"
                class="size-8 text-[var(--color-success)]"
                aria-hidden="true"
              />
            </span>

            <h2 class="mt-5 text-2xl font-bold text-[var(--color-foreground)]">
              {{ $t('quote.success.title') }}
            </h2>
            <p class="mt-3 max-w-xl leading-relaxed text-[var(--color-foreground-soft)]">
              {{ $t('quote.success.description') }}
            </p>

            <div class="mt-6 border-t border-[var(--color-border)] pt-6">
              <p class="text-sm font-semibold text-[var(--color-foreground-soft)]">
                {{ $t('quote.success.nextStepsTitle') }}
              </p>
              <ol class="mt-3 space-y-2 text-sm text-[var(--color-muted)]">
                <li class="flex gap-2.5">
                  <span class="font-bold text-[var(--color-primary)] tabular">{{ formatNumber(1, locale as LocaleCode) }}</span>
                  <span>{{ $t('quote.success.step1') }}</span>
                </li>
                <li class="flex gap-2.5">
                  <span class="font-bold text-[var(--color-primary)] tabular">{{ formatNumber(2, locale as LocaleCode) }}</span>
                  <span>{{ $t('quote.success.step2') }}</span>
                </li>
                <li class="flex gap-2.5">
                  <span class="font-bold text-[var(--color-primary)] tabular">{{ formatNumber(3, locale as LocaleCode) }}</span>
                  <span>{{ $t('quote.success.step3') }}</span>
                </li>
              </ol>
            </div>

            <div class="mt-8 flex flex-wrap gap-3">
              <UButton :to="localePath('/')" color="primary" size="lg">
                {{ $t('quote.success.backHome') }}
              </UButton>
              <UButton :to="localePath('/services')" color="neutral" variant="outline" size="lg">
                {{ $t('quote.success.browseServices') }}
              </UButton>
              <UButton color="neutral" variant="ghost" size="lg" @click="startAnother">
                {{ $t('quote.success.another') }}
              </UButton>
            </div>
          </div>

          <form v-else class="space-y-10" novalidate @submit.prevent="onSubmit">
            <div
              v-if="quoteStore.state === 'error'"
              id="quote-error"
              class="border border-[var(--color-danger)] bg-[var(--color-surface)] p-5"
              role="alert"
              tabindex="-1"
            >
              <p class="font-bold text-[var(--color-danger)]">
                {{ $t('quote.error.title') }}
              </p>
              <p class="mt-1 text-sm text-[var(--color-foreground-soft)]">
                {{ errorMessage }}
              </p>
            </div>

            <!-- Contact -->
            <section>
              <h2 class="text-base font-bold text-[var(--color-foreground)]">
                {{ $t('quote.sections.contact') }}
              </h2>
              <p class="mt-1 text-sm text-[var(--color-muted)]">
                {{ $t('quote.sections.contactHint') }}
              </p>

              <div class="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <QuoteField
                  id="fullName"
                  :label="$t('quote.form.fullName')"
                  required
                  :error="errors.fullName"
                >
                  <input
                    id="fullName"
                    v-model="form.fullName"
                    required
                    type="text"
                    autocomplete="name"
                    :placeholder="$t('quote.form.fullNamePlaceholder')"
                    class="form-input"
                    :aria-invalid="!!errors.fullName"
                    :aria-describedby="errors.fullName ? 'fullName-error' : undefined"
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

                <QuoteField
                  id="phone"
                  :label="$t('quote.form.phone')"
                  required
                  :error="errors.phone"
                >
                  <!-- Phone and email stay LTR regardless of page direction:
                       digits and addresses are read left-to-right. -->
                  <input
                    id="phone"
                    v-model="form.phone"
                    required
                    type="tel"
                    inputmode="tel"
                    autocomplete="tel"
                    dir="ltr"
                    :placeholder="$t('quote.form.phonePlaceholder')"
                    class="form-input text-start"
                    :aria-invalid="!!errors.phone"
                    :aria-describedby="errors.phone ? 'phone-error' : undefined"
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
                    :aria-describedby="errors.email ? 'email-error' : undefined"
                  >
                </QuoteField>
              </div>
            </section>

            <!-- Project -->
            <section>
              <h2 class="text-base font-bold text-[var(--color-foreground)]">
                {{ $t('quote.sections.project') }}
              </h2>
              <p class="mt-1 text-sm text-[var(--color-muted)]">
                {{ $t('quote.sections.projectHint') }}
              </p>

              <div class="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <QuoteField
                  id="serviceSlug"
                  :label="$t('quote.form.service')"
                  required
                  :error="errors.serviceSlug"
                >
                  <select
                    id="serviceSlug"
                    v-model="form.serviceSlug"
                    required
                    class="form-input"
                    :aria-invalid="!!errors.serviceSlug"
                    :aria-describedby="errors.serviceSlug ? 'serviceSlug-error' : undefined"
                  >
                    <option value="" disabled>
                      {{ $t('quote.form.servicePlaceholder') }}
                    </option>
                    <option
                      v-for="option in serviceOptions"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </option>
                  </select>
                </QuoteField>

                <QuoteField
                  id="quantity"
                  :label="$t('quote.form.quantity')"
                  :error="errors.quantity"
                >
                  <input
                    id="quantity"
                    v-model="form.quantity"
                    type="text"
                    inputmode="numeric"
                    :placeholder="$t('quote.form.quantityPlaceholder')"
                    class="form-input"
                    :aria-invalid="!!errors.quantity"
                    :aria-describedby="errors.quantity ? 'quantity-error' : undefined"
                  >
                </QuoteField>

                <QuoteField
                  id="neededBy"
                  :label="$t('quote.form.neededBy')"
                  class="sm:col-span-2"
                >
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
                    required
                    rows="6"
                    :maxlength="DESCRIPTION_MAX"
                    :placeholder="$t('quote.form.descriptionPlaceholder')"
                    class="form-input resize-y"
                    :aria-invalid="!!errors.description"
                    :aria-describedby="errors.description ? 'description-error' : 'description-count'"
                  />
                  <p
                    id="description-count"
                    class="mt-1.5 text-end text-xs text-[var(--color-muted)] tabular"
                  >
                    {{ counterLabel }}
                  </p>
                </QuoteField>
              </div>
            </section>

            <!-- Attachment -->
            <section>
              <h2 class="text-base font-bold text-[var(--color-foreground)]">
                {{ $t('quote.sections.attachment') }}
              </h2>
              <p class="mt-1 text-sm text-[var(--color-muted)]">
                {{ $t('quote.sections.attachmentHint') }}
              </p>

              <div class="mt-5">
                <QuoteFileUpload
                  id="file"
                  v-model="file"
                  :error="errors.file"
                  :disabled="submitting"
                />
              </div>
            </section>

            <!-- Submit -->
            <div class="border-t border-[var(--color-border)] pt-8">
              <UButton
                type="submit"
                color="primary"
                size="xl"
                :loading="submitting"
                :disabled="submitting"
              >
                {{ submitting ? $t('quote.form.submitting') : $t('quote.form.submit') }}
              </UButton>
              <p class="mt-3 text-xs text-[var(--color-muted)]">
                {{ $t('quote.form.privacyNote') }}
              </p>
            </div>
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
