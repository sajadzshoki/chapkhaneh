<script setup lang="ts">
const { site, localized, companyName } = useSite()
const { L } = useLocalizedContent()
const { mainNav } = useNavigation()
const localePath = useLocalePath()

// Footer renders inside the layout on every page; use the shared handle
// rather than a top-level await so it never suspends the layout.
const { data: services } = useServices()
const footerServices = computed(() => (services.value ?? []).slice(0, 6))
const year = new Date().getFullYear()

const socialIcons: Record<string, string> = {
  instagram: 'i-lucide-instagram',
  linkedin: 'i-lucide-linkedin',
  telegram: 'i-lucide-send',
  whatsapp: 'i-lucide-message-circle',
  x: 'i-lucide-twitter',
  aparat: 'i-lucide-play',
}
</script>

<template>
  <footer class="border-t border-[var(--color-border)] bg-[var(--color-secondary)] text-white">
    <UiPageContainer class="py-14 lg:py-16">
      <div class="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
        <!-- Company summary -->
        <div class="lg:col-span-4">
          <AppLogo inverted />
          <p class="mt-5 max-w-sm text-sm leading-7 text-white/65">
            {{ localized(site.description) }}
          </p>

          <div v-if="site.social.length" class="mt-6">
            <p class="mb-3 text-xs font-bold uppercase tracking-widest text-white/45">
              {{ $t('footer.followUs') }}
            </p>
            <ul class="flex items-center gap-2">
              <li v-for="link in site.social" :key="link.platform">
                <a
                  :href="link.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex size-9 items-center justify-center border border-white/20 text-white/75 transition-colors hover:border-white/50 hover:text-white"
                  :aria-label="link.label"
                >
                  <UIcon :name="socialIcons[link.platform] ?? 'i-lucide-link'" class="size-4" aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <!-- Quick links -->
        <nav class="lg:col-span-2" :aria-label="$t('nav.footerNavigation')">
          <h2 class="mb-4 text-xs font-bold uppercase tracking-widest text-white/45">
            {{ $t('footer.quickLinks') }}
          </h2>
          <ul class="space-y-2.5 text-sm">
            <li v-for="item in mainNav" :key="item.to">
              <NuxtLink
                :to="localePath(item.to)"
                class="text-white/70 transition-colors hover:text-white"
              >
                {{ $t(item.key) }}
              </NuxtLink>
            </li>
          </ul>
        </nav>

        <!-- Services -->
        <div class="lg:col-span-3">
          <h2 class="mb-4 text-xs font-bold uppercase tracking-widest text-white/45">
            {{ $t('footer.servicesTitle') }}
          </h2>
          <ul class="space-y-2.5 text-sm">
            <li v-for="service in footerServices" :key="service.id">
              <NuxtLink
                :to="localePath(`/services/${service.slug}`)"
                class="text-white/70 transition-colors hover:text-white"
              >
                {{ L(service.title) }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Contact + hours -->
        <div class="lg:col-span-3">
          <h2 class="mb-4 text-xs font-bold uppercase tracking-widest text-white/45">
            {{ $t('footer.contactTitle') }}
          </h2>
          <address class="space-y-3 text-sm not-italic text-white/70">
            <p class="leading-7">{{ localized(site.contact.address) }}</p>
            <p v-for="phone in site.contact.phones" :key="phone">
              <a :href="`tel:${phone}`" class="tabular transition-colors hover:text-white">{{ phone }}</a>
            </p>
            <p>
              <a :href="`mailto:${site.contact.email}`" class="transition-colors hover:text-white">
                {{ site.contact.email }}
              </a>
            </p>
          </address>

          <h2 class="mb-3 mt-7 text-xs font-bold uppercase tracking-widest text-white/45">
            {{ $t('footer.workingHoursTitle') }}
          </h2>
          <ul class="space-y-2 text-sm text-white/70">
            <li
              v-for="(entry, index) in site.workingHours"
              :key="index"
              class="flex items-center justify-between gap-4"
            >
              <span>{{ localized(entry.days) }}</span>
              <span class="tabular text-white/55">{{ localized(entry.hours) }}</span>
            </li>
          </ul>
        </div>
      </div>
    </UiPageContainer>

    <div class="border-t border-white/10">
      <UiPageContainer class="flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/50 sm:flex-row">
        <p>© {{ year }} {{ localized(site.legalName) }}. {{ $t('footer.rights') }}</p>
        <p class="tabular">{{ companyName }} — {{ site.contact.postalCode }}</p>
      </UiPageContainer>
    </div>
  </footer>
</template>
