'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { coursesApi } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { toast } from '../../components/Toast';
import { SkeletonGrid, SkeletonRow } from '../../components/Skeleton';
import { Plus, Trash, Eye, ArrowLeft, Loader as Loader2, BookOpen, CircleCheck as CheckCircle } from 'lucide-react';
import type { Course, CourseSection, Lesson } from '../../lib/api';

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    price: '',
    discount_price: '',
    status: 'draft' as string,
  });
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [sectionForm, setSectionForm] = useState({ title: '', order: '1' });
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    order: '1',
    quality_720_url: '',
    quality_1080_url: '',
    quality_480_url: '',
    is_free_preview: false,
    allow_download: false,
  });

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'teacher' && user.role !== 'admin') {
      toast('دسترسی غیرمجاز', 'error');
      router.push('/');
      return;
    }
    setLoading(true);
    coursesApi
      .getMyCreated()
      .then((c) => setCourses(c))
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'خطا در بارگذاری';
        toast(message, 'error');
      })
      .finally(() => setLoading(false));
  }, [user, router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.title || !createForm.description || !createForm.price) {
      toast('لطفاً همه فیلدهای الزامی را تکمیل کنید', 'error');
      return;
    }
    setCreateLoading(true);
    try {
      const course = await coursesApi.create({
        title: createForm.title,
        description: createForm.description,
        price: Number(createForm.price),
        discount_price: createForm.discount_price ? Number(createForm.discount_price) : undefined,
      });
      setCourses((prev) => [course, ...prev]);
      setShowCreate(false);
      setCreateForm({ title: '', description: '', price: '', discount_price: '', status: 'draft' });
      toast('دوره با موفقیت ایجاد شد', 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'خطا در ایجاد دوره';
      toast(message, 'error');
    } finally {
      setCreateLoading(false);
    }
  };

  const loadSections = async (courseId: string) => {
    setSectionsLoading(true);
    try {
      const s = await coursesApi.getCourseSections(courseId);
      setSections(s);
      setSelectedCourse(courseId);
    } catch {
      toast('خطا در بارگذاری سرفصل‌ها', 'error');
    } finally {
      setSectionsLoading(false);
    }
  };

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !sectionForm.title) return;
    try {
      const s = await coursesApi.createSection(selectedCourse, {
        title: sectionForm.title,
        order: Number(sectionForm.order),
      });
      setSections((prev) => [...prev, s]);
      setShowSectionForm(false);
      setSectionForm({ title: '', order: String((sections.length || 0) + 1) });
      toast('سرفصل با موفقیت ایجاد شد', 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'خطا در ایجاد سرفصل';
      toast(message, 'error');
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSectionId || !lessonForm.title || !lessonForm.quality_720_url) return;
    try {
      const l = await coursesApi.createLesson(selectedSectionId, {
        title: lessonForm.title,
        order: Number(lessonForm.order),
        quality_720_url: lessonForm.quality_720_url,
        quality_1080_url: lessonForm.quality_1080_url || undefined,
        quality_480_url: lessonForm.quality_480_url || undefined,
        is_free_preview: lessonForm.is_free_preview,
        allow_download: lessonForm.allow_download,
      });
      setSections((prev) =>
        prev.map((s) =>
          s.id === selectedSectionId ? { ...s, lessons: [...(s.lessons ?? []), l] } : s
        )
      );
      setShowLessonForm(false);
      setLessonForm({
        title: '',
        order: '1',
        quality_720_url: '',
        quality_1080_url: '',
        quality_480_url: '',
        is_free_preview: false,
        allow_download: false,
      });
      toast('جلسه با موفقیت ایجاد شد', 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'خطا در ایجاد جلسه';
      toast(message, 'error');
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('آیا از حذف این جلسه اطمینان دارید؟')) return;
    try {
      await coursesApi.deleteLesson(lessonId);
      setSections((prev) =>
        prev.map((s) => ({
          ...s,
          lessons: (s.lessons ?? []).filter((l: Lesson) => l.id !== lessonId),
        }))
      );
      toast('جلسه حذف شد', 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'خطا در حذف';
      toast(message, 'error');
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-[calc(100vh-64px-120px)] items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">ابتدا وارد شوید</h1>
          <Link href="/auth/login" className="mt-4 inline-block rounded-full bg-primary-600 px-6 py-2 text-sm font-bold text-white">
            ورود
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-primary-600">پنل مدرس</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">مدیریت دوره‌ها</h1>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          {showCreate ? 'بستن فرم' : 'دوره جدید'}
        </button>
      </div>

      {/* Create Course Form */}
      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-4 text-lg font-bold text-slate-900">ایجاد دوره جدید</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">عنوان</label>
              <input
                value={createForm.title}
                onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="مثلاً مکالمه انگلیسی"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm text-slate-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">قیمت (تومان)</label>
              <input
                inputMode="numeric"
                value={createForm.price}
                onChange={(e) => setCreateForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="1490000"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm text-slate-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">قیمت تخفیفی (اختیاری)</label>
              <input
                inputMode="numeric"
                value={createForm.discount_price}
                onChange={(e) => setCreateForm((f) => ({ ...f, discount_price: e.target.value }))}
                placeholder="990000"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm text-slate-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">وضعیت</label>
              <select
                value={createForm.status}
                onChange={(e) => setCreateForm((f) => ({ ...f, status: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm text-slate-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
              >
                <option value="draft">پیش‌نویس</option>
                <option value="published">منتشر شده</option>
                <option value="archived">بایگانی</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-slate-700">توضیحات</label>
              <textarea
                value={createForm.description}
                onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="توضیح کوتاه دوره"
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm text-slate-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={createLoading}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
          >
            {createLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            ذخیره دوره
          </button>
        </form>
      )}

      {/* Courses List */}
      {loading ? (
        <SkeletonGrid count={3} />
      ) : courses.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          هنوز دوره‌ای ایجاد نکرده‌اید.
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <div key={course.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-bold text-primary-700">
                      {course.status === 'published' ? 'منتشر شده' : course.status === 'draft' ? 'پیش‌نویس' : 'بایگانی'}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">{course.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">{course.description}</p>
                  <div className="mt-2 text-sm text-slate-700">
                    قیمت: {Number(course.price).toLocaleString('fa-IR')} تومان
                    {course.discount_price && (
                      <span className="ml-2 text-emerald-700">
                        {Number(course.discount_price).toLocaleString('fa-IR')} تومان
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/courses/${course.slug}`}
                    className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200"
                  >
                    <Eye className="h-3 w-3 inline" /> نمایش
                  </Link>
                  <button
                    onClick={() => loadSections(course.id)}
                    className="rounded-full bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-700 transition-colors hover:bg-primary-100"
                  >
                    <BookOpen className="h-3 w-3 inline" /> سرفصل‌ها
                  </button>
                </div>
              </div>

              {/* Sections for this course */}
              {selectedCourse === course.id && (
                <div className="mt-6 border-t border-slate-100 pt-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-700">سرفصل‌ها و جلسات</h3>
                    <button
                      onClick={() => {
                        setShowSectionForm(!showSectionForm);
                        setSectionForm({ title: '', order: String((sections.length || 0) + 1) });
                      }}
                      className="inline-flex items-center gap-1 rounded-full bg-accent-50 px-3 py-1.5 text-xs font-bold text-accent-700 hover:bg-accent-100"
                    >
                      <Plus className="h-3 w-3" /> سرفصل جدید
                    </button>
                  </div>

                  {showSectionForm && (
                    <form onSubmit={handleCreateSection} className="mb-4 rounded-xl bg-slate-50 p-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          value={sectionForm.title}
                          onChange={(e) => setSectionForm((f) => ({ ...f, title: e.target.value }))}
                          placeholder="عنوان سرفصل"
                          className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm outline-none focus:border-primary-400"
                        />
                        <input
                          inputMode="numeric"
                          value={sectionForm.order}
                          onChange={(e) => setSectionForm((f) => ({ ...f, order: e.target.value }))}
                          placeholder="ترتیب"
                          className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm outline-none focus:border-primary-400"
                        />
                      </div>
                      <button
                        type="submit"
                        className="mt-3 inline-flex items-center gap-1 rounded-full bg-primary-600 px-3 py-1.5 text-xs font-bold text-white"
                      >
                        <CheckCircle className="h-3 w-3" /> ذخیره
                      </button>
                    </form>
                  )}

                  {sectionsLoading ? (
                    <SkeletonRow />
                  ) : sections.length === 0 ? (
                    <p className="text-sm text-slate-500">هنوز سرفصلی ثبت نشده.</p>
                  ) : (
                    <div className="space-y-4">
                      {sections.map((section) => (
                        <div key={section.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <h4 className="text-sm font-bold text-slate-800">{section.title}</h4>
                            <button
                              onClick={() => {
                                setSelectedSectionId(section.id);
                                setShowLessonForm(true);
                                setLessonForm((f) => ({
                                  ...f,
                                  order: String(((section.lessons ?? []).length || 0) + 1),
                                }));
                              }}
                              className="rounded-full bg-primary-50 px-2 py-1 text-xs font-bold text-primary-700 hover:bg-primary-100"
                            >
                              <Plus className="h-3 w-3 inline" /> جلسه
                            </button>
                          </div>
                          <div className="space-y-2">
                            {(section.lessons ?? []).map((lesson: Lesson) => (
                              <div
                                key={lesson.id}
                                className="flex items-center justify-between rounded-lg border border-slate-100 bg-white p-3"
                              >
                                <div className="text-sm font-medium text-slate-900">
                                  {lesson.title}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Link
                                    href={`/watch/${course.id}/${lesson.id}`}
                                    className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200"
                                  >
                                    <Eye className="h-3 w-3 inline" />
                                  </Link>
                                  <button
                                    onClick={() => handleDeleteLesson(lesson.id)}
                                    className="rounded-full bg-red-50 px-2 py-1 text-xs font-bold text-red-700 hover:bg-red-100"
                                  >
                                    <Trash className="h-3 w-3 inline" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lesson Form Modal */}
      {showLessonForm && selectedSectionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleCreateLesson}
            className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-xl"
          >
            <h3 className="text-lg font-bold text-slate-900">افزودن جلسه</h3>
            <div className="grid gap-3">
              <input
                value={lessonForm.title}
                onChange={(e) => setLessonForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="عنوان جلسه"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm outline-none focus:border-primary-400"
              />
              <input
                inputMode="numeric"
                value={lessonForm.order}
                onChange={(e) => setLessonForm((f) => ({ ...f, order: e.target.value }))}
                placeholder="ترتیب"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm outline-none focus:border-primary-400"
              />
              <input
                value={lessonForm.quality_720_url}
                onChange={(e) => setLessonForm((f) => ({ ...f, quality_720_url: e.target.value }))}
                placeholder="URL کیفیت 720p (اجباری)"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm outline-none focus:border-primary-400"
                dir="ltr"
              />
              <input
                value={lessonForm.quality_1080_url}
                onChange={(e) => setLessonForm((f) => ({ ...f, quality_1080_url: e.target.value }))}
                placeholder="URL کیفیت 1080p (اختیاری)"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm outline-none focus:border-primary-400"
                dir="ltr"
              />
              <input
                value={lessonForm.quality_480_url}
                onChange={(e) => setLessonForm((f) => ({ ...f, quality_480_url: e.target.value }))}
                placeholder="URL کیفیت 480p (اختیاری)"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm outline-none focus:border-primary-400"
                dir="ltr"
              />
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={lessonForm.is_free_preview}
                    onChange={(e) => setLessonForm((f) => ({ ...f, is_free_preview: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 text-primary-600"
                  />
                  پیش‌نمایش رایگان
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={lessonForm.allow_download}
                    onChange={(e) => setLessonForm((f) => ({ ...f, allow_download: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 text-primary-600"
                  />
                  امکان دانلود
                </label>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-4 py-2 text-sm font-bold text-white hover:bg-primary-700"
              >
                <CheckCircle className="h-4 w-4" /> ذخیره جلسه
              </button>
              <button
                type="button"
                onClick={() => setShowLessonForm(false)}
                className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200"
              >
                انصراف
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
