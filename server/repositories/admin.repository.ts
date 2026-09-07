import { and, asc, count, desc, eq, ilike, inArray, ne, or } from 'drizzle-orm'
import type { PgColumn } from 'drizzle-orm/pg-core'
import { useDatabase } from '../database/client'
import { removeUpload } from '../utils/uploads'
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
} from '../database/schema'
import type {
  EquipmentInput,
  FaqInput,
  ListQuery,
  PortfolioCategoryInput,
  PortfolioItemInput,
  PricingRowInput,
  ServiceInput,
  SiteSettingsInput,
} from '../utils/admin-schemas'

/**
 * ---------------------------------------------------------------------------
 * Admin repository
 * ---------------------------------------------------------------------------
 * Every admin mutation lives here. Routes stay thin (validate -> call -> respond)
 * and no SQL is written twice.
 *
 * Two rules are enforced centrally rather than per-route:
 *
 *  1. Slug uniqueness is checked before writing, so the user gets a 422 on the
 *     `slug` field instead of a raw unique-violation 500.
 *  2. Referential integrity is respected, never bypassed. The category delete
 *     pre-checks its dependants so the database RESTRICT never has to fire as
 *     an unhandled error.
 */

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

/** Tables addressed generically by the slug and ordering helpers below. */
type SluggedTable =
  typeof services | typeof equipment | typeof portfolioItems | typeof portfolioCategories

type OrderedTable = SluggedTable | typeof faqs | typeof pricingRows

function notFound(what: string): never {
  throw createError({ statusCode: 404, statusMessage: `${what} not found` })
}

function duplicateSlug(): never {
  throw createError({
    statusCode: 422,
    statusMessage: 'Validation failed',
    data: { issues: { slug: ['This slug is already in use'] } },
  })
}

/**
 * Rejects a slug already used by a different row.
 * `excludeId` makes editing an existing record safe — a record may keep its own
 * slug without tripping the check.
 */
async function assertSlugFree(
  table: SluggedTable,
  slug: string,
  excludeId?: string,
): Promise<void> {
  const db = useDatabase()
  const where = excludeId
    ? and(eq(table.slug, slug), ne(table.id, excludeId))
    : eq(table.slug, slug)

  const [existing] = await db.select({ id: table.id }).from(table).where(where).limit(1)
  if (existing) duplicateSlug()
}

/** Verifies a foreign key target exists, returning 422 on the owning field. */
async function assertExists(
  table: SluggedTable,
  id: string,
  field: string,
): Promise<void> {
  const db = useDatabase()
  const [row] = await db.select({ id: table.id }).from(table).where(eq(table.id, id)).limit(1)
  if (!row) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Validation failed',
      data: { issues: { [field]: ['The selected record no longer exists'] } },
    })
  }
}

/**
 * Counts child rows grouped by their parent id.
 *
 * Used instead of a correlated subquery so the aggregation is a plain, easily
 * verified GROUP BY, and so list queries keep the batched style used elsewhere
 * in the codebase.
 */
async function countChildren(
  parentColumn: PgColumn,
  parentIds: string[],
): Promise<Map<string, number>> {
  if (!parentIds.length) return new Map()

  const db = useDatabase()
  const rows = await db
    .select({ parentId: parentColumn, value: count() })
    .from(parentColumn.table)
    .where(inArray(parentColumn, parentIds))
    .groupBy(parentColumn)

  return new Map(rows.map(row => [row.parentId as string, row.value]))
}

/** Case-insensitive match across several columns. */
function searchFilter(term: string | undefined, columns: Parameters<typeof ilike>[0][]) {
  if (!term) return undefined
  const pattern = `%${term}%`
  return or(...columns.map(column => ilike(column, pattern)))
}

function activeFilter(column: PgColumn, value: ListQuery['active']) {
  if (value === 'active') return eq(column, true)
  if (value === 'inactive') return eq(column, false)
  return undefined
}

/** Applies an explicit id order in one statement per row. */
async function applyOrder(table: OrderedTable, ids: string[]): Promise<void> {
  const db = useDatabase()
  await db.transaction(async (tx) => {
    for (const [index, id] of ids.entries()) {
      await tx.update(table).set({ sortOrder: index + 1 }).where(eq(table.id, id))
    }
  })
}

