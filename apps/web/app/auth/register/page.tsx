import Link from 'next/link';
import styles from '../auth.module.css';

export default function RegisterPage() {
  return (
    <main className={styles.page} dir="rtl">
      <form className={styles.card}>
        <p>ثبت‌نام</p>
        <h1>ساخت حساب دانشجو</h1>
        <label>نام<input placeholder="نام و نام خانوادگی" /></label>
        <label>ایمیل<input type="email" placeholder="you@example.com" /></label>
        <label>رمز عبور<input type="password" placeholder="حداقل ۸ کاراکتر" /></label>
        <button type="button">ثبت‌نام و دریافت OTP</button>
        <div className={styles.links}><Link href="/auth/verify">کد تایید دارم</Link></div>
      </form>
    </main>
  );
}
