import type { Equipment } from '../types'

export const equipment: Equipment[] = [
  {
    id: 'eq-1', slug: 'heidelberg-speedmaster-xl-106', type: 'offset',
    name: 'Speedmaster XL 106-5+L', manufacturer: 'Heidelberg', installedYear: 2019,
    title: { fa: 'هایدلبرگ اسپیدمستر XL 106', en: 'Heidelberg Speedmaster XL 106' },
    description: {
      fa: 'ماشین افست ورقی پنج‌رنگ با برج لاک، اصلی‌ترین خط تولید مجموعه برای تیراژهای بالا در قطع ۷۰×۱۰۰.',
      en: 'Five-colour sheet-fed press with a coating unit — our main line for high-volume 70×100 work.',
    },
    specs: [
      { label: { fa: 'حداکثر قطع', en: 'Max sheet size' }, value: { fa: '۷۵ × ۱۰۶ سانتی‌متر', en: '75 × 106 cm' } },
      { label: { fa: 'سرعت', en: 'Speed' }, value: { fa: '۱۵٬۰۰۰ برگ در ساعت', en: '15,000 sheets/hour' } },
      { label: { fa: 'واحدهای چاپ', en: 'Printing units' }, value: { fa: '۵ رنگ + لاک', en: '5 colours + coater' } },
      { label: { fa: 'گراماژ', en: 'Stock range' }, value: { fa: '۶۰ تا ۶۵۰ گرم', en: '60 – 650 gsm' } },
    ],
    order: 1,
  },
  {
    id: 'eq-2', slug: 'komori-lithrone-g40', type: 'offset',
    name: 'Lithrone G40', manufacturer: 'Komori', installedYear: 2016,
    title: { fa: 'کوموری لیترون G40', en: 'Komori Lithrone G40' },
    description: {
      fa: 'ماشین چهار رنگ قطع ۷۰×۱۰۰ که عمدتاً برای چاپ کتاب و نشریات در تیراژ متوسط استفاده می‌شود.',
      en: 'Four-colour 70×100 press used mainly for medium-run book and periodical work.',
    },
    specs: [
      { label: { fa: 'حداکثر قطع', en: 'Max sheet size' }, value: { fa: '۷۲ × ۱۰۳ سانتی‌متر', en: '72 × 103 cm' } },
      { label: { fa: 'سرعت', en: 'Speed' }, value: { fa: '۱۳٬۰۰۰ برگ در ساعت', en: '13,000 sheets/hour' } },
      { label: { fa: 'واحدهای چاپ', en: 'Printing units' }, value: { fa: '۴ رنگ', en: '4 colours' } },
      { label: { fa: 'کنترل رنگ', en: 'Colour control' }, value: { fa: 'سیستم PDC-SX', en: 'PDC-SX system' } },
    ],
    order: 2,
  },
  {
    id: 'eq-3', slug: 'ryobi-755', type: 'offset',
    name: '755', manufacturer: 'Ryobi', installedYear: 2013,
    title: { fa: 'ریوبی ۷۵۵', en: 'Ryobi 755' },
    description: {
      fa: 'ماشین پنج‌رنگ قطع ۵۰×۷۰ برای سفارش‌های تجاری مانند بروشور، کارت و پوشه.',
      en: 'Five-colour 50×70 press for commercial work such as brochures, cards and folders.',
    },
    specs: [
      { label: { fa: 'حداکثر قطع', en: 'Max sheet size' }, value: { fa: '۵۲ × ۷۴ سانتی‌متر', en: '52 × 74 cm' } },
      { label: { fa: 'سرعت', en: 'Speed' }, value: { fa: '۱۵٬۰۰۰ برگ در ساعت', en: '15,000 sheets/hour' } },
      { label: { fa: 'واحدهای چاپ', en: 'Printing units' }, value: { fa: '۵ رنگ', en: '5 colours' } },
    ],
    order: 3,
  },
  {
    id: 'eq-4', slug: 'accuriopress-c14000', type: 'digital',
    name: 'AccurioPress C14000', manufacturer: 'Konica Minolta', installedYear: 2022,
    title: { fa: 'کونیکا مینولتا AccurioPress C14000', en: 'Konica Minolta AccurioPress C14000' },
    description: {
      fa: 'پرس دیجیتال رنگی برای تیراژ کم، چاپ داده‌متغیر و نمونه‌گیری رنگی پیش از افست.',
      en: 'Colour digital press for short runs, variable data and pre-offset colour proofing.',
    },
    specs: [
      { label: { fa: 'سرعت', en: 'Speed' }, value: { fa: '۱۴۰ برگ A4 در دقیقه', en: '140 A4 pages/min' } },
      { label: { fa: 'حداکثر قطع', en: 'Max sheet size' }, value: { fa: '۳۳ × ۱۲۰ سانتی‌متر', en: '33 × 120 cm' } },
      { label: { fa: 'گراماژ', en: 'Stock range' }, value: { fa: '۶۲ تا ۴۵۰ گرم', en: '62 – 450 gsm' } },
      { label: { fa: 'رزولوشن', en: 'Resolution' }, value: { fa: '۳۶۰۰ × ۲۴۰۰ dpi', en: '3600 × 2400 dpi' } },
    ],
    order: 4,
  },
  {
    id: 'eq-5', slug: 'kodak-magnus-ctp', type: 'prepress',
    name: 'Magnus Q800 CTP', manufacturer: 'Kodak', installedYear: 2018,
    title: { fa: 'دستگاه پلیت‌سازی کداک Magnus Q800', en: 'Kodak Magnus Q800 CTP' },
    description: {
      fa: 'پلیت‌سازی مستقیم حرارتی که فایل تأییدشده را بدون واسطهٔ فیلم به زینک منتقل می‌کند.',
      en: 'Thermal computer-to-plate imaging that goes from approved file to plate with no film step.',
    },
    specs: [
      { label: { fa: 'رزولوشن', en: 'Resolution' }, value: { fa: '۲۴۰۰ dpi', en: '2400 dpi' } },
      { label: { fa: 'ظرفیت', en: 'Throughput' }, value: { fa: '۳۰ پلیت در ساعت', en: '30 plates/hour' } },
      { label: { fa: 'حداکثر اندازهٔ پلیت', en: 'Max plate size' }, value: { fa: '۱۱۶۰ × ۹۴۰ میلی‌متر', en: '1160 × 940 mm' } },
    ],
    order: 5,
  },
  {
    id: 'eq-6', slug: 'polar-137-cutter', type: 'finishing',
    name: 'Polar 137 XT', manufacturer: 'Polar Mohr', installedYear: 2017,
    title: { fa: 'برش پولار ۱۳۷', en: 'Polar 137 XT Guillotine' },
    description: {
      fa: 'برش برنامه‌پذیر با دقت میلی‌متری که یکنواختی ابعاد را در کل تیراژ حفظ می‌کند.',
      en: 'Programmable guillotine holding millimetre accuracy across an entire run.',
    },
    specs: [
      { label: { fa: 'عرض برش', en: 'Cutting width' }, value: { fa: '۱۳۷ سانتی‌متر', en: '137 cm' } },
      { label: { fa: 'ارتفاع دسته', en: 'Pile height' }, value: { fa: '۱۶۵ میلی‌متر', en: '165 mm' } },
      { label: { fa: 'حافظهٔ برنامه', en: 'Program memory' }, value: { fa: '۹۹۹ برنامهٔ برش', en: '999 cutting programs' } },
    ],
    order: 6,
  },
  {
    id: 'eq-7', slug: 'horizon-bq-480-binder', type: 'finishing',
    name: 'BQ-480 PUR', manufacturer: 'Horizon', installedYear: 2021,
    title: { fa: 'صحافی چسب گرم هورایزن BQ-480', en: 'Horizon BQ-480 PUR Binder' },
    description: {
      fa: 'خط صحافی چسب گرم PUR با دوام چسبندگی بالاتر نسبت به EVA، مناسب کتاب‌های پرمصرف.',
      en: 'PUR perfect binding line with markedly better adhesion than EVA — suited to heavily used books.',
    },
    specs: [
      { label: { fa: 'سرعت', en: 'Speed' }, value: { fa: '۱٬۳۵۰ جلد در ساعت', en: '1,350 books/hour' } },
      { label: { fa: 'ضخامت عطف', en: 'Spine thickness' }, value: { fa: '۱ تا ۶۵ میلی‌متر', en: '1 – 65 mm' } },
      { label: { fa: 'نوع چسب', en: 'Adhesive' }, value: { fa: 'PUR و EVA', en: 'PUR and EVA' } },
    ],
    order: 7,
  },
  {
    id: 'eq-8', slug: 'bobst-die-cutter', type: 'finishing',
    name: 'Novacut 106 ER', manufacturer: 'Bobst', installedYear: 2020,
    title: { fa: 'برش قالبی باپست Novacut 106', en: 'Bobst Novacut 106 ER' },
    description: {
      fa: 'دستگاه برش قالبی و خط‌تا برای تولید جعبه‌های مقوایی با دقت تکرارپذیر.',
      en: 'Die-cutting and creasing platen for folding cartons with repeatable register.',
    },
    specs: [
      { label: { fa: 'حداکثر قطع', en: 'Max sheet size' }, value: { fa: '۷۵ × ۱۰۶ سانتی‌متر', en: '75 × 106 cm' } },
      { label: { fa: 'سرعت', en: 'Speed' }, value: { fa: '۷٬۵۰۰ برگ در ساعت', en: '7,500 sheets/hour' } },
      { label: { fa: 'فشار برش', en: 'Cutting force' }, value: { fa: '۳۰۰ تن', en: '300 tonnes' } },
    ],
    order: 8,
  },
]

export const getEquipmentBySlug = (slug: string): Equipment | undefined =>
  equipment.find(e => e.slug === slug)