/* -------------------------------------------------------------------------- */
/* Services                                                                    */
/* -------------------------------------------------------------------------- */

export async function adminListServices(query: ListQuery) {
  const db = useDatabase()
  const where = and(
    searchFilter(query.search, [services.titleFa, services.titleEn, services.slug]),
    activeFilter(services.isActive, query.active),
  )

  const [rows, [total]] = await Promise.all([
    db.select({
      id: services.id,
      slug: services.slug,
      titleFa: services.titleFa,
      titleEn: services.titleEn,
      image: services.image,
      isActive: services.isActive,
      sortOrder: services.sortOrder,
    })
      .from(services)
      .where(where)
      .orderBy(asc(services.sortOrder))
      .limit(query.perPage)
      .offset((query.page - 1) * query.perPage),
    db.select({ value: count() }).from(services).where(where),
  ])

  // Counted in a second batched query rather than a correlated subquery: it is
  // one extra round trip for the page, and keeps the count logic readable.
  const counts = await countChildren(pricingRows.serviceId, rows.map(r => r.id))

  return {
    items: rows.map(row => ({ ...row, pricingCount: counts.get(row.id) ?? 0 })),
    total: total?.value ?? 0,
  }
}

export async function adminGetService(id: string) {
  const db = useDatabase()
  const [row] = await db.select().from(services).where(eq(services.id, id)).limit(1)
  if (!row) notFound('Service')

  const [features, specifications] = await Promise.all([
    db.select().from(serviceFeatures)
      .where(eq(serviceFeatures.serviceId, id)).orderBy(asc(serviceFeatures.sortOrder)),
    db.select().from(serviceSpecifications)
      .where(eq(serviceSpecifications.serviceId, id)).orderBy(asc(serviceSpecifications.sortOrder)),
  ])

  return { ...row, features, specifications }
}

export async function adminCreateService(input: ServiceInput) {
  const db = useDatabase()
  await assertSlugFree(services, input.slug)

  return db.transaction(async (tx) => {
    const { features, specifications, ...fields } = input
    const [row] = await tx.insert(services).values(fields).returning({ id: services.id })
    const id = row!.id

    if (features.length) {
      await tx.insert(serviceFeatures).values(
        features.map((f, i) => ({ ...f, serviceId: id, sortOrder: i + 1 })),
      )
    }
    if (specifications.length) {
      await tx.insert(serviceSpecifications).values(
        specifications.map((s, i) => ({ ...s, serviceId: id, sortOrder: i + 1 })),
      )
    }
    return { id }
  })
}

export async function adminUpdateService(id: string, input: ServiceInput) {
  const db = useDatabase()
  await adminGetService(id)
  await assertSlugFree(services, input.slug, id)

  return db.transaction(async (tx) => {
    const { features, specifications, ...fields } = input
    await tx.update(services)
      .set({ ...fields, updatedAt: new Date() })
      .where(eq(services.id, id))

    // Child rows are replaced wholesale: the form always submits the complete
    // list, so diffing would add complexity without changing the result.
    await tx.delete(serviceFeatures).where(eq(serviceFeatures.serviceId, id))
    await tx.delete(serviceSpecifications).where(eq(serviceSpecifications.serviceId, id))

    if (features.length) {
      await tx.insert(serviceFeatures).values(
        features.map((f, i) => ({ ...f, serviceId: id, sortOrder: i + 1 })),
      )
    }
    if (specifications.length) {
      await tx.insert(serviceSpecifications).values(
        specifications.map((s, i) => ({ ...s, serviceId: id, sortOrder: i + 1 })),
      )
    }
    return { id }
  })
}

/** Reports what a service delete would take with it, for the confirm dialog. */
export async function adminServiceDeleteImpact(id: string) {
  const db = useDatabase()
  const [pricing] = await db.select({ value: count() })
    .from(pricingRows).where(eq(pricingRows.serviceId, id))
  const [quotes] = await db.select({ value: count() })
    .from(quoteRequests).where(eq(quoteRequests.serviceId, id))

  return { pricingRows: pricing?.value ?? 0, quoteRequests: quotes?.value ?? 0 }
}

