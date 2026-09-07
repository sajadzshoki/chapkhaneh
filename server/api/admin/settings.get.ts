import { adminGetSiteSettingsRow } from '../../repositories/admin.repository'
import { getThemeSettings } from '../../repositories/content.repository'

export default defineEventHandler(async () => {
  const [site, theme] = await Promise.all([adminGetSiteSettingsRow(), getThemeSettings()])
  return { site, theme }
})
