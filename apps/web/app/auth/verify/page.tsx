import styles from '../auth.module.css';

export default function VerifyPage() {
  return (
    <main className={styles.page} dir="rtl">
      <form className={styles.card}>
        <p>تایید OTP</p>
        <h1>تایید ایمیل</h1>
        <label>ایمیل<input type="email" placeholder="you@example.com" /></label>
        <label>کد تایید<input inputMode="numeric" placeholder="123456" /></label>
        <button type="button">تایید حساب</button>
      </form>
    </main>
  );
}
