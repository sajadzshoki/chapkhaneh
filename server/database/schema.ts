import { relations, sql } from 'drizzle-orm'
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

/**
 * ---------------------------------------------------------------------------
 * Drizzle schema
 * ---------------------------------------------------------------------------
 * Bilingual content is stored as paired `*Fa` / `*En` columns rather than JSON
 * so that the database can index, constrain and validate individual fields.
 * The mapping back to the `Localized<T>` shape the UI expects happens in
 * `server/database/mappers.ts`, which keeps the public API contract stable.
 *
 * Timestamps are `withTimezone` everywhere. `sortOrder` drives display order.
 */

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}

/* -------------------------------------------------------------------------- */
/* Admin                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * There is exactly one admin account in this phase: no roles, no permissions,
 * no self-service registration. The seed creates it.
 */
export const adminUsers = pgTable('admin_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull(),
  /** scrypt hash, format `scrypt$N$r$p$salt$key` — never returned by any API. */
  passwordHash: text('password_hash').notNull(),
  ...timestamps,
}, table => [
  uniqueIndex('admin_users_email_key').on(table.email),
])

/* -------------------------------------------------------------------------- */
/* Services + pricing                                                          */
/* -------------------------------------------------------------------------- */

export const services = pgTable('services', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull(),
  titleFa: text('title_fa').notNull(),
  titleEn: text('title_en').notNull(),
  shortDescriptionFa: text('short_description_fa').notNull(),
  shortDescriptionEn: text('short_description_en').notNull(),
  descriptionFa: text('description_fa').notNull(),
  descriptionEn: text('description_en').notNull(),
  image: text('image'),
  minimumOrderFa: text('minimum_order_fa'),
  minimumOrderEn: text('minimum_order_en'),
  turnaroundFa: text('turnaround_fa'),
  turnaroundEn: text('turnaround_en'),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  ...timestamps,
}, table => [
  uniqueIndex('services_slug_key').on(table.slug),
  index('services_active_order_idx').on(table.isActive, table.sortOrder),
])

/**
 * Pricing rows belong to a service. `onDelete: 'cascade'` is the simplest safe
 * strategy here: a price list has no meaning without its service, so removing
 * the service removes its rows rather than orphaning them.
 */
export const pricingRows = pgTable('pricing_rows', {
  id: uuid('id').primaryKey().defaultRandom(),
  serviceId: uuid('service_id').notNull()
    .references(() => services.id, { onDelete: 'cascade' }),
  /** Row label, e.g. «سلفون مات» / "Matte laminated". */
  titleFa: text('title_fa').notNull(),
  titleEn: text('title_en').notNull(),
  quantity: integer('quantity').notNull(),
  specificationFa: text('specification_fa').notNull(),
  specificationEn: text('specification_en').notNull(),
  turnaroundFa: text('turnaround_fa'),
  turnaroundEn: text('turnaround_en'),
  noteFa: text('note_fa'),
  noteEn: text('note_en'),
  unitFa: text('unit_fa').notNull(),
  unitEn: text('unit_en').notNull(),
  /** Stored in whole Toman. Integer to avoid float rounding on money. */
  price: integer('price').notNull(),
  currency: text('currency').notNull().default('IRT'),
  sortOrder: integer('sort_order').notNull().default(0),
  ...timestamps,
}, table => [
  index('pricing_rows_service_idx').on(table.serviceId, table.sortOrder),
  check('pricing_rows_price_positive', sql`${table.price} >= 0`),
  check('pricing_rows_quantity_positive', sql`${table.quantity} > 0`),
  check('pricing_rows_currency_valid', sql`${table.currency} IN ('IRT', 'IRR')`),
])


/** Bullet points listing what a service includes. */
export const serviceFeatures = pgTable('service_features', {
  id: uuid('id').primaryKey().defaultRandom(),
  serviceId: uuid('service_id').notNull()
    .references(() => services.id, { onDelete: 'cascade' }),
  valueFa: text('value_fa').notNull(),
  valueEn: text('value_en').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
}, table => [
  index('service_features_service_idx').on(table.serviceId, table.sortOrder),
])

/**
 * Specification groups (formats, papers, binding...). `values*` hold a
 * newline-separated list — a child table per bullet would be over-normalised
 * for content that is always read and edited as one block.
 */
