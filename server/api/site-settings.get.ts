import { siteSettings } from '~~/shared/data/site'
import { brandTheme } from '~~/shared/theme/brand'

export default defineEventHandler(() => ({
  site: siteSettings,
  theme: {
    primary: brandTheme.colors.primary,
    secondary: brandTheme.colors.secondary,
    accent: brandTheme.colors.accent,
    logo: siteSettings.brand.logo,
    favicon: siteSettings.brand.favicon,
  },
}))
