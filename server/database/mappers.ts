import type { Localized } from '~~/shared/types'
import type {
  EquipmentRow,
  ServiceFeatureRow,
  ServiceSpecificationRow,
  EquipmentSpecRow,
  FaqRow,
  PortfolioCategoryRow,
  PortfolioDetailRow,
  PortfolioImageRow,
  PortfolioItemRow,
  PricingRowRow,
  QuoteRequestRow,
  ServiceRow,
  SiteSettingsRow,
  ThemeSettingsRow,
} from './schema'

/**
 * ---------------------------------------------------------------------------
 * Row -> API shape mappers
 * ---------------------------------------------------------------------------
 * The database stores bilingual text in flat `*Fa` / `*En` columns, but the
 * whole front end is built against `Localized<T>` (`{ fa, en }`). These
 * mappers are the single translation layer between the two, so the public
 * pages keep working unchanged and no route hand-rolls its own shaping.
 *
 * They also act as the field allow-list: anything not returned here (password
 * hashes, internal notes) can never reach a public response.
 */

const loc = (fa: string, en: string): Localized => ({ fa, en })

const locOptional = (fa: string | null, en: string | null): Localized | undefined =>
  fa || en ? loc(fa ?? en ?? '', en ?? fa ?? '') : undefined

/** Derive the UI service category from the slug, preserving phase 2 filters. */
function serviceCategory(slug: string): 'printing' | 'packaging' | 'finishing' {
  if (slug === 'packaging-boxes' || slug === 'label-printing') return 'packaging'
  if (slug === 'post-press-services') return 'finishing'
  return 'printing'
}

/** Icon per service slug — presentation detail, not worth a database column. */
const SERVICE_ICONS: Record<string, string> = {
  'offset-printing': 'i-lucide-printer',
  'digital-printing': 'i-lucide-monitor-cog',
  'book-printing': 'i-lucide-book-open',
  'magazine-printing': 'i-lucide-newspaper',
  'catalog-printing': 'i-lucide-gallery-vertical-end',
  'brochure-printing': 'i-lucide-file-text',
  'packaging-boxes': 'i-lucide-package',
  'label-printing': 'i-lucide-tag',
  'business-card-printing': 'i-lucide-credit-card',
  'post-press-services': 'i-lucide-scissors',
}

export interface ImageDto {
  src: string
  alt: Localized
  width?: number
  height?: number
}

export interface ServiceDto {
  id: string
  slug: string
  category: 'printing' | 'packaging' | 'finishing'
  icon: string
  title: Localized
  summary: Localized
  description: Localized
  features: Localized<string[]>
  specifications: { label: Localized, values: Localized<string[]> }[]
  minimumOrder?: Localized
  turnaround?: Localized
  image?: ImageDto
  featured: boolean
  order: number
}

export function toServiceDto(
  row: ServiceRow,
  features: ServiceFeatureRow[] = [],
  specifications: ServiceSpecificationRow[] = [],
): ServiceDto {
  const sorted = <T extends { sortOrder: number }>(list: T[]) =>
    list.slice().sort((a, b) => a.sortOrder - b.sortOrder)

  return {
    id: row.id,
    slug: row.slug,
    category: serviceCategory(row.slug),
    icon: SERVICE_ICONS[row.slug] ?? 'i-lucide-printer',
    title: loc(row.titleFa, row.titleEn),
    summary: loc(row.shortDescriptionFa, row.shortDescriptionEn),
    description: loc(row.descriptionFa, row.descriptionEn),
    features: {
      fa: sorted(features).map(f => f.valueFa),
      en: sorted(features).map(f => f.valueEn),
    },
    specifications: sorted(specifications).map(spec => ({
      label: loc(spec.labelFa, spec.labelEn),
      values: {
        fa: spec.valuesFa.split('\n').filter(Boolean),
        en: spec.valuesEn.split('\n').filter(Boolean),
      },
    })),
    minimumOrder: locOptional(row.minimumOrderFa, row.minimumOrderEn),
    turnaround: locOptional(row.turnaroundFa, row.turnaroundEn),
    image: row.image
      ? { src: row.image, alt: loc(row.titleFa, row.titleEn) }
      : undefined,
    featured: row.sortOrder <= 6,
    order: row.sortOrder,
  }
}