export const serviceSpecifications = pgTable('service_specifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  serviceId: uuid('service_id').notNull()
    .references(() => services.id, { onDelete: 'cascade' }),
  labelFa: text('label_fa').notNull(),
  labelEn: text('label_en').notNull(),
  valuesFa: text('values_fa').notNull(),
  valuesEn: text('values_en').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
}, table => [
  index('service_specifications_service_idx').on(table.serviceId, table.sortOrder),
])

/* -------------------------------------------------------------------------- */
/* Equipment                                                                   */
/* -------------------------------------------------------------------------- */

export const equipment = pgTable('equipment', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull(),
  nameFa: text('name_fa').notNull(),
  nameEn: text('name_en').notNull(),
  manufacturerFa: text('manufacturer_fa').notNull(),
  manufacturerEn: text('manufacturer_en').notNull(),
  model: text('model').notNull(),
  typeFa: text('type_fa').notNull(),
  typeEn: text('type_en').notNull(),
  /** Stable machine-readable type key used for filtering in the UI. */
  typeKey: text('type_key').notNull(),
  installedYear: integer('installed_year'),
  descriptionFa: text('description_fa').notNull(),
  descriptionEn: text('description_en').notNull(),
  image: text('image'),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  ...timestamps,
}, table => [
  uniqueIndex('equipment_slug_key').on(table.slug),
  index('equipment_active_order_idx').on(table.isActive, table.sortOrder),
  check('equipment_type_valid', sql`${table.typeKey} IN ('offset', 'digital', 'prepress', 'finishing')`),
])

/** Machine specifications, kept relational so the admin can edit rows later. */
export const equipmentSpecs = pgTable('equipment_specs', {
  id: uuid('id').primaryKey().defaultRandom(),
  equipmentId: uuid('equipment_id').notNull()
    .references(() => equipment.id, { onDelete: 'cascade' }),
  labelFa: text('label_fa').notNull(),
  labelEn: text('label_en').notNull(),
  valueFa: text('value_fa').notNull(),
  valueEn: text('value_en').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
}, table => [
  index('equipment_specs_equipment_idx').on(table.equipmentId, table.sortOrder),
])

/* -------------------------------------------------------------------------- */
/* Portfolio                                                                   */
/* -------------------------------------------------------------------------- */

export const portfolioCategories = pgTable('portfolio_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull(),
  nameFa: text('name_fa').notNull(),
  nameEn: text('name_en').notNull(),
  descriptionFa: text('description_fa'),
  descriptionEn: text('description_en'),
  sortOrder: integer('sort_order').notNull().default(0),
  ...timestamps,
}, table => [
  uniqueIndex('portfolio_categories_slug_key').on(table.slug),
])

/**
 * `onDelete: 'restrict'` on the category: deleting a category that still holds
 * projects would strand them, so the database refuses and the admin has to
 * move or remove the projects first.
 */
export const portfolioItems = pgTable('portfolio_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull(),
  titleFa: text('title_fa').notNull(),
  titleEn: text('title_en').notNull(),
  descriptionFa: text('description_fa').notNull(),
  descriptionEn: text('description_en').notNull(),
  coverImage: text('cover_image').notNull(),
  year: integer('year'),
  clientFa: text('client_fa'),
  clientEn: text('client_en'),
  categoryId: uuid('category_id').notNull()
    .references(() => portfolioCategories.id, { onDelete: 'restrict' }),
  isFeatured: boolean('is_featured').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  ...timestamps,
}, table => [
  uniqueIndex('portfolio_items_slug_key').on(table.slug),
  index('portfolio_items_category_idx').on(table.categoryId, table.sortOrder),
  index('portfolio_items_active_order_idx').on(table.isActive, table.sortOrder),
])

/** Gallery frames. Cascade: images are meaningless without their project. */
export const portfolioImages = pgTable('portfolio_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  portfolioId: uuid('portfolio_id').notNull()
    .references(() => portfolioItems.id, { onDelete: 'cascade' }),
  image: text('image').notNull(),
  altFa: text('alt_fa').notNull(),
  altEn: text('alt_en').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
}, table => [
  index('portfolio_images_portfolio_idx').on(table.portfolioId, table.sortOrder),
])

/** Production details shown as a small spec list on the project page. */
export const portfolioDetails = pgTable('portfolio_details', {
  id: uuid('id').primaryKey().defaultRandom(),
  portfolioId: uuid('portfolio_id').notNull()
    .references(() => portfolioItems.id, { onDelete: 'cascade' }),
  labelFa: text('label_fa').notNull(),
  labelEn: text('label_en').notNull(),
  valueFa: text('value_fa').notNull(),
  valueEn: text('value_en').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
}, table => [
  index('portfolio_details_portfolio_idx').on(table.portfolioId, table.sortOrder),
])

