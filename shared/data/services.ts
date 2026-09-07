import type { Service } from '../types'

export const services: Service[] = [
  {
    id: 'svc-offset',
    slug: 'offset-printing',
    category: 'printing',
    icon: 'i-lucide-printer',
    title: { fa: 'چاپ افست', en: 'Offset Printing' },
    summary: {
      fa: 'چاپ ورقی چهار و پنج‌رنگ برای تیراژهای متوسط و بالا با ثبات رنگ کنترل‌شده.',
      en: 'Four and five-colour sheet-fed printing for medium and high volumes with controlled colour consistency.',
    },
    description: {
      fa: 'خط چاپ افست ورقی مبین برتر با ماشین‌های هایدلبرگ و کوموری در قطع‌های ۵۰×۷۰ و ۷۰×۱۰۰ کار می‌کند. کنترل رنگ بر پایهٔ استاندارد ISO 12647-2 و با دستگاه اسپکتروفتومتر انجام می‌شود تا در تیراژهای بالا اختلاف رنگ بین فرم‌ها به حداقل برسد. برای سفارش‌های انتشاراتی و سازمانی، امکان چاپ روی کاغذهای تحریر، گلاسه، کرافت و مقواهای پشت‌طوسی و ایندربرد فراهم است.',
      en: 'Our sheet-fed offset line runs Heidelberg and Komori presses in 50×70 and 70×100 formats. Colour is managed to ISO 12647-2 using spectrophotometric control, keeping form-to-form deviation minimal across long runs. We print on uncoated, coated, kraft and duplex/folding boxboard substrates for publishing and corporate work.',
    },
    features: {
      fa: [
        'قطع‌های ۵۰×۷۰ و ۷۰×۱۰۰ سانتی‌متر',
        'چاپ چهار رنگ و رنگ اختصاصی پنتون',
        'کنترل رنگ مطابق ISO 12647-2',
        'پلیت‌سازی مستقیم CTP با رزولوشن ۲۴۰۰ dpi',
        'مناسب تیراژ ۱٬۰۰۰ تا ۵۰۰٬۰۰۰ برگ',
      ],
      en: [
        '50×70 and 70×100 cm formats',
        'CMYK plus dedicated Pantone inks',
        'Colour control to ISO 12647-2',
        'Direct CTP plate-making at 2400 dpi',
        'Suited to runs of 1,000 – 500,000 sheets',
      ],
    },
    minimumOrder: { fa: '۱٬۰۰۰ برگ', en: '1,000 sheets' },
    turnaround: { fa: '۳ تا ۷ روز کاری', en: '3 – 7 working days' },
        image: {
      src: '/photos/service-offset.jpg',
      alt: { fa: 'چاپ افست ورقی در سالن تولید مبین برتر', en: 'Sheet-fed offset printing at the Mobin Bartar plant' },
      width: 1408,
      height: 768,
    },
    specifications: [
      {
        label: { fa: 'قطع‌های قابل چاپ', en: 'Available formats' },
        values: {
          fa: ['۵۰ × ۷۰ سانتی‌متر', '۷۰ × ۱۰۰ سانتی‌متر', 'قطع‌های اختصاصی با برش نهایی'],
          en: ['50 × 70 cm', '70 × 100 cm', 'Custom trimmed formats'],
        },
      },
      {
        label: { fa: 'کاغذ و مقوا', en: 'Papers and boards' },
        values: {
          fa: ['تحریر ۷۰ تا ۱۰۰ گرم', 'گلاسه ۱۰۰ تا ۳۰۰ گرم', 'مقوای پشت‌طوسی و ایندربرد', 'کرافت و فانتزی'],
          en: ['70 – 100 gsm uncoated', '100 – 300 gsm coated', 'Duplex and folding boxboard', 'Kraft and specialty stocks'],
        },
      },
      {
        label: { fa: 'رنگ', en: 'Colour' },
        values: {
          fa: ['چهار رنگ CMYK', 'رنگ اختصاصی پنتون', 'لاک آبی و یووی درون‌خطی'],
          en: ['CMYK process', 'Pantone spot colours', 'Inline aqueous and UV coating'],
        },
      },
      {
        label: { fa: 'تیراژ مناسب', en: 'Suitable quantities' },
        values: {
          fa: ['از ۱٬۰۰۰ تا ۵۰۰٬۰۰۰ برگ', 'صرفهٔ اقتصادی از ۵٬۰۰۰ برگ به بالا'],
          en: ['1,000 – 500,000 sheets', 'Best unit economics above 5,000 sheets'],
        },
      },
    ],
featured: true,
    order: 1,
  },
  {
    id: 'svc-digital',
    slug: 'digital-printing',
    category: 'printing',
    icon: 'i-lucide-monitor-cog',
    title: { fa: 'چاپ دیجیتال', en: 'Digital Printing' },
    summary: {
      fa: 'تیراژ کم، تحویل سریع و امکان چاپ داده‌متغیر بدون هزینهٔ زینک.',
      en: 'Short runs, fast turnaround and variable-data printing with no plate cost.',
    },
    description: {
      fa: 'برای سفارش‌هایی که تیراژ آن‌ها اقتصادی‌بودن افست را توجیه نمی‌کند، خط چاپ دیجیتال با دستگاه‌های Konica Minolta AccurioPress پاسخگوست. چاپ داده‌متغیر برای شماره‌گذاری، بارکد و شخصی‌سازی نام، و همچنین چاپ نمونهٔ رنگی پیش از تولید انبوه در همین خط انجام می‌شود.',
      en: 'For runs where offset is not economical, our Konica Minolta AccurioPress line delivers. It also handles variable-data work — numbering, barcodes and name personalisation — as well as colour proofs before a full offset run.',
    },
    features: {
      fa: [
        'تحویل از ۲۴ ساعت',
        'چاپ داده‌متغیر و شماره‌گذاری',
        'بدون هزینهٔ زینک و راه‌اندازی',
        'چاپ نمونهٔ رنگی پیش از افست',
        'گراماژ ۸۰ تا ۳۵۰ گرم',
      ],
      en: [
        'Delivery from 24 hours',
        'Variable data and numbering',
        'No plate or make-ready cost',
        'Colour proofing ahead of offset',
        'Stock weights 80 – 350 gsm',
      ],
    },
    minimumOrder: { fa: '۱ نسخه', en: '1 copy' },
    turnaround: { fa: '۱ تا ۳ روز کاری', en: '1 – 3 working days' },
        image: {
      src: '/photos/service-digital.jpg',
      alt: { fa: 'پرس دیجیتال رنگی در خط تولید', en: 'Colour digital production press' },
      width: 1408,
      height: 768,
    },
    specifications: [
      {
        label: { fa: 'قطع‌های قابل چاپ', en: 'Available formats' },
        values: {
          fa: ['A4 و A3', '۳۳ × ۴۸ سانتی‌متر', 'بنر تا طول ۱۲۰ سانتی‌متر'],
          en: ['A4 and A3', '33 × 48 cm', 'Banner sheets up to 120 cm'],
        },
      },
      {
        label: { fa: 'کاغذ', en: 'Papers' },
        values: {
          fa: ['تحریر و گلاسه ۸۰ تا ۳۵۰ گرم', 'مقوای فانتزی', 'برچسب و لیبل'],
          en: ['80 – 350 gsm uncoated and coated', 'Specialty boards', 'Self-adhesive label stock'],
        },
      },
      {
        label: { fa: 'قابلیت‌های ویژه', en: 'Special capabilities' },
        values: {
          fa: ['چاپ داده‌متغیر', 'شماره‌گذاری و بارکد', 'نمونهٔ رنگی پیش از افست'],
          en: ['Variable data printing', 'Numbering and barcodes', 'Colour proofing ahead of offset'],
        },
      },
      {
        label: { fa: 'تیراژ مناسب', en: 'Suitable quantities' },
        values: {
          fa: ['از ۱ تا ۳٬۰۰۰ نسخه', 'بالاتر از آن، افست اقتصادی‌تر است'],
          en: ['1 – 3,000 copies', 'Above this, offset becomes more economical'],
        },
      },
    ],
featured: true,
    order: 2,
  },
  {
    id: 'svc-book',
    slug: 'book-printing',
    category: 'printing',
    icon: 'i-lucide-book-open',
    title: { fa: 'چاپ کتاب', en: 'Book Printing' },
    summary: {
      fa: 'تولید کامل کتاب از فرم‌بندی تا صحافی چسب گرم و سخت، ویژهٔ ناشران.',
      en: 'End-to-end book production from imposition to perfect and case binding, built for publishers.',
    },
    description: {
      fa: 'مبین برتر با بیش از ۴۰۰ ناشر داخلی همکاری می‌کند. فرآیند شامل فرم‌بندی، چاپ متن روی کاغذ تحریر یا بالکی، چاپ و سلفون جلد، و صحافی چسب گرم (PUR یا EVA)، ته‌دوخت و جلد سخت است. برای مجموعه‌های آموزشی امکان تولید در تیراژهای پیوسته و انبارش نسخه‌های چاپ‌شده وجود دارد.',
      en: 'We work with more than 400 domestic publishers. The workflow covers imposition, text printing on uncoated or bulky stock, cover printing and lamination, and binding — PUR or EVA perfect binding, saddle-stitch and hard case. Educational series can be produced in rolling batches with warehousing of finished copies.',
    },
    features: {
      fa: [
        'صحافی چسب گرم PUR و EVA',
        'جلد سخت با گالینگور و روکش چاپی',
        'کاغذ تحریر، بالکی و گلاسه',
        'فرم‌بندی و کنترل نمونهٔ قبل از چاپ',
        'تیراژ از ۳۰۰ نسخه',
      ],
      en: [
        'PUR and EVA perfect binding',
        'Hard case binding with printed or cloth covers',
        'Uncoated, bulky and coated text stocks',
        'Imposition and pre-press proofing',
        'Runs from 300 copies',
      ],
    },
    minimumOrder: { fa: '۳۰۰ نسخه', en: '300 copies' },
    turnaround: { fa: '۷ تا ۱۴ روز کاری', en: '7 – 14 working days' },
        image: {
      src: '/photos/service-book.jpg',
      alt: { fa: 'خط صحافی کتاب در مبین برتر', en: 'Book binding line at Mobin Bartar' },
      width: 1408,
      height: 768,
    },
    specifications: [
      {
        label: { fa: 'قطع کتاب', en: 'Book formats' },
        values: {
          fa: ['رقعی ۱۴.۵ × ۲۱.۵', 'وزیری ۱۶.۵ × ۲۳.۵', 'خشتی و جیبی', 'قطع اختصاصی'],
          en: ['Roghai 14.5 × 21.5 cm', 'Vaziri 16.5 × 23.5 cm', 'Square and pocket formats', 'Custom sizes'],
        },
      },
      {
        label: { fa: 'کاغذ متن', en: 'Text papers' },
        values: {
          fa: ['تحریر ۷۰ و ۸۰ گرم', 'بالکی ۶۰ تا ۸۰ گرم', 'گلاسه مات ۱۰۰ تا ۱۳۵ گرم'],
          en: ['70 and 80 gsm uncoated', '60 – 80 gsm bulky', '100 – 135 gsm matte coated'],
        },
      },
      {
        label: { fa: 'روش صحافی', en: 'Binding options' },
        values: {
          fa: ['چسب گرم PUR', 'چسب گرم EVA', 'ته‌دوخت با سیم', 'جلد سخت گالینگور', 'جلد سخت با روکش چاپی'],
          en: ['PUR perfect binding', 'EVA perfect binding', 'Saddle-stitching', 'Cloth hard case', 'Printed-jacket hard case'],
        },
      },
      {
        label: { fa: 'خدمات تکمیلی جلد', en: 'Cover finishing' },
        values: {
          fa: ['سلفون مات و براق', 'سلفون مخملی', 'یووی موضعی', 'طلاکوب', 'قاب و جعبهٔ کتاب'],
          en: ['Matte and gloss lamination', 'Soft-touch lamination', 'Spot UV', 'Foil stamping', 'Slipcases'],
        },
      },
      {
        label: { fa: 'تیراژ مناسب', en: 'Suitable quantities' },
        values: {
          fa: ['از ۳۰۰ نسخه', 'تیراژهای آموزشی تا ۱۰۰٬۰۰۰ نسخه'],
          en: ['From 300 copies', 'Educational runs up to 100,000 copies'],
        },
      },
    ],
featured: true,
    order: 3,
  },
  {
    id: 'svc-magazine',
    slug: 'magazine-printing',
    category: 'printing',
    icon: 'i-lucide-newspaper',
    title: { fa: 'چاپ مجله و نشریه', en: 'Magazine Printing' },
    summary: {
      fa: 'چاپ ادواری نشریات با برنامهٔ زمانی ثابت و صحافی ته‌دوخت یا چسب گرم.',
      en: 'Periodical production on a fixed schedule with saddle-stitch or perfect binding.',
    },
    description: {
      fa: 'برای نشریات ماهانه و فصلنامه‌ها، تقویم تولید ثابت تعریف می‌شود تا تاریخ انتشار هرگز جابه‌جا نشود. جلد روی گلاسه ۲۵۰ گرم با یووی یا سلفون مات، و متن روی گلاسه ۱۰۰ تا ۱۳۵ گرم چاپ می‌شود. امکان درج آگهی با فرم جداگانه و صفحات جداشونده نیز فراهم است.',
      en: 'Monthly and quarterly titles run on a fixed production calendar so publication dates never slip. Covers print on 250gsm gloss with UV or matte lamination; text pages on 100–135gsm coated stock. Separate advertising forms and tip-in pages are supported.',
    },
    features: {
      fa: [
        'برنامهٔ تولید ادواری تضمین‌شده',
        'صحافی ته‌دوخت یا چسب گرم',
        'یووی موضعی و سلفون مات روی جلد',
        'فرم آگهی مجزا',
        'بسته‌بندی و ارسال به توزیع‌کننده',
      ],
      en: [
        'Guaranteed periodical schedule',
        'Saddle-stitch or perfect binding',
        'Spot UV and matte lamination on covers',
        'Separate advertising forms',
        'Packing and delivery to distributors',
      ],
    },
    turnaround: { fa: '۵ تا ۱۰ روز کاری', en: '5 – 10 working days' },
        image: {
      src: '/photos/service-offset.jpg',
      alt: { fa: 'چاپ نشریه روی ماشین افست', en: 'Periodical printing on the offset press' },
      width: 1408,
      height: 768,
    },
    specifications: [
      {
        label: { fa: 'قطع نشریه', en: 'Formats' },
        values: {
          fa: ['A4 رایج‌ترین قطع', 'رحلی ۲۱ × ۲۹.۷', 'قطع اختصاصی'],
          en: ['A4 — the most common', 'Rahli 21 × 29.7 cm', 'Custom formats'],
        },
      },
      {
        label: { fa: 'کاغذ', en: 'Papers' },
        values: {
          fa: ['جلد گلاسه ۲۰۰ تا ۲۵۰ گرم', 'متن گلاسه ۱۰۰ تا ۱۳۵ گرم', 'متن تحریر ۸۰ گرم'],
          en: ['200 – 250 gsm coated cover', '100 – 135 gsm coated text', '80 gsm uncoated text'],
        },
      },
      {
        label: { fa: 'صحافی', en: 'Binding' },
        values: {
          fa: ['ته‌دوخت با سیم تا ۶۴ صفحه', 'چسب گرم از ۴۸ صفحه به بالا'],
          en: ['Saddle-stitch up to 64 pages', 'Perfect binding from 48 pages'],
        },
      },
      {
        label: { fa: 'برنامهٔ تولید', en: 'Production schedule' },
        values: {
          fa: ['تقویم ثابت ماهانه و فصلی', 'فرم آگهی مجزا', 'بسته‌بندی و ارسال به توزیع‌کننده'],
          en: ['Fixed monthly and quarterly calendar', 'Separate advertising forms', 'Packing and delivery to distributors'],
        },
      },
    ],
featured: false,
    order: 4,
  },
  {
    id: 'svc-catalog',
    slug: 'catalog-printing',
    category: 'printing',
    icon: 'i-lucide-gallery-vertical-end',
    title: { fa: 'چاپ کاتالوگ', en: 'Catalogue Printing' },
    summary: {
      fa: 'کاتالوگ محصولات با کیفیت تصویری بالا و صحافی متناسب با تعداد صفحات.',
      en: 'Product catalogues with high image fidelity and binding matched to page count.',
    },
    description: {
      fa: 'کاتالوگ ابزار فروش است، بنابراین دقت رنگ در تصاویر محصول اهمیت مستقیم دارد. با پروفایل رنگ اختصاصی و چاپ نمونهٔ تأییدیه، رنگ محصولات نزدیک به نمونهٔ واقعی بازتولید می‌شود. برای کاتالوگ‌های کم‌صفحه ته‌دوخت و برای بیش از ۴۸ صفحه چسب گرم پیشنهاد می‌شود.',
      en: 'A catalogue is a sales tool, so product-image colour accuracy matters directly. With a dedicated colour profile and a signed-off contract proof, product colours reproduce close to the physical sample. Saddle-stitch suits low page counts; above 48 pages we recommend perfect binding.',
    },
    features: {
      fa: [
        'پروفایل رنگ اختصاصی برای هر برند',
        'چاپ نمونهٔ تأییدیه پیش از تیراژ',
        'گلاسه ۱۳۵ تا ۲۵۰ گرم',
        'سلفون مات به همراه یووی موضعی',
        'تیراژ از ۵۰۰ نسخه',
      ],
      en: [
        'Per-brand colour profile',
        'Contract proof before the production run',
        '135 – 250 gsm coated stock',
        'Matte lamination with spot UV',
        'Runs from 500 copies',
      ],
    },
    minimumOrder: { fa: '۵۰۰ نسخه', en: '500 copies' },
    turnaround: { fa: '۵ تا ۹ روز کاری', en: '5 – 9 working days' },
        image: {
      src: '/photos/service-offset.jpg',
      alt: { fa: 'چاپ کاتالوگ با کنترل رنگ دقیق', en: 'Catalogue printing under close colour control' },
      width: 1408,
      height: 768,
    },
    specifications: [
      {
        label: { fa: 'قطع کاتالوگ', en: 'Formats' },
        values: {
          fa: ['A4 و A5', 'مربع ۲۱ × ۲۱', 'قطع اختصاصی'],
          en: ['A4 and A5', 'Square 21 × 21 cm', 'Custom formats'],
        },
      },
      {
        label: { fa: 'کاغذ', en: 'Papers' },
        values: {
          fa: ['جلد گلاسه ۲۵۰ تا ۳۰۰ گرم', 'متن گلاسه ۱۱۵ تا ۱۷۰ گرم', 'گلاسه مات برای تصاویر محصول'],
          en: ['250 – 300 gsm coated cover', '115 – 170 gsm coated text', 'Matte coated for product imagery'],
        },
      },
      {
        label: { fa: 'صحافی', en: 'Binding' },
        values: {
          fa: ['ته‌دوخت تا ۴۸ صفحه', 'چسب گرم بالای ۴۸ صفحه', 'فنر دوبل برای کاتالوگ فنی'],
          en: ['Saddle-stitch up to 48 pages', 'Perfect binding above 48 pages', 'Wire-o for technical catalogues'],
        },
      },
      {
        label: { fa: 'کنترل رنگ', en: 'Colour control' },
        values: {
          fa: ['پروفایل رنگ اختصاصی هر برند', 'چاپ نمونهٔ تأییدیه', 'تطبیق با نمونهٔ فیزیکی محصول'],
          en: ['Per-brand colour profile', 'Contract proof before the run', 'Matching against the physical product'],
        },
      },
    ],
featured: true,
    order: 5,
  },
  {
    id: 'svc-brochure',
    slug: 'brochure-printing',
    category: 'printing',
    icon: 'i-lucide-file-text',
    title: { fa: 'چاپ بروشور و تراکت', en: 'Brochure & Flyer Printing' },
    summary: {
      fa: 'بروشورهای تاشو و تراکت تبلیغاتی در تیراژ بالا با قیمت تمام‌شدهٔ پایین.',
      en: 'Folded brochures and promotional flyers at high volume and low unit cost.',
    },
    description: {
      fa: 'بروشور دو لت، سه لت و آکاردئونی روی گلاسه ۱۳۵ گرم رایج‌ترین سفارش این بخش است. تا برش و تاخوردگی روی خط پس از چاپ به‌صورت خودکار انجام می‌شود که در تیراژهای بالای ۱۰٬۰۰۰ نسخه تفاوت محسوسی در هزینه ایجاد می‌کند.',
      en: 'Bi-fold, tri-fold and concertina brochures on 135gsm gloss are the most common job here. Trimming and folding run automatically on the finishing line, which makes a measurable cost difference above 10,000 copies.',
    },
    features: {
      fa: [
        'تا دو لت، سه لت و آکاردئونی',
        'گلاسه ۱۰۰ تا ۱۷۰ گرم',
        'تیراژ بالا با قیمت تمام‌شدهٔ پایین',
        'برش و تا به‌صورت ماشینی',
        'امکان بسته‌بندی شماره‌ای',
      ],
      en: [
        'Bi-fold, tri-fold and concertina folds',
        '100 – 170 gsm coated stock',
        'Low unit cost at volume',
        'Machine trimming and folding',
        'Counted bundle packing',
      ],
    },
    minimumOrder: { fa: '۱٬۰۰۰ نسخه', en: '1,000 copies' },
    turnaround: { fa: '۳ تا ۵ روز کاری', en: '3 – 5 working days' },
        image: {
      src: '/photos/service-finishing.jpg',
      alt: { fa: 'برش و تای بروشور در خط پس از چاپ', en: 'Brochure trimming and folding on the finishing line' },
      width: 1408,
      height: 768,
    },
    specifications: [
      {
        label: { fa: 'نوع تا', en: 'Fold types' },
        values: {
          fa: ['دو لت', 'سه لت', 'آکاردئونی', 'تای پنجره‌ای', 'بدون تا (تراکت)'],
          en: ['Bi-fold', 'Tri-fold', 'Concertina', 'Gate fold', 'Flat (flyer)'],
        },
      },
      {
        label: { fa: 'قطع', en: 'Formats' },
        values: {
          fa: ['A4 و A5 تاشده', 'A3 تا به A4', 'قطع اختصاصی'],
          en: ['Folded A4 and A5', 'A3 folded to A4', 'Custom formats'],
        },
      },
      {
        label: { fa: 'کاغذ', en: 'Papers' },
        values: {
          fa: ['گلاسه ۱۰۰ تا ۱۷۰ گرم', 'تحریر ۸۰ تا ۱۲۰ گرم', 'کرافت برای کار محیط‌زیستی'],
          en: ['100 – 170 gsm coated', '80 – 120 gsm uncoated', 'Kraft for eco-oriented work'],
        },
      },
      {
        label: { fa: 'تیراژ مناسب', en: 'Suitable quantities' },
        values: {
          fa: ['از ۱٬۰۰۰ نسخه', 'صرفهٔ اقتصادی از ۱۰٬۰۰۰ نسخه به بالا'],
          en: ['From 1,000 copies', 'Best unit economics above 10,000 copies'],
        },
      },
    ],
featured: false,
    order: 6,
  },
  {
    id: 'svc-packaging',
    slug: 'packaging-boxes',
    category: 'packaging',
    icon: 'i-lucide-package',
    title: { fa: 'بسته‌بندی و جعبه', en: 'Packaging & Boxes' },
    summary: {
      fa: 'طراحی قالب، چاپ و تولید جعبهٔ مقوایی برای صنایع غذایی، دارویی و آرایشی.',
      en: 'Die design, printing and production of folding cartons for food, pharma and cosmetics.',
    },
    description: {
      fa: 'از طراحی گسترده (die-line) تا تولید جعبهٔ نهایی در همین مجموعه انجام می‌شود. مقواهای پشت‌طوسی، ایندربرد و متالایز موجودند و برای صنایع غذایی امکان استفاده از مرکب و لاک با گواهی تماس غیرمستقیم با مواد غذایی وجود دارد. خط چسب‌زنی خودکار جعبه‌های تاشو را آمادهٔ خط پرکن مشتری تحویل می‌دهد.',
      en: 'From die-line design to the finished carton, everything happens in-house. Duplex, folding boxboard and metallised boards are stocked, and for food applications we offer inks and varnishes certified for indirect food contact. The automatic folder-gluer delivers cartons ready for the customer’s filling line.',
    },
    features: {
      fa: [
        'طراحی و ساخت قالب اختصاصی',
        'مقوای پشت‌طوسی، ایندربرد و متالایز',
        'چسب‌زنی خودکار جعبهٔ تاشو',
        'لاک و مرکب مناسب صنایع غذایی',
        'تیراژ از ۲٬۰۰۰ عدد',
      ],
      en: [
        'Custom die design and manufacture',
        'Duplex, FBB and metallised board',
        'Automatic folder-gluer finishing',
        'Food-grade inks and varnishes',
        'Runs from 2,000 units',
      ],
    },
    minimumOrder: { fa: '۲٬۰۰۰ عدد', en: '2,000 units' },
    turnaround: { fa: '۱۰ تا ۱۸ روز کاری', en: '10 – 18 working days' },
        image: {
      src: '/photos/service-packaging.jpg',
      alt: { fa: 'جعبه‌های مقوایی برش‌خورده آمادهٔ تحویل', en: 'Die-cut folding cartons ready for delivery' },
      width: 1408,
      height: 768,
    },
    specifications: [
      {
        label: { fa: 'نوع جعبه', en: 'Carton types' },
        values: {
          fa: ['جعبهٔ تاشو با درب قفلی', 'جعبهٔ کشویی', 'جعبهٔ پنجره‌دار', 'جعبهٔ چسبی خودکار'],
          en: ['Tuck-end folding cartons', 'Sleeve boxes', 'Window cartons', 'Auto-glued cartons'],
        },
      },
      {
        label: { fa: 'مقوا', en: 'Board' },
        values: {
          fa: ['پشت‌طوسی ۲۵۰ تا ۴۰۰ گرم', 'ایندربرد ۲۵۰ تا ۳۵۰ گرم', 'مقوای متالایز', 'کرافت'],
          en: ['250 – 400 gsm duplex', '250 – 350 gsm FBB', 'Metallised board', 'Kraft board'],
        },
      },
      {
        label: { fa: 'تکمیل و روکش', en: 'Finishing' },
        values: {
          fa: ['سلفون مات، براق و مخملی', 'یووی موضعی', 'طلاکوب و نقره‌کوب', 'برجسته‌کاری'],
          en: ['Matte, gloss and soft-touch lamination', 'Spot UV', 'Gold and silver foiling', 'Embossing'],
        },
      },
      {
        label: { fa: 'الزامات صنعتی', en: 'Industry requirements' },
        values: {
          fa: ['مرکب و لاک مناسب صنایع غذایی', 'درج بریل برای بسته‌بندی دارویی', 'کد رهگیری متغیر'],
          en: ['Food-grade inks and varnishes', 'Braille for pharmaceutical packs', 'Variable track-and-trace codes'],
        },
      },
      {
        label: { fa: 'تیراژ مناسب', en: 'Suitable quantities' },
        values: {
          fa: ['از ۲٬۰۰۰ عدد', 'تولید انبوه تا ۵۰۰٬۰۰۰ عدد'],
          en: ['From 2,000 units', 'Volume production to 500,000 units'],
        },
      },
    ],
featured: true,
    order: 7,
  },
  {
    id: 'svc-label',
    slug: 'label-printing',
    category: 'packaging',
    icon: 'i-lucide-tag',
    title: { fa: 'چاپ لیبل و برچسب', en: 'Label Printing' },
    summary: {
      fa: 'لیبل رول و ورقی روی کاغذ، پی‌وی‌سی و متالایز با برش قالبی دقیق.',
      en: 'Roll and sheet labels on paper, PVC and metallised film with precise die-cutting.',
    },
    description: {
      fa: 'لیبل محصول باید در برابر رطوبت، سرما و سایش دوام بیاورد. بسته به کاربرد، از کاغذ لیبل معمولی تا پی‌وی‌سی شفاف و متالایز پیشنهاد می‌شود. برش قالبی با دقت بالا و تحویل به‌صورت رول با مغزی استاندارد برای خطوط لیبل‌زن خودکار انجام می‌شود.',
      en: 'A product label has to survive moisture, cold and abrasion. Depending on the application we specify anything from standard label paper to clear PVC and metallised film. Die-cutting is high-precision and rolls ship with standard cores for automatic labelling lines.',
    },
    features: {
      fa: [
        'لیبل رول برای دستگاه لیبل‌زن',
        'پی‌وی‌سی شفاف و متالایز',
        'برش قالبی با اشکال اختصاصی',
        'مقاوم در برابر رطوبت و سرما',
        'شماره‌گذاری و بارکد متغیر',
      ],
      en: [
        'Roll labels for automatic applicators',
        'Clear PVC and metallised substrates',
        'Custom-shape die-cutting',
        'Moisture and cold resistant',
        'Variable numbering and barcodes',
      ],
    },
    minimumOrder: { fa: '۵٬۰۰۰ عدد', en: '5,000 units' },
    turnaround: { fa: '۵ تا ۱۰ روز کاری', en: '5 – 10 working days' },
        image: {
      src: '/photos/service-packaging.jpg',
      alt: { fa: 'تولید لیبل و برچسب محصول', en: 'Product label production' },
      width: 1408,
      height: 768,
    },
    specifications: [
      {
        label: { fa: 'متریال', en: 'Substrates' },
        values: {
          fa: ['کاغذ لیبل معمولی', 'کاغذ لیبل مقاوم به رطوبت', 'پی‌وی‌سی شفاف', 'متالایز نقره‌ای'],
          en: ['Standard label paper', 'Wet-strength label paper', 'Clear PVC', 'Silver metallised film'],
        },
      },
      {
        label: { fa: 'شکل تحویل', en: 'Delivery format' },
        values: {
          fa: ['رول با مغزی ۷۶ میلی‌متر', 'رول با مغزی ۴۰ میلی‌متر', 'ورقی برش‌خورده'],
          en: ['Rolls on 76 mm cores', 'Rolls on 40 mm cores', 'Cut sheets'],
        },
      },
      {
        label: { fa: 'برش', en: 'Die-cutting' },
        values: {
          fa: ['اشکال استاندارد مستطیل و دایره', 'قالب اختصاصی بر اساس طرح', 'برش نیم‌بر روی لاینر'],
          en: ['Standard rectangles and circles', 'Custom dies from your artwork', 'Kiss-cutting on the liner'],
        },
      },
      {
        label: { fa: 'قابلیت‌های ویژه', en: 'Special capabilities' },
        values: {
          fa: ['شماره‌گذاری و بارکد متغیر', 'چسب سرد و یخچالی', 'مقاوم در برابر سایش'],
          en: ['Variable numbering and barcodes', 'Cold and freezer-grade adhesives', 'Abrasion resistant'],
        },
      },
    ],
featured: false,
    order: 8,
  },
  {
    id: 'svc-business-card',
    slug: 'business-card-printing',
    category: 'printing',
    icon: 'i-lucide-credit-card',
    title: { fa: 'چاپ کارت ویزیت', en: 'Business Card Printing' },
    summary: {
      fa: 'کارت ویزیت سلفون مات، براق، طلاکوب و سوسماری با تحویل سریع.',
      en: 'Matte, gloss, foil-stamped and embossed business cards with quick turnaround.',
    },
    description: {
      fa: 'کارت ویزیت کوچک‌ترین سفارش ماست اما با همان استاندارد رنگی تیراژهای بزرگ چاپ می‌شود. گزینه‌های تکمیلی شامل سلفون مات مخملی، یووی موضعی، طلاکوب و لبهٔ رنگی است. برای سازمان‌ها امکان چاپ داده‌متغیر نام و سمت کارکنان در یک فایل واحد فراهم است.',
      en: 'Business cards are our smallest job but print to the same colour standard as long runs. Finishing options include soft-touch matte lamination, spot UV, foil stamping and edge colouring. For organisations, staff names and titles can be variable-printed from a single file.',
    },
    features: {
      fa: [
        'سلفون مات مخملی و براق',
        'طلاکوب و یووی موضعی',
        'گراماژ ۳۰۰ تا ۴۰۰ گرم',
        'چاپ داده‌متغیر برای سازمان‌ها',
        'تحویل از ۴۸ ساعت',
      ],
      en: [
        'Soft-touch matte and gloss lamination',
        'Foil stamping and spot UV',
        '300 – 400 gsm stock',
        'Variable data for organisations',
        'Delivery from 48 hours',
      ],
    },
    minimumOrder: { fa: '۱٬۰۰۰ عدد', en: '1,000 units' },
    turnaround: { fa: '۲ تا ۴ روز کاری', en: '2 – 4 working days' },
        image: {
      src: '/photos/service-digital.jpg',
      alt: { fa: 'چاپ و تکمیل کارت ویزیت', en: 'Business card printing and finishing' },
      width: 1408,
      height: 768,
    },
    specifications: [
      {
        label: { fa: 'اندازه', en: 'Sizes' },
        values: {
          fa: ['۸.۵ × ۴.۸ سانتی‌متر (استاندارد)', '۹ × ۵ سانتی‌متر', 'مربع ۵.۵ × ۵.۵', 'اندازهٔ اختصاصی'],
          en: ['8.5 × 4.8 cm (standard)', '9 × 5 cm', 'Square 5.5 × 5.5 cm', 'Custom sizes'],
        },
      },
      {
        label: { fa: 'مقوا', en: 'Board' },
        values: {
          fa: ['۳۰۰ گرم', '۳۵۰ گرم', '۴۰۰ گرم', 'مقوای فانتزی و بافت‌دار'],
          en: ['300 gsm', '350 gsm', '400 gsm', 'Textured and specialty boards'],
        },
      },
      {
        label: { fa: 'تکمیل', en: 'Finishing' },
        values: {
          fa: ['سلفون مات و براق', 'سلفون مخملی', 'یووی موضعی', 'طلاکوب', 'لبهٔ رنگی', 'گوشه گرد'],
          en: ['Matte and gloss lamination', 'Soft-touch lamination', 'Spot UV', 'Foil stamping', 'Edge colouring', 'Rounded corners'],
        },
      },
      {
        label: { fa: 'تیراژ مناسب', en: 'Suitable quantities' },
        values: {
          fa: ['از ۱٬۰۰۰ عدد', 'چاپ داده‌متغیر برای ست سازمانی'],
          en: ['From 1,000 units', 'Variable data for organisation-wide sets'],
        },
      },
    ],
featured: false,
    order: 9,
  },
  {
    id: 'svc-post-press',
    slug: 'post-press-services',
    category: 'finishing',
    icon: 'i-lucide-scissors',
    title: { fa: 'خدمات پس از چاپ', en: 'Post-Press Services' },
    summary: {
      fa: 'سلفون، یووی، طلاکوب، برش قالبی، صحافی و بسته‌بندی در یک مجموعه.',
      en: 'Lamination, UV, foiling, die-cutting, binding and packing under one roof.',
    },
    description: {
      fa: 'همهٔ مراحل پس از چاپ داخل مجموعه انجام می‌شود؛ این یعنی کار بین چند کارگاه جابه‌جا نمی‌شود و زمان تحویل و کیفیت قابل کنترل می‌ماند. این خدمات به‌صورت مستقل نیز برای چاپخانه‌های دیگر ارائه می‌شود.',
      en: 'Every post-press stage happens in-house, so jobs never shuttle between workshops and both lead time and quality stay controllable. These services are also available standalone to other printing houses.',
    },
    features: {
      fa: [
        'سلفون مات، براق و مخملی',
        'یووی کامل و موضعی',
        'طلاکوب و نقره‌کوب',
        'برش قالبی و شماره‌گذاری',
        'صحافی و بسته‌بندی نهایی',
      ],
      en: [
        'Matte, gloss and soft-touch lamination',
        'Flood and spot UV',
        'Gold and silver foil stamping',
        'Die-cutting and numbering',
        'Binding and final packing',
      ],
    },
    turnaround: { fa: '۲ تا ۶ روز کاری', en: '2 – 6 working days' },
        image: {
      src: '/photos/service-finishing.jpg',
      alt: { fa: 'بخش خدمات پس از چاپ', en: 'The post-press finishing department' },
      width: 1408,
      height: 768,
    },
    specifications: [
      {
        label: { fa: 'روکش', en: 'Lamination' },
        values: {
          fa: ['سلفون مات', 'سلفون براق', 'سلفون مخملی (سافت‌تاچ)'],
          en: ['Matte lamination', 'Gloss lamination', 'Soft-touch lamination'],
        },
      },
      {
        label: { fa: 'لاک و برجسته‌سازی', en: 'Coating and embellishment' },
        values: {
          fa: ['یووی کامل', 'یووی موضعی', 'طلاکوب و نقره‌کوب', 'برجسته‌کاری و مهرکوب'],
          en: ['Flood UV', 'Spot UV', 'Gold and silver foil stamping', 'Embossing and debossing'],
        },
      },
      {
        label: { fa: 'برش و شکل‌دهی', en: 'Cutting and forming' },
        values: {
          fa: ['برش قالبی', 'خط‌تا و پرفراژ', 'تای ماشینی', 'شماره‌گذاری'],
          en: ['Die-cutting', 'Creasing and perforating', 'Machine folding', 'Numbering'],
        },
      },
      {
        label: { fa: 'صحافی', en: 'Binding' },
        values: {
          fa: ['چسب گرم PUR و EVA', 'ته‌دوخت', 'فنر دوبل', 'جلد سخت'],
          en: ['PUR and EVA perfect binding', 'Saddle-stitching', 'Wire-o binding', 'Hard case binding'],
        },
      },
    ],
featured: false,
    order: 10,
  },
]

export const getServiceBySlug = (slug: string): Service | undefined =>
  services.find(s => s.slug === slug)

export const featuredServices = (): Service[] =>
  services.filter(s => s.featured).sort((a, b) => a.order - b.order)

/**
 * Related services for a detail page.
 * Uses the explicit `relatedSlugs` when the data sets it, otherwise falls back
 * to other services sharing the same category.
 */
export const getRelatedServices = (slug: string, limit = 3): Service[] => {
  const service = getServiceBySlug(slug)
  if (!service) return []

  if (service.relatedSlugs?.length) {
    return service.relatedSlugs
      .map(getServiceBySlug)
      .filter((s): s is Service => Boolean(s))
      .slice(0, limit)
  }

  return services
    .filter(s => s.category === service.category && s.slug !== slug)
    .sort((a, b) => a.order - b.order)
    .slice(0, limit)
}
