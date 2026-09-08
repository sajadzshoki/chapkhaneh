import { z } from 'zod'
import { slugSchema } from './validation'

/**
 * ---------------------------------------------------------------------------
 * Admin write schemas
 * ---------------------------------------------------------------------------
 * One schema per entity, shared by the create and update routes. These are the
 * server-side contract: the admin forms validate the same rules for immediate
 * feedback, but nothing is trusted until it passes through here.
 *
 * Every schema mirrors the database constraints (enum values, non-negative
 * integers, required bilingual pairs) so a valid payload can never produce a
 * constraint violation the user sees as a 500.
 */

const text = (max: number) => z.string().trim().min(1, 'Required').max(max)
const optionalText = (max: number) =>
  z.string().trim().max(max).optional().nullable().transform(v => v || null)

export const EQUIPMENT_TYPES = ['offset', 'digital', 'prepress', 'finishing'] as const
export const FAQ_CATEGORIES = ['orders', 'technical', 'delivery', 'pricing'] as const
export const CURRENCIES = ['IRT', 'IRR'] as const

/* --------------------------------- Services ------------------------------ */

export const serviceFeatureSchema = z.object({
  valueFa: text(300),
  valueEn: text(300),
})

export const serviceSpecificationSchema = z.object({
  labelFa: text(120),
  labelEn: text(120),
  /** Newline-separated list; stored verbatim and split for display. */
  valuesFa: text(2000),
  valuesEn: text(2000),
})

export const serviceInputSchema = z.object({
  slug: slugSchema,
  titleFa: text(160),
  titleEn: text(160),
  shortDescriptionFa: text(500),
  shortDescriptionEn: text(500),
  descriptionFa: text(8000),
  descriptionEn: text(8000),
  image: optionalText(500),
  minimumOrderFa: optionalText(120),
  minimumOrderEn: optionalText(120),
  turnaroundFa: optionalText(120),
  turnaroundEn: optionalText(120),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).max(9999).default(0),
  features: z.array(serviceFeatureSchema).max(30).default([]),
  specifications: z.array(serviceSpecificationSchema).max(20).default([]),
})

/* --------------------------------- Pricing ------------------------------- */

export const pricingRowInputSchema = z.object({
  serviceId: z.string().uuid('Select a service'),
  titleFa: text(160),
  titleEn: text(160),
  quantity: z.number().int().positive('Must be greater than zero').max(100_000_000),
  specificationFa: text(300),
  specificationEn: text(300),
  unitFa: text(40),
  unitEn: text(40),
  /** Whole Toman. Integer so money never hits float rounding. */
  price: z.number().int().nonnegative('Cannot be negative').max(1_000_000_000_000),
  currency: z.enum(CURRENCIES).default('IRT'),
  turnaroundFa: optionalText(120),
  turnaroundEn: optionalText(120),
  noteFa: optionalText(300),
  noteEn: optionalText(300),
  sortOrder: z.number().int().min(0).max(9999).default(0),
})

/* -------------------------------- Equipment ------------------------------ */

export const equipmentSpecSchema = z.object({
  labelFa: text(120),
  labelEn: text(120),
  valueFa: text(200),
  valueEn: text(200),
})

export const equipmentInputSchema = z.object({
  slug: slugSchema,
  nameFa: text(160),
  nameEn: text(160),
  manufacturerFa: text(120),
  manufacturerEn: text(120),
  model: text(120),
  typeKey: z.enum(EQUIPMENT_TYPES, { errorMap: () => ({ message: 'Select a valid type' }) }),
  installedYear: z.number().int().min(1900).max(2200).optional().nullable(),
  descriptionFa: text(4000),
  descriptionEn: text(4000),
  image: optionalText(500),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).max(9999).default(0),
  specs: z.array(equipmentSpecSchema).max(20).default([]),
})

/* --------------------------- Portfolio categories ------------------------ */

export const portfolioCategoryInputSchema = z.object({
  slug: slugSchema,
  nameFa: text(120),
  nameEn: text(120),
  descriptionFa: optionalText(600),
  descriptionEn: optionalText(600),
  sortOrder: z.number().int().min(0).max(9999).default(0),
})

/* ------------------------------- Portfolio ------------------------------- */

export const portfolioImageSchema = z.object({
  image: text(500),
  altFa: text(300),
  altEn: text(300),
})

export const portfolioDetailSchema = z.object({
  labelFa: text(120),
  labelEn: text(120),
  valueFa: text(200),
  valueEn: text(200),
})

