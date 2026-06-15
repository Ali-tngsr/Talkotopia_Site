import Link from 'next/link';
import { courses } from './lib/mockData';
import styles from './page.module.css';

export default function Home() {
  const featured = courses.slice(0, 3);

  return (
    <main className={styles.page} dir="rtl">
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Talkotopia LMS MVP</p>
        <h1>دوره‌های ضبط‌شده زبان را بفروشید، مدیریت کنید و امن پخش کنید.</h1>
        <p className={styles.lead}>
          نسخه MVP شامل معرفی محصول، لیست دوره‌ها، خرید، پنل دانشجو، پلیر و پنل پایه مدرس است.
        </p>
        <div className={styles.actions}>
          <Link className={styles.primary} href="/courses">مشاهده دوره‌ها</Link>
          <Link className={styles.secondary} href="/auth/login">ورود به حساب</Link>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>دوره‌های منتخب</p>
          <Link href="/courses">همه دوره‌ها ←</Link>
        </div>
        <div className={styles.grid}>
          {featured.map((course) => (
            <article className={styles.card} key={course.id}>
              <span>{course.badge}</span>
              <h2>{course.title}</h2>
              <p>{course.description}</p>
              <strong>{course.price}</strong>
              <Link href={`/courses/${course.slug}`}>جزئیات و خرید</Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
