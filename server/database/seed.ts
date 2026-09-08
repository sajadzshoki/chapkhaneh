import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { services as mockServices } from '../../shared/data/services'
import { pricingGroups as mockPricing } from '../../shared/data/pricing'
import { equipment as mockEquipment } from '../../shared/data/equipment'
import { portfolioCategories as mockCategories, portfolioItems as mockPortfolio } from '../../shared/data/portfolio'
import { faqs as mockFaqs } from '../../shared/data/faq'
import { siteSettings as mockSite } from '../../shared/data/site'
import { brandTheme } from '../../shared/theme/brand'
import { hashPassword } from '../utils/password'
import * as schema from './schema'

/**
 * ---------------------------------------------------------------------------
 * Database seed
 * ---------------------------------------------------------------------------
 * Derives the demo dataset from the curated bilingual content in `shared/data`
 * rather than inventing a parallel dataset, so the seeded site is identical to
 * the phase 2 site.
 *
 * Safe to re-run: every table is truncated first, and the admin password comes
 * from the environment. Deterministic — no randomised values.
 */

const TYPE_LABELS: Record<string, { fa: string, en: string }> = {
  offset: { fa: 'افست', en: 'Offset' },
  digital: { fa: 'دیجیتال', en: 'Digital' },
  prepress: { fa: 'پیش از چاپ', en: 'Prepress' },
  finishing: { fa: 'پس از چاپ', en: 'Finishing' },
}

/** Parses «۱٬۰۰۰ عدد» / "1,000 pcs" into a plain integer quantity. */
function parseQuantity(en: string): number {
  const digits = en.replace(/[^\d]/g, '')
  return digits ? Number.parseInt(digits, 10) : 1
}

