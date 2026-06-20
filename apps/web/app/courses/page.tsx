'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { coursesApi } from '../../lib/api';
import { SkeletonGrid } from '../../components/Skeleton';
import { toast } from '../../components/Toast';
import { Search, ArrowLeft } from 'lucide-react';
import type { Course } from '../../lib/api';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    coursesApi
      .list({ page, limit: 9, sort: 'created_at' })
      .then((res) => {
        setCourses(res.data);
        setTotalPages(res.pages);
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'خطا در بارگذاری';
        toast(message, 'error');
      })
      .finally(() => setLoading(false));
  }, [page]);

  const filtered = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold text-primary-600">کاتالوگ دوره‌ها</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">جستجو و فیلتر دوره‌های Talkotopia</h1>
        <div className="mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو بر اساس عنوان یا توضیحات"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition-colors focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-200"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <SkeletonGrid count={6} />
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          دوره‌ای یافت نشد.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.slug}`}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-primary-200 hover:shadow-md"
            >
              <div className="mb-4">
                <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700">
                  {course.status === 'published' ? 'منتشر شده' : course.status}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 group-hover:text-primary-700">
                {course.title}
              </h2>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
                {course.description}
              </p>
              <div className="mt-auto flex items-center justify-between pt-4">
                <span className="text-lg font-bold text-slate-900">
                  {course.discount_price ? (
                    <span className="text-emerald-700">
                      {Number(course.discount_price).toLocaleString('fa-IR')}
                    </span>
                  ) : (
                    Number(course.price).toLocaleString('fa-IR')
                  )}{' '}
                  <span className="text-sm font-normal text-slate-500">تومان</span>
                </span>
                <span className="inline-flex items-center gap-1 text-sm font-bold text-primary-600">
                  مشاهده <ArrowLeft className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && !loading && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40"
          >
            صفحه قبل
          </button>
          <span className="text-sm text-slate-600">
            صفحه {page} از {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40"
          >
            صفحه بعد
          </button>
        </div>
      )}
    </div>
  );
}
