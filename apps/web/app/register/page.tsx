"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { useToast } from "../../components/toast-provider";
import { registerUser } from "../../lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error("لطفاً همه فیلدها را تکمیل کنید.");
      return;
    }

    setIsSubmitting(true);

    try {
      await registerUser({ email, name, password });
      toast.success("ثبت‌نام انجام شد. کد تایید را وارد کنید.");
      router.push(`/verify?email=${encodeURIComponent(email)}`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "ثبت‌نام ناموفق بود. لطفاً دوباره تلاش کنید.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1 className="auth-title">ثبت‌نام در Talkotopia</h1>
        <p className="auth-subtitle">برای شروع یادگیری، حساب کاربری خود را ایجاد کنید.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">نام و نام خانوادگی</label>
            <input className="form-input" id="name" onChange={(event) => setName(event.target.value)} placeholder="مثلاً علی رضایی" type="text" value={name} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="email">ایمیل</label>
            <input autoComplete="email" className="form-input" dir="ltr" id="email" onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" type="email" value={email} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">رمز عبور</label>
            <input autoComplete="new-password" className="form-input" dir="ltr" id="password" onChange={(event) => setPassword(event.target.value)} placeholder="********" type="password" value={password} />
          </div>
          <button className="primary-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? "در حال ثبت‌نام..." : "ثبت‌نام"}
          </button>
        </form>
        <p className="auth-footer">قبلاً حساب دارید؟ <Link href="/login">ورود</Link></p>
      </section>
    </main>
  );
}
