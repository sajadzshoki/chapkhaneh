import { pgTable, text, integer, timestamp, uuid, jsonb, boolean } from 'drizzle-orm/pg-core'

/**
 * ---------------------------------------------------------------------------
 * Drizzle schema — phase 1 scope
 * ---------------------------------------------------------------------------
 * Only the tables the public site genuinely needs right now are defined:
 * inbound quote requests, plus the settings tables the admin panel will drive
 * in a later phase. Content (services, equipment, portfolio, FAQ) is still
 * served from typed mock data in `shared/data`, so those tables are
 * intentionally NOT created yet — they arrive when the admin CRUD does.
 */

export const quoteRequests = pgTable('quote_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  fullName: text('full_name').notNull(),
  company: text('company'),
  phone: text('phone').notNull(),
  email: text('email'),
  serviceSlug: text('service_slug').notNull(),
  quantity: integer('quantity').notNull(),
  description: text('description').notNull(),
  neededBy: text('needed_by'),
  locale: text('locale').notNull().default('fa'),
  /** new | in_review | quoted | won | lost */
  status: text('status').notNull().default('new'),
  internalNote: text('internal_note'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

/** Single-row table holding the editable site profile and theme overrides. */
export const siteSettings = pgTable('site_settings', {
  id: text('id').primaryKey().default('default'),
  /** Serialised `SiteSettings`. */
  profile: jsonb('profile').notNull(),
  /** Serialised `ThemeSettings`. */
  theme: jsonb('theme'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const adminUsers = pgTable('admin_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  /** owner | editor */
  role: text('role').notNull().default('editor'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
})

export type QuoteRequestRow = typeof quoteRequests.$inferSelect
export type NewQuoteRequestRow = typeof quoteRequests.$inferInsert
