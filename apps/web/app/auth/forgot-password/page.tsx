import styles from '../auth.module.css';

export default function ForgotPasswordPage() {
  return (
    <main className={styles.page} dir="rtl">
      <form className={styles.card}>
        <p>بازیابی رمز</p>
        <h1>دریافت لینک بازیابی</h1>
        <label>ایمیل<input type="email" placeholder="you@example.com" /></label>
        <button type="button">ارسال لینک بازیابی</button>
      </form>
    </main>
  );
}
