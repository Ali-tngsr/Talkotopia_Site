import Link from "next/link";

export default function Home() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1 className="auth-title">Talkotopia</h1>
        <p className="auth-subtitle">
          به سامانه مدیریت یادگیری تاکوتوپیا خوش آمدید. برای ادامه وارد شوید
          یا حساب جدید بسازید.
        </p>
        <div style={{ display: "grid", gap: 12 }}>
          <Link className="primary-button" href="/login" style={{ textAlign: "center" }}>
            ورود
          </Link>
          <Link className="auth-footer" href="/register">
            ساخت حساب کاربری جدید
          </Link>
        </div>
      </section>
    </main>
  );
}
