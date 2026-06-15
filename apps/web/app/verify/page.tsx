"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, Suspense, useState } from "react";
import { useToast } from "../../components/toast-provider";
import { getAccessTokenFromResponse, getRefreshTokenFromResponse, verifyOtp } from "../../lib/api";
import { saveAuthTokens } from "../../lib/auth-storage";

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !otp.trim()) {
      toast.error("لطفاً ایمیل و کد تایید را وارد کنید.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await verifyOtp({ email, otp });
      const accessToken = getAccessTokenFromResponse(result);

      if (!accessToken) {
        throw new Error("توکن ورود از سرور دریافت نشد.");
      }

      saveAuthTokens({ accessToken, refreshToken: getRefreshTokenFromResponse(result) });
      toast.success("حساب شما با موفقیت تایید شد.");
      router.replace("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "کد تایید نامعتبر است. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1 className="auth-title">تایید کد یکبار مصرف</h1>
        <p className="auth-subtitle">کد ارسال‌شده به ایمیل خود را وارد کنید.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">ایمیل</label>
            <input className="form-input" dir="ltr" id="email" onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" type="email" value={email} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="otp">کد تایید</label>
            <input className="form-input" dir="ltr" id="otp" inputMode="numeric" maxLength={8} onChange={(event) => setOtp(event.target.value)} placeholder="123456" type="text" value={otp} />
          </div>
          <button className="primary-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? "در حال بررسی..." : "تایید حساب"}
          </button>
        </form>
        <p className="auth-footer">حساب شما تایید شده؟ <Link href="/login">ورود</Link></p>
      </section>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyOtpForm />
    </Suspense>
  );
}
