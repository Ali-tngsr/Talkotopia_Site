import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <GraduationCap className="h-5 w-5 text-primary-600" />
            Talkotopia
          </Link>
          <p className="text-sm text-slate-500">
            پلتفرم آموزشی زبان — دوره‌های ضبط‌شده، پرداخت امن، پخش امن
          </p>
        </div>
      </div>
    </footer>
  );
}
