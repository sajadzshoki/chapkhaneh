import { getSiteSettings, getThemeSettings } from '../../repositories/content.repository'

export default defineEventHandler(async () => {
  const [site, theme] = await Promise.all([getSiteSettings(), getThemeSettings()])
  return { site, theme }
})
