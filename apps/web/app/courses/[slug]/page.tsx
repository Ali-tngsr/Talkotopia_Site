'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { coursesApi, ordersApi } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { toast } from '../../components/Toast';
import { SkeletonRow } from '../../components/Skeleton';
import {
  Play,
  Lock,
  Star,
  ShoppingCart,
  CheckCircle,
  Clock,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import type { Course, CourseSection, Review, Lesson } from '../../lib/api';

export default function CourseDetailsPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const { user, enrolledIds } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);

  const isEnrolled = course ? enrolledIds.includes(course.id) : false;

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    Promise.all([
      coursesApi.getBySlug(slug),
      coursesApi.getCourseSections(slug).catch(() => [] as CourseSection[]),
      coursesApi.getReviews(slug).catch(() => [] as Review[]),
    ])
      .then(([c, s, r]) => {
        setCourse(c);
        setSections(s);
        setReviews(r);
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'خطا در بارگذاری';
        toast(message, 'error');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handlePurchase = async () => {
    if (!user) {
      toast('برای خرید دوره ابتدا وارد شوید', 'error');
      return;
    }
    if (!course) return;
    if (isEnrolled) {
      toast('شما قبلاً در این دوره ثبت‌نام کرده‌اید', 'info');
      return;
    }
    setPurchasing(true);
    try {
      const order = await ordersApi.create({ course_ids: [course.id] });
      const payment = await ordersApi.requestPayment(order.id);
      toast('در حال انتقال به درگاه پرداخت...', 'info');
      // For MVP, simulate payment by redirecting to callback URL or just showing the payment link
      // In a real app, you'd redirect to the actual gateway URL
      window.location.href = payment.payment_url;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'خطا در ایجاد سفارش';
      toast(message, 'error');
    } finally {
      setPurchasing(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course || !isEnrolled) return;
    setReviewLoading(true);
    try {
      const review = await coursesApi.addReview(course.id, {
        rating: reviewForm.rating,
        comment: reviewForm.comment || undefined,
      });
      setReviews((prev) => [review, ...prev]);
      setReviewForm({ rating: 5, comment: '' });
      toast('نظر شما با موفقیت ثبت شد', 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'خطا در ثبت نظر';
      toast(message, 'error');
    } finally {
      setReviewLoading(false);
    }
  };

  if (!slug) return null;

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        <div className="mb-8 space-y-4">
          <div className="h-8 w-64 rounded bg-slate-200" />
          <div className="h-4 w-full rounded bg-slate-200" />
        </div>
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12 text-center">
        <h1 className="text-2xl font-bold text-slate-900">دوره یافت نشد</h1>
      </div>
    );
  }

  const firstLesson = sections.flatMap((s) => s.lessons ?? []).find((l) => l.order === 0) ??
    sections.flatMap((s) => s.lessons ?? [])[0];

  const totalLessons = sections.reduce((sum, s) => sum + (s.lessons?.length ?? 0), 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      {/* Hero */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="flex-1 space-y-4">
            <span className="inline-block rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700">
              {course.status === 'published' ? 'منتشر شده' : course.status}
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 md:text-4xl">{course.title}</h1>
            <p className="text-base leading-relaxed text-slate-600 md:text-lg">
              {course.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {totalLessons} جلسه
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                {reviews.length > 0
                  ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
                  : 'بدون نظر'}
              </span>
            </div>
          </div>

          <div className="w-full shrink-0 rounded-2xl border border-slate-200 bg-slate-50 p-6 md:w-72">
            <div className="mb-4 text-center">
              {course.discount_price ? (
                <div className="space-y-1">
                  <p className="text-sm text-slate-400 line-through">
                    {Number(course.price).toLocaleString('fa-IR')} تومان
                  </p>
                  <p className="text-3xl font-extrabold text-emerald-700">
                    {Number(course.discount_price).toLocaleString('fa-IR')} تومان
                  </p>
                </div>
              ) : (
                <p className="text-3xl font-extrabold text-slate-900">
                  {Number(course.price).toLocaleString('fa-IR')} تومان
                </p>
              )}
            </div>

            {isEnrolled ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800">
                  <CheckCircle className="h-4 w-4" />
                  شما در این دوره ثبت‌نام کرده‌اید
                </div>
                {firstLesson && (
                  <Link
                    href={`/watch/${course.id}/${firstLesson.id}`}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-primary-600 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-700"
                  >
                    <Play className="h-4 w-4" />
                    ادامه یادگیری
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={handlePurchase}
                  disabled={purchasing}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-primary-600 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
                >
                  {purchasing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShoppingCart className="h-4 w-4" />
                  )}
                  {purchasing ? 'در حال پردازش...' : 'خرید دوره'}
                </button>
                <p className="text-center text-xs text-slate-500">
                  پس از پرداخت موفق، دسترسی خودکار فعال می‌شود.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sections & Lessons */}
      <div className="mt-8 space-y-6">
        <h2 className="text-xl font-bold text-slate-900">سرفصل‌ها و جلسات</h2>
        {sections.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            هنوز سرفصلی برای این دوره ثبت نشده است.
          </div>
        ) : (
          sections.map((section) => (
            <div
              key={section.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="mb-4 text-lg font-bold text-slate-900">{section.title}</h3>
              <div className="space-y-3">
                {(section.lessons ?? []).map((lesson: Lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="flex items-center gap-3">
                      {isEnrolled || lesson.is_free_preview ? (
                        <Play className="h-4 w-4 text-primary-600" />
                      ) : (
                        <Lock className="h-4 w-4 text-slate-400" />
                      )}
                      <div>
                        <p className="text-sm font-bold text-slate-900">{lesson.title}</p>
                        {lesson.duration_seconds && (
                          <p className="text-xs text-slate-500">
                            {Math.floor(lesson.duration_seconds / 60)} دقیقه
                          </p>
                        )}
                      </div>
                      {lesson.is_free_preview && (
                        <span className="rounded-full bg-accent-50 px-2 py-0.5 text-xs font-bold text-accent-700">
                          رایگان
                        </span>
                      )}
                    </div>
                    {isEnrolled || lesson.is_free_preview ? (
                      <Link
                        href={`/watch/${course.id}/${lesson.id}`}
                        className="rounded-full bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-700 transition-colors hover:bg-primary-100"
                      >
                        {lesson.is_free_preview && !isEnrolled ? 'پیش‌نمایش' : 'تماشا'}
                      </Link>
                    ) : (
                      <span className="text-xs text-slate-400">نیازمند خرید</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reviews */}
      <div className="mt-8 space-y-6">
        <h2 className="text-xl font-bold text-slate-900">نظرات</h2>
        {isEnrolled && (
          <form
            onSubmit={handleReviewSubmit}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="mb-4 text-sm font-bold text-slate-700">ثبت نظر</p>
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm text-slate-600">امتیاز:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewForm((f) => ({ ...f, rating: star }))}
                  className="transition-colors"
                >
                  <Star
                    className={`h-5 w-5 ${
                      star <= reviewForm.rating
                        ? 'fill-amber-500 text-amber-500'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <textarea
              value={reviewForm.comment}
              onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
              placeholder="نظر شما درباره این دوره..."
              rows={3}
              className="mb-3 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none transition-colors focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-200"
            />
            <button
              type="submit"
              disabled={reviewLoading}
              className="rounded-full bg-primary-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
            >
              {reviewLoading ? 'در حال ارسال...' : 'ارسال نظر'}
            </button>
          </form>
        )}
        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            هنوز نظری ثبت نشده است.
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? 'fill-amber-500 text-amber-500'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(review.created_at).toLocaleDateString('fa-IR')}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm leading-relaxed text-slate-700">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
