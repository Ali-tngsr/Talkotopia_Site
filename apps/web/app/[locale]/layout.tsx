// apps/web/app/[locale]/layout.tsx

import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { ToastContainer } from "./components/Toast";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});
// Add the local Persian font
const vazirmatn = localFont({
  src: [
    { path: './fonts/Vazirmatn-Regular.woff2', weight: '400', style: 'normal' },
    { path: './fonts/Vazirmatn-Bold.woff2', weight: '700', style: 'normal' }
  ],
  variable: '--font-vazirmatn'
});

export const metadata: Metadata = {
  title: "Talkotopia — پلتفرم آموزشی زبان",
  description: "دوره‌های ضبط‌شده زبان را بفروشید، مدیریت کنید و امن پخش کنید.",
};

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const messages = await getMessages();
  const dir = locale === 'fa' ? 'rtl' : 'ltr';

  // Apply Vazirmatn for Farsi, Geist for English
  const fontClass = locale === 'fa' ? vazirmatn.variable : `${geistSans.variable} ${geistMono.variable}`;

  return (
    <html lang={locale} dir={dir}>
      <body className={`${fontClass} font-sans`}>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <ToastContainer />
            <main className="min-h-[calc(100vh-64px-120px)]">{children}</main>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}