'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth';
import { toast } from '../../components/Toast';
import { Loader2, Mail, Lock, User, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const { user, register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');

  useEffect(() => {
    if (user) router.push('/student');
  }, [user, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast('لطفاً همه فیلدها را تکمیل کنید', 'error');
      return;
    }
    if (password.length < 6) {
      toast('رمز عبور باید حداقل ۶ کاراکتر باشد', 'error');
      return;
    }
    setLoading(true);
    try {
      const result = await register(name, email, password);
      setDevOtp(result.dev_otp);
      setShowOtp(true);
      toast('ثبت‌نام اولیه انجام شد. کد تایید را وارد کنید', 'info');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'خطا در ثبت‌نام';
      toast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (showOtp) {
    return (
      <div className="flex min-h-[calc(100vh-64px-120px)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
          <div className="text-center">
            <p className="text-sm font-bold text-primary-600">تایید ایمیل</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">کد تایید را وارد کنید</h1>
          </div>
          <div className="rounded-xl bg-amber-50 p-4 text-center text-sm text-amber-800">
            <p className="font-bold">کد تایید (توسعه): {devOtp}</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">کد تایید</label>
              <input
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="12345"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-center text-lg font-bold tracking-widest text-slate-900 outline-none transition-colors focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-200"
                dir="ltr"
              />
            </div>
          </div>
          <Link
            href={`/auth/verify?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary-600 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-700"
          >
            ادامه تایید <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-64px-120px)] items-center justify-center px-4 py-12">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-lg"
      >
        <div className="text-center">
          <p className="text-sm font-bold text-primary-600">ثبت‌نام</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">ساخت حساب کاربری</h1>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">نام</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="نام و نام خانوادگی"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition-colors focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-200"
              />
            </div>
          </div>

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

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">رمز عبور</label>
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
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary-600 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'ثبت‌نام و دریافت OTP'}
        </button>

        <div className="text-center text-sm font-medium">
          <Link href="/auth/login" className="text-primary-600 hover:text-primary-700">
            قبلاً حساب دارید؟ ورود
          </Link>
        </div>
      </form>
    </div>
  );
}