export interface PricingRowDto {
  id: string
  serviceId: string
  title: Localized
  /** Numeric quantity, for sorting and admin editing. */
  quantity: number
  /** Display quantity, e.g. «۱٬۰۰۰ عدد» / "1,000 pcs". */
  quantityLabel: Localized
  specification: Localized
  unit: Localized
  price: number
  currency: string
  turnaround?: Localized
  note?: Localized
  order: number
}

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']

/** 1000 -> "1,000" (en) / "۱٬۰۰۰" (fa). */
function formatQuantity(value: number, localeCode: 'fa' | 'en'): string {
  const grouped = value.toLocaleString('en-US')
  if (localeCode === 'en') return grouped
  return grouped
    .replace(/,/g, '٬')
    .replace(/\d/g, d => FA_DIGITS[Number(d)]!)
}

export function toPricingRowDto(row: PricingRowRow): PricingRowDto {
  return {
    id: row.id,
    serviceId: row.serviceId,
    title: loc(row.titleFa, row.titleEn),
    quantity: row.quantity,
    quantityLabel: {
      fa: `${formatQuantity(row.quantity, 'fa')} ${row.unitFa}`.trim(),
      en: `${formatQuantity(row.quantity, 'en')} ${row.unitEn}`.trim(),
    },
    specification: loc(row.specificationFa, row.specificationEn),
    unit: loc(row.unitFa, row.unitEn),
    price: row.price,
    currency: row.currency,
    turnaround: locOptional(row.turnaroundFa, row.turnaroundEn),
    note: locOptional(row.noteFa, row.noteEn),
    order: row.sortOrder,
  }
}

export interface EquipmentDto {
  id: string
  slug: string
  type: string
  name: string
  manufacturer: string
  model: string
  installedYear?: number
  title: Localized
  typeLabel: Localized
  description: Localized
  specs: { label: Localized, value: Localized }[]
  image?: { src: string, alt: Localized }
  order: number
}

export function toEquipmentDto(row: EquipmentRow, specs: EquipmentSpecRow[] = []): EquipmentDto {
  return {
    id: row.id,
    slug: row.slug,
    type: row.typeKey,
    name: row.nameEn,
    manufacturer: row.manufacturerEn,
    model: row.model,
    installedYear: row.installedYear ?? undefined,
    title: loc(row.nameFa, row.nameEn),
    typeLabel: loc(row.typeFa, row.typeEn),
    description: loc(row.descriptionFa, row.descriptionEn),
    specs: specs
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(s => ({ label: loc(s.labelFa, s.labelEn), value: loc(s.valueFa, s.valueEn) })),
    image: row.image ? { src: row.image, alt: loc(row.nameFa, row.nameEn) } : undefined,
    order: row.sortOrder,
  }
}

export interface PortfolioCategoryDto {
  id: string
  slug: string
  title: Localized
  description?: Localized
  order: number
}

export function toPortfolioCategoryDto(row: PortfolioCategoryRow): PortfolioCategoryDto {
  return {
    id: row.id,
    slug: row.slug,
    title: loc(row.nameFa, row.nameEn),
    description: locOptional(row.descriptionFa, row.descriptionEn),
    order: row.sortOrder,
  }
}

export interface PortfolioItemDto {
  id: string
  slug: string
  categoryId: string
  categorySlug: string
  title: Localized
  client: Localized
  description: Localized
  details: { label: Localized, value: Localized }[]
  image: { src: string, alt: Localized }
  gallery: { src: string, alt: Localized }[]
  serviceSlugs: string[]
  year: number
  featured: boolean
  order: number
}

