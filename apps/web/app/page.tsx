'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { coursesApi } from '../lib/api';
import { SkeletonGrid } from '../components/Skeleton';
import { toast } from '../components/Toast';
import { ArrowLeft, Star, CirclePlay as PlayCircle } from 'lucide-react';
import type { Course } from '../lib/api';

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    coursesApi
      .list({ page: 1, limit: 6, sort: 'created_at' })
      .then((res) => setCourses(res.data))
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'خطا در بارگذاری دوره‌ها';
        toast(message, 'error');
      })
      .finally(() => setLoading(false));
  }, []);

  const featured = courses.slice(0, 3);

  return (
    <div className="space-y-16 px-4 py-8 md:py-12">
      {/* Hero */}
      <section className="mx-auto max-w-4xl text-center">
        <p className="text-sm font-bold text-primary-600">Talkotopia LMS</p>
        <h1 className="mt-4 text-3xl font-extrabold leading-tight text-slate-900 md:text-5xl">
          دوره‌های ضبط‌شده زبان را بفروشید، مدیریت کنید و امن پخش کنید.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
          نسخه MVP شامل معرفی محصول، لیست دوره‌ها، خرید، پنل دانشجو، پلیر و پنل پایه مدرس است.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-700"
          >
            <PlayCircle className="h-4 w-4" />
            مشاهده دوره‌ها
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-6 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200"
          >
            ورود به حساب
          </Link>
        </div>
      </section>

      {/* Featured courses */}
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-primary-600">دوره‌های منتخب</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">آخرین دوره‌های منتشرشده</h2>
          </div>
          <Link
            href="/courses"
            className="inline-flex items-center gap-1 text-sm font-bold text-primary-600 hover:text-primary-700"
          >
            همه دوره‌ها <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <SkeletonGrid count={3} />
        ) : featured.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            هنوز دوره‌ای منتشر نشده است.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.slug}`}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-primary-200 hover:shadow-md"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700">
                    جدید
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                    ۴.۵
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-700">
                  {course.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
                  {course.description}
                </p>
                <div className="mt-auto pt-4">
                  <span className="text-lg font-bold text-slate-900">
                    {course.discount_price ? (
                      <>
                        <span className="text-sm text-slate-400 line-through decoration-slate-400">
                          {Number(course.price).toLocaleString('fa-IR')}
                        </span>{' '}
                        <span className="text-emerald-700">
                          {Number(course.discount_price).toLocaleString('fa-IR')}
                        </span>
                      </>
                    ) : (
                      Number(course.price).toLocaleString('fa-IR')
                    )}{' '}
                    <span className="text-sm font-normal text-slate-500">تومان</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
