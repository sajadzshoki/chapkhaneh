<script setup lang="ts">
import { EDITABLE_THEME_KEYS, type EditableTheme } from '~~/shared/theme/tokens'
import { isValidHex } from '~~/shared/theme/colors'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
defineI18nRoute(false)

/**
 * Brand colour editor.
 *
 * The administrator edits eight colours; everything else (hover states, the
 * numbered scales Nuxt UI needs, the soft/strong variants) is derived from
 * them — see `shared/theme/tokens.ts`. Exposing nineteen variables would be a
 * design-system editor, which is explicitly not what a printing company owner
 * needs.
 *
 * The preview is *scoped*: the draft palette is applied as inline CSS
 * variables on a preview container, never to the document. Editing a colour
 * therefore cannot alter the live site — or even the surrounding admin
 * chrome — until Save is pressed.
 */
const { t } = useI18n()
const toast = useToast()
const normalize = useAdminError()
const theme = useThemeStore()

useHead({ title: () => `${t('admin.theme.title')} — ${t('admin.brand')}` })

const { data, pending, error, refresh } = await useAsyncData('admin-theme', () =>
  $fetch<EditableTheme>('/api/admin/theme', {
    headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
  }))

watchEffect(() => {
  if (data.value) theme.load(data.value)
})

const saving = ref(false)
const formError = ref('')

/**
 * Starting points, not a marketplace: each preset simply fills the colour
 * fields, and the administrator still has to review and save them. Only the
 * three brand colours change — background, surface and text stay neutral,
 * because a printing company's site should remain readable and light.
 */
const PRESETS: { key: string, colors: Pick<EditableTheme, 'primary' | 'secondary' | 'accent'> }[] = [
  { key: 'default', colors: { primary: '#0f4c81', secondary: '#2f3740', accent: '#a35b18' } },
  { key: 'blue', colors: { primary: '#1d4ed8', secondary: '#312e81', accent: '#0891b2' } },
  { key: 'red', colors: { primary: '#b3261e', secondary: '#3f2021', accent: '#b45309' } },
  { key: 'green', colors: { primary: '#15803d', secondary: '#1f3d2b', accent: '#a16207' } },
  { key: 'orange', colors: { primary: '#c2410c', secondary: '#3b2a20', accent: '#0f766e' } },
]

const allValid = computed(() =>
  EDITABLE_THEME_KEYS.every(key => isValidHex(theme.draft[key])))

/** Inline `--color-*` declarations for the scoped preview. */
const previewStyle = computed(() => theme.previewVariables)

