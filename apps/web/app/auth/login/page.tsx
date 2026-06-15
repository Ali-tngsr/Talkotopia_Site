import Link from 'next/link';
import styles from '../auth.module.css';

export default function LoginPage() {
  return (
    <main className={styles.page} dir="rtl">
      <form className={styles.card}>
        <p>ورود</p>
        <h1>ورود به حساب Talkotopia</h1>
        <label>ایمیل<input type="email" placeholder="you@example.com" /></label>
        <label>رمز عبور<input type="password" placeholder="••••••••" /></label>
        <button type="button">ورود</button>
        <div className={styles.links}>
          <Link href="/auth/register">ثبت‌نام</Link>
          <Link href="/auth/forgot-password">فراموشی رمز</Link>
        </div>
      </form>
    </main>
  );
}
