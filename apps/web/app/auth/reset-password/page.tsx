'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '../../../lib/api';
import { toast } from '../../components/Toast';
import { Loader2, Lock, ArrowRight, CheckCircle } from 'lucide-react';

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) {
      toast('لینک تغییر رمز نامعتبر است', 'error');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast('لینک تغییر رمز نامعتبر است', 'error');
      return;
    }
    if (!password || !confirmPassword) {
      toast('لطفاً همه فیلدها را تکمیل کنید', 'error');
      return;
    }
    if (password.length < 6) {
      toast('رمز عبور باید حداقل ۶ کاراکتر باشد', 'error');
      return;
    }
    if (password !== confirmPassword) {
      toast('رمز عبور و تکرار آن یکسان نیستند', 'error');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword({ token, new_password: password });
      setDone(true);
      toast('رمز عبور با موفقیت تغییر یافت', 'success');
      setTimeout(() => router.push('/auth/login'), 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'خطا در تغییر رمز';
      toast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-lg text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-emerald-500" />
        <h1 className="text-2xl font-bold text-slate-900">رمز عبور تغییر یافت</h1>
        <p className="text-sm text-slate-600">در حال انتقال به صفحه ورود...</p>
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-1 rounded-full bg-primary-600 px-4 py-2 text-sm font-bold text-white hover:bg-primary-700"
        >
          <ArrowRight className="h-4 w-4" /> ورود
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
      <div className="text-center">
        <p className="text-sm font-bold text-primary-600">تغییر رمز</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">رمز عبور جدید</h1>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">رمز عبور جدید</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="حداقل ۶ کاراکتر"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition-colors focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-200"
              dir="ltr"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">تکرار رمز عبور</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition-colors focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-200"
              dir="ltr"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !token}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-primary-600 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'تغییر رمز عبور'}
      </button>

      <div className="text-center text-sm font-medium">
        <Link href="/auth/login" className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700">
          <ArrowRight className="h-4 w-4" /> بازگشت به ورود
        </Link>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px-120px)] items-center justify-center px-4 py-12">
      <Suspense
        fallback={
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-lg text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-600" />
            <h1 className="mt-4 text-xl font-bold text-slate-900">در حال بارگذاری...</h1>
          </div>
        }
      >
        <ResetForm />
      </Suspense>
    </div>
  );
}
