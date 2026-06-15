import Link from 'next/link';
import { notFound } from 'next/navigation';
import { courses, enrolledCourseIds } from '../../lib/mockData';
import styles from './page.module.css';

type CourseDetailsProps = {
  params: Promise<{ slug: string }>;
};

export default async function CourseDetailsPage({ params }: CourseDetailsProps) {
  const { slug } = await params;
  const course = courses.find((item) => item.slug === slug);

  if (!course) {
    notFound();
  }

  const isEnrolled = enrolledCourseIds.includes(course.id);
  const firstLesson = course.lessons[0];

  return (
    <main className={styles.page} dir="rtl">
      <section className={styles.hero}>
        <div>
          <p>{course.badge}</p>
          <h1>{course.title}</h1>
          <span>مدرس: {course.teacher} · سطح {course.level}</span>
          <p className={styles.description}>{course.description}</p>
        </div>
        <aside className={styles.purchaseBox}>
          <strong>{course.price}</strong>
          {isEnrolled ? (
            <Link href={firstLesson ? `/watch/${firstLesson.id}?title=${encodeURIComponent(firstLesson.title)}&download=true` : '/student'}>
              ادامه یادگیری
            </Link>
          ) : (
            <Link href="/auth/login">ورود و خرید دوره</Link>
          )}
          <small>{isEnrolled ? 'شما به این دوره دسترسی دارید.' : 'پس از پرداخت موفق، دسترسی خودکار فعال می‌شود.'}</small>
        </aside>
      </section>

      <section className={styles.lessons}>
        <h2>سرفصل‌ها و جلسات</h2>
        {course.lessons.map((lesson, index) => (
          <article className={styles.lesson} key={lesson.id}>
            <div>
              <span>جلسه {index + 1}</span>
              <h3>{lesson.title}</h3>
              <p>{lesson.duration}</p>
            </div>
            {isEnrolled || lesson.isFreePreview ? (
              <Link href={`/watch/${lesson.id}?title=${encodeURIComponent(lesson.title)}&download=${isEnrolled}`}>
                {lesson.isFreePreview && !isEnrolled ? 'پیش‌نمایش رایگان' : 'تماشا'}
              </Link>
            ) : (
              <small>نیازمند خرید دوره</small>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}
