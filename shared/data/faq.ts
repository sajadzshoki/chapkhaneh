import type { Faq } from '../types'

export const faqs: Faq[] = [
  {
    id: 'faq-1', category: 'orders', order: 1,
    question: { fa: 'حداقل تیراژ سفارش چقدر است؟', en: 'What is the minimum order quantity?' },
    answer: {
      fa: 'حداقل تیراژ به روش چاپ بستگی دارد. در چاپ دیجیتال از یک نسخه هم سفارش می‌پذیریم، اما چاپ افست از حدود ۱٬۰۰۰ برگ اقتصادی می‌شود؛ زیر این عدد هزینهٔ زینک و راه‌اندازی سهم زیادی از قیمت تمام‌شده پیدا می‌کند. برای جعبه و بسته‌بندی، حداقل تیراژ معمولاً ۲٬۰۰۰ عدد است.',
      en: 'It depends on the printing method. Digital jobs start from a single copy, while offset becomes economical from around 1,000 sheets — below that, plate and make-ready costs dominate the unit price. For cartons and packaging the practical minimum is usually 2,000 units.',
    },
  },
  {
    id: 'faq-2', category: 'technical', order: 2,
    question: { fa: 'فایل را با چه مشخصاتی ارسال کنیم؟', en: 'How should we prepare our artwork files?' },
    answer: {
      fa: 'فایل PDF با حالت رنگی CMYK، رزولوشن تصاویر حداقل ۳۰۰ dpi و ۳ میلی‌متر بلید در هر طرف. فونت‌ها باید به منحنی تبدیل یا در فایل امبد شده باشند. اگر رنگ سازمانی مشخصی دارید، کد پنتون آن را اعلام کنید تا با رنگ اختصاصی چاپ شود.',
      en: 'Send a PDF in CMYK with images at 300 dpi minimum and 3 mm bleed on every edge. Fonts must be outlined or embedded. If you have a corporate colour, give us its Pantone reference so we can run it as a spot ink.',
    },
  },
  {
    id: 'faq-3', category: 'technical', order: 3,
    question: { fa: 'آیا قبل از چاپ نهایی نمونه ارائه می‌دهید؟', en: 'Do you provide a proof before the production run?' },
    answer: {
      fa: 'بله. برای سفارش‌های رنگی حساس، نمونهٔ دیجیتال تأییدیه چاپ و ارسال می‌شود و تولید انبوه فقط پس از تأیید کتبی شما آغاز می‌گردد. برای بسته‌بندی، نمونهٔ برش‌خوردهٔ فیزیکی جعبه نیز قابل ارائه است.',
      en: 'Yes. For colour-critical work we produce a digital contract proof and only start the run after your written approval. For packaging we can also supply a physical cut-and-folded carton sample.',
    },
  },
  {
    id: 'faq-4', category: 'delivery', order: 4,
    question: { fa: 'زمان تحویل سفارش‌ها چقدر است؟', en: 'What are your delivery times?' },
    answer: {
      fa: 'چاپ دیجیتال از ۲۴ ساعت، سفارش‌های افست تجاری ۳ تا ۷ روز کاری، کتاب ۷ تا ۱۴ روز کاری و بسته‌بندی ۱۰ تا ۱۸ روز کاری. زمان دقیق پس از بررسی فایل و مشخصات در پیش‌فاکتور اعلام می‌شود.',
      en: 'Digital work from 24 hours; commercial offset 3–7 working days; books 7–14 working days; packaging 10–18 working days. The exact date is confirmed on the quotation once we have reviewed your files and specification.',
    },
  },
  {
    id: 'faq-5', category: 'delivery', order: 5,
    question: { fa: 'ارسال به شهرستان انجام می‌شود؟', en: 'Do you ship outside Tehran?' },
    answer: {
      fa: 'بله. ارسال به تمام مراکز استان‌ها از طریق باربری‌های طرف قرارداد انجام می‌شود. برای تیراژهای بالا امکان تحویل مستقیم در انبار مشتری وجود دارد. هزینهٔ حمل بر اساس وزن و مقصد جداگانه محاسبه می‌شود.',
      en: 'Yes. We ship to every provincial capital through contracted freight partners, and for large runs we can deliver directly to your warehouse. Freight is quoted separately based on weight and destination.',
    },
  },
  {
    id: 'faq-6', category: 'pricing', order: 6,
    question: { fa: 'قیمت‌های اعلام‌شده در سایت قطعی است؟', en: 'Are the prices on the website final?' },
    answer: {
      fa: 'قیمت‌های صفحهٔ تعرفه جنبهٔ راهنما دارند و بر اساس مشخصات استاندارد محاسبه شده‌اند. قیمت قطعی پس از بررسی فایل، جنس کاغذ، تیراژ و خدمات پس از چاپ در پیش‌فاکتور اعلام می‌شود. با توجه به نوسان قیمت کاغذ، اعتبار پیش‌فاکتور معمولاً هفت روز است.',
      en: 'The tariff page is indicative and based on standard specifications. The binding figure is issued on a quotation after we review your files, stock, quantity and finishing. Because paper prices fluctuate, quotations are typically valid for seven days.',
    },
  },
  {
    id: 'faq-7', category: 'pricing', order: 7,
    question: { fa: 'شرایط پرداخت چگونه است؟', en: 'What are your payment terms?' },
    answer: {
      fa: 'برای مشتریان جدید، ۵۰٪ پیش‌پرداخت هنگام ثبت سفارش و مابقی پیش از تحویل. برای مشتریان سازمانی با سابقهٔ همکاری، امکان تعریف قرارداد سالانه با تسویهٔ مدت‌دار وجود دارد. فاکتور رسمی با احتساب مالیات بر ارزش افزوده صادر می‌شود.',
      en: 'New customers pay 50% on order and the balance before delivery. Established corporate clients can move to an annual contract with agreed payment terms. Official invoices including VAT are issued for all orders.',
    },
  },
  {
    id: 'faq-8', category: 'orders', order: 8,
    question: { fa: 'خدمات طراحی گرافیک هم ارائه می‌دهید؟', en: 'Do you offer graphic design services?' },
    answer: {
      fa: 'واحد پیش از چاپ ما اصلاحات فنی فایل مانند تنظیم بلید، تفکیک رنگ و آماده‌سازی قالب بسته‌بندی را رایگان انجام می‌دهد. طراحی خلاقانه از ابتدا در حوزهٔ تخصصی ما نیست، اما می‌توانیم شما را به استودیوهای طراحی همکار معرفی کنیم.',
      en: 'Our pre-press team handles technical file corrections — bleed, separations, packaging die preparation — at no charge. Original creative design is not our specialism, but we can refer you to design studios we work with regularly.',
    },
  },
  {
    id: 'faq-9', category: 'technical', order: 9,
    question: { fa: 'اختلاف رنگ چاپ با مانیتور طبیعی است؟', en: 'Why does the print differ slightly from my screen?' },
    answer: {
      fa: 'بله، تا حدی طبیعی است. مانیتور رنگ را با نور (RGB) و چاپ با مرکب (CMYK) تولید می‌کند و گسترهٔ رنگی این دو یکسان نیست. برای کاهش اختلاف، از پروفایل رنگ استاندارد استفاده می‌کنیم و توصیه می‌کنیم تصمیم نهایی دربارهٔ رنگ بر اساس نمونهٔ چاپی گرفته شود، نه تصویر روی نمایشگر.',
      en: 'To a degree, yes. A monitor produces colour with light (RGB) while print uses ink (CMYK), and the two gamuts differ. We work to a standard colour profile to minimise the gap, and recommend that final colour decisions are made from a printed proof rather than a screen.',
    },
  },
  {
    id: 'faq-10', category: 'orders', order: 10,
    question: { fa: 'امکان بازدید از کارخانه وجود دارد؟', en: 'Can we visit your production facility?' },
    answer: {
      fa: 'بله. بازدید از خط تولید با هماهنگی قبلی در روزهای کاری امکان‌پذیر است. بسیاری از مشتریان سازمانی پیش از عقد قرارداد سالانه از مجموعه بازدید می‌کنند. برای هماهنگی با واحد فروش تماس بگیرید.',
      en: 'Yes. Facility tours can be arranged on working days with prior notice, and many corporate clients visit before signing an annual contract. Contact our sales team to schedule one.',
    },
  },
]

export const faqsByCategory = (category: Faq['category']): Faq[] =>
  faqs.filter(f => f.category === category).sort((a, b) => a.order - b.order)
