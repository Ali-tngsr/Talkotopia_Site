import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "../lib/auth";
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

export const metadata: Metadata = {
  title: "Talkotopia — پلتفرم آموزشی زبان",
  description: "دوره‌های ضبط‌شده زبان را بفروشید، مدیریت کنید و امن پخش کنید.",
};

export default async function RootLayout({
  children,
  params: { locale }
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  // دریافت فایل‌های ترجمه برای استفاده در کلاینت کامپوننت‌ها
  const messages = await getMessages();
  // تعیین جهت متن بر اساس زبان
  const dir = locale === 'fa' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir}>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <ToastContainer />
            <Navbar />
            <main className="min-h-[calc(100vh-64px-120px)]">{children}</main>
            <Footer />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