async function onSubmit() {
  if (saving.value || !allValid.value) return

  saving.value = true
  formError.value = ''

  try {
    const saved = await $fetch<EditableTheme>('/api/admin/theme', {
      method: 'PUT',
      body: { ...theme.draft },
    })

    theme.commit(saved)
    await refresh()

    toast.add({
      title: t('admin.toast.themeSaved'),
      description: t('admin.theme.savedHint'),
      color: 'success',
      icon: 'i-lucide-check',
    })
  }
  catch (caught) {
    const normalized = normalize(caught)
    formError.value = normalized.message
    toast.add({ title: normalized.message, color: 'danger', icon: 'i-lucide-triangle-alert' })
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <AdminPageHeader
      :title="t('admin.theme.title')"
      :description="t('admin.theme.description')"
    >
      <UButton
        to="/admin/settings"
        color="neutral"
        variant="outline"
        size="sm"
        icon="i-lucide-arrow-left"
      >
        {{ t('admin.theme.backToSettings') }}
      </UButton>
    </AdminPageHeader>

    <div
      v-if="pending"
      class="space-y-3 border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
      aria-busy="true"
    >
      <div v-for="i in 6" :key="i" class="h-10 animate-pulse rounded bg-[var(--color-surface-muted)]" />
    </div>

    <div v-else-if="error" role="alert" class="border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <p class="font-semibold text-[var(--color-danger)]">
        {{ t('admin.states.errorTitle') }}
      </p>
      <UButton color="neutral" variant="outline" size="sm" class="mt-3" @click="() => { refresh() }">
        {{ t('admin.actions.retry') }}
      </UButton>
    </div>

    <form v-else class="grid gap-6 lg:grid-cols-5" @submit.prevent="onSubmit">
      <!-- Editor -->
      <div class="space-y-6 border border-[var(--color-border)] bg-[var(--color-surface)] p-6 lg:col-span-2">
        <UAlert
          v-if="formError"
          color="danger"
          variant="subtle"
          icon="i-lucide-triangle-alert"
          :description="formError"
        />

        <div>
          <p class="text-sm font-semibold text-[var(--color-foreground)]">
            {{ t('admin.theme.presets') }}
          </p>
          <p class="mt-1 text-xs text-[var(--color-muted)]">
            {{ t('admin.theme.presetsHint') }}
          </p>
          <div class="mt-3 flex flex-wrap gap-2">
            <UButton
              v-for="preset in PRESETS"
              :key="preset.key"
              color="neutral"
              variant="outline"
              size="xs"
              @click="() => { theme.apply(preset.colors) }"
            >
              <span
                class="size-3 rounded-full border border-[var(--color-border)]"
                :style="{ backgroundColor: preset.colors.primary }"
                aria-hidden="true"
              />
              {{ t(`admin.theme.presetNames.${preset.key}`) }}
            </UButton>
          </div>
        </div>

        <div class="space-y-4 border-t border-[var(--color-border)] pt-5">
          <AdminColorField
            v-for="key in EDITABLE_THEME_KEYS"
            :key="key"
            :model-value="theme.draft[key]"
            :label="t(`admin.theme.colors.${key}`)"
            :hint="t(`admin.theme.hints.${key}`)"
            :invalid-message="t('admin.theme.invalidColor')"
            @update:model-value="(value: string) => theme.set(key, value)"
          />
        </div>

        <div class="flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-5">
          <UButton
            color="neutral"
            variant="ghost"
            :disabled="!theme.dirty || saving"
            @click="() => { theme.revert() }"
          >
            {{ t('admin.actions.cancel') }}
          </UButton>

          <UButton
            type="submit"
            color="primary"
            :loading="saving"
            :disabled="saving || !allValid || !theme.dirty"
          >
            {{ saving ? t('admin.actions.saving') : t('admin.actions.save') }}
          </UButton>
        </div>

        <p v-if="theme.dirty" class="text-xs text-[var(--color-warning)]">
          {{ t('admin.theme.unsaved') }}
        </p>
      </div>

      <!-- Preview. The draft palette is applied here and nowhere else. -->
      <div class="lg:col-span-3">
        <div class="border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <p class="text-sm font-semibold text-[var(--color-foreground)]">
            {{ t('admin.theme.preview') }}
          </p>
          <p class="mt-1 text-xs text-[var(--color-muted)]">
            {{ t('admin.theme.previewHint') }}
          </p>

          <div
            :style="previewStyle"
            class="mt-4 border border-[var(--color-border)]"
          >
            <!-- Mock header -->
            <div
              class="flex items-center justify-between px-5 py-3"
              :style="{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }"
            >
              <span class="text-sm font-bold" :style="{ color: 'var(--color-primary)' }">
                {{ t('admin.theme.sampleBrand') }}
              </span>
              <span class="text-xs" :style="{ color: 'var(--color-muted)' }">
                {{ t('admin.theme.sampleNav') }}
              </span>
            </div>

            <!-- Mock hero -->
            <div class="px-5 py-8" :style="{ background: 'var(--color-background)' }">
              <p class="text-xl font-bold" :style="{ color: 'var(--color-foreground)' }">
                {{ t('admin.theme.sampleHeading') }}
              </p>
              <p class="mt-2 max-w-md text-sm leading-6" :style="{ color: 'var(--color-foreground-soft)' }">
                {{ t('admin.theme.sampleBody') }}
              </p>

              <div class="mt-5 flex flex-wrap gap-3">
                <span
                  class="inline-flex items-center px-4 py-2 text-sm font-semibold"
                  :style="{
                    background: 'var(--color-primary)',
                    color: 'var(--color-primary-contrast)',
                    borderRadius: 'var(--radius-md)',
                  }"
                >
                  {{ t('admin.theme.samplePrimaryButton') }}
                </span>
                <span
                  class="inline-flex items-center px-4 py-2 text-sm font-semibold"
                  :style="{
                    border: '1px solid var(--color-border-strong)',
                    color: 'var(--color-foreground)',
                    borderRadius: 'var(--radius-md)',
                  }"
                >
                  {{ t('admin.theme.sampleSecondaryButton') }}
                </span>
              </div>
            </div>

            <!-- Mock cards -->
            <div class="grid gap-3 px-5 pb-6 sm:grid-cols-2" :style="{ background: 'var(--color-background)' }">
              <div
                v-for="card in 2"
                :key="card"
                class="p-4"
                :style="{
                  background: 'var(--color-surface-muted)',
                  border: '1px solid var(--color-border)',
                }"
              >
                <p class="text-sm font-semibold" :style="{ color: 'var(--color-foreground)' }">
                  {{ t('admin.theme.sampleCardTitle') }}
                </p>
                <p class="mt-1 text-xs" :style="{ color: 'var(--color-muted)' }">
                  {{ t('admin.theme.sampleCardBody') }}
                </p>
                <span
                  class="mt-3 inline-block text-xs font-semibold"
                  :style="{ color: 'var(--color-accent)' }"
                >
                  {{ t('admin.theme.sampleLink') }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>