export async function adminDeleteService(id: string) {
  const db = useDatabase()
  await adminGetService(id)
  // Pricing rows cascade; quote requests keep their history via SET NULL.
  await db.delete(services).where(eq(services.id, id))
  return { id }
}

export async function adminSetServiceActive(id: string, isActive: boolean) {
  const db = useDatabase()
  await adminGetService(id)
  await db.update(services)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(services.id, id))
  return { id, isActive }
}

export const adminReorderServices = (ids: string[]) => applyOrder(services, ids)

/* -------------------------------------------------------------------------- */
/* Pricing                                                                     */
/* -------------------------------------------------------------------------- */

export async function adminListPricingRows(query: ListQuery) {
  const db = useDatabase()
  const where = and(
    query.serviceId ? eq(pricingRows.serviceId, query.serviceId) : undefined,
    searchFilter(query.search, [pricingRows.titleFa, pricingRows.titleEn]),
  )

  const rows = await db.select({
    row: pricingRows,
    serviceTitleFa: services.titleFa,
    serviceTitleEn: services.titleEn,
    serviceSlug: services.slug,
  })
    .from(pricingRows)
    .innerJoin(services, eq(pricingRows.serviceId, services.id))
    .where(where)
    .orderBy(asc(services.sortOrder), asc(pricingRows.sortOrder))

  return rows.map(({ row, serviceTitleFa, serviceTitleEn, serviceSlug }) => ({
    ...row,
    service: { id: row.serviceId, slug: serviceSlug, titleFa: serviceTitleFa, titleEn: serviceTitleEn },
  }))
}

export async function adminGetPricingRow(id: string) {
  const db = useDatabase()
  const [row] = await db.select().from(pricingRows).where(eq(pricingRows.id, id)).limit(1)
  if (!row) notFound('Pricing row')
  return row
}

export async function adminCreatePricingRow(input: PricingRowInput) {
  const db = useDatabase()
  await assertExists(services, input.serviceId, 'serviceId')
  const [row] = await db.insert(pricingRows).values(input).returning({ id: pricingRows.id })
  return { id: row!.id }
}

export async function adminUpdatePricingRow(id: string, input: PricingRowInput) {
  const db = useDatabase()
  await adminGetPricingRow(id)
  await assertExists(services, input.serviceId, 'serviceId')
  await db.update(pricingRows)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(pricingRows.id, id))
  return { id }
}

export async function adminDeletePricingRow(id: string) {
  const db = useDatabase()
  await adminGetPricingRow(id)
  await db.delete(pricingRows).where(eq(pricingRows.id, id))
  return { id }
}

export const adminReorderPricingRows = (ids: string[]) => applyOrder(pricingRows, ids)

/* -------------------------------------------------------------------------- */
/* Equipment                                                                   */
/* -------------------------------------------------------------------------- */

const EQUIPMENT_TYPE_LABELS: Record<string, { fa: string, en: string }> = {
  offset: { fa: 'افست', en: 'Offset' },
  digital: { fa: 'دیجیتال', en: 'Digital' },
  prepress: { fa: 'پیش از چاپ', en: 'Prepress' },
  finishing: { fa: 'پس از چاپ', en: 'Finishing' },
}

export async function adminListEquipment(query: ListQuery) {
  const db = useDatabase()
  const where = and(
    searchFilter(query.search, [
      equipment.nameFa, equipment.nameEn, equipment.model,
      equipment.manufacturerEn, equipment.slug,
    ]),
    activeFilter(equipment.isActive, query.active),
    query.type && query.type !== 'all' ? eq(equipment.typeKey, query.type) : undefined,
  )

  const [rows, [total]] = await Promise.all([
    db.select().from(equipment).where(where)
      .orderBy(asc(equipment.sortOrder))
      .limit(query.perPage)
      .offset((query.page - 1) * query.perPage),
    db.select({ value: count() }).from(equipment).where(where),
  ])

  return { items: rows, total: total?.value ?? 0 }
}

