import type { SiteSettings } from '../types'

/**
 * ---------------------------------------------------------------------------
 * DEMO COMPANY PROFILE — "Mobin Bartar" / «مبین برتر»
 * ---------------------------------------------------------------------------
 * This is the ONLY place company identity lives. To rebrand the product for a
 * different printing house, edit this file plus `shared/theme/brand.ts`.
 */
export const siteSettings: SiteSettings = {
  companyName: {
    fa: 'مبین برتر',
    en: 'Mobin Bartar',
  },
  legalName: {
    fa: 'شرکت چاپ و بسته‌بندی مبین برتر',
    en: 'Mobin Bartar Printing & Packaging Co.',
  },
  tagline: {
    fa: 'چاپ صنعتی، دقیق و قابل اتکا',
    en: 'Industrial printing. Precise and dependable.',
  },
  description: {
    fa: 'مبین برتر از سال ۱۳۷۹ در زمینهٔ چاپ افست ورقی، چاپ دیجیتال، تولید بسته‌بندی و خدمات پس از چاپ فعالیت می‌کند. با بیش از ۲۰۰ هزار متر مربع ظرفیت چاپ ماهانه، سفارش‌های سازمانی و انتشاراتی را در تیراژهای بالا با کیفیت یکنواخت تحویل می‌دهیم.',
    en: 'Since 2000, Mobin Bartar has delivered sheet-fed offset, digital printing, packaging production and post-press finishing. With a monthly capacity of over 200,000 square metres, we handle high-volume corporate and publishing work with consistent quality.',
  },
  foundedYear: 2000,

  contact: {
    phones: ['۰۲۱-۶۶۵۴۳۲۱۰', '۰۲۱-۶۶۵۴۳۲۱۱'],
    fax: '۰۲۱-۶۶۵۴۳۲۱۹',
    email: 'info@mobinbartar.ir',
    salesEmail: 'sales@mobinbartar.ir',
    address: {
      fa: 'تهران، کیلومتر ۹ جادهٔ مخصوص کرج، شهرک صنعتی چاپ و نشر، خیابان دوم، پلاک ۴۸',
      en: 'No. 48, Second St., Print & Publishing Industrial Park, KM 9 Makhsous Rd., Tehran, Iran',
    },
    city: { fa: 'تهران، ایران', en: 'Tehran, Iran' },
    postalCode: '1389917561',
    mapUrl: 'https://maps.google.com/?q=35.7000,51.2500',
  },

  workingHours: [
    {
      days: { fa: 'شنبه تا چهارشنبه', en: 'Saturday – Wednesday' },
      hours: { fa: '۸:۰۰ تا ۱۷:۰۰', en: '08:00 – 17:00' },
    },
    {
      days: { fa: 'پنجشنبه', en: 'Thursday' },
      hours: { fa: '۸:۰۰ تا ۱۳:۰۰', en: '08:00 – 13:00' },
    },
    {
      days: { fa: 'جمعه', en: 'Friday' },
      hours: { fa: 'تعطیل', en: 'Closed' },
    },
  ],

  social: [
    { platform: 'instagram', url: 'https://instagram.com/mobinbartar', label: 'Instagram' },
    { platform: 'linkedin', url: 'https://linkedin.com/company/mobinbartar', label: 'LinkedIn' },
    { platform: 'telegram', url: 'https://t.me/mobinbartar', label: 'Telegram' },
    { platform: 'whatsapp', url: 'https://wa.me/989120000000', label: 'WhatsApp' },
  ],

  brand: {
    logo: '/brand/logo.svg',
    mark: '/brand/mark.svg',
    favicon: '/favicon.svg',
    ogImage: '/brand/og.svg',
  },
}

/** Headline production figures shown on the homepage and about page. */
export const companyStats = [
  { id: 'experience', value: 25, suffix: '+', label: { fa: 'سال سابقهٔ چاپ', en: 'Years in print' } },
  { id: 'clients', value: 1200, suffix: '+', label: { fa: 'مشتری سازمانی', en: 'Corporate clients' } },
  { id: 'capacity', value: 200000, suffix: '', label: { fa: 'متر مربع چاپ در ماه', en: 'Sqm printed monthly' } },
  { id: 'staff', value: 140, suffix: '', label: { fa: 'کارکنان متخصص', en: 'Skilled staff' } },
] as const