export const portfolioItemInputSchema = z.object({
  slug: slugSchema,
  titleFa: text(160),
  titleEn: text(160),
  descriptionFa: text(4000),
  descriptionEn: text(4000),
  coverImage: text(500),
  year: z.number().int().min(1900).max(2200).optional().nullable(),
  clientFa: optionalText(160),
  clientEn: optionalText(160),
  categoryId: z.string().uuid('Select a category'),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).max(9999).default(0),
  images: z.array(portfolioImageSchema).max(30).default([]),
  details: z.array(portfolioDetailSchema).max(20).default([]),
  serviceIds: z.array(z.string().uuid()).max(20).default([]),
})

/* ---------------------------------- FAQ ---------------------------------- */

export const faqInputSchema = z.object({
  category: z.enum(FAQ_CATEGORIES).default('orders'),
  questionFa: text(400),
  questionEn: text(400),
  answerFa: text(4000),
  answerEn: text(4000),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).max(9999).default(0),
})

/* ----------------------------- Quote requests ---------------------------- */

export const quoteStatusUpdateSchema = z.object({
  status: z.enum(['NEW', 'REVIEWING', 'CONTACTED', 'COMPLETED']),
  internalNote: optionalText(2000).optional(),
})

/* -------------------------------- Settings ------------------------------- */

const optionalUrl = z.string().trim().max(400).optional().nullable()
  .transform(v => v || null)
  .refine(v => !v || /^https?:\/\//.test(v), 'Must start with http:// or https://')

export const siteSettingsInputSchema = z.object({
  companyNameFa: text(160),
  companyNameEn: text(160),
  legalNameFa: optionalText(200),
  legalNameEn: optionalText(200),
  taglineFa: text(300),
  taglineEn: text(300),
  descriptionFa: optionalText(2000),
  descriptionEn: optionalText(2000),
  foundedYear: z.number().int().min(1800).max(2200).optional().nullable(),
  phone: text(40),
  phoneSecondary: optionalText(40),
  fax: optionalText(40),
  email: z.string().trim().toLowerCase().email('Invalid email address').max(160),
  salesEmail: z.string().trim().toLowerCase().max(160).optional().nullable()
    .transform(v => v || null)
    .refine(v => !v || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), 'Invalid email address'),
  addressFa: text(400),
  addressEn: text(400),
  cityFa: optionalText(120),
  cityEn: optionalText(120),
  postalCode: optionalText(20),
  mapUrl: optionalUrl,
  workingHoursFa: text(200),
  workingHoursEn: text(200),
  workingHoursDaysFa: optionalText(200),
  workingHoursDaysEn: optionalText(200),
  logo: optionalText(400),
  mark: optionalText(400),
  favicon: optionalText(400),
  ogImage: optionalText(400),
  seoTitleFa: optionalText(200),
  seoTitleEn: optionalText(200),
  seoDescriptionFa: optionalText(400),
  seoDescriptionEn: optionalText(400),
  instagramUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  telegramUrl: optionalUrl,
  whatsappUrl: optionalUrl,
})

/* --------------------------------- Theme --------------------------------- */

/**
 * A single brand colour.
 *
 * Only `#rrggbb` is accepted. This is the boundary that prevents CSS
 * injection: theme values end up inside a `<style>` block, so anything that
 * is not a literal hex colour is rejected outright rather than escaped.
 */
const hexColor = z.string().trim()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Use a 6-digit hex colour, e.g. #0f4c81')
  .transform(v => v.toLowerCase())

export const themeSettingsInputSchema = z.object({
  primary: hexColor,
  secondary: hexColor,
  accent: hexColor,
  background: hexColor,
  surface: hexColor,
  foreground: hexColor,
  muted: hexColor,
  border: hexColor,
})

/* -------------------------------- Reorder -------------------------------- */

/** Shared payload for drag-free reordering: an ordered list of ids. */
export const reorderSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(500),
})

/* ------------------------------ List queries ----------------------------- */

export const listQuerySchema = z.object({
  search: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().trim().max(40).optional(),
  active: z.enum(['all', 'active', 'inactive']).default('all'),
  type: z.string().trim().max(40).optional(),
  category: z.string().trim().max(80).optional(),
  featured: z.enum(['all', 'yes', 'no']).default('all'),
  serviceId: z.string().uuid().optional(),
})

export type ServiceInput = z.infer<typeof serviceInputSchema>
export type PricingRowInput = z.infer<typeof pricingRowInputSchema>
export type EquipmentInput = z.infer<typeof equipmentInputSchema>
export type PortfolioCategoryInput = z.infer<typeof portfolioCategoryInputSchema>
export type PortfolioItemInput = z.infer<typeof portfolioItemInputSchema>
export type FaqInput = z.infer<typeof faqInputSchema>
export type SiteSettingsInput = z.infer<typeof siteSettingsInputSchema>
export type ThemeSettingsInput = z.infer<typeof themeSettingsInputSchema>
export type ListQuery = z.infer<typeof listQuerySchema>
