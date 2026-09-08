import { getThemeSettings } from '../repositories/content.repository'
import { buildThemeCss, sanitizeTheme } from '../../shared/theme/tokens'

/**
 * The active brand palette, served as a real stylesheet.
 *
 * Why a CSS route rather than applying variables from JavaScript: a `<link>`
 * in `<head>` is render-blocking, so the browser has the correct colours
 * before the first paint. Writing them from a client plugin would show the
 * compile-time defaults first and then repaint — the "flash of wrong theme"
 * the brief asks us to avoid.
 *
 * Every value has passed `sanitizeTheme`, so the body is a fixed set of
 * property names with literal `#rrggbb` values; a malformed or hostile row
 * degrades to the default palette rather than emitting arbitrary CSS.
 */
export default defineEventHandler(async (event) => {
  let css: string

  try {
    css = buildThemeCss(sanitizeTheme(await getThemeSettings()))
  }
  catch {
    // The site must still render if the database is unreachable.
    css = buildThemeCss(sanitizeTheme(null))
  }

  setResponseHeaders(event, {
    'content-type': 'text/css; charset=utf-8',
    // Short cache: a theme change should show up on the next refresh, which is
    // the behaviour promised to the administrator.
    'cache-control': 'public, max-age=0, must-revalidate',
  })

  return css
})
