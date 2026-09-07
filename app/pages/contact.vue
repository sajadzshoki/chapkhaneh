<script setup lang="ts">
const { t } = useI18n()
const { site, localized } = useSite()
const localePath = useLocalePath()

const socialIcons: Record<string, string> = {
  instagram: 'i-lucide-instagram',
  linkedin: 'i-lucide-linkedin',
  telegram: 'i-lucide-send',
  whatsapp: 'i-lucide-message-circle',
  x: 'i-lucide-twitter',
  aparat: 'i-lucide-play',
}

useHead({ title: () => t('contact.title') })
useSeoMeta({
  title: () => t('contact.title'),
  description: () => t('contact.intro'),
  ogTitle: () => t('contact.title'),
  ogDescription: () => t('contact.intro'),
})
</script>

<template>
  <div>
    <UiPageHero :title="$t('contact.title')" :description="$t('contact.intro')" />

    <UiPageContainer class="py-12 lg:py-16">
      <div class="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
        <div class="lg:col-span-7">
          <dl class="grid grid-cols-1 gap-px bg-[var(--color-border)] sm:grid-cols-2">
            <div class="bg-[var(--color-surface)] p-6">
              <dt class="flex items-center gap-2 text-sm text-[var(--color-muted)]">
                <UIcon name="i-lucide-phone" class="size-4" aria-hidden="true" />
                {{ $t('contact.phone') }}
              </dt>
              <dd class="mt-3 space-y-1">
                <p v-for="phone in site.contact.phones" :key="phone">
                  <a :href="`tel:${phone}`" class="font-bold text-[var(--color-foreground)] tabular hover:text-[var(--color-primary)]">
                    {{ phone }}
                  </a>
                </p>
              </dd>
            </div>

            <div v-if="site.contact.fax" class="bg-[var(--color-surface)] p-6">
              <dt class="flex items-center gap-2 text-sm text-[var(--color-muted)]">
                <UIcon name="i-lucide-printer" class="size-4" aria-hidden="true" />
                {{ $t('contact.fax') }}
              </dt>
              <dd class="mt-3 font-bold text-[var(--color-foreground)] tabular">{{ site.contact.fax }}</dd>
            </div>

            <div class="bg-[var(--color-surface)] p-6">
              <dt class="flex items-center gap-2 text-sm text-[var(--color-muted)]">
                <UIcon name="i-lucide-mail" class="size-4" aria-hidden="true" />
                {{ $t('contact.email') }}
              </dt>
              <dd class="mt-3">
                <a :href="`mailto:${site.contact.email}`" class="font-bold text-[var(--color-foreground)] hover:text-[var(--color-primary)]">
                  {{ site.contact.email }}
                </a>
              </dd>
            </div>

            <div v-if="site.contact.salesEmail" class="bg-[var(--color-surface)] p-6">
              <dt class="flex items-center gap-2 text-sm text-[var(--color-muted)]">
                <UIcon name="i-lucide-briefcase" class="size-4" aria-hidden="true" />
                {{ $t('contact.salesEmail') }}
              </dt>
              <dd class="mt-3">
                <a :href="`mailto:${site.contact.salesEmail}`" class="font-bold text-[var(--color-foreground)] hover:text-[var(--color-primary)]">
                  {{ site.contact.salesEmail }}
                </a>
              </dd>
            </div>

            <div class="bg-[var(--color-surface)] p-6 sm:col-span-2">
              <dt class="flex items-center gap-2 text-sm text-[var(--color-muted)]">
                <UIcon name="i-lucide-map-pin" class="size-4" aria-hidden="true" />
                {{ $t('contact.address') }}
              </dt>
              <dd class="mt-3">
                <address class="not-italic leading-8 text-[var(--color-foreground)]">
                  {{ localized(site.contact.address) }}
                </address>
                <p v-if="site.contact.postalCode" class="mt-2 text-sm text-[var(--color-muted)] tabular">
                  {{ $t('contact.postalCode') }}: {{ site.contact.postalCode }}
                </p>
                <UButton
                  v-if="site.contact.mapUrl"
                  :to="site.contact.mapUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outline"
                  color="neutral"
                  size="sm"
                  class="mt-4"
                  icon="i-lucide-external-link"
                >
                  {{ $t('contact.viewOnMap') }}
                </UButton>
              </dd>
            </div>
          </dl>
        </div>

        <aside class="lg:col-span-5">
          <div class="border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-6">
            <h2 class="text-lg font-bold text-[var(--color-foreground)]">
              {{ $t('contact.workingHours') }}
            </h2>
            <ul class="mt-4 space-y-3 text-sm">
              <li
                v-for="(entry, index) in site.workingHours"
                :key="index"
                class="flex items-center justify-between gap-4 border-b border-[var(--color-border)] pb-3 last:border-0 last:pb-0"
              >
                <span class="text-[var(--color-foreground-soft)]">{{ localized(entry.days) }}</span>
                <span class="font-bold text-[var(--color-foreground)] tabular">{{ localized(entry.hours) }}</span>
              </li>
            </ul>

            <h2 class="mt-8 text-lg font-bold text-[var(--color-foreground)]">
              {{ $t('contact.social') }}
            </h2>
            <ul class="mt-4 flex flex-wrap gap-2">
              <li v-for="link in site.social" :key="link.platform">
                <a
                  :href="link.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-2 border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-foreground-soft)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                >
                  <UIcon :name="socialIcons[link.platform] ?? 'i-lucide-link'" class="size-4" aria-hidden="true" />
                  {{ link.label }}
                </a>
              </li>
            </ul>

            <UButton :to="localePath('/quote')" color="primary" size="lg" block class="mt-8">
              {{ $t('common.getQuote') }}
            </UButton>
          </div>
        </aside>
      </div>

      <!-- Location block. A real map embed is deliberately avoided; this is a
           styled, accessible summary with a link out to the map provider. -->
      <section class="mt-12 border border-[var(--color-border)]">
        <div class="grid grid-cols-1 lg:grid-cols-12">
          <div class="bg-[var(--color-secondary)] p-8 text-white lg:col-span-5">
            <h2 class="text-lg font-bold">{{ $t('contact.location') }}</h2>
            <address class="mt-4 not-italic leading-8 text-white/75">
              {{ localized(site.contact.address) }}
            </address>
            <p v-if="site.contact.postalCode" class="mt-3 text-sm text-white/55 tabular">
              {{ $t('contact.postalCode') }}: {{ site.contact.postalCode }}
            </p>
            <UButton
              v-if="site.contact.mapUrl"
              :to="site.contact.mapUrl"
              target="_blank"
              rel="noopener noreferrer"
              color="neutral"
              size="md"
              class="mt-6 bg-white text-[var(--color-secondary)] hover:bg-white/90"
              icon="i-lucide-external-link"
            >
              {{ $t('contact.viewOnMap') }}
            </UButton>
          </div>

          <div class="flex items-center bg-[var(--color-surface-muted)] p-8 lg:col-span-7">
            <div>
              <UIcon name="i-lucide-map-pin" class="size-7 text-[var(--color-primary)]" aria-hidden="true" />
              <p class="mt-4 leading-8 text-[var(--color-foreground-soft)]">
                {{ $t('contact.locationNote') }}
              </p>
            </div>
          </div>
        </div>
      </section>
    </UiPageContainer>

    <UiCtaSection
      :title="$t('contact.quoteCta.title')"
      :description="$t('contact.quoteCta.description')"
      :primary-label="$t('common.getQuote')"
      :primary-to="localePath('/quote')"
      :secondary-label="$t('nav.services')"
      :secondary-to="localePath('/services')"
    />
  </div>
</template>
