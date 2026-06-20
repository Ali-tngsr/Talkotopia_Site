'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { coursesApi } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import { VideoPlayer } from '../../../components/VideoPlayer';
import { toast } from '../../../components/Toast';
import { SkeletonRow } from '../../../components/Skeleton';
import { ArrowLeft, ArrowRight, Lock, Play } from 'lucide-react';
import type { Lesson, LessonMedia, CourseSection } from '../../../lib/api';

export default function WatchPage() {
  const params = useParams<{ courseId: string; lessonId: string }>();
  const { user } = useAuth();
  const courseId = params?.courseId;
  const lessonId = params?.lessonId;

  const [media, setMedia] = useState<LessonMedia | null>(null);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId || !lessonId) return;
    if (!user) {
      toast('برای مشاهده جلسه باید وارد شوید', 'error');
      return;
    }

    setLoading(true);
    Promise.all([
      coursesApi.getLessonMedia(courseId, lessonId).catch(() => null),
      coursesApi.getCourseSections(courseId).catch(() => [] as CourseSection[]),
    ])
      .then(([m, s]) => {
        if (!m) {
          toast('دسترسی به این جلسه امکان‌پذیر نیست', 'error');
        } else {
          setMedia(m);
        }
        setSections(s || []);
        setLoading(false);
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'خطا در بارگذاری';
        toast(message, 'error');
        setLoading(false);
      });
  }, [courseId, lessonId, user]);

  // Build all lessons flat list for prev/next navigation
  const allLessons = sections.flatMap((s) =>
    (s.lessons ?? []).map((l: Lesson) => ({ ...l, sectionTitle: s.title }))
  );
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < allLessons.length - 1
      ? allLessons[currentIndex + 1]
      : null;

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
        <div className="mb-6 h-6 w-48 rounded bg-slate-200" />
        <div className="mb-6 aspect-video rounded-2xl bg-slate-200" />
        <SkeletonRow />
      </div>
    );
  }

  if (!media) {
    return (
      <div className="flex min-h-[calc(100vh-64px-120px)] items-center justify-center px-4">
        <div className="text-center">
          <Lock className="mx-auto h-12 w-12 text-slate-300" />
          <h1 className="mt-4 text-2xl font-bold text-slate-900">دسترسی غیرمجاز</h1>
          <p className="mt-2 text-slate-600">
            برای مشاهده این جلسه باید دوره را خریداری کرده باشید.
          </p>
          <Link
            href="/courses"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary-600 px-4 py-2 text-sm font-bold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            بازگشت به صفحه دوره‌ها
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{media.title}</h1>
      </div>

      <VideoPlayer
        title={media.title}
        sources={media.sources.map((s) => ({
          quality: s.quality as '480p' | '720p' | '1080p',
          url: s.url,
          isDefault: s.is_default,
          canDownload: s.can_download,
          filename: s.filename,
        }))}
        allowDownload={media.allow_download}
      />

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        {prevLesson ? (
          <Link
            href={`/watch/${courseId}/${prevLesson.id}`}
            className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200"
          >
            <ArrowRight className="h-4 w-4" />
            {prevLesson.title}
          </Link>
        ) : (
          <div />
        )}
        {nextLesson ? (
          <Link
            href={`/watch/${courseId}/${nextLesson.id}`}
            className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-sm font-bold text-primary-700 transition-colors hover:bg-primary-100"
          >
            {nextLesson.title}
            <ArrowLeft className="h-4 w-4" />
          </Link>
        ) : (
          <div />
        )}
      </div>

      {/* Lesson list */}
      <div className="mt-8 space-y-4">
        <h2 className="text-lg font-bold text-slate-900">سرفصل‌ها</h2>
        {sections.map((section) => (
          <div key={section.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-bold text-slate-700">{section.title}</h3>
            <div className="space-y-2">
              {(section.lessons ?? []).map((lesson: Lesson) => (
                <div
                  key={lesson.id}
                  className={`flex items-center justify-between rounded-xl border p-3 ${
                    lesson.id === lessonId
                      ? 'border-primary-200 bg-primary-50'
                      : 'border-slate-100 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Play className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-900">{lesson.title}</span>
                  </div>
                  <Link
                    href={`/watch/${courseId}/${lesson.id}`}
                    className="text-xs font-bold text-primary-600 hover:text-primary-700"
                  >
                    {lesson.id === lessonId ? 'در حال پخش' : 'تماشا'}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
