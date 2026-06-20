'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { coursesApi } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { toast } from '../../components/Toast';
import { SkeletonGrid } from '../../components/Skeleton';
import { Play, CheckCircle, ArrowLeft } from 'lucide-react';
import type { Course } from '../../lib/api';

export default function StudentDashboardPage() {
  const { user, enrolledIds } = useAuth();
  const [enrolled, setEnrolled] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    coursesApi
      .getMyEnrolled()
      .then((courses) => setEnrolled(courses))
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'خطا در بارگذاری';
        toast(message, 'error');
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="flex min-h-[calc(100vh-64px-120px)] items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">ابتدا وارد شوید</h1>
          <p className="mt-2 text-slate-600">برای مشاهده پنل دانشجو باید وارد حساب کاربری خود شوید.</p>
          <Link
            href="/auth/login"
            className="mt-4 inline-block rounded-full bg-primary-600 px-6 py-2 text-sm font-bold text-white"
          >
            ورود
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold text-primary-600">پنل دانشجو</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">دوره‌های خریداری‌شده</h1>
      </div>

      {loading ? (
        <SkeletonGrid count={3} />
      ) : enrolled.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          <p className="text-lg font-bold text-slate-900">هنوز دوره‌ای خریداری نکرده‌اید</p>
          <Link
            href="/courses"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary-600 px-4 py-2 text-sm font-bold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            مشاهده دوره‌ها
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {enrolled.map((course) => (
            <div
              key={course.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-bold text-emerald-700">دسترسی فعال</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">{course.title}</h2>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
                {course.description}
              </p>
              <div className="mt-auto pt-4">
                <Link
                  href={`/courses/${course.slug}`}
                  className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-sm font-bold text-primary-700 transition-colors hover:bg-primary-100"
                >
                  <Play className="h-4 w-4" />
                  ادامه یادگیری
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
