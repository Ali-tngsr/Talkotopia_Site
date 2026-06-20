'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth';
import { toast } from '../../components/Toast';
import { Loader2, CheckCircle } from 'lucide-react';

function VerifyForm() {
  const { verifyOtp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const otp = searchParams.get('otp') ?? '';

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!email || !otp) {
      toast('لینک تایید نامعتبر است', 'error');
      router.push('/auth/register');
      return;
    }
    verifyOtp(email, otp)
      .then(() => {
        toast('ایمیل شما تایید شد. خوش آمدید!', 'success');
        setLoading(false);
        setTimeout(() => router.push('/student'), 1500);
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'خطا در تایید';
        toast(message, 'error');
        setLoading(false);
      });
  }, [email, otp, verifyOtp, router]);

  return (
    <div className="flex min-h-[calc(100vh-64px-120px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-lg text-center">
        {loading ? (
          <>
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-600" />
            <h1 className="text-xl font-bold text-slate-900">در حال تایید حساب...</h1>
          </>
        ) : (
          <>
            <CheckCircle className="mx-auto h-12 w-12 text-emerald-500" />
            <h1 className="text-xl font-bold text-slate-900">حساب شما تایید شد</h1>
            <p className="text-sm text-slate-600">در حال انتقال به پنل دانشجو...</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-64px-120px)] items-center justify-center px-4 py-12">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-lg text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-600" />
            <h1 className="mt-4 text-xl font-bold text-slate-900">در حال بارگذاری...</h1>
          </div>
        </div>
      }
    >
      <VerifyForm />
    </Suspense>
  );
}
