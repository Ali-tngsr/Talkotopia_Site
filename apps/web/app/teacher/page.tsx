import { courses } from '../lib/mockData';
import styles from './page.module.css';

export default function TeacherDashboardPage() {
  return (
    <main className={styles.page} dir="rtl">
      <header className={styles.header}>
        <p>پنل مدرس/ادمین</p>
        <h1>مدیریت پایه دوره‌ها، جلسات و سفارش‌ها</h1>
      </header>

      <section className={styles.layout}>
        <form className={styles.panel}>
          <h2>ایجاد/ویرایش دوره</h2>
          <label>عنوان دوره<input placeholder="مثلاً مکالمه انگلیسی" /></label>
          <label>قیمت<input inputMode="numeric" placeholder="1490000" /></label>
          <label>وضعیت انتشار<select defaultValue="draft"><option value="draft">draft</option><option value="published">published</option><option value="archived">archived</option></select></label>
          <label>توضیحات<textarea placeholder="توضیح کوتاه دوره" /></label>
          <button type="button">ذخیره دوره</button>
        </form>

        <form className={styles.panel}>
          <h2>مدیریت جلسه و URL کیفیت‌ها</h2>
          <label>عنوان جلسه<input placeholder="جلسه اول" /></label>
          <label>URL کیفیت 720p<input placeholder="https://.../720.mp4" /></label>
          <label>URL کیفیت 1080p<input placeholder="اختیاری" /></label>
          <label>URL کیفیت 480p<input placeholder="اختیاری" /></label>
          <label className={styles.inline}><input type="checkbox" /> امکان دانلود</label>
          <button type="button">افزودن جلسه</button>
        </form>
      </section>

      <section className={styles.panel}>
        <h2>دوره‌ها و سفارش‌های اخیر</h2>
        <div className={styles.table}>
          {courses.map((course, index) => (
            <div className={styles.row} key={course.id}>
              <span>{course.title}</span>
              <small>{course.lessons.length} جلسه</small>
              <strong>{index % 2 === 0 ? 'published' : 'draft'}</strong>
              <em>{index + 3} سفارش</em>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
