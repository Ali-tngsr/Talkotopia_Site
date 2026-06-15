import Link from 'next/link';
import { courses, enrolledCourseIds } from '../lib/mockData';
import styles from './page.module.css';

export default function StudentDashboardPage() {
  const enrolled = courses.filter((course) => enrolledCourseIds.includes(course.id));
  const locked = courses.filter((course) => !enrolledCourseIds.includes(course.id));

  return (
    <main className={styles.page} dir="rtl">
      <header className={styles.header}>
        <p>پنل دانشجو</p>
        <h1>دوره‌های خریداری‌شده و وضعیت دسترسی</h1>
      </header>

      <section className={styles.grid}>
        {enrolled.map((course) => {
          const firstLesson = course.lessons[0];
          const watchHref = firstLesson
            ? `/watch/${firstLesson.id}?title=${encodeURIComponent(firstLesson.title)}&download=true`
            : '/courses';

          return (
            <article className={styles.card} key={course.id}>
              <span className={styles.open}>دسترسی فعال</span>
              <h2>{course.title}</h2>
              <p>{course.description}</p>
              <Link href={watchHref}>ادامه تماشا</Link>
              <form className={styles.reviewBox}>
                <label>
                  ثبت نظر برای دوره
                  <textarea placeholder="نظر شما درباره این دوره" />
                </label>
                <button type="button">ارسال نظر</button>
              </form>
            </article>
          );
        })}

        {locked.map((course) => (
          <article className={styles.card} key={course.id}>
            <span className={styles.locked}>نیازمند خرید</span>
            <h2>{course.title}</h2>
            <p>برای مشاهده جلسات غیررایگان، ابتدا دوره را خریداری کنید.</p>
            <Link href={`/courses/${course.slug}`}>مشاهده و خرید</Link>
          </article>
        ))}
      </section>
    </main>
  );
}
