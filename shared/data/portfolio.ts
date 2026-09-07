import type { PortfolioCategory, PortfolioItem } from '../types'

export const portfolioCategories: PortfolioCategory[] = [
  { id: 'pc-1', slug: 'books', title: { fa: 'کتاب', en: 'Books' }, description: { fa: 'پروژه‌های انتشاراتی و آموزشی', en: 'Publishing and educational projects' }, order: 1 },
  { id: 'pc-2', slug: 'catalogs', title: { fa: 'کاتالوگ', en: 'Catalogues' }, description: { fa: 'کاتالوگ محصولات و نمایشگاهی', en: 'Product and exhibition catalogues' }, order: 2 },
  { id: 'pc-3', slug: 'packaging', title: { fa: 'بسته‌بندی', en: 'Packaging' }, description: { fa: 'جعبه و بسته‌بندی صنایع مختلف', en: 'Cartons and packaging across industries' }, order: 3 },
  { id: 'pc-4', slug: 'magazines', title: { fa: 'نشریات', en: 'Magazines' }, description: { fa: 'مجلات ادواری و گزارش سالانه', en: 'Periodicals and annual reports' }, order: 4 },
  { id: 'pc-5', slug: 'branding', title: { fa: 'اقلام سازمانی', en: 'Corporate Stationery' }, description: { fa: 'ست اداری و اقلام تبلیغاتی', en: 'Stationery sets and promotional items' }, order: 5 },
]