export async function adminGetEquipment(id: string) {
  const db = useDatabase()
  const [row] = await db.select().from(equipment).where(eq(equipment.id, id)).limit(1)
  if (!row) notFound('Equipment')

  const specs = await db.select().from(equipmentSpecs)
    .where(eq(equipmentSpecs.equipmentId, id)).orderBy(asc(equipmentSpecs.sortOrder))

  return { ...row, specs }
}

export async function adminCreateEquipment(input: EquipmentInput) {
  const db = useDatabase()
  await assertSlugFree(equipment, input.slug)
  const labels = EQUIPMENT_TYPE_LABELS[input.typeKey]!

  return db.transaction(async (tx) => {
    const { specs, ...fields } = input
    const [row] = await tx.insert(equipment)
      .values({ ...fields, typeFa: labels.fa, typeEn: labels.en })
      .returning({ id: equipment.id })
    const id = row!.id

    if (specs.length) {
      await tx.insert(equipmentSpecs).values(
        specs.map((s, i) => ({ ...s, equipmentId: id, sortOrder: i + 1 })),
      )
    }
    return { id }
  })
}

export async function adminUpdateEquipment(id: string, input: EquipmentInput) {
  const db = useDatabase()
  await adminGetEquipment(id)
  await assertSlugFree(equipment, input.slug, id)
  const labels = EQUIPMENT_TYPE_LABELS[input.typeKey]!

  return db.transaction(async (tx) => {
    const { specs, ...fields } = input
    await tx.update(equipment)
      .set({ ...fields, typeFa: labels.fa, typeEn: labels.en, updatedAt: new Date() })
      .where(eq(equipment.id, id))

    await tx.delete(equipmentSpecs).where(eq(equipmentSpecs.equipmentId, id))
    if (specs.length) {
      await tx.insert(equipmentSpecs).values(
        specs.map((s, i) => ({ ...s, equipmentId: id, sortOrder: i + 1 })),
      )
    }
    return { id }
  })
}

export async function adminDeleteEquipment(id: string) {
  const db = useDatabase()
  await adminGetEquipment(id)
  await db.delete(equipment).where(eq(equipment.id, id))
  return { id }
}

export async function adminSetEquipmentActive(id: string, isActive: boolean) {
  const db = useDatabase()
  await adminGetEquipment(id)
  await db.update(equipment)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(equipment.id, id))
  return { id, isActive }
}

export const adminReorderEquipment = (ids: string[]) => applyOrder(equipment, ids)

/* -------------------------------------------------------------------------- */
/* Portfolio categories                                                        */
/* -------------------------------------------------------------------------- */

export async function adminListPortfolioCategories() {
  const db = useDatabase()
  const rows = await db.select({
    id: portfolioCategories.id,
    slug: portfolioCategories.slug,
    nameFa: portfolioCategories.nameFa,
    nameEn: portfolioCategories.nameEn,
    descriptionFa: portfolioCategories.descriptionFa,
    descriptionEn: portfolioCategories.descriptionEn,
    sortOrder: portfolioCategories.sortOrder,
  })
    .from(portfolioCategories)
    .orderBy(asc(portfolioCategories.sortOrder))

  const counts = await countChildren(portfolioItems.categoryId, rows.map(r => r.id))

  return rows.map(row => ({ ...row, itemCount: counts.get(row.id) ?? 0 }))
}

export async function adminGetPortfolioCategory(id: string) {
  const db = useDatabase()
  const [row] = await db.select().from(portfolioCategories)
    .where(eq(portfolioCategories.id, id)).limit(1)
  if (!row) notFound('Category')
  return row
}

export async function adminCreatePortfolioCategory(input: PortfolioCategoryInput) {
  const db = useDatabase()
  await assertSlugFree(portfolioCategories, input.slug)
  const [row] = await db.insert(portfolioCategories).values(input)
    .returning({ id: portfolioCategories.id })
  return { id: row!.id }
}

export async function adminUpdatePortfolioCategory(id: string, input: PortfolioCategoryInput) {
  const db = useDatabase()
  await adminGetPortfolioCategory(id)
  await assertSlugFree(portfolioCategories, input.slug, id)
  await db.update(portfolioCategories)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(portfolioCategories.id, id))
  return { id }
}