/** Join table linking a project to the services used to produce it. */
export const portfolioServices = pgTable('portfolio_services', {
  portfolioId: uuid('portfolio_id').notNull()
    .references(() => portfolioItems.id, { onDelete: 'cascade' }),
  serviceId: uuid('service_id').notNull()
    .references(() => services.id, { onDelete: 'cascade' }),
}, table => [
  uniqueIndex('portfolio_services_pk').on(table.portfolioId, table.serviceId),
])

/* -------------------------------------------------------------------------- */
/* FAQ                                                                         */
/* -------------------------------------------------------------------------- */

export const faqs = pgTable('faqs', {
  id: uuid('id').primaryKey().defaultRandom(),
  category: text('category').notNull().default('orders'),
  questionFa: text('question_fa').notNull(),
  questionEn: text('question_en').notNull(),
  answerFa: text('answer_fa').notNull(),
  answerEn: text('answer_en').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  ...timestamps,
}, table => [
  index('faqs_active_order_idx').on(table.isActive, table.sortOrder),
  check('faqs_category_valid', sql`${table.category} IN ('orders', 'technical', 'delivery', 'pricing')`),
])

/* -------------------------------------------------------------------------- */
/* Quote requests                                                              */
/* -------------------------------------------------------------------------- */

export const QUOTE_STATUSES = ['NEW', 'REVIEWING', 'CONTACTED', 'COMPLETED'] as const
export type QuoteStatus = (typeof QUOTE_STATUSES)[number]

/**
 * `onDelete: 'set null'` on the service: a quote request is a business record
 * and must survive the deletion of the service it referenced.
 */
export const quoteRequests = pgTable('quote_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  fullName: text('full_name').notNull(),
  company: text('company'),
  phone: text('phone').notNull(),
  email: text('email'),
  serviceId: uuid('service_id').references(() => services.id, { onDelete: 'set null' }),
  quantity: integer('quantity'),
  description: text('description').notNull(),
  neededBy: text('needed_by'),
  fileUrl: text('file_url'),
  fileName: text('file_name'),
  locale: text('locale').notNull().default('fa'),
  status: text('status').notNull().default('NEW'),
  internalNote: text('internal_note'),
  ...timestamps,
}, table => [
  index('quote_requests_status_idx').on(table.status, table.createdAt),
  index('quote_requests_created_idx').on(table.createdAt),
  check('quote_requests_status_valid', sql`${table.status} IN ('NEW', 'REVIEWING', 'CONTACTED', 'COMPLETED')`),
  check('quote_requests_locale_valid', sql`${table.locale} IN ('fa', 'en')`),
])

/* -------------------------------------------------------------------------- */
/* Settings                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Single-row tables. `id` is a fixed text key ('default') so an upsert can
 * never accidentally create a second row.
 */