export function toPortfolioItemDto(
  row: PortfolioItemRow,
  categorySlug: string,
  images: PortfolioImageRow[] = [],
  details: PortfolioDetailRow[] = [],
  serviceSlugs: string[] = [],
): PortfolioItemDto {
  const title = loc(row.titleFa, row.titleEn)
  return {
    id: row.id,
    slug: row.slug,
    categoryId: row.categoryId,
    categorySlug,
    title,
    client: locOptional(row.clientFa, row.clientEn) ?? loc('', ''),
    description: loc(row.descriptionFa, row.descriptionEn),
    details: details
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(d => ({ label: loc(d.labelFa, d.labelEn), value: loc(d.valueFa, d.valueEn) })),
    image: { src: row.coverImage, alt: title },
    gallery: images
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(i => ({ src: i.image, alt: loc(i.altFa, i.altEn) })),
    serviceSlugs,
    year: row.year ?? 0,
    featured: row.isFeatured,
    order: row.sortOrder,
  }
}

export interface FaqDto {
  id: string
  category: string
  question: Localized
  answer: Localized
  order: number
}

export function toFaqDto(row: FaqRow): FaqDto {
  return {
    id: row.id,
    category: row.category,
    question: loc(row.questionFa, row.questionEn),
    answer: loc(row.answerFa, row.answerEn),
    order: row.sortOrder,
  }
}

/** Public site profile. Mirrors the `SiteSettings` shape used by `useSite()`. */
export function toSiteSettingsDto(row: SiteSettingsRow) {
  const phones = [row.phone, row.phoneSecondary].filter((p): p is string => Boolean(p))
  const social = [
    { platform: 'instagram' as const, url: row.instagramUrl, label: 'Instagram' },
    { platform: 'linkedin' as const, url: row.linkedinUrl, label: 'LinkedIn' },
    { platform: 'telegram' as const, url: row.telegramUrl, label: 'Telegram' },
    { platform: 'whatsapp' as const, url: row.whatsappUrl, label: 'WhatsApp' },
  ].filter((s): s is { platform: typeof s.platform, url: string, label: string } => Boolean(s.url))

  return {
    companyName: loc(row.companyNameFa, row.companyNameEn),
    legalName: locOptional(row.legalNameFa, row.legalNameEn) ?? loc(row.companyNameFa, row.companyNameEn),
    tagline: loc(row.taglineFa, row.taglineEn),
    description: locOptional(row.descriptionFa, row.descriptionEn) ?? loc('', ''),
    foundedYear: row.foundedYear ?? 0,
    contact: {
      phones,
      fax: row.fax ?? undefined,
      email: row.email,
      salesEmail: row.salesEmail ?? undefined,
      address: loc(row.addressFa, row.addressEn),
      city: locOptional(row.cityFa, row.cityEn) ?? loc('', ''),
      postalCode: row.postalCode ?? undefined,
      mapUrl: row.mapUrl ?? undefined,
    },
    workingHours: [{
      days: locOptional(row.workingHoursDaysFa, row.workingHoursDaysEn) ?? loc('', ''),
      hours: loc(row.workingHoursFa, row.workingHoursEn),
    }],
    social,
    brand: {
      logo: row.logo ?? '/brand/logo.svg',
      mark: row.mark ?? '/brand/mark.svg',
      favicon: row.favicon ?? '/favicon.svg',
      ogImage: row.ogImage ?? undefined,
    },
  }
}

export function toThemeSettingsDto(row: ThemeSettingsRow) {
  return {
    primary: row.primary,
    secondary: row.secondary,
    accent: row.accent,
    background: row.background,
    surface: row.surface,
    foreground: row.foreground,
    muted: row.muted,
    border: row.border,
  }
}

/** Admin-only view of a quote request. Never exposed on public routes. */
export function toQuoteRequestDto(row: QuoteRequestRow, serviceTitle?: Localized) {
  return {
    id: row.id,
    fullName: row.fullName,
    company: row.company ?? undefined,
    phone: row.phone,
    email: row.email ?? undefined,
    serviceId: row.serviceId ?? undefined,
    serviceTitle,
    quantity: row.quantity ?? undefined,
    description: row.description,
    fileUrl: row.fileUrl ?? undefined,
    fileName: row.fileName ?? undefined,
    status: row.status,
    locale: row.locale,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}
