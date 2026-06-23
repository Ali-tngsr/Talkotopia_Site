export type Lesson = {
  id: string;
  title: string;
  duration: string;
  isFreePreview?: boolean;
};

export type Course = {
  id: string;
  slug: string;
  title: string;
  teacher: string;
  level: string;
  price: string;
  badge: string;
  description: string;
  lessons: Lesson[];
};

export const courses: Course[] = [
  {
    id: 'course-speaking-1',
    slug: 'english-speaking-confidence',
    title: 'مکالمه انگلیسی با اعتمادبه‌نفس',
    teacher: 'سارا احمدی',
    level: 'متوسط',
    price: '۱,۴۹۰,۰۰۰ تومان',
    badge: 'پرفروش',
    description:
      'یک مسیر ضبط‌شده برای تمرین مکالمه روزمره، تلفظ و پاسخ‌دادن سریع در موقعیت‌های واقعی.',
    lessons: [
      { id: 'speaking-101', title: 'شروع مسیر و تعیین سطح', duration: '۱۸ دقیقه', isFreePreview: true },
      { id: 'speaking-102', title: 'ساخت جمله‌های کاربردی', duration: '۲۶ دقیقه' },
      { id: 'speaking-103', title: 'تمرین مکالمه در سفر', duration: '۳۲ دقیقه' },
    ],
  },
  {
    id: 'course-ielts-1',
    slug: 'ielts-writing-task-2',
    title: 'رایتینگ آیلتس Task 2',
    teacher: 'علی رضایی',
    level: 'پیشرفته',
    price: '۱,۹۹۰,۰۰۰ تومان',
    badge: 'جدید',
    description:
      'آموزش ساختار مقاله، ایده‌پردازی، پاراگراف‌بندی و بازبینی نمونه‌های واقعی برای نمره بالاتر.',
    lessons: [
      { id: 'ielts-201', title: 'ساختار استاندارد Essay', duration: '۲۲ دقیقه', isFreePreview: true },
      { id: 'ielts-202', title: 'ایده‌پردازی سریع', duration: '۲۹ دقیقه' },
      { id: 'ielts-203', title: 'نمونه تحلیل‌شده Band 7+', duration: '۳۵ دقیقه' },
    ],
  },
  {
    id: 'course-kids-1',
    slug: 'kids-english-starter',
    title: 'انگلیسی کودکان Starter',
    teacher: 'مریم نوری',
    level: 'مقدماتی',
    price: '۹۹۰,۰۰۰ تومان',
    badge: 'مناسب خانواده',
    description:
      'درس‌های کوتاه و شاد برای واژگان پایه، جمله‌های ساده و تمرین شنیداری کودکان.',
    lessons: [
      { id: 'kids-301', title: 'رنگ‌ها و سلام‌کردن', duration: '۱۲ دقیقه', isFreePreview: true },
      { id: 'kids-302', title: 'حیوانات و بازی کلمات', duration: '۱۵ دقیقه' },
      { id: 'kids-303', title: 'جمله‌های کوتاه روزانه', duration: '۱۷ دقیقه' },
    ],
  },
];

export const enrolledCourseIds = ['course-speaking-1', 'course-ielts-1'];