export const siteSettings = pgTable('site_settings', {
  id: text('id').primaryKey().default('default'),
  companyNameFa: text('company_name_fa').notNull(),
  companyNameEn: text('company_name_en').notNull(),
  legalNameFa: text('legal_name_fa'),
  legalNameEn: text('legal_name_en'),
  taglineFa: text('tagline_fa').notNull(),
  taglineEn: text('tagline_en').notNull(),
  descriptionFa: text('description_fa'),
  descriptionEn: text('description_en'),
  foundedYear: integer('founded_year'),
  phone: text('phone').notNull(),
  phoneSecondary: text('phone_secondary'),
  fax: text('fax'),
  email: text('email').notNull(),
  salesEmail: text('sales_email'),
  addressFa: text('address_fa').notNull(),
  addressEn: text('address_en').notNull(),
  cityFa: text('city_fa'),
  cityEn: text('city_en'),
  postalCode: text('postal_code'),
  mapUrl: text('map_url'),
  workingHoursFa: text('working_hours_fa').notNull(),
  workingHoursEn: text('working_hours_en').notNull(),
  workingHoursDaysFa: text('working_hours_days_fa'),
  workingHoursDaysEn: text('working_hours_days_en'),
  logo: text('logo'),
  mark: text('mark'),
  favicon: text('favicon'),
  ogImage: text('og_image'),
  instagramUrl: text('instagram_url'),
  linkedinUrl: text('linkedin_url'),
  telegramUrl: text('telegram_url'),
  whatsappUrl: text('whatsapp_url'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const themeSettings = pgTable('theme_settings', {
  id: text('id').primaryKey().default('default'),
  primary: text('primary').notNull(),
  secondary: text('secondary').notNull(),
  accent: text('accent').notNull(),
  background: text('background').notNull(),
  surface: text('surface').notNull(),
  foreground: text('foreground').notNull(),
  muted: text('muted').notNull(),
  border: text('border').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

/* -------------------------------------------------------------------------- */
/* Relations                                                                   */
/* -------------------------------------------------------------------------- */

export const servicesRelations = relations(services, ({ many }) => ({
  features: many(serviceFeatures),
  specifications: many(serviceSpecifications),
  pricingRows: many(pricingRows),
  quoteRequests: many(quoteRequests),
  portfolioServices: many(portfolioServices),
}))

export const serviceFeaturesRelations = relations(serviceFeatures, ({ one }) => ({
  service: one(services, { fields: [serviceFeatures.serviceId], references: [services.id] }),
}))

export const serviceSpecificationsRelations = relations(serviceSpecifications, ({ one }) => ({
  service: one(services, { fields: [serviceSpecifications.serviceId], references: [services.id] }),
}))

export const pricingRowsRelations = relations(pricingRows, ({ one }) => ({
  service: one(services, { fields: [pricingRows.serviceId], references: [services.id] }),
}))

export const equipmentRelations = relations(equipment, ({ many }) => ({
  specs: many(equipmentSpecs),
}))

export const equipmentSpecsRelations = relations(equipmentSpecs, ({ one }) => ({
  equipment: one(equipment, { fields: [equipmentSpecs.equipmentId], references: [equipment.id] }),
}))

export const portfolioCategoriesRelations = relations(portfolioCategories, ({ many }) => ({
  items: many(portfolioItems),
}))

export const portfolioItemsRelations = relations(portfolioItems, ({ one, many }) => ({
  category: one(portfolioCategories, {
    fields: [portfolioItems.categoryId],
    references: [portfolioCategories.id],
  }),
  images: many(portfolioImages),
  details: many(portfolioDetails),
  services: many(portfolioServices),
}))

export const portfolioImagesRelations = relations(portfolioImages, ({ one }) => ({
  item: one(portfolioItems, { fields: [portfolioImages.portfolioId], references: [portfolioItems.id] }),
}))

export const portfolioDetailsRelations = relations(portfolioDetails, ({ one }) => ({
  item: one(portfolioItems, { fields: [portfolioDetails.portfolioId], references: [portfolioItems.id] }),
}))

export const portfolioServicesRelations = relations(portfolioServices, ({ one }) => ({
  item: one(portfolioItems, { fields: [portfolioServices.portfolioId], references: [portfolioItems.id] }),
  service: one(services, { fields: [portfolioServices.serviceId], references: [services.id] }),
}))

export const quoteRequestsRelations = relations(quoteRequests, ({ one }) => ({
  service: one(services, { fields: [quoteRequests.serviceId], references: [services.id] }),
}))

/* -------------------------------------------------------------------------- */
/* Row types                                                                   */
/* -------------------------------------------------------------------------- */

export type AdminUserRow = typeof adminUsers.$inferSelect
export type ServiceRow = typeof services.$inferSelect
export type ServiceFeatureRow = typeof serviceFeatures.$inferSelect
export type ServiceSpecificationRow = typeof serviceSpecifications.$inferSelect
export type PricingRowRow = typeof pricingRows.$inferSelect
export type EquipmentRow = typeof equipment.$inferSelect
export type EquipmentSpecRow = typeof equipmentSpecs.$inferSelect
export type PortfolioCategoryRow = typeof portfolioCategories.$inferSelect
export type PortfolioItemRow = typeof portfolioItems.$inferSelect
export type PortfolioImageRow = typeof portfolioImages.$inferSelect
export type PortfolioDetailRow = typeof portfolioDetails.$inferSelect
export type FaqRow = typeof faqs.$inferSelect
export type QuoteRequestRow = typeof quoteRequests.$inferSelect
export type NewQuoteRequestRow = typeof quoteRequests.$inferInsert
export type SiteSettingsRow = typeof siteSettings.$inferSelect
export type ThemeSettingsRow = typeof themeSettings.$inferSelect
