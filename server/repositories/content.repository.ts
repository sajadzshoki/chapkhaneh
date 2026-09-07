import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm'
import { useDatabase } from '../database/client'
import {
  equipment,
  equipmentSpecs,
  faqs,
  portfolioCategories,
  portfolioDetails,
  portfolioImages,
  portfolioItems,
  portfolioServices,
  pricingRows,
  quoteRequests,
  serviceFeatures,
  services,
  serviceSpecifications,
  siteSettings,
  themeSettings,
} from '../database/schema'
import {
  toEquipmentDto,
  toFaqDto,
  toPortfolioCategoryDto,
  toPortfolioItemDto,
  toPricingRowDto,
  toServiceDto,
  toSiteSettingsDto,
  toThemeSettingsDto,
} from '../database/mappers'

/**
 * ---------------------------------------------------------------------------
 * Content repository
 * ---------------------------------------------------------------------------
 * All content reads live here so API routes stay thin and no query is written
 * twice. Public routes call the `*Public` helpers, which filter on `isActive`;
 * admin routes call the unfiltered variants.
 */

/* ----------------------------------- Services ---------------------------- */

export async function listServices(options: { activeOnly?: boolean } = {}) {
  const db = useDatabase()
  const rows = await db
    .select()
    .from(services)
    .where(options.activeOnly ? eq(services.isActive, true) : undefined)
    .orderBy(asc(services.sortOrder))

  if (!rows.length) return []

  const ids = rows.map(r => r.id)
  const [features, specs] = await Promise.all([
    db.select().from(serviceFeatures)
      .where(inArray(serviceFeatures.serviceId, ids))
      .orderBy(asc(serviceFeatures.sortOrder)),
    db.select().from(serviceSpecifications)
      .where(inArray(serviceSpecifications.serviceId, ids))
      .orderBy(asc(serviceSpecifications.sortOrder)),
  ])

  const groupBy = <T extends { serviceId: string }>(list: T[]) => {
    const map = new Map<string, T[]>()
    for (const entry of list) {
      const arr = map.get(entry.serviceId) ?? []
      arr.push(entry)
      map.set(entry.serviceId, arr)
    }
    return map
  }

  const featuresBy = groupBy(features)
  const specsBy = groupBy(specs)

  return rows.map(row => toServiceDto(row, featuresBy.get(row.id) ?? [], specsBy.get(row.id) ?? []))
}

export async function getServiceBySlug(slug: string) {
  const db = useDatabase()
  const [row] = await db
    .select()
    .from(services)
    .where(and(eq(services.slug, slug), eq(services.isActive, true)))
    .limit(1)

  if (!row) return null

  const [features, specs] = await Promise.all([
    db.select().from(serviceFeatures)
      .where(eq(serviceFeatures.serviceId, row.id))
      .orderBy(asc(serviceFeatures.sortOrder)),
    db.select().from(serviceSpecifications)
      .where(eq(serviceSpecifications.serviceId, row.id))
      .orderBy(asc(serviceSpecifications.sortOrder)),
  ])

  return toServiceDto(row, features, specs)
}

/* ----------------------------------- Pricing ----------------------------- */

/** Pricing rows grouped by service slug, ready for the pricing page. */
export async function listPricingGroups() {
  const db = useDatabase()
  const rows = await db
    .select({ price: pricingRows, service: services })
    .from(pricingRows)
    .innerJoin(services, eq(pricingRows.serviceId, services.id))
    .where(eq(services.isActive, true))
    .orderBy(asc(services.sortOrder), asc(pricingRows.sortOrder))

  const groups = new Map<string, {
    id: string
    serviceSlug: string
    title: { fa: string, en: string }
    rows: ReturnType<typeof toPricingRowDto>[]
  }>()

  for (const { price, service } of rows) {
    let group = groups.get(service.slug)
    if (!group) {
      group = {
        id: service.id,
        serviceSlug: service.slug,
        title: { fa: service.titleFa, en: service.titleEn },
        rows: [],
      }
      groups.set(service.slug, group)
    }
    group.rows.push(toPricingRowDto(price))
  }

  return [...groups.values()]
}

export async function listPricingRows() {
  const db = useDatabase()
  const rows = await db.select().from(pricingRows).orderBy(asc(pricingRows.sortOrder))
  return rows.map(toPricingRowDto)
}

/* ---------------------------------- Equipment ---------------------------- */

export async function listEquipment(options: { activeOnly?: boolean } = {}) {
  const db = useDatabase()
  const rows = await db
    .select()
    .from(equipment)
    .where(options.activeOnly ? eq(equipment.isActive, true) : undefined)
    .orderBy(asc(equipment.sortOrder))

  if (!rows.length) return []

  const specs = await db
    .select()
    .from(equipmentSpecs)
    .where(inArray(equipmentSpecs.equipmentId, rows.map(r => r.id)))
    .orderBy(asc(equipmentSpecs.sortOrder))

  const byEquipment = new Map<string, typeof specs>()
  for (const spec of specs) {
    const list = byEquipment.get(spec.equipmentId) ?? []
    list.push(spec)
    byEquipment.set(spec.equipmentId, list)
  }

  return rows.map(row => toEquipmentDto(row, byEquipment.get(row.id) ?? []))
}

