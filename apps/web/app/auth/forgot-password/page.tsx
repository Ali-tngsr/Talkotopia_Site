'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '../../../lib/api';
import { toast } from '../../components/Toast';
import { Loader2, Mail, ArrowRight } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast('لطفاً ایمیل را وارد کنید', 'error');
      return;
    }
    setLoading(true);
    try {
      const result = await authApi.forgotPassword({ email });
      setSent(true);
      if (result.dev_reset_token) {
        setDevToken(result.dev_reset_token);
      }
      toast('لینک بازیابی ارسال شد', 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'خطا در ارسال درخواست';
      toast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px-120px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="text-center">
          <p className="text-sm font-bold text-primary-600">بازیابی رمز</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">دریافت لینک بازیابی</h1>
        </div>

        {sent && (
          <div className="rounded-xl bg-emerald-50 p-4 text-center text-sm text-emerald-800">
            <p className="font-bold">لینک بازیابی با موفقیت ارسال شد.</p>
            {devToken && (
              <p className="mt-2 font-mono text-xs">توکن (توسعه): {devToken}</p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">ایمیل</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition-colors focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-200"
                dir="ltr"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary-600 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'ارسال لینک بازیابی'}
          </button>
        </form>

        <div className="text-center text-sm font-medium">
          <Link href="/auth/login" className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700">
            <ArrowRight className="h-4 w-4" /> بازگشت به ورود
          </Link>
        </div>

        {devToken && (
          <div className="text-center">
            <Link
              href={`/auth/reset-password?token=${encodeURIComponent(devToken)}`}
              className="inline-flex items-center gap-1 rounded-full bg-accent-100 px-4 py-2 text-sm font-bold text-accent-800 hover:bg-accent-200"
            >
              رفتن به صفحه تغییر رمز
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
