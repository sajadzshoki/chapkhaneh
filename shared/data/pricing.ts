import type { PricingGroup } from '../types'

/**
 * Indicative price list. Values are unit prices in Toman (IRT) and are used by
 * the pricing page only as a guide — the real figure always comes from a quote.
 */
export const pricingGroups: PricingGroup[] = [
  {
    id: 'pg-business-card',
    serviceSlug: 'business-card-printing',
    title: { fa: 'کارت ویزیت', en: 'Business Cards' },
    description: {
      fa: 'قیمت‌ها برای هر ۱٬۰۰۰ عدد کارت ۸.۵×۴.۸ سانتی‌متر، دو رو رنگی.',
      en: 'Prices per 1,000 cards, 8.5×4.8 cm, full colour both sides.',
    },
    rows: [
      {
        id: 'pr-bc-1', serviceSlug: 'business-card-printing',
        title: { fa: 'سلفون مات', en: 'Matte laminated' },
        quantity: { fa: '۱٬۰۰۰ عدد', en: '1,000 pcs' },
        specification: { fa: 'مقوای ۳۰۰ گرم، دو رو', en: '300 gsm board, double-sided' },
        price: 780000, currency: 'IRT',
        turnaround: { fa: '۳ روز کاری', en: '3 working days' },
      },
      {
        id: 'pr-bc-2', serviceSlug: 'business-card-printing',
        title: { fa: 'سلفون براق', en: 'Gloss laminated' },
        quantity: { fa: '۱٬۰۰۰ عدد', en: '1,000 pcs' },
        specification: { fa: 'مقوای ۳۰۰ گرم، دو رو', en: '300 gsm board, double-sided' },
        price: 740000, currency: 'IRT',
        turnaround: { fa: '۳ روز کاری', en: '3 working days' },
      },
      {
        id: 'pr-bc-3', serviceSlug: 'business-card-printing',
        title: { fa: 'سلفون مخملی', en: 'Soft-touch laminated' },
        quantity: { fa: '۱٬۰۰۰ عدد', en: '1,000 pcs' },
        specification: { fa: 'مقوای ۳۵۰ گرم، دو رو', en: '350 gsm board, double-sided' },
        price: 1250000, currency: 'IRT',
        turnaround: { fa: '۴ روز کاری', en: '4 working days' },
      },
      {
        id: 'pr-bc-4', serviceSlug: 'business-card-printing',
        title: { fa: 'مخملی با طلاکوب', en: 'Soft-touch with foil' },
        quantity: { fa: '۱٬۰۰۰ عدد', en: '1,000 pcs' },
        specification: { fa: 'مقوای ۳۵۰ گرم، طلاکوب یک رو', en: '350 gsm board, single-side foil' },
        price: 2150000, currency: 'IRT',
        turnaround: { fa: '۵ روز کاری', en: '5 working days' },
        note: { fa: 'هزینهٔ کلیشه جداگانه محاسبه می‌شود.', en: 'Foil die charged separately.' },
      },
    ],
  },
  {
    id: 'pg-brochure',
    serviceSlug: 'brochure-printing',
    title: { fa: 'بروشور و تراکت', en: 'Brochures & Flyers' },
    description: {
      fa: 'قیمت‌ها برای چاپ افست، دو رو رنگی، بدون احتساب طراحی.',
      en: 'Offset, full colour both sides, design not included.',
    },
    rows: [
      {
        id: 'pr-br-1', serviceSlug: 'brochure-printing',
        title: { fa: 'تراکت A5', en: 'A5 flyer' },
        quantity: { fa: '۵٬۰۰۰ عدد', en: '5,000 pcs' },
        specification: { fa: 'گلاسه ۱۳۵ گرم', en: '135 gsm gloss' },
        price: 4900000, currency: 'IRT',
        turnaround: { fa: '۴ روز کاری', en: '4 working days' },
      },
      {
        id: 'pr-br-2', serviceSlug: 'brochure-printing',
        title: { fa: 'تراکت A4', en: 'A4 flyer' },
        quantity: { fa: '۵٬۰۰۰ عدد', en: '5,000 pcs' },
        specification: { fa: 'گلاسه ۱۳۵ گرم', en: '135 gsm gloss' },
        price: 8600000, currency: 'IRT',
        turnaround: { fa: '۴ روز کاری', en: '4 working days' },
      },
      {
        id: 'pr-br-3', serviceSlug: 'brochure-printing',
        title: { fa: 'بروشور سه لت A4', en: 'A4 tri-fold brochure' },
        quantity: { fa: '۵٬۰۰۰ عدد', en: '5,000 pcs' },
        specification: { fa: 'گلاسه ۱۷۰ گرم، تا ماشینی', en: '170 gsm gloss, machine folded' },
        price: 12400000, currency: 'IRT',
        turnaround: { fa: '۵ روز کاری', en: '5 working days' },
      },
      {
        id: 'pr-br-4', serviceSlug: 'brochure-printing',
        title: { fa: 'بروشور سه لت A4', en: 'A4 tri-fold brochure' },
        quantity: { fa: '۲۰٬۰۰۰ عدد', en: '20,000 pcs' },
        specification: { fa: 'گلاسه ۱۷۰ گرم، تا ماشینی', en: '170 gsm gloss, machine folded' },
        price: 38000000, currency: 'IRT',
        turnaround: { fa: '۷ روز کاری', en: '7 working days' },
        note: { fa: 'صرفهٔ اقتصادی در تیراژ بالا.', en: 'Best unit economics at volume.' },
      },
    ],
  },
  {
    id: 'pg-catalog',
    serviceSlug: 'catalog-printing',
    title: { fa: 'کاتالوگ', en: 'Catalogues' },
    description: {
      fa: 'قیمت‌ها برای قطع A4، جلد گلاسه ۲۵۰ گرم با سلفون مات.',
      en: 'A4 format, 250 gsm gloss cover with matte lamination.',
    },
    rows: [
      {
        id: 'pr-cat-1', serviceSlug: 'catalog-printing',
        title: { fa: '۱۶ صفحه، ته‌دوخت', en: '16 pages, saddle-stitched' },
        quantity: { fa: '۱٬۰۰۰ نسخه', en: '1,000 copies' },
        specification: { fa: 'متن گلاسه ۱۳۵ گرم', en: '135 gsm gloss text' },
        price: 39500000, currency: 'IRT',
        turnaround: { fa: '۶ روز کاری', en: '6 working days' },
      },
      {
        id: 'pr-cat-2', serviceSlug: 'catalog-printing',
        title: { fa: '۳۲ صفحه، ته‌دوخت', en: '32 pages, saddle-stitched' },
        quantity: { fa: '۱٬۰۰۰ نسخه', en: '1,000 copies' },
        specification: { fa: 'متن گلاسه ۱۳۵ گرم', en: '135 gsm gloss text' },
        price: 68000000, currency: 'IRT',
        turnaround: { fa: '۷ روز کاری', en: '7 working days' },
      },
      {
        id: 'pr-cat-3', serviceSlug: 'catalog-printing',
        title: { fa: '۶۴ صفحه، چسب گرم', en: '64 pages, perfect bound' },
        quantity: { fa: '۲٬۰۰۰ نسخه', en: '2,000 copies' },
        specification: { fa: 'متن گلاسه ۱۱۵ گرم', en: '115 gsm gloss text' },
        price: 196000000, currency: 'IRT',
        turnaround: { fa: '۹ روز کاری', en: '9 working days' },
      },
    ],
  },
  {
    id: 'pg-book',
    serviceSlug: 'book-printing',
    title: { fa: 'کتاب', en: 'Books' },
    description: {
      fa: 'قطع رقعی، متن تک‌رنگ روی کاغذ تحریر ۷۰ گرم، جلد چهار رنگ.',
      en: 'Roghai format, mono text on 70 gsm uncoated, four-colour cover.',
    },
    rows: [
      {
        id: 'pr-bk-1', serviceSlug: 'book-printing',
        title: { fa: '۱۵۰ صفحه، چسب گرم', en: '150 pages, perfect bound' },
        quantity: { fa: '۱٬۰۰۰ نسخه', en: '1,000 copies' },
        specification: { fa: 'جلد گلاسه ۲۵۰ گرم، سلفون مات', en: '250 gsm gloss cover, matte lam.' },
        price: 84000000, currency: 'IRT',
        turnaround: { fa: '۱۰ روز کاری', en: '10 working days' },
      },
      {
        id: 'pr-bk-2', serviceSlug: 'book-printing',
        title: { fa: '۳۰۰ صفحه، چسب گرم', en: '300 pages, perfect bound' },
        quantity: { fa: '۱٬۰۰۰ نسخه', en: '1,000 copies' },
        specification: { fa: 'جلد گلاسه ۲۵۰ گرم، سلفون مات', en: '250 gsm gloss cover, matte lam.' },
        price: 148000000, currency: 'IRT',
        turnaround: { fa: '۱۲ روز کاری', en: '12 working days' },
      },
      {
        id: 'pr-bk-3', serviceSlug: 'book-printing',
        title: { fa: '۳۰۰ صفحه، جلد سخت', en: '300 pages, case bound' },
        quantity: { fa: '۱٬۰۰۰ نسخه', en: '1,000 copies' },
        specification: { fa: 'گالینگور با روکش چاپی', en: 'Cloth board with printed jacket' },
        price: 245000000, currency: 'IRT',
        turnaround: { fa: '۱۶ روز کاری', en: '16 working days' },
      },
    ],
  },
  {
    id: 'pg-packaging',
    serviceSlug: 'packaging-boxes',
    title: { fa: 'جعبه و بسته‌بندی', en: 'Cartons & Packaging' },
    description: {
      fa: 'قیمت‌ها بدون هزینهٔ ساخت قالب اولیه محاسبه شده‌اند.',
      en: 'Prices exclude the one-off cutting-die tooling cost.',
    },
    rows: [
      {
        id: 'pr-pk-1', serviceSlug: 'packaging-boxes',
        title: { fa: 'جعبهٔ تاشو کوچک', en: 'Small folding carton' },
        quantity: { fa: '۵٬۰۰۰ عدد', en: '5,000 pcs' },
        specification: { fa: 'ایندربرد ۳۰۰ گرم، سلفون مات', en: '300 gsm FBB, matte lam.' },
        price: 41000000, currency: 'IRT',
        turnaround: { fa: '۱۲ روز کاری', en: '12 working days' },
      },
      {
        id: 'pr-pk-2', serviceSlug: 'packaging-boxes',
        title: { fa: 'جعبهٔ تاشو متوسط', en: 'Medium folding carton' },
        quantity: { fa: '۱۰٬۰۰۰ عدد', en: '10,000 pcs' },
        specification: { fa: 'پشت‌طوسی ۳۵۰ گرم، یووی', en: '350 gsm duplex, UV coated' },
        price: 118000000, currency: 'IRT',
        turnaround: { fa: '۱۴ روز کاری', en: '14 working days' },
      },
      {
        id: 'pr-pk-3', serviceSlug: 'packaging-boxes',
        title: { fa: 'لیبل رول', en: 'Roll labels' },
        quantity: { fa: '۱۰٬۰۰۰ عدد', en: '10,000 pcs' },
        specification: { fa: 'کاغذ لیبل، برش قالبی', en: 'Label paper, die-cut' },
        price: 26500000, currency: 'IRT',
        turnaround: { fa: '۷ روز کاری', en: '7 working days' },
      },
    ],
  },
]

export const getPricingGroupsForService = (serviceSlug: string): PricingGroup[] =>
  pricingGroups.filter(g => g.serviceSlug === serviceSlug)
