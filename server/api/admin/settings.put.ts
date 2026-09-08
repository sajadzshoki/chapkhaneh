import { adminUpdateSiteSettings } from '../../repositories/admin.repository'
import { siteSettingsInputSchema } from '../../utils/admin-schemas'
import { readValidatedBodyOrThrow } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  const input = await readValidatedBodyOrThrow(event, siteSettingsInputSchema)
  return await adminUpdateSiteSettings(input)
})
