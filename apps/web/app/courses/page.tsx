import Link from 'next/link';
import { courses } from '../lib/mockData';
import styles from './page.module.css';

export default function CoursesPage() {
  return (
    <main className={styles.page} dir="rtl">
      <header className={styles.header}>
        <p>کاتالوگ دوره‌ها</p>
        <h1>جستجو و فیلتر پایه دوره‌های Talkotopia</h1>
        <div className={styles.filters}>
          <input aria-label="جستجوی دوره" placeholder="جستجو بر اساس عنوان یا مدرس" />
          <select aria-label="فیلتر سطح" defaultValue="all">
            <option value="all">همه سطح‌ها</option>
            <option>مقدماتی</option>
            <option>متوسط</option>
            <option>پیشرفته</option>
          </select>
        </div>
      </header>

      <section className={styles.list}>
        {courses.map((course) => (
          <article className={styles.course} key={course.id}>
            <div>
              <span>{course.level}</span>
              <h2>{course.title}</h2>
              <p>{course.description}</p>
              <small>مدرس: {course.teacher}</small>
            </div>
            <div className={styles.meta}>
              <strong>{course.price}</strong>
              <Link href={`/courses/${course.slug}`}>مشاهده جزئیات</Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
