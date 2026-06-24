'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight, BookOpen, Globe2, ShoppingBag, Sparkles, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type CourseCard = {
  slug: string;
  title: string;
  subtitle: string;
  instructor: string;
  rating: string;
  price: string;
  tag: string;
};

export default function HomePage() {
  const t = useTranslations('HomePage');
  const common = useTranslations('Common');
  const locale = useLocale();
  const isRtl = locale === 'fa';
  const otherLocale = isRtl ? 'en' : 'fa';
  const courses = t.raw('courses.items') as CourseCard[];

  return (
    <div className="min-h-screen bg-[#F2EED9] text-[#5E6646]">
      <nav className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 rounded-[2rem] border border-[#5E6646]/10 bg-white/45 px-4 py-3 shadow-sm backdrop-blur md:px-6">
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#F1BD79] text-xl shadow-sm">
              🌈
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-lg font-black tracking-tight text-[#5E6646]">{t('nav.logo')}</span>
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#9EB766]">{t('nav.logoSub')}</span>
            </span>
          </Link>

          <div className="hidden items-center gap-6 rounded-full bg-[#F2EED9]/75 px-5 py-3 text-sm font-bold text-[#5E6646]/80 lg:flex">
            <Link href={`/${locale}#courses`} className="transition hover:text-[#9EB766]">{t('nav.links.courses')}</Link>
            <Link href={`/${locale}#shop`} className="transition hover:text-[#9EB766]">{t('nav.links.shop')}</Link>
            <Link href={`/${locale}/student`} className="transition hover:text-[#9EB766]">{t('nav.links.student')}</Link>
            <Link href={`/${locale}/teacher`} className="transition hover:text-[#9EB766]">{t('nav.links.teacher')}</Link>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="hidden rounded-full px-4 font-bold text-[#5E6646] hover:bg-[#F2EED9] sm:inline-flex">
              <Link href={`/${locale}/auth/login`}>{t('nav.login')}</Link>
            </Button>
            <Button asChild className="rounded-full bg-[#9EB766] px-5 font-black text-white shadow-sm hover:bg-[#8aa454]">
              <Link href={`/${locale}/auth/register`}>{t('nav.signup')}</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-[#9EB766]/40 bg-white/80 px-3 font-black text-[#5E6646] hover:bg-[#F1BD79]/30">
              <Link href={`/${otherLocale}`} aria-label={t('nav.languageAria')}>
                <Globe2 className="me-1 h-4 w-4" /> {t('nav.language')}
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <section className="grid items-center gap-10 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
          <div className={isRtl ? 'text-right' : 'text-left'}>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-black text-[#5E6646] shadow-sm ring-1 ring-[#5E6646]/10">
              <Sparkles className="h-4 w-4 fill-[#F1BD79] text-[#F1BD79]" />
              {t('hero.badge')}
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.05] tracking-tight text-[#5E6646] sm:text-5xl lg:text-7xl">
              {t('hero.headline')}
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-[#5E6646]/75 sm:text-xl">
              {t('hero.body')}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild className="h-12 rounded-full bg-[#9EB766] px-7 text-base font-black text-white shadow-lg shadow-[#9EB766]/25 hover:bg-[#8aa454]">
                <Link href={`/${locale}/courses`}>{t('hero.primaryCta')}<ArrowRight className={`ms-2 h-5 w-5 ${isRtl ? 'rotate-180' : ''}`} /></Link>
              </Button>
              <Button asChild variant="outline" className="h-12 rounded-full border-[#5E6646]/20 bg-white/60 px-7 text-base font-black text-[#5E6646] hover:bg-white">
                <Link href={`/${locale}/auth/login`}>{t('hero.secondaryCta')}</Link>
              </Button>
            </div>
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-[520px] rounded-[3rem] bg-[#F1BD79]/70 p-6 shadow-2xl shadow-[#5E6646]/10 ring-1 ring-white/70">
            <div className="absolute -start-4 top-10 rounded-3xl bg-white/85 px-4 py-3 text-sm font-black shadow-lg">{t('hero.floatOne')}</div>
            <div className="absolute -end-3 bottom-12 rounded-3xl bg-[#9EB766] px-4 py-3 text-sm font-black text-white shadow-lg">{t('hero.floatTwo')}</div>
            <div className="grid h-full place-items-center rounded-[2.4rem] bg-[#F2EED9]">
              <div className="relative h-64 w-64 rounded-full bg-white shadow-inner">
                <div className="absolute left-1/2 top-10 h-28 w-36 -translate-x-1/2 rounded-[45%] bg-[#9EB766]" />
                <div className="absolute left-1/2 top-24 h-32 w-44 -translate-x-1/2 rounded-[48%] bg-[#F1BD79]" />
                <div className="absolute left-[84px] top-[82px] h-4 w-4 rounded-full bg-[#5E6646]" />
                <div className="absolute right-[84px] top-[82px] h-4 w-4 rounded-full bg-[#5E6646]" />
                <div className="absolute left-1/2 top-[116px] h-4 w-12 -translate-x-1/2 rounded-b-full border-b-4 border-[#5E6646]" />
                <div className="absolute -left-8 top-32 h-20 w-12 rotate-[-18deg] rounded-full bg-[#9EB766]" />
                <div className="absolute -right-8 top-32 h-20 w-12 rotate-[18deg] rounded-full bg-[#9EB766]" />
                <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#5E6646] px-4 py-2 text-sm font-black text-white">
                  <BookOpen className="h-4 w-4" /> {t('hero.mascotLabel')}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="courses" className="py-12">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className={isRtl ? 'text-right' : 'text-left'}>
              <p className="text-sm font-black uppercase tracking-[0.24em] text-[#9EB766]">{t('courses.eyebrow')}</p>
              <h2 className="mt-2 text-3xl font-black text-[#5E6646] sm:text-4xl">{t('courses.title')}</h2>
            </div>
            <Button asChild variant="outline" className="rounded-full border-[#9EB766]/40 bg-white/70 px-6 font-black text-[#5E6646] hover:bg-white">
              <Link href={`/${locale}/courses`}>{t('courses.viewAll')}</Link>
            </Button>
          </div>

          <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {courses.map((course, index) => (
              <Link key={course.slug} href={`/${locale}/courses/${course.slug}`} className="min-w-[280px] snap-start sm:min-w-[330px]">
                <Card className="h-full rounded-[2rem] border-0 bg-white/75 p-3 shadow-sm ring-[#5E6646]/10 transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="h-40 rounded-[1.5rem] bg-gradient-to-br from-[#F1BD79] via-[#F2EED9] to-[#9EB766] p-4">
                    <div className="flex h-full items-end justify-between rounded-[1.15rem] bg-white/35 p-4">
                      <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-black text-[#5E6646]">{course.tag}</span>
                      <span className="text-5xl">{['🦊', '🐼', '🦁', '🐰'][index % 4]}</span>
                    </div>
                  </div>
                  <CardContent className="space-y-4 px-2 pb-2 pt-4">
                    <div>
                      <h3 className="text-xl font-black leading-7 text-[#5E6646]">{course.title}</h3>
                      <p className="mt-1 text-sm font-bold text-[#5E6646]/60">{course.subtitle}</p>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-sm font-bold text-[#5E6646]/70">
                      <span>{common('teacher')}: {course.instructor}</span>
                      <span className="flex items-center gap-1 text-[#5E6646]"><Star className="h-4 w-4 fill-[#F1BD79] text-[#F1BD79]" />{course.rating}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-[#F2EED9] px-4 py-3">
                      <span className="text-xs font-black uppercase tracking-wider text-[#9EB766]">{t('courses.priceLabel')}</span>
                      <span className="text-lg font-black text-[#5E6646]">{course.price} {common('toman')}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section id="shop" className="rounded-[2.5rem] bg-[#5E6646] p-6 text-white shadow-2xl shadow-[#5E6646]/15 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className={isRtl ? 'text-right' : 'text-left'}>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-black text-[#F1BD79]">
                <ShoppingBag className="h-4 w-4" /> {t('shop.eyebrow')}
              </div>
              <h2 className="mt-4 text-3xl font-black sm:text-4xl">{t('shop.title')}</h2>
              <p className="mt-4 max-w-xl text-base font-medium leading-8 text-white/75">{t('shop.body')}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="min-h-40 rounded-[2rem] border border-white/15 bg-white/10 p-4">
                  <div className="mb-4 h-20 rounded-3xl bg-[#F1BD79]/80" />
                  <div className="h-3 w-2/3 rounded-full bg-white/35" />
                  <div className="mt-3 h-3 w-1/2 rounded-full bg-white/20" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