/**
 * Deletes a category, optionally moving its projects first.
 *
 * The schema uses ON DELETE RESTRICT, so a category holding projects cannot be
 * removed. Rather than letting that surface as a database error, the count is
 * checked up front and a 409 explains the options. When `moveToCategoryId` is
 * supplied the projects are reassigned inside the same transaction.
 */
export async function adminDeletePortfolioCategory(id: string, moveToCategoryId?: string) {
  const db = useDatabase()
  await adminGetPortfolioCategory(id)

  const [used] = await db.select({ value: count() })
    .from(portfolioItems).where(eq(portfolioItems.categoryId, id))
  const itemCount = used?.value ?? 0

  if (itemCount > 0 && !moveToCategoryId) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Category is in use',
      data: { itemCount },
    })
  }

  if (moveToCategoryId) {
    if (moveToCategoryId === id) {
      throw createError({
        statusCode: 422,
        statusMessage: 'Validation failed',
        data: { issues: { moveToCategoryId: ['Choose a different category'] } },
      })
    }
    await assertExists(portfolioCategories, moveToCategoryId, 'moveToCategoryId')
  }

  await db.transaction(async (tx) => {
    if (moveToCategoryId && itemCount > 0) {
      await tx.update(portfolioItems)
        .set({ categoryId: moveToCategoryId, updatedAt: new Date() })
        .where(eq(portfolioItems.categoryId, id))
    }
    await tx.delete(portfolioCategories).where(eq(portfolioCategories.id, id))
  })

  return { id, moved: moveToCategoryId ? itemCount : 0 }
}

export const adminReorderPortfolioCategories = (ids: string[]) =>
  applyOrder(portfolioCategories, ids)

/* -------------------------------------------------------------------------- */
/* Portfolio items                                                             */
/* -------------------------------------------------------------------------- */

export async function adminListPortfolioItems(query: ListQuery) {
  const db = useDatabase()
  const where = and(
    searchFilter(query.search, [
      portfolioItems.titleFa, portfolioItems.titleEn, portfolioItems.slug,
    ]),
    activeFilter(portfolioItems.isActive, query.active),
    query.category && query.category !== 'all'
      ? eq(portfolioItems.categoryId, query.category)
      : undefined,
    query.featured === 'yes'
      ? eq(portfolioItems.isFeatured, true)
      : query.featured === 'no' ? eq(portfolioItems.isFeatured, false) : undefined,
  )

  const [rows, [total]] = await Promise.all([
    db.select({
      id: portfolioItems.id,
      slug: portfolioItems.slug,
      titleFa: portfolioItems.titleFa,
      titleEn: portfolioItems.titleEn,
      coverImage: portfolioItems.coverImage,
      year: portfolioItems.year,
      isFeatured: portfolioItems.isFeatured,
      isActive: portfolioItems.isActive,
      sortOrder: portfolioItems.sortOrder,
      categoryId: portfolioItems.categoryId,
      categoryNameFa: portfolioCategories.nameFa,
      categoryNameEn: portfolioCategories.nameEn,
    })
      .from(portfolioItems)
      .innerJoin(portfolioCategories, eq(portfolioItems.categoryId, portfolioCategories.id))
      .where(where)
      .orderBy(asc(portfolioItems.sortOrder))
      .limit(query.perPage)
      .offset((query.page - 1) * query.perPage),
    db.select({ value: count() }).from(portfolioItems).where(where),
  ])

  const counts = await countChildren(portfolioImages.portfolioId, rows.map(r => r.id))

  return {
    items: rows.map(row => ({ ...row, imageCount: counts.get(row.id) ?? 0 })),
    total: total?.value ?? 0,
  }
}

export async function adminGetPortfolioItem(id: string) {
  const db = useDatabase()
  const [row] = await db.select().from(portfolioItems).where(eq(portfolioItems.id, id)).limit(1)
  if (!row) notFound('Portfolio project')

  const [images, details, links] = await Promise.all([
    db.select().from(portfolioImages)
      .where(eq(portfolioImages.portfolioId, id)).orderBy(asc(portfolioImages.sortOrder)),
    db.select().from(portfolioDetails)
      .where(eq(portfolioDetails.portfolioId, id)).orderBy(asc(portfolioDetails.sortOrder)),
    db.select({ serviceId: portfolioServices.serviceId })
      .from(portfolioServices).where(eq(portfolioServices.portfolioId, id)),
  ])

  return { ...row, images, details, serviceIds: links.map(l => l.serviceId) }
}

