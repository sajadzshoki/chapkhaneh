/** Locale codes supported by the site. */
export type LocaleCode = 'fa' | 'en'

/**
 * A value that exists in every supported locale.
 * Mock data and (later) database rows both use this shape, so the UI can stay
 * identical whichever source is active.
 */
export type Localized<T = string> = Record<LocaleCode, T>

/** Anything addressable by a stable, human-readable URL segment. */
export interface Sluggable {
  id: string
  slug: string
}

export interface ImageAsset {
  src: string
  alt: Localized
  width?: number
  height?: number
}

export interface SeoMeta {
  title: Localized
  description: Localized
}
