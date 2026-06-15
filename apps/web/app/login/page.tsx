"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { useToast } from "../../components/toast-provider";
import { getAccessTokenFromResponse, getRefreshTokenFromResponse, loginUser } from "../../lib/api";
import { saveAuthTokens } from "../../lib/auth-storage";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("لطفاً ایمیل و رمز عبور را وارد کنید.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await loginUser({ email, password });
      const accessToken = getAccessTokenFromResponse(result);

      if (!accessToken) {
        throw new Error("توکن ورود از سرور دریافت نشد.");
      }

      saveAuthTokens({ accessToken, refreshToken: getRefreshTokenFromResponse(result) });
      toast.success("ورود با موفقیت انجام شد.");
      router.replace("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ایمیل یا رمز عبور اشتباه است.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1 className="auth-title">ورود به Talkotopia</h1>
        <p className="auth-subtitle">برای ادامه یادگیری، وارد حساب کاربری خود شوید.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">ایمیل</label>
            <input autoComplete="email" className="form-input" dir="ltr" id="email" onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" type="email" value={email} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">رمز عبور</label>
            <input autoComplete="current-password" className="form-input" dir="ltr" id="password" onChange={(event) => setPassword(event.target.value)} placeholder="********" type="password" value={password} />
          </div>
          <button className="primary-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? "در حال ورود..." : "ورود"}
          </button>
        </form>
        <p className="auth-footer">حساب ندارید؟ <Link href="/register">ثبت‌نام</Link></p>
      </section>
    </main>
  );
}