/* ---------------------------------- Portfolio ---------------------------- */

export async function listPortfolioCategories() {
  const db = useDatabase()
  const rows = await db
    .select()
    .from(portfolioCategories)
    .orderBy(asc(portfolioCategories.sortOrder))

  return rows.map(toPortfolioCategoryDto)
}

/**
 * Loads projects with their category slug, gallery, detail list and linked
 * service slugs. Uses four queries total (not one per item) to avoid N+1.
 */
export async function listPortfolioItems(options: { activeOnly?: boolean } = {}) {
  const db = useDatabase()
  const rows = await db
    .select({ item: portfolioItems, categorySlug: portfolioCategories.slug })
    .from(portfolioItems)
    .innerJoin(portfolioCategories, eq(portfolioItems.categoryId, portfolioCategories.id))
    .where(options.activeOnly ? eq(portfolioItems.isActive, true) : undefined)
    .orderBy(asc(portfolioItems.sortOrder))

  if (!rows.length) return []

  const ids = rows.map(r => r.item.id)

  const [images, details, links] = await Promise.all([
    db.select().from(portfolioImages)
      .where(inArray(portfolioImages.portfolioId, ids))
      .orderBy(asc(portfolioImages.sortOrder)),
    db.select().from(portfolioDetails)
      .where(inArray(portfolioDetails.portfolioId, ids))
      .orderBy(asc(portfolioDetails.sortOrder)),
    db.select({ portfolioId: portfolioServices.portfolioId, slug: services.slug })
      .from(portfolioServices)
      .innerJoin(services, eq(portfolioServices.serviceId, services.id))
      .where(inArray(portfolioServices.portfolioId, ids)),
  ])

  const group = <T extends { portfolioId: string }>(list: T[]) => {
    const map = new Map<string, T[]>()
    for (const entry of list) {
      const arr = map.get(entry.portfolioId) ?? []
      arr.push(entry)
      map.set(entry.portfolioId, arr)
    }
    return map
  }

  const imagesBy = group(images)
  const detailsBy = group(details)
  const linksBy = group(links)

  return rows.map(({ item, categorySlug }) => toPortfolioItemDto(
    item,
    categorySlug,
    imagesBy.get(item.id) ?? [],
    detailsBy.get(item.id) ?? [],
    (linksBy.get(item.id) ?? []).map(l => l.slug),
  ))
}

/* ------------------------------------- FAQ ------------------------------- */

export async function listFaqs(options: { activeOnly?: boolean } = {}) {
  const db = useDatabase()
  const rows = await db
    .select()
    .from(faqs)
    .where(options.activeOnly ? eq(faqs.isActive, true) : undefined)
    .orderBy(asc(faqs.sortOrder))

  return rows.map(toFaqDto)
}

/* ---------------------------------- Settings ----------------------------- */

export async function getSiteSettings() {
  const db = useDatabase()
  const [row] = await db.select().from(siteSettings).limit(1)
  return row ? toSiteSettingsDto(row) : null
}

export async function getThemeSettings() {
  const db = useDatabase()
  const [row] = await db.select().from(themeSettings).limit(1)
  return row ? toThemeSettingsDto(row) : null
}

/* ------------------------------ Dashboard stats -------------------------- */

export async function getDashboardStats() {
  const db = useDatabase()

  const [[serviceCount], [portfolioCount], [equipmentCount], [newQuotes], [totalQuotes]] =
    await Promise.all([
      db.select({ value: sql<number>`count(*)::int` }).from(services),
      db.select({ value: sql<number>`count(*)::int` }).from(portfolioItems),
      db.select({ value: sql<number>`count(*)::int` }).from(equipment),
      db.select({ value: sql<number>`count(*)::int` }).from(quoteRequests)
        .where(eq(quoteRequests.status, 'NEW')),
      db.select({ value: sql<number>`count(*)::int` }).from(quoteRequests),
    ])

  return {
    services: serviceCount?.value ?? 0,
    portfolioItems: portfolioCount?.value ?? 0,
    equipment: equipmentCount?.value ?? 0,
    newQuoteRequests: newQuotes?.value ?? 0,
    totalQuoteRequests: totalQuotes?.value ?? 0,
  }
}

/* ------------------------------- Quote requests -------------------------- */

export async function listQuoteRequests(options: { limit?: number } = {}) {
  const db = useDatabase()
  const rows = await db
    .select({ quote: quoteRequests, serviceTitleFa: services.titleFa, serviceTitleEn: services.titleEn })
    .from(quoteRequests)
    .leftJoin(services, eq(quoteRequests.serviceId, services.id))
    .orderBy(desc(quoteRequests.createdAt))
    .limit(options.limit ?? 100)

  return rows.map(({ quote, serviceTitleFa, serviceTitleEn }) => ({
    id: quote.id,
    fullName: quote.fullName,
    company: quote.company ?? undefined,
    phone: quote.phone,
    email: quote.email ?? undefined,
    serviceTitle: serviceTitleFa && serviceTitleEn
      ? { fa: serviceTitleFa, en: serviceTitleEn }
      : undefined,
    quantity: quote.quantity ?? undefined,
    description: quote.description,
    status: quote.status,
    createdAt: quote.createdAt.toISOString(),
  }))
}