/** Extracts the unit label ("pcs", "sheets") from the quantity string. */
function parseUnit(fa: string, en: string): { fa: string, en: string } {
  const enUnit = en.replace(/[\d,.\s]/g, '').trim() || 'pcs'
  const faUnit = fa.replace(/[\d\u06F0-\u06F9,.٬\s]/g, '').trim() || 'عدد'
  return { fa: faUnit, en: enUnit }
}

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error('[seed] DATABASE_URL is not set. Copy .env.example to .env first.')
    process.exit(1)
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@mobinbartar.ir'
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword) {
    console.error('[seed] ADMIN_PASSWORD is not set. Refusing to seed a default password.')
    process.exit(1)
  }
  if (adminPassword.length < 10) {
    console.error('[seed] ADMIN_PASSWORD must be at least 10 characters.')
    process.exit(1)
  }

  const sql = postgres(url, { max: 1, onnotice: () => {} })
  const db = drizzle(sql, { schema })

  try {
    console.info('[seed] clearing existing data…')
    // Order matters only for readability; CASCADE handles dependants.
    await sql`
      TRUNCATE TABLE
        portfolio_services, portfolio_images, portfolio_details, portfolio_items,
        portfolio_categories, pricing_rows, service_features, service_specifications,
        equipment_specs, equipment, faqs, quote_requests, services,
        admin_users, site_settings, theme_settings
      RESTART IDENTITY CASCADE
    `

    /* ------------------------------- Admin ------------------------------- */
    console.info('[seed] admin user…')
    await db.insert(schema.adminUsers).values({
      email: adminEmail.toLowerCase(),
      passwordHash: await hashPassword(adminPassword),
    })

    /* ------------------------------ Settings ----------------------------- */
    console.info('[seed] site + theme settings…')
    const hours = mockSite.workingHours[0]
    await db.insert(schema.siteSettings).values({
      id: 'default',
      companyNameFa: mockSite.companyName.fa,
      companyNameEn: mockSite.companyName.en,
      legalNameFa: mockSite.legalName.fa,
      legalNameEn: mockSite.legalName.en,
      taglineFa: mockSite.tagline.fa,
      taglineEn: mockSite.tagline.en,
      descriptionFa: mockSite.description.fa,
      descriptionEn: mockSite.description.en,
      foundedYear: mockSite.foundedYear,
      phone: mockSite.contact.phones[0] ?? '',
      phoneSecondary: mockSite.contact.phones[1] ?? null,
      fax: mockSite.contact.fax ?? null,
      email: mockSite.contact.email,
      salesEmail: mockSite.contact.salesEmail ?? null,
      addressFa: mockSite.contact.address.fa,
      addressEn: mockSite.contact.address.en,
      cityFa: mockSite.contact.city.fa,
      cityEn: mockSite.contact.city.en,
      postalCode: mockSite.contact.postalCode ?? null,
      mapUrl: mockSite.contact.mapUrl ?? null,
      workingHoursFa: hours?.hours.fa ?? '',
      workingHoursEn: hours?.hours.en ?? '',
      workingHoursDaysFa: hours?.days.fa ?? null,
      workingHoursDaysEn: hours?.days.en ?? null,
      logo: mockSite.brand.logo,
      mark: mockSite.brand.mark,
      favicon: mockSite.brand.favicon,
      ogImage: mockSite.brand.ogImage ?? null,
      instagramUrl: mockSite.social.find(s => s.platform === 'instagram')?.url ?? null,
      linkedinUrl: mockSite.social.find(s => s.platform === 'linkedin')?.url ?? null,
      telegramUrl: mockSite.social.find(s => s.platform === 'telegram')?.url ?? null,
      whatsappUrl: mockSite.social.find(s => s.platform === 'whatsapp')?.url ?? null,
    })

    await db.insert(schema.themeSettings).values({
      id: 'default',
      primary: brandTheme.colors.primary,
      secondary: brandTheme.colors.secondary,
      accent: brandTheme.colors.accent,
      background: '#ffffff',
      surface: '#ffffff',
      foreground: '#14181d',
      muted: '#697787',
      border: '#e2e6ea',
    })

    /* ------------------------------ Services ----------------------------- */
    console.info(`[seed] ${mockServices.length} services…`)
    const serviceIdBySlug = new Map<string, string>()

    for (const [index, service] of mockServices.entries()) {
      const [row] = await db.insert(schema.services).values({
        slug: service.slug,
        titleFa: service.title.fa,
        titleEn: service.title.en,
        shortDescriptionFa: service.summary.fa,
        shortDescriptionEn: service.summary.en,
        descriptionFa: service.description.fa,
        descriptionEn: service.description.en,
        image: service.image?.src ?? null,
        minimumOrderFa: service.minimumOrder?.fa ?? null,
        minimumOrderEn: service.minimumOrder?.en ?? null,
        turnaroundFa: service.turnaround?.fa ?? null,
        turnaroundEn: service.turnaround?.en ?? null,
        isActive: true,
        sortOrder: service.order ?? index + 1,
      }).returning({ id: schema.services.id })

      const serviceId = row!.id
      serviceIdBySlug.set(service.slug, serviceId)

      // Features are parallel fa/en arrays; zip them by position.
      const featureCount = Math.max(service.features.fa.length, service.features.en.length)
      if (featureCount) {
        await db.insert(schema.serviceFeatures).values(
          Array.from({ length: featureCount }, (_, i) => ({
            serviceId,
            valueFa: service.features.fa[i] ?? service.features.en[i] ?? '',
            valueEn: service.features.en[i] ?? service.features.fa[i] ?? '',
            sortOrder: i + 1,
          })),
        )
      }

      if (service.specifications?.length) {
        await db.insert(schema.serviceSpecifications).values(
          service.specifications.map((spec, specIndex) => ({
            serviceId,
            labelFa: spec.label.fa,
            labelEn: spec.label.en,
            valuesFa: spec.values.fa.join('\n'),
            valuesEn: spec.values.en.join('\n'),
            sortOrder: specIndex + 1,
          })),
        )
      }
    }

    /* ------------------------------- Pricing ----------------------------- */
    const pricingValues = mockPricing.flatMap(group =>
      group.rows.map((row, rowIndex) => {
        const serviceId = serviceIdBySlug.get(group.serviceSlug)
        if (!serviceId) return null
        const unit = parseUnit(row.quantity.fa, row.quantity.en)
        return {
          serviceId,
          titleFa: row.title.fa,
          titleEn: row.title.en,
          quantity: parseQuantity(row.quantity.en),
          specificationFa: row.specification.fa,
          specificationEn: row.specification.en,
          unitFa: unit.fa,
          unitEn: unit.en,
          price: row.price,
          currency: row.currency,
          turnaroundFa: row.turnaround?.fa ?? null,
          turnaroundEn: row.turnaround?.en ?? null,
          noteFa: row.note?.fa ?? null,
          noteEn: row.note?.en ?? null,
          sortOrder: rowIndex + 1,
        }
      }).filter(v => v !== null),
    )

    console.info(`[seed] ${pricingValues.length} pricing rows…`)
    if (pricingValues.length) await db.insert(schema.pricingRows).values(pricingValues)

    /* ------------------------------ Equipment ---------------------------- */
    console.info(`[seed] ${mockEquipment.length} equipment items…`)
    for (const [index, machine] of mockEquipment.entries()) {
      const labels = TYPE_LABELS[machine.type] ?? { fa: machine.type, en: machine.type }
      const [row] = await db.insert(schema.equipment).values({
        slug: machine.slug,
        nameFa: machine.title.fa,
        nameEn: machine.title.en,
        manufacturerFa: machine.manufacturer,
        manufacturerEn: machine.manufacturer,
        model: machine.name,
        typeFa: labels.fa,
        typeEn: labels.en,
        typeKey: machine.type,
        installedYear: machine.installedYear,
        descriptionFa: machine.description.fa,
        descriptionEn: machine.description.en,
        image: machine.image?.src ?? null,
        isActive: true,
        sortOrder: machine.order ?? index + 1,
      }).returning({ id: schema.equipment.id })

      if (machine.specs.length) {
        await db.insert(schema.equipmentSpecs).values(
          machine.specs.map((spec, specIndex) => ({
            equipmentId: row!.id,
            labelFa: spec.label.fa,
            labelEn: spec.label.en,
            valueFa: spec.value.fa,
            valueEn: spec.value.en,
            sortOrder: specIndex + 1,
          })),
        )
      }
    }

    /* ------------------------------ Portfolio ---------------------------- */
    console.info(`[seed] ${mockCategories.length} portfolio categories…`)
    const categoryIdBySlug = new Map<string, string>()

    for (const [index, category] of mockCategories.entries()) {
      const [row] = await db.insert(schema.portfolioCategories).values({
        slug: category.slug,
        nameFa: category.title.fa,
        nameEn: category.title.en,
        descriptionFa: category.description?.fa ?? null,
        descriptionEn: category.description?.en ?? null,
        sortOrder: category.order ?? index + 1,
      }).returning({ id: schema.portfolioCategories.id })

      categoryIdBySlug.set(category.slug, row!.id)
    }

    console.info(`[seed] ${mockPortfolio.length} portfolio items…`)
    for (const [index, item] of mockPortfolio.entries()) {
      const categoryId = categoryIdBySlug.get(item.categorySlug)
      if (!categoryId) {
        console.warn(`[seed] skipping ${item.slug}: unknown category ${item.categorySlug}`)
        continue
      }

      const [row] = await db.insert(schema.portfolioItems).values({
        slug: item.slug,
        titleFa: item.title.fa,
        titleEn: item.title.en,
        descriptionFa: item.description.fa,
        descriptionEn: item.description.en,
        coverImage: item.image.src,
        year: item.year,
        clientFa: item.client.fa,
        clientEn: item.client.en,
        categoryId,
        isFeatured: item.featured,
        isActive: true,
        sortOrder: index + 1,
      }).returning({ id: schema.portfolioItems.id })

      const portfolioId = row!.id

      if (item.gallery?.length) {
        await db.insert(schema.portfolioImages).values(
          item.gallery.map((image, imageIndex) => ({
            portfolioId,
            image: image.src,
            altFa: image.alt.fa,
            altEn: image.alt.en,
            sortOrder: imageIndex + 1,
          })),
        )
      }

      if (item.details.length) {
        await db.insert(schema.portfolioDetails).values(
          item.details.map((detail, detailIndex) => ({
            portfolioId,
            labelFa: detail.label.fa,
            labelEn: detail.label.en,
            valueFa: detail.value.fa,
            valueEn: detail.value.en,
            sortOrder: detailIndex + 1,
          })),
        )
      }

      const linkedServiceIds = (item.serviceSlugs ?? [])
        .map(slug => serviceIdBySlug.get(slug))
        .filter((id): id is string => Boolean(id))

      if (linkedServiceIds.length) {
        await db.insert(schema.portfolioServices).values(
          linkedServiceIds.map(serviceId => ({ portfolioId, serviceId })),
        )
      }
    }

    /* --------------------------------- FAQ ------------------------------- */
    console.info(`[seed] ${mockFaqs.length} FAQs…`)
    await db.insert(schema.faqs).values(
      mockFaqs.map((faq, index) => ({
        category: faq.category,
        questionFa: faq.question.fa,
        questionEn: faq.question.en,
        answerFa: faq.answer.fa,
        answerEn: faq.answer.en,
        isActive: true,
        sortOrder: faq.order ?? index + 1,
      })),
    )

    console.info('[seed] done.')
    console.info(`[seed] admin login: ${adminEmail}`)
  }
  catch (error) {
    console.error('[seed] failed:', error instanceof Error ? error.message : error)
    process.exitCode = 1
  }
  finally {
    await sql.end()
  }
}

void main()