async function writePortfolioChildren(
  tx: Parameters<Parameters<ReturnType<typeof useDatabase>['transaction']>[0]>[0],
  id: string,
  input: PortfolioItemInput,
) {
  if (input.images.length) {
    await tx.insert(portfolioImages).values(
      input.images.map((img, i) => ({ ...img, portfolioId: id, sortOrder: i + 1 })),
    )
  }
  if (input.details.length) {
    await tx.insert(portfolioDetails).values(
      input.details.map((d, i) => ({ ...d, portfolioId: id, sortOrder: i + 1 })),
    )
  }
  if (input.serviceIds.length) {
    await tx.insert(portfolioServices).values(
      input.serviceIds.map(serviceId => ({ portfolioId: id, serviceId })),
    )
  }
}

export async function adminCreatePortfolioItem(input: PortfolioItemInput) {
  const db = useDatabase()
  await assertSlugFree(portfolioItems, input.slug)
  await assertExists(portfolioCategories, input.categoryId, 'categoryId')

  return db.transaction(async (tx) => {
    const { images: _i, details: _d, serviceIds: _s, ...fields } = input
    const [row] = await tx.insert(portfolioItems).values(fields)
      .returning({ id: portfolioItems.id })
    const id = row!.id
    await writePortfolioChildren(tx, id, input)
    return { id }
  })
}

export async function adminUpdatePortfolioItem(id: string, input: PortfolioItemInput) {
  const db = useDatabase()
  await adminGetPortfolioItem(id)
  await assertSlugFree(portfolioItems, input.slug, id)
  await assertExists(portfolioCategories, input.categoryId, 'categoryId')

  return db.transaction(async (tx) => {
    const { images: _i, details: _d, serviceIds: _s, ...fields } = input
    await tx.update(portfolioItems)
      .set({ ...fields, updatedAt: new Date() })
      .where(eq(portfolioItems.id, id))

    await tx.delete(portfolioImages).where(eq(portfolioImages.portfolioId, id))
    await tx.delete(portfolioDetails).where(eq(portfolioDetails.portfolioId, id))
    await tx.delete(portfolioServices).where(eq(portfolioServices.portfolioId, id))
    await writePortfolioChildren(tx, id, input)
    return { id }
  })
}

export async function adminDeletePortfolioItem(id: string) {
  const db = useDatabase()
  await adminGetPortfolioItem(id)
  // Images, details and service links all cascade.
  await db.delete(portfolioItems).where(eq(portfolioItems.id, id))
  return { id }
}

export async function adminSetPortfolioFlags(
  id: string,
  flags: { isActive?: boolean, isFeatured?: boolean },
) {
  const db = useDatabase()
  await adminGetPortfolioItem(id)
  await db.update(portfolioItems)
    .set({ ...flags, updatedAt: new Date() })
    .where(eq(portfolioItems.id, id))
  return { id, ...flags }
}

export const adminReorderPortfolioItems = (ids: string[]) => applyOrder(portfolioItems, ids)

/* -------------------------------------------------------------------------- */
/* FAQ                                                                         */
/* -------------------------------------------------------------------------- */

export async function adminListFaqs(query: ListQuery) {
  const db = useDatabase()
  const where = and(
    searchFilter(query.search, [faqs.questionFa, faqs.questionEn]),
    activeFilter(faqs.isActive, query.active),
    query.category && query.category !== 'all' ? eq(faqs.category, query.category) : undefined,
  )

  const rows = await db.select().from(faqs).where(where).orderBy(asc(faqs.sortOrder))
  return { items: rows, total: rows.length }
}

export async function adminGetFaq(id: string) {
  const db = useDatabase()
  const [row] = await db.select().from(faqs).where(eq(faqs.id, id)).limit(1)
  if (!row) notFound('FAQ')
  return row
}

export async function adminCreateFaq(input: FaqInput) {
  const db = useDatabase()
  const [row] = await db.insert(faqs).values(input).returning({ id: faqs.id })
  return { id: row!.id }
}

