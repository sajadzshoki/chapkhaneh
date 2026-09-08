<script setup lang="ts">
/**
 * Admin login. Uses no layout — a focused, standalone screen.
 * The `admin-auth` middleware bounces an already-authenticated admin to /admin.
 */
definePageMeta({
  layout: false,
  middleware: 'admin-auth',
})
// The admin panel is an internal single-language tool: keep it out of the
// public i18n routing so no /en/admin duplicates are generated.
defineI18nRoute(false)

const { t } = useI18n()

useHead({ title: () => `${t('admin.login.title')} — ${t('admin.brand')}` })

const { login } = useAdminAuth()
const route = useRoute()

const email = ref('')
const password = ref('')
const pending = ref(false)
const error = ref('')

async function onSubmit() {
  error.value = ''
  pending.value = true

  try {
    await login(email.value, password.value)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/admin'
    // Only allow internal redirects, never an attacker-supplied absolute URL.
    await navigateTo(redirect.startsWith('/admin') ? redirect : '/admin')
  }
  catch (err) {
    const status = (err as { statusCode?: number }).statusCode
    error.value = status === 401
      ? 'Invalid email or password.'
      : status === 422
        ? 'Please enter a valid email address and password.'
        : 'Sign-in is unavailable right now. Please try again.'
  }
  finally {
    pending.value = false
  }
}
</script>

<template>
  <div dir="ltr" class="flex min-h-screen items-center justify-center bg-[var(--color-surface-muted)] p-6">
    <div class="w-full max-w-sm">
      <div class="mb-8 flex items-center justify-center gap-2.5">
        <img src="/brand/mark.svg" alt="" aria-hidden="true" width="36" height="36" class="size-9">
        <span class="text-lg font-bold text-[var(--color-foreground)]">{{ t('admin.brand') }}</span>
      </div>

      <div class="border border-[var(--color-border)] bg-[var(--color-surface)] p-7">
        <h1 class="text-lg font-bold text-[var(--color-foreground)]">
          Admin sign in
        </h1>
        <p class="mt-1.5 text-sm text-[var(--color-muted)]">
          Sign in to manage website content.
        </p>

        <form class="mt-6 space-y-4" novalidate @submit.prevent="onSubmit">
          <div
            v-if="error"
            role="alert"
            class="flex items-start gap-2 border border-[var(--color-danger)]/25 bg-[var(--color-danger)]/6 p-3 text-sm text-[var(--color-danger)]"
          >
            <UIcon name="i-lucide-triangle-alert" class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{{ error }}</span>
          </div>

          <div>
            <label for="admin-email" class="mb-1.5 block text-sm font-medium">Email</label>
            <input
              id="admin-email"
              v-model="email"
              type="email"
              name="email"
              autocomplete="username"
              required
              class="w-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus-visible:border-[var(--color-primary)] focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/20"
            >
          </div>

          <div>
            <label for="admin-password" class="mb-1.5 block text-sm font-medium">Password</label>
            <input
              id="admin-password"
              v-model="password"
              type="password"
              name="password"
              autocomplete="current-password"
              required
              class="w-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus-visible:border-[var(--color-primary)] focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/20"
            >
          </div>

          <UButton
            type="submit"
            color="primary"
            size="lg"
            block
            :loading="pending"
            :disabled="!email || !password"
          >
            Sign in
          </UButton>
        </form>
      </div>

      <NuxtLink
        to="/"
        class="mt-5 flex items-center justify-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-primary)]"
      >
        <UIcon name="i-lucide-chevron-left" class="size-4" aria-hidden="true" />
        Back to website
      </NuxtLink>
    </div>
  </div>
</template>
