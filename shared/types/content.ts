import type { ImageAsset, Localized, Sluggable } from './common'

/* -------------------------------------------------------------------------- */
/* Services                                                                    */
/* -------------------------------------------------------------------------- */

export type ServiceCategory = 'printing' | 'packaging' | 'finishing'

export interface Service extends Sluggable {
  category: ServiceCategory
  /** Nuxt UI icon name, e.g. `i-lucide-printer`. */
  icon: string
  title: Localized
  /** One-line summary used on cards and in listings. */
  summary: Localized
  /** Full description used on the service detail page. */
  description: Localized
  /** Bullet points describing what is included. */
  features: Localized<string[]>
  image?: ImageAsset
  /** Minimum economical order quantity, if the service has one. */
  minimumOrder?: Localized
  turnaround?: Localized
  featured: boolean
  order: number
}

/* -------------------------------------------------------------------------- */
/* Pricing                                                                     */
/* -------------------------------------------------------------------------- */

export type Currency = 'IRR' | 'IRT'

export interface PricingRow {
  id: string
  /** Slug of the related service, so tables can be filtered per service. */
  serviceSlug: string
  title: Localized
  /** e.g. «۱۰۰۰ عدد» / "1,000 pcs" */
  quantity: Localized
  /** e.g. «گلاسه ۱۳۵ گرم» / "135gsm gloss" */
  specification: Localized
  /** Unit price in Toman (IRT). Kept numeric for sorting/formatting. */
  price: number
  currency: Currency
  /** Optional delivery estimate for this specific row. */
  turnaround?: Localized
  note?: Localized
}

export interface PricingGroup {
  id: string
  serviceSlug: string
  title: Localized
  description?: Localized
  rows: PricingRow[]
}

/* -------------------------------------------------------------------------- */
/* Equipment                                                                   */
/* -------------------------------------------------------------------------- */

export type EquipmentType = 'offset' | 'digital' | 'finishing' | 'prepress'

export interface EquipmentSpec {
  label: Localized
  value: Localized
}

export interface Equipment extends Sluggable {
  type: EquipmentType
  name: string
  manufacturer: string
  /** Year the machine entered the production line. */
  installedYear: number
  title: Localized
  description: Localized
  specs: EquipmentSpec[]
  image?: ImageAsset
  order: number
}

/* -------------------------------------------------------------------------- */
/* Portfolio                                                                   */
/* -------------------------------------------------------------------------- */

export interface PortfolioCategory extends Sluggable {
  title: Localized
  description?: Localized
  order: number
}

export interface PortfolioItem extends Sluggable {
  categorySlug: string
  title: Localized
  client: Localized
  /** Short project description. */
  description: Localized
  /** Production details shown as a small spec list. */
  details: { label: Localized, value: Localized }[]
  image: ImageAsset
  year: number
  featured: boolean
}

/* -------------------------------------------------------------------------- */
/* FAQ                                                                         */
/* -------------------------------------------------------------------------- */

export type FaqCategory = 'orders' | 'technical' | 'delivery' | 'pricing'

export interface Faq {
  id: string
  category: FaqCategory
  question: Localized
  answer: Localized
  order: number
}