export async function adminUpdateFaq(id: string, input: FaqInput) {
  const db = useDatabase()
  await adminGetFaq(id)
  await db.update(faqs).set({ ...input, updatedAt: new Date() }).where(eq(faqs.id, id))
  return { id }
}

export async function adminDeleteFaq(id: string) {
  const db = useDatabase()
  await adminGetFaq(id)
  await db.delete(faqs).where(eq(faqs.id, id))
  return { id }
}

export async function adminSetFaqActive(id: string, isActive: boolean) {
  const db = useDatabase()
  await adminGetFaq(id)
  await db.update(faqs).set({ isActive, updatedAt: new Date() }).where(eq(faqs.id, id))
  return { id, isActive }
}

export const adminReorderFaqs = (ids: string[]) => applyOrder(faqs, ids)

/* -------------------------------------------------------------------------- */
/* Quote requests                                                              */
/* -------------------------------------------------------------------------- */

export async function adminListQuoteRequests(query: ListQuery) {
  const db = useDatabase()
  const where = and(
    searchFilter(query.search, [
      quoteRequests.fullName, quoteRequests.phone, quoteRequests.email, quoteRequests.company,
    ]),
    query.status && query.status !== 'all' ? eq(quoteRequests.status, query.status) : undefined,
  )

  const [rows, [total]] = await Promise.all([
    db.select({
      id: quoteRequests.id,
      fullName: quoteRequests.fullName,
      company: quoteRequests.company,
      phone: quoteRequests.phone,
      email: quoteRequests.email,
      quantity: quoteRequests.quantity,
      status: quoteRequests.status,
      createdAt: quoteRequests.createdAt,
      fileName: quoteRequests.fileName,
      serviceTitleFa: services.titleFa,
      serviceTitleEn: services.titleEn,
    })
      .from(quoteRequests)
      .leftJoin(services, eq(quoteRequests.serviceId, services.id))
      .where(where)
      .orderBy(desc(quoteRequests.createdAt))
      .limit(query.perPage)
      .offset((query.page - 1) * query.perPage),
    db.select({ value: count() }).from(quoteRequests).where(where),
  ])

  return { items: rows, total: total?.value ?? 0 }
}

export async function adminGetQuoteRequest(id: string) {
  const db = useDatabase()
  const [row] = await db.select({
    quote: quoteRequests,
    serviceTitleFa: services.titleFa,
    serviceTitleEn: services.titleEn,
  })
    .from(quoteRequests)
    .leftJoin(services, eq(quoteRequests.serviceId, services.id))
    .where(eq(quoteRequests.id, id))
    .limit(1)

  if (!row) notFound('Quote request')

  const { quote, serviceTitleFa, serviceTitleEn } = row
  return {
    id: quote.id,
    fullName: quote.fullName,
    company: quote.company,
    phone: quote.phone,
    email: quote.email,
    quantity: quote.quantity,
    description: quote.description,
    neededBy: quote.neededBy,
    // Only display metadata is exposed; the storage name stays server-side and
    // the file is reached by request id through the protected download route.
    fileName: quote.fileName,
    fileSize: quote.fileSize,
    fileMimeType: quote.fileMimeType,
    hasFile: Boolean(quote.fileUrl),
    locale: quote.locale,
    status: quote.status,
    internalNote: quote.internalNote,
    serviceTitle: serviceTitleFa && serviceTitleEn
      ? { fa: serviceTitleFa, en: serviceTitleEn }
      : null,
    createdAt: quote.createdAt,
    updatedAt: quote.updatedAt,
  }
}

export async function adminUpdateQuoteStatus(
  id: string,
  status: string,
  internalNote?: string | null,
) {
  const db = useDatabase()
  await adminGetQuoteRequest(id)
  await db.update(quoteRequests)
    .set({
      status,
      ...(internalNote !== undefined ? { internalNote } : {}),
      updatedAt: new Date(),
    })
    .where(eq(quoteRequests.id, id))
  return { id, status }
}

