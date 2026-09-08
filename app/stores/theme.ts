import { defineStore } from 'pinia'
import {
  buildCssVariables,
  defaultEditableTheme,
  sanitizeTheme,
  type EditableTheme,
} from '~~/shared/theme/tokens'

/**
 * Theme store — used by the **admin preview only**.
 *
 * The public site does not need this: its palette arrives as a render-blocking
 * stylesheet from `/theme.css`, so there is no flash and no JavaScript
 * involved. What the store adds is the ability to preview unsaved colours
 * while an administrator is editing them.
 *
 * `preview` is deliberately scoped: it is applied to a container element in
 * the theme editor, never to `document.documentElement`, so editing a colour
 * cannot alter the live site for anyone — including the admin's own panel —
 * until Save is pressed.
 */
export const useThemeStore = defineStore('theme', () => {
  /** The palette currently persisted in PostgreSQL. */
  const saved = ref<EditableTheme>({ ...defaultEditableTheme })
  /** Unsaved edits shown in the preview. */
  const draft = ref<EditableTheme>({ ...defaultEditableTheme })

  const dirty = computed(() =>
    (Object.keys(draft.value) as (keyof EditableTheme)[])
      .some(key => draft.value[key] !== saved.value[key]))

  /** CSS variables for the draft, for scoped preview styling. */
  const previewVariables = computed(() => buildCssVariables(sanitizeTheme(draft.value)))

  /** Loads the persisted palette and resets any in-progress edits. */
  function load(theme: Partial<EditableTheme> | null | undefined) {
    saved.value = sanitizeTheme(theme)
    draft.value = { ...saved.value }
  }

  function set(key: keyof EditableTheme, value: string) {
    draft.value = { ...draft.value, [key]: value }
  }

  /** Applies a preset to the draft. The admin still has to save it. */
  function apply(theme: Partial<EditableTheme>) {
    draft.value = { ...draft.value, ...theme }
  }

  /** Marks the draft as persisted, after a successful save. */
  function commit(theme: EditableTheme) {
    saved.value = sanitizeTheme(theme)
    draft.value = { ...saved.value }
  }

  /** Cancel — discards edits and restores the last saved palette. */
  function revert() {
    draft.value = { ...saved.value }
  }

  return { saved, draft, dirty, previewVariables, load, set, apply, commit, revert }
})
