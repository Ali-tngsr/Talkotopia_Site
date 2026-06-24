import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

const locales = ['fa', 'en'] as const;
type AppLocale = (typeof locales)[number];

function isAppLocale(locale: string): locale is AppLocale {
  return locales.includes(locale as AppLocale);
}

export default getRequestConfig(async ({requestLocale}) => {
  const locale = await requestLocale;

  if (!locale || !isAppLocale(locale)) {
    notFound();
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