export async function adminDeleteQuoteRequest(id: string) {
  const db = useDatabase()
  const existing = await adminGetQuoteRequest(id)

  // Read the storage name before the row disappears, otherwise the attachment
  // is stranded on disk with nothing left pointing at it.
  const [stored] = existing.hasFile
    ? await db.select({ fileUrl: quoteRequests.fileUrl })
      .from(quoteRequests).where(eq(quoteRequests.id, id)).limit(1)
    : []

  await db.delete(quoteRequests).where(eq(quoteRequests.id, id))

  // Best effort: the request is already gone, so a failed unlink must not turn
  // a successful delete into an error. Worst case a stray file is left behind.
  if (stored?.fileUrl) await removeUpload(stored.fileUrl)

  return { id }
}

/** Resolves the stored file path for a request, for the download route. */
export async function adminGetQuoteFile(id: string) {
  const db = useDatabase()
  const [row] = await db.select({
    fileUrl: quoteRequests.fileUrl,
    fileName: quoteRequests.fileName,
    fileMimeType: quoteRequests.fileMimeType,
  }).from(quoteRequests).where(eq(quoteRequests.id, id)).limit(1)

  if (!row) notFound('Quote request')
  return row
}

/* -------------------------------------------------------------------------- */
/* Settings                                                                    */
/* -------------------------------------------------------------------------- */

export async function adminGetSiteSettingsRow() {
  const db = useDatabase()
  const [row] = await db.select().from(siteSettings).limit(1)
  return row ?? null
}

/**
 * Upsert on the fixed `default` key, so the single-row invariant holds even if
 * the table was somehow emptied.
 */
export async function adminUpdateSiteSettings(input: SiteSettingsInput) {
  const db = useDatabase()
  const existing = await adminGetSiteSettingsRow()

  if (existing) {
    await db.update(siteSettings)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(siteSettings.id, existing.id))
    return { id: existing.id }
  }

  const [row] = await db.insert(siteSettings)
    .values({ ...input, id: 'default' })
    .returning({ id: siteSettings.id })
  return { id: row!.id }
}

/* -------------------------------------------------------------------------- */
/* Dashboard                                                                   */
/* -------------------------------------------------------------------------- */

export async function adminDashboard() {
  const db = useDatabase()

  const [
    [totalServices], [activeServices], [portfolioCount], [equipmentCount],
    [newQuotes], [reviewingQuotes], [contactedQuotes], [completedQuotes], [totalQuotes],
  ] = await Promise.all([
    db.select({ value: count() }).from(services),
    db.select({ value: count() }).from(services).where(eq(services.isActive, true)),
    db.select({ value: count() }).from(portfolioItems),
    db.select({ value: count() }).from(equipment),
    db.select({ value: count() }).from(quoteRequests).where(eq(quoteRequests.status, 'NEW')),
    db.select({ value: count() }).from(quoteRequests).where(eq(quoteRequests.status, 'REVIEWING')),
    db.select({ value: count() }).from(quoteRequests).where(eq(quoteRequests.status, 'CONTACTED')),
    db.select({ value: count() }).from(quoteRequests).where(eq(quoteRequests.status, 'COMPLETED')),
    db.select({ value: count() }).from(quoteRequests),
  ])

  const recent = await db.select({
    id: quoteRequests.id,
    fullName: quoteRequests.fullName,
    phone: quoteRequests.phone,
    status: quoteRequests.status,
    createdAt: quoteRequests.createdAt,
    serviceTitleFa: services.titleFa,
    serviceTitleEn: services.titleEn,
  })
    .from(quoteRequests)
    .leftJoin(services, eq(quoteRequests.serviceId, services.id))
    .orderBy(desc(quoteRequests.createdAt))
    .limit(6)

  return {
    stats: {
      services: totalServices?.value ?? 0,
      activeServices: activeServices?.value ?? 0,
      portfolioItems: portfolioCount?.value ?? 0,
      equipment: equipmentCount?.value ?? 0,
      newQuoteRequests: newQuotes?.value ?? 0,
      reviewingQuoteRequests: reviewingQuotes?.value ?? 0,
      contactedQuoteRequests: contactedQuotes?.value ?? 0,
      completedQuoteRequests: completedQuotes?.value ?? 0,
      totalQuoteRequests: totalQuotes?.value ?? 0,
    },
    recentQuoteRequests: recent,
  }
}
