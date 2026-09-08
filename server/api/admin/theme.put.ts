import { adminUpdateTheme } from '../../repositories/admin.repository'
import { themeSettingsInputSchema } from '../../utils/admin-schemas'
import { readValidatedBodyOrThrow } from '../../utils/validation'

/**
 * Saves the brand palette.
 *
 * Colours are validated as strict hex by the schema and sanitised again in the
 * repository, so nothing that is not `#rrggbb` can reach the stylesheet.
 */
export default defineEventHandler(async (event) => {
  const input = await readValidatedBodyOrThrow(event, themeSettingsInputSchema)
  return await adminUpdateTheme(input)
})
