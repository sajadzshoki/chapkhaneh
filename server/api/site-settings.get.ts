import { getSiteSettings, getThemeSettings } from '../repositories/content.repository'

/**
 * Public site profile + theme tokens.
 * Returns only presentational fields — no admin or internal data.
 */
export default defineEventHandler(async () => {
  const [site, theme] = await Promise.all([getSiteSettings(), getThemeSettings()])

  if (!site) {
    throw createError({ statusCode: 404, statusMessage: 'Site settings not found' })
  }

  return {
    site,
    theme: theme
      ? { ...theme, logo: site.brand.logo, favicon: site.brand.favicon }
      : null,
  }
})