export const portfolioItems: PortfolioItem[] = [
  {
    id: 'pi-1', slug: 'daneshgostar-textbook-series', categorySlug: 'books',
    title: { fa: 'مجموعهٔ کتاب‌های درسی دانش‌گستر', en: 'Danesh Gostar Textbook Series' },
    client: { fa: 'انتشارات دانش‌گستر', en: 'Danesh Gostar Publishing' },
    description: {
      fa: 'تولید ۱۲ عنوان کتاب کمک‌آموزشی در تیراژ مجموع ۹۰ هزار نسخه، با برنامهٔ تحویل مرحله‌ای پیش از آغاز سال تحصیلی.',
      en: 'Twelve supplementary textbook titles totalling 90,000 copies, delivered in staged batches ahead of the school year.',
    },
    details: [
      { label: { fa: 'تیراژ', en: 'Run length' }, value: { fa: '۹۰٬۰۰۰ نسخه', en: '90,000 copies' } },
      { label: { fa: 'صحافی', en: 'Binding' }, value: { fa: 'چسب گرم PUR', en: 'PUR perfect bound' } },
      { label: { fa: 'کاغذ', en: 'Stock' }, value: { fa: 'تحریر ۷۰ گرم', en: '70 gsm uncoated' } },
    ],
    image: { src: '/portfolio/books-textbook-series.svg', alt: { fa: 'مجموعه کتاب‌های درسی چاپ‌شده', en: 'Printed textbook series' } },
    gallery: [
      { src: '/portfolio/books-textbook-series-2.svg', alt: { fa: 'فرم‌های چاپ‌شدهٔ کتاب پیش از صحافی', en: 'Printed book forms before binding' }, width: 800, height: 600 },
      { src: '/portfolio/books-textbook-series-3.svg', alt: { fa: 'کتاب‌های صحافی‌شده آمادهٔ بسته‌بندی', en: 'Bound books ready for packing' }, width: 800, height: 600 },
    ],
    serviceSlugs: ['book-printing', 'post-press-services'],
    year: 2024, featured: true,
  },
  {
    id: 'pi-2', slug: 'pars-steel-product-catalog', categorySlug: 'catalogs',
    title: { fa: 'کاتالوگ محصولات فولاد پارس', en: 'Pars Steel Product Catalogue' },
    client: { fa: 'گروه صنعتی فولاد پارس', en: 'Pars Steel Industrial Group' },
    description: {
      fa: 'کاتالوگ ۹۶ صفحه‌ای دوزبانه برای نمایشگاه بین‌المللی صنعت، با پروفایل رنگ اختصاصی برای بازتولید دقیق رنگ فلزات.',
      en: 'A 96-page bilingual catalogue for an international industry exhibition, with a dedicated colour profile for accurate metal tones.',
    },
    details: [
      { label: { fa: 'تیراژ', en: 'Run length' }, value: { fa: '۳٬۰۰۰ نسخه', en: '3,000 copies' } },
      { label: { fa: 'صفحات', en: 'Extent' }, value: { fa: '۹۶ صفحه', en: '96 pages' } },
      { label: { fa: 'روکش', en: 'Finish' }, value: { fa: 'سلفون مات و یووی موضعی', en: 'Matte lamination + spot UV' } },
    ],
    image: { src: '/portfolio/catalog-pars-steel.svg', alt: { fa: 'کاتالوگ محصولات صنعتی', en: 'Industrial product catalogue' } },
    gallery: [
      { src: '/portfolio/catalog-pars-steel-2.svg', alt: { fa: 'صفحات داخلی کاتالوگ', en: 'Catalogue inner pages' }, width: 800, height: 600 },
      { src: '/portfolio/catalog-pars-steel-3.svg', alt: { fa: 'جلد کاتالوگ با یووی موضعی', en: 'Catalogue cover with spot UV' }, width: 800, height: 600 },
    ],
    serviceSlugs: ['catalog-printing', 'post-press-services'],
    year: 2025, featured: true,
  },
  {
    id: 'pi-3', slug: 'golrang-cosmetics-cartons', categorySlug: 'packaging',
    title: { fa: 'جعبهٔ محصولات آرایشی گل‌رنگ', en: 'Golrang Cosmetics Cartons' },
    client: { fa: 'صنایع آرایشی گل‌رنگ', en: 'Golrang Cosmetics' },
    description: {
      fa: 'طراحی قالب و تولید سه اندازه جعبهٔ تاشو با روکش مخملی و طلاکوب، تحویل‌شده به‌صورت چسب‌خورده و آمادهٔ خط پرکن.',
      en: 'Die design and production of three folding-carton sizes with soft-touch lamination and foil, delivered glued and ready for the filling line.',
    },
    details: [
      { label: { fa: 'تیراژ', en: 'Run length' }, value: { fa: '۱۵۰٬۰۰۰ عدد', en: '150,000 units' } },
      { label: { fa: 'مقوا', en: 'Board' }, value: { fa: 'ایندربرد ۳۵۰ گرم', en: '350 gsm FBB' } },
      { label: { fa: 'تکمیل', en: 'Finishing' }, value: { fa: 'مخملی، طلاکوب، چسب‌زنی', en: 'Soft-touch, foil, gluing' } },
    ],
    image: { src: '/portfolio/packaging-cosmetics.svg', alt: { fa: 'جعبه‌های بسته‌بندی محصولات آرایشی', en: 'Cosmetics packaging cartons' } },
    gallery: [
      { src: '/portfolio/packaging-cosmetics-2.svg', alt: { fa: 'گسترده و قالب جعبه', en: 'Carton die-line and blank' }, width: 800, height: 600 },
      { src: '/portfolio/packaging-cosmetics-3.svg', alt: { fa: 'جعبه‌های چسب‌خوردهٔ نهایی', en: 'Finished glued cartons' }, width: 800, height: 600 },
    ],
    serviceSlugs: ['packaging-boxes', 'post-press-services'],
    year: 2025, featured: true,
  },
  {
    id: 'pi-4', slug: 'sanaat-emrooz-magazine', categorySlug: 'magazines',
    title: { fa: 'ماهنامهٔ صنعت امروز', en: 'Sanaat Emrooz Monthly' },
    client: { fa: 'مؤسسهٔ مطبوعاتی صنعت امروز', en: 'Sanaat Emrooz Press' },
    description: {
      fa: 'چاپ ادواری ماهنامه در ۳۶ شماره پیاپی بدون یک مورد تأخیر در تاریخ انتشار.',
      en: 'Thirty-six consecutive monthly issues produced without a single missed publication date.',
    },
    details: [
      { label: { fa: 'تیراژ هر شماره', en: 'Per issue' }, value: { fa: '۸٬۰۰۰ نسخه', en: '8,000 copies' } },
      { label: { fa: 'صفحات', en: 'Extent' }, value: { fa: '۶۸ صفحه', en: '68 pages' } },
      { label: { fa: 'صحافی', en: 'Binding' }, value: { fa: 'ته‌دوخت', en: 'Saddle-stitched' } },
    ],
    image: { src: '/portfolio/magazine-sanaat.svg', alt: { fa: 'جلد ماهنامهٔ صنعتی', en: 'Industrial monthly magazine cover' } },
    gallery: [
      { src: '/portfolio/magazine-sanaat-2.svg', alt: { fa: 'صفحات داخلی نشریه', en: 'Magazine inner pages' }, width: 800, height: 600 },
    ],
    serviceSlugs: ['magazine-printing'],
    year: 2024, featured: false,
  },
  {
    id: 'pi-5', slug: 'bank-ayandeh-annual-report', categorySlug: 'magazines',
    title: { fa: 'گزارش سالانهٔ بانک آینده', en: 'Bank Ayandeh Annual Report' },
    client: { fa: 'بانک آینده', en: 'Bank Ayandeh' },
    description: {
      fa: 'گزارش سالانهٔ ۱۲۰ صفحه‌ای با جلد سخت و روکش پارچه‌ای، تولیدشده در بازهٔ فشردهٔ ده روزه.',
      en: 'A 120-page annual report with cloth-covered hard case, produced in a compressed ten-day window.',
    },
    details: [
      { label: { fa: 'تیراژ', en: 'Run length' }, value: { fa: '۱٬۵۰۰ نسخه', en: '1,500 copies' } },
      { label: { fa: 'جلد', en: 'Cover' }, value: { fa: 'جلد سخت گالینگور', en: 'Cloth hard case' } },
      { label: { fa: 'تکمیل', en: 'Finishing' }, value: { fa: 'طلاکوب عنوان', en: 'Foil-stamped title' } },
    ],
    image: { src: '/portfolio/report-annual.svg', alt: { fa: 'گزارش سالانه با جلد سخت', en: 'Hard-cased annual report' } },
    gallery: [
      { src: '/portfolio/report-annual-2.svg', alt: { fa: 'جلد سخت با طلاکوب عنوان', en: 'Hard case with foil-stamped title' }, width: 800, height: 600 },
      { src: '/portfolio/report-annual-3.svg', alt: { fa: 'صفحات داخلی گزارش', en: 'Report inner pages' }, width: 800, height: 600 },
    ],
    serviceSlugs: ['book-printing', 'post-press-services'],
    year: 2025, featured: true,
  },
  {
    id: 'pi-6', slug: 'zarin-food-label-run', categorySlug: 'packaging',
    title: { fa: 'لیبل محصولات غذایی زرین', en: 'Zarin Food Product Labels' },
    client: { fa: 'صنایع غذایی زرین', en: 'Zarin Food Industries' },
    description: {
      fa: 'تولید لیبل رول برای هفت محصول با مرکب مقاوم در برابر رطوبت و برش قالبی اختصاصی هر بسته.',
      en: 'Roll labels for seven products using moisture-resistant inks and a bespoke die per pack format.',
    },
    details: [
      { label: { fa: 'تیراژ', en: 'Run length' }, value: { fa: '۴۰۰٬۰۰۰ عدد', en: '400,000 units' } },
      { label: { fa: 'متریال', en: 'Substrate' }, value: { fa: 'کاغذ لیبل مقاوم', en: 'Wet-strength label paper' } },
      { label: { fa: 'تحویل', en: 'Delivery' }, value: { fa: 'رول با مغزی ۷۶ میلی‌متر', en: '76 mm core rolls' } },
    ],
    image: { src: '/portfolio/labels-food.svg', alt: { fa: 'لیبل محصولات غذایی', en: 'Food product labels' } },
    gallery: [
      { src: '/portfolio/labels-food-2.svg', alt: { fa: 'لیبل‌های رول تحویل‌شده', en: 'Delivered roll labels' }, width: 800, height: 600 },
    ],
    serviceSlugs: ['label-printing'],
    year: 2024, featured: false,
  },
  {
    id: 'pi-7', slug: 'mellat-insurance-stationery', categorySlug: 'branding',
    title: { fa: 'ست اداری بیمهٔ ملت', en: 'Mellat Insurance Stationery Set' },
    client: { fa: 'بیمهٔ ملت', en: 'Mellat Insurance' },
    description: {
      fa: 'تولید ست کامل اداری شامل سربرگ، پاکت، پوشه و کارت ویزیت برای ۱۴۰ شعبه با چاپ داده‌متغیر نشانی هر شعبه.',
      en: 'A complete stationery set — letterheads, envelopes, folders and cards — for 140 branches, with each branch address variable-printed.',
    },
    details: [
      { label: { fa: 'شعب', en: 'Branches' }, value: { fa: '۱۴۰ شعبه', en: '140 branches' } },
      { label: { fa: 'اقلام', en: 'Items' }, value: { fa: '۴ قلم', en: '4 item types' } },
      { label: { fa: 'ویژگی', en: 'Highlight' }, value: { fa: 'چاپ داده‌متغیر', en: 'Variable data printing' } },
    ],
    image: { src: '/portfolio/stationery-insurance.svg', alt: { fa: 'ست اداری سازمانی', en: 'Corporate stationery set' } },
    gallery: [
      { src: '/portfolio/stationery-insurance-2.svg', alt: { fa: 'سربرگ و پاکت سازمانی', en: 'Corporate letterhead and envelope' }, width: 800, height: 600 },
    ],
    serviceSlugs: ['business-card-printing', 'offset-printing'],
    year: 2025, featured: false,
  },
  {
    id: 'pi-8', slug: 'tehran-art-museum-book', categorySlug: 'books',
    title: { fa: 'کتاب نفیس موزهٔ هنرهای معاصر', en: 'Museum of Contemporary Art Art Book' },
    client: { fa: 'موزهٔ هنرهای معاصر تهران', en: 'Tehran Museum of Contemporary Art' },
    description: {
      fa: 'کتاب نفیس آثار با چاپ پنج‌رنگ روی کاغذ گلاسه مات و کنترل رنگ سخت‌گیرانه برای بازتولید نقاشی‌ها.',
      en: 'A fine-art volume printed in five colours on matte coated stock with strict colour control for painting reproduction.',
    },
    details: [
      { label: { fa: 'تیراژ', en: 'Run length' }, value: { fa: '۲٬۰۰۰ نسخه', en: '2,000 copies' } },
      { label: { fa: 'چاپ', en: 'Printing' }, value: { fa: '۵ رنگ + لاک', en: '5 colours + varnish' } },
      { label: { fa: 'صحافی', en: 'Binding' }, value: { fa: 'جلد سخت با قاب', en: 'Case bound with slipcase' } },
    ],
    image: { src: '/portfolio/book-art-museum.svg', alt: { fa: 'کتاب نفیس هنری', en: 'Fine-art printed book' } },
    gallery: [
      { src: '/portfolio/book-art-museum-2.svg', alt: { fa: 'صفحات رنگی کتاب هنری', en: 'Colour plates in the art book' }, width: 800, height: 600 },
      { src: '/portfolio/book-art-museum-3.svg', alt: { fa: 'جلد سخت به همراه قاب', en: 'Hard case with slipcase' }, width: 800, height: 600 },
    ],
    serviceSlugs: ['book-printing', 'post-press-services'],
    year: 2025, featured: true,
  },
  {
    id: 'pi-9', slug: 'novin-pharma-cartons', categorySlug: 'packaging',
    title: { fa: 'جعبهٔ دارویی نوین‌فارما', en: 'Novin Pharma Medicine Cartons' },
    client: { fa: 'داروسازی نوین‌فارما', en: 'Novin Pharma' },
    description: {
      fa: 'جعبهٔ دارویی با درج بریل و شمارهٔ سری ساخت متغیر، مطابق الزامات سازمان غذا و دارو.',
      en: 'Pharmaceutical cartons with braille embossing and variable batch numbering, meeting national regulatory requirements.',
    },
    details: [
      { label: { fa: 'تیراژ', en: 'Run length' }, value: { fa: '۲۲۰٬۰۰۰ عدد', en: '220,000 units' } },
      { label: { fa: 'الزامات', en: 'Compliance' }, value: { fa: 'بریل و کد رهگیری', en: 'Braille and track-and-trace code' } },
      { label: { fa: 'مقوا', en: 'Board' }, value: { fa: 'ایندربرد ۳۰۰ گرم', en: '300 gsm FBB' } },
    ],
    image: { src: '/portfolio/packaging-pharma.svg', alt: { fa: 'جعبه‌های بسته‌بندی دارویی', en: 'Pharmaceutical packaging cartons' } },
    gallery: [
      { src: '/portfolio/packaging-pharma-2.svg', alt: { fa: 'جعبهٔ دارویی با درج بریل', en: 'Pharmaceutical carton with braille' }, width: 800, height: 600 },
    ],
    serviceSlugs: ['packaging-boxes'],
    year: 2024, featured: false,
  },
  {
    id: 'pi-10', slug: 'homa-hotels-brochure', categorySlug: 'catalogs',
    title: { fa: 'بروشور هتل‌های هما', en: 'Homa Hotels Brochure' },
    client: { fa: 'گروه هتل‌های هما', en: 'Homa Hotel Group' },
    description: {
      fa: 'بروشور آکاردئونی شش لت دوزبانه با تصاویر تمام‌صفحه و روکش مخملی برای ارائه در لابی هتل‌ها.',
      en: 'A bilingual six-panel concertina brochure with full-bleed photography and soft-touch finish for hotel lobbies.',
    },
    details: [
      { label: { fa: 'تیراژ', en: 'Run length' }, value: { fa: '۲۵٬۰۰۰ نسخه', en: '25,000 copies' } },
      { label: { fa: 'تا', en: 'Fold' }, value: { fa: 'آکاردئونی شش لت', en: 'Six-panel concertina' } },
      { label: { fa: 'کاغذ', en: 'Stock' }, value: { fa: 'گلاسه ۱۷۰ گرم', en: '170 gsm gloss' } },
    ],
    image: { src: '/portfolio/brochure-hotels.svg', alt: { fa: 'بروشور تاشو هتل', en: 'Folded hotel brochure' } },
    gallery: [
      { src: '/portfolio/brochure-hotels-2.svg', alt: { fa: 'بروشور باز شده', en: 'The brochure fully unfolded' }, width: 800, height: 600 },
    ],
    serviceSlugs: ['brochure-printing', 'post-press-services'],
    year: 2025, featured: false,
  },
]

export const featuredPortfolio = (): PortfolioItem[] => portfolioItems.filter(p => p.featured)
export const getPortfolioBySlug = (slug: string): PortfolioItem | undefined =>
  portfolioItems.find(p => p.slug === slug)

export const getCategoryBySlug = (slug: string): PortfolioCategory | undefined =>
  portfolioCategories.find(c => c.slug === slug)

/** Other projects in the same category, excluding the current one. */
export const getRelatedPortfolio = (slug: string, limit = 3): PortfolioItem[] => {
  const item = getPortfolioBySlug(slug)
  if (!item) return []

  return portfolioItems
    .filter(p => p.categorySlug === item.categorySlug && p.id !== item.id)
    .slice(0, limit)
}

/** Number of projects per category — used for filter counts. */
export const countByCategory = (categorySlug: string): number =>
  portfolioItems.filter(p => p.categorySlug === categorySlug).length
