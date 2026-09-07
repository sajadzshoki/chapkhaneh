<template>
  <div class="flex min-h-screen flex-col bg-[var(--color-background)]">
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-[100] focus:bg-[var(--color-primary)] focus:px-4 focus:py-2 focus:text-white"
    >
      {{ $t('nav.skipToContent') }}
    </a>

    <AppHeader />

    <main id="main-content" class="flex-1">
      <slot />
    </main>

    <AppFooter />
  </div>
</template>
