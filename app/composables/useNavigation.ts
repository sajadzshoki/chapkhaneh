export interface NavItem {
  /** i18n key under `nav.*`. */
  key: string
  /** Unprefixed route path — resolved through `localePath()` at render time. */
  to: string
}

/**
 * Single source of truth for the public navigation.
 * Header, footer and mobile menu all read from here.
 */
export function useNavigation() {
  const mainNav: NavItem[] = [
    { key: 'nav.home', to: '/' },
    { key: 'nav.services', to: '/services' },
    { key: 'nav.pricing', to: '/pricing' },
    { key: 'nav.equipment', to: '/equipment' },
    { key: 'nav.portfolio', to: '/portfolio' },
    { key: 'nav.about', to: '/about' },
    { key: 'nav.faq', to: '/faq' },
    { key: 'nav.contact', to: '/contact' },
  ]

  return { mainNav }
}
