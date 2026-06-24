import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { BookOpen, User, ImageIcon } from 'lucide-react';
import { Course } from '../lib/api'; // اتصال مستقیم به تایپ‌های دیتابیس واقعی

export function CourseCard({ course }: { course: Course }) {
  const t = useTranslations('Common');

  // تبدیل عدد قیمت به فرمت پولی خوانا (مثلا 150000 -> ۱۵۰,۰۰۰)
  const formattedPrice = new Intl.NumberFormat('fa-IR').format(course.price);
  const formattedDiscount = course.discount_price 
    ? new Intl.NumberFormat('fa-IR').format(course.discount_price) 
    : null;

  return (
    <Link href={`/courses/${course.slug}`} className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <div className="aspect-video w-full bg-slate-100 dark:bg-slate-800 relative flex items-center justify-center overflow-hidden">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
        ) : (
          <ImageIcon className="h-10 w-10 text-slate-300 dark:text-slate-600" />
        )}
      </div>
      
      <div className="flex flex-col flex-1 p-5">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary-600 transition-colors line-clamp-2">
          {course.title}
        </h3>
        
        <div className="mt-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <User className="h-4 w-4" />
          <span>{t('teacher')}</span> {/* این بخش در آینده با دیتای مدرس از سرور پر میشه */}
        </div>
        
        <div className="mt-auto pt-5 flex items-center justify-end border-t border-slate-100 dark:border-slate-800">
          {course.price === 0 ? (
            <span className="font-bold text-green-600">{t('free')}</span>
          ) : course.discount_price ? (
            <div className="flex flex-col items-end">
              <span className="text-xs text-slate-400 line-through">
                {formattedPrice}
              </span>
              <span className="font-bold text-red-600">
                {formattedDiscount} {t('toman')}
              </span>
            </div>
          ) : (
            <span className="font-bold text-primary-700 dark:text-primary-500">
              {formattedPrice} {t('toman')}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}