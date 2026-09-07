import type { Localized } from './common'

export interface SocialLink {
  /** Platform key — also used to resolve the icon. */
  platform: 'instagram' | 'linkedin' | 'telegram' | 'whatsapp' | 'x' | 'aparat'
  url: string
  label: string
}

export interface WorkingHours {
  /** e.g. «شنبه تا چهارشنبه» */
  days: Localized
  hours: Localized
}

export interface ContactInfo {
  phones: string[]
  fax?: string
  email: string
  salesEmail?: string
  address: Localized
  /** Short city/province line used in compact places like the footer. */
  city: Localized
  postalCode?: string
  mapUrl?: string
}

export interface BrandAssets {
  logo: string
  logoDark?: string
  /** Compact mark used in tight spaces (mobile header, favicons). */
  mark: string
  favicon: string
  ogImage?: string
}

/**
 * Everything that identifies the company.
 * A different printing company is onboarded by editing ONE object
 * (`shared/data/site.ts`) — never by editing components.
 */
export interface SiteSettings {
  companyName: Localized
  legalName: Localized
  tagline: Localized
  description: Localized
  foundedYear: number
  contact: ContactInfo
  workingHours: WorkingHours[]
  social: SocialLink[]
  brand: BrandAssets
}

/** Overridable subset of the theme — the admin panel will write this in phase 3. */
export interface ThemeSettings {
  primary: string
  secondary: string
  accent: string
  logo?: string
  favicon?: string
}

export type AdminRole = 'owner' | 'editor'

export interface AdminUser {
  id: string
  name: string
  email: string
  role: AdminRole
  createdAt: string
  lastLoginAt?: string
}
