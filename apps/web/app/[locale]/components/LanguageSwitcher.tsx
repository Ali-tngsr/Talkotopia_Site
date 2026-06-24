'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const nextLocale = locale === 'fa' ? 'en' : 'fa';
    // جایگزین کردن پیشوند زبان در آدرس فعلی مرورگر
    const newPath = pathname.replace(`/${locale}`, `/${nextLocale}`);
    router.push(newPath);
  };

  return (
    <button
      onClick={toggleLocale}
      className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200"
    >
      <Globe className="h-4 w-4" />
      <span className="mb-0.5">{locale === 'fa' ? 'English' : 'فارسی'}</span>
    </button>
  );
}